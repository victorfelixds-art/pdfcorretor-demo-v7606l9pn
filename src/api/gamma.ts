/**
 * BACKEND API PROXY
 *
 * This file acts as a secure proxy to the Gamma API.
 * In this client-side demo, it calls the Gamma API directly.
 * In a production environment, this would be a server-side function to protect the API Key.
 */

import { ProposalFormValues, GammaGenerationResponse } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// --- BACKEND CONFIGURATION ---
const GAMMA_API_KEY = import.meta.env.VITE_GAMMA_API_KEY
const GAMMA_TEMPLATE_ID =
  import.meta.env.VITE_GAMMA_TEMPLATE_ID || 'j4euglofm0z6e7e'
const BASE_API_URL = 'https://public-api.gamma.app/v1.0/generations'

/**
 * Builds the prompt based on the specific template placeholders.
 */
function buildServerSidePrompt(data: ProposalFormValues): Record<string, any> {
  const economy = (data.originalValue || 0) - (data.discountedValue || 0)

  // Map data to placeholders required by the template
  const dynamicData = {
    '{{NOME_CLIENTE}}': data.clientName,
    '{{VALOR_ORIGINAL}}': formatCurrency(data.originalValue),
    '{{VALOR_COM_DESCONTO}}': formatCurrency(data.discountedValue),
    '{{UNIDADE}}': data.unit,
    '{{METRAGEM}}': `${data.area}m²`,
    '{{ECONOMIA}}': formatCurrency(economy),
    '{{ITEM_1}}': data.items[0] || '',
    '{{ITEM_2}}': data.items[1] || '',
    '{{ITEM_3}}': data.items[2] || '',
    '{{ITEM_4}}': data.items[3] || '',
    '{{ITEM_5}}': data.items[4] || '',
    '{{ITEM_6}}': data.items[5] || '',
    '{{NOME_CORRETOR}}': data.brokerName,
    '{{CRECI_CORRETOR}}': data.brokerCreci,
    '{{VALIDADE_PROPOSTA}}': format(data.validity, 'dd/MM/yyyy', {
      locale: ptBR,
    }),
  }

  return dynamicData
}

/**
 * Extracts the PDF URL based on priority rules
 */
function extractPdfUrl(data: any): string | undefined {
  // 1. exportUrl
  if (data.exportUrl) return data.exportUrl
  // 2. exports.pdf.url
  if (data.exports?.pdf?.url) return data.exports.pdf.url
  // 3. files.pdf.url
  if (data.files?.pdf?.url) return data.files.pdf.url
  // 4. Any other field within the export object
  if (data.export?.url) return data.export.url
  if (data.export?.pdf?.url) return data.export.pdf.url

  return undefined
}

/**
 * Extracts the Gamma URL (web view)
 */
function extractGammaUrl(data: any): string | undefined {
  if (data.link) return data.link
  if (data.url) return data.url
  if (data.gammaUrl) return data.gammaUrl
  return undefined
}

/**
 * Router / Dispatcher for Backend Requests
 */
export async function mockBackendFetch(
  endpoint: string,
  method: 'POST' | 'GET',
  body?: any,
): Promise<any> {
  console.log(`[BACKEND] ${method} ${endpoint}`)

  // Route: Generate
  if (endpoint === '/api/gamma/generate' && method === 'POST') {
    return handleGenerateRequest(body)
  }

  // Route: Status
  if (endpoint.startsWith('/api/gamma/status/') && method === 'GET') {
    const generationId = endpoint.split('/').pop()
    return handleStatusRequest(generationId!)
  }

  throw new Error(`Endpoint ${endpoint} not found`)
}

/**
 * Handler for POST /api/gamma/generate
 * Calls the Real Gamma API
 */
async function handleGenerateRequest(data: ProposalFormValues) {
  if (!GAMMA_API_KEY) {
    throw {
      status: 500,
      message: 'Server Configuration Error: GAMMA_API_KEY missing',
    }
  }

  try {
    const dynamicData = buildServerSidePrompt(data)

    // Construct the payload for Gamma API
    const payload = {
      templateId: GAMMA_TEMPLATE_ID,
      exportAs: 'pdf', // Required by User Story
      dynamicData: dynamicData,
    }

    // Call Gamma API
    const response = await fetch(`${BASE_API_URL}/from-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GAMMA_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw {
        status: response.status,
        message: 'Gamma API Request Failed',
        body: errorBody,
      }
    }

    const responseData = await response.json()

    // Return the ID for polling
    return { id: responseData.id }
  } catch (error: any) {
    console.error('Generation Error:', error)
    throw {
      status: error.status || 500,
      message: error.message || 'Internal Server Error during generation',
      body: error.body,
    }
  }
}

/**
 * Handler for GET /api/gamma/status/:id
 * Polls the Real Gamma API
 */
async function handleStatusRequest(
  generationId: string,
): Promise<GammaGenerationResponse> {
  if (!GAMMA_API_KEY) {
    throw { status: 500, message: 'GAMMA_API_KEY missing' }
  }

  try {
    const response = await fetch(`${BASE_API_URL}/${generationId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GAMMA_API_KEY}`,
      },
    })

    if (!response.ok) {
      // If 404, return undefined or error
      if (response.status === 404) {
        throw { status: 404, message: 'Generation Job not found on Gamma' }
      }
      throw { status: response.status, message: 'Failed to check status' }
    }

    const data = await response.json()
    const status = data.status || 'IN_PROGRESS'

    // Map the response to our internal structure
    const result: GammaGenerationResponse = {
      id: data.id,
      status: status,
    }

    // If completed, extract URLs
    if (status === 'COMPLETED' || status === 'completed') {
      result.status = 'COMPLETED'
      result.output = {
        pdf: { url: extractPdfUrl(data) || '' },
        gamma: { url: extractGammaUrl(data) || '' },
      }
    } else if (
      status === 'ERROR' ||
      status === 'error' ||
      status === 'FAILED'
    ) {
      result.status = 'FAILED'
    } else {
      result.status = 'IN_PROGRESS'
    }

    return result
  } catch (error: any) {
    console.error('Status Check Error:', error)
    throw error
  }
}

// Export for compatibility
export const buildGammaPrompt = buildServerSidePrompt

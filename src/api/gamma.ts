/**
 * SIMULATED BACKEND API
 *
 * This file acts as a mock server to handle Gamma API interactions securely.
 * In a production environment, this logic would reside in a Node.js/Edge function.
 * It intercepts requests to '/api/gamma/*' and simulates the server-side processing.
 */

import { ProposalFormValues, GammaGenerationResponse } from '@/types'
import { formatCurrency, generateId } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// --- BACKEND CONFIGURATION (Simulated) ---
const GAMMA_API_KEY = import.meta.env.VITE_GAMMA_API_KEY
const GAMMA_TEMPLATE_ID = 'j4euglofm0z6e7e'
const PUBLIC_API_URL =
  'https://public-api.gamma.app/v1.0/generations/from-template'

// Simulated Database to persist job status
const jobStore = new Map<
  string,
  {
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
    createdAt: number
    pdfUrl?: string
    gammaUrl?: string
    logs: string[]
  }
>()

/**
 * Builds the prompt based on the specific template placeholders.
 * This function effectively runs "Server-Side".
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
 * Router / Dispatcher for Simulated Backend Requests
 */
export async function mockBackendFetch(
  endpoint: string,
  method: 'POST' | 'GET',
  body?: any,
): Promise<any> {
  // Simulate network latency (500ms - 1500ms)
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 1000),
  )

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
 */
async function handleGenerateRequest(data: ProposalFormValues) {
  // 1. Security Check
  if (!GAMMA_API_KEY) {
    throw {
      status: 500,
      message: 'Server Configuration Error: GAMMA_API_KEY missing',
    }
  }

  try {
    // 2. Build Payload
    const placeholders = buildServerSidePrompt(data)

    const payload = {
      gammaId: GAMMA_TEMPLATE_ID,
      exportAs: 'pdf',
      ...placeholders,
    }

    // 3. Log External Call (Simulated)
    console.groupCollapsed('Backend: External API Call')
    console.log(`POST ${PUBLIC_API_URL}`)
    console.log('Headers:', { Authorization: 'Bearer ************' })
    console.log('Body:', payload)
    console.groupEnd()

    // 4. Create Job (Simulated External Response)
    const generationId = generateId()

    // Store job in "Database"
    jobStore.set(generationId, {
      status: 'IN_PROGRESS',
      createdAt: Date.now(),
      logs: ['Job created', 'Sent to Gamma API'],
    })

    // Start background process to complete the job
    simulateGammaProcessing(generationId)

    return { id: generationId }
  } catch (error: any) {
    throw {
      status: 500,
      message: 'Internal Server Error during generation',
      body: error.message,
      stack: error.stack,
    }
  }
}

/**
 * Handler for GET /api/gamma/status/:id
 */
async function handleStatusRequest(
  generationId: string,
): Promise<GammaGenerationResponse> {
  const job = jobStore.get(generationId)

  if (!job) {
    throw { status: 404, message: 'Generation Job not found' }
  }

  // Simulate server-side polling of Gamma
  if (job.status === 'COMPLETED') {
    return {
      id: generationId,
      status: 'COMPLETED',
      output: {
        pdf: { url: job.pdfUrl || '' },
        gamma: { url: job.gammaUrl || '' },
      },
    }
  } else if (job.status === 'FAILED') {
    return { id: generationId, status: 'FAILED' }
  }

  return { id: generationId, status: 'IN_PROGRESS' }
}

/**
 * Background Worker Simulation
 * Updates the job status after a delay to simulate Gamma processing time.
 */
function simulateGammaProcessing(id: string) {
  // 30% chance of "long processing", otherwise 5-8 seconds
  const processingTime = 5000 + Math.random() * 3000

  setTimeout(() => {
    const job = jobStore.get(id)
    if (job) {
      job.status = 'COMPLETED'
      job.pdfUrl =
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Mock PDF
      job.gammaUrl = `https://gamma.app/docs/proposta-${id}` // Mock Gamma URL
      jobStore.set(id, job)
      console.log(`[BACKGROUND] Job ${id} completed`)
    }
  }, processingTime)
}

// Export a dummy for compatibility if needed, though we use mockBackendFetch mainly
export const buildGammaPrompt = buildServerSidePrompt

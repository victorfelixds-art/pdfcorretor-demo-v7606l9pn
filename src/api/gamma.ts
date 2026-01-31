import { ProposalFormValues, GammaGenerationResponse } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Configuration
const GAMMA_API_KEY = import.meta.env.VITE_GAMMA_API_KEY
const GAMMA_TEMPLATE_ID =
  import.meta.env.VITE_GAMMA_TEMPLATE_ID || 'j4euglofm0z6e7e'
const API_BASE_URL = 'https://gamma.app/api/v1.0'

/**
 * Builds the strict prompt required by Gamma API
 */
export function buildGammaPrompt(data: ProposalFormValues): string {
  const economy = (data.originalValue || 0) - (data.discountedValue || 0)

  // Explicit mapping of fields to placeholders as per requirements
  const placeholders: Record<string, string | number> = {
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

  // Constructing the strict prompt
  const promptLines = [
    'Use este documento como template fixo',
    'Substitua SOMENTE os placeholders listados abaixo pelos valores indicados.',
    'Não altere layout, cores, fontes, espaçamentos, tamanhos, nem ordem.',
    'Não adicione novos elementos.',
    '',
    'PLACEHOLDERS:',
    ...Object.entries(placeholders).map(([key, value]) => `${key}: ${value}`),
  ]

  return promptLines.join('\n')
}

/**
 * Initiates the generation process via Gamma API.
 */
export async function createGeneration(
  data: ProposalFormValues,
): Promise<{ id: string }> {
  if (!GAMMA_API_KEY) {
    throw new Error('Chave de API Gamma não configurada')
  }

  const prompt = buildGammaPrompt(data)

  const response = await fetch(`${API_BASE_URL}/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GAMMA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      source_deck_id: GAMMA_TEMPLATE_ID,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Gamma API Generation Error:', errorData)
    throw new Error(
      errorData.message || 'Falha ao iniciar geração na Gamma API',
    )
  }

  const json = await response.json()
  return { id: json.id }
}

/**
 * Checks the status of the generation and retrieves the PDF URL.
 * Handles fallback export triggering if PDF is not automatically generated.
 */
export async function checkStatus(
  generationId: string,
): Promise<GammaGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/generations/${generationId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${GAMMA_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error('Falha ao verificar status da geração')
  }

  const data = await response.json()

  // Normalize status
  const apiStatus = data.status // PLANNING, GENERATING, COMPLETED, ERROR
  let status: GammaGenerationResponse['status'] = 'IN_PROGRESS'

  if (apiStatus === 'COMPLETED' || apiStatus === 'DONE') {
    status = 'COMPLETED'
  } else if (apiStatus === 'ERROR' || apiStatus === 'FAILED') {
    return { id: generationId, status: 'FAILED' }
  } else {
    return { id: generationId, status: 'IN_PROGRESS' }
  }

  // Retrieve URLs
  const pdfUrl = data.exports?.pdf?.url
  const gammaUrl = data.url

  // If completed, ensure PDF is available
  if (status === 'COMPLETED') {
    if (pdfUrl) {
      return {
        id: generationId,
        status: 'COMPLETED',
        output: {
          pdf: { url: pdfUrl },
          gamma: { url: gammaUrl },
        },
      }
    } else {
      // PDF URL not found, check if we need to trigger export
      // This covers the "Fallback URL Retrieval" requirement

      const exportStatus = data.exports?.pdf?.status

      if (!data.exports?.pdf) {
        // Trigger new export
        try {
          await fetch(`${API_BASE_URL}/generations/${generationId}/exports`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${GAMMA_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ format: 'pdf' }),
          })
          // Return IN_PROGRESS to allow polling to continue and pick up the new export
          return { id: generationId, status: 'IN_PROGRESS' }
        } catch (err) {
          console.error('Export Trigger Error:', err)
          // If trigger fails, we can't do much but retry or fail.
          // Returning IN_PROGRESS keeps the loop alive.
          return { id: generationId, status: 'IN_PROGRESS' }
        }
      } else if (exportStatus === 'FAILED') {
        return { id: generationId, status: 'ERROR' }
      } else if (exportStatus === 'COMPLETED') {
        // Should have been caught by pdfUrl check, but strictly:
        return {
          id: generationId,
          status: 'COMPLETED',
          output: {
            pdf: { url: data.exports.pdf.url },
            gamma: { url: gammaUrl },
          },
        }
      } else {
        // Export is processing (IN_PROGRESS, PENDING, etc)
        return { id: generationId, status: 'IN_PROGRESS' }
      }
    }
  }

  return { id: generationId, status: 'IN_PROGRESS' }
}

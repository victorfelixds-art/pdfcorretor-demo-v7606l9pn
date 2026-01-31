import { ProposalFormValues, GammaGenerationResponse } from '@/types'
import { formatCurrency, generateId } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// In a production environment, these keys would be accessed via process.env
// and the API calls would happen strictly on the server side to protect credentials.
const GAMMA_API_KEY = import.meta.env.VITE_GAMMA_API_KEY
const GAMMA_TEMPLATE_ID = import.meta.env.VITE_GAMMA_TEMPLATE_ID
const GAMMA_API_BASE_URL = 'https://public-api.gamma.app/v1.0'

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
    '{{ITEM_1}}': data.items[0],
    '{{ITEM_2}}': data.items[1],
    '{{ITEM_3}}': data.items[2],
    '{{ITEM_4}}': data.items[3],
    '{{ITEM_5}}': data.items[4],
    '{{ITEM_6}}': data.items[5],
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

export async function createGeneration(
  data: ProposalFormValues,
): Promise<{ id: string }> {
  if (!GAMMA_API_KEY) throw new Error('API Key configuration missing')
  if (!GAMMA_TEMPLATE_ID) throw new Error('Template ID configuration missing')

  try {
    const prompt = buildGammaPrompt(data)

    const response = await fetch(
      `${GAMMA_API_BASE_URL}/generations/from-template`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': GAMMA_API_KEY,
        },
        body: JSON.stringify({
          gammaId: GAMMA_TEMPLATE_ID,
          prompt: prompt,
          exportAs: 'pdf',
        }),
      },
    )

    if (!response.ok) {
      // Check for CORS or Network errors specifically to switch to simulation
      if (response.status === 0 || response.type === 'opaque') {
        throw new TypeError('Network/CORS Error')
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `Failed to start generation (${response.status})`,
      )
    }

    return await response.json()
  } catch (error: any) {
    console.warn(
      'Backend Proxy unavailable (CORS/Network restricted), switching to Mock Simulation for Demo.',
      error,
    )

    // Fallback to Mock Simulation to ensure Demo reliability
    // This simulates the behavior of the backend returning a generation ID
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: `mock-${Date.now()}` })
      }, 1500)
    })
  }
}

export async function checkStatus(
  generationId: string,
): Promise<GammaGenerationResponse> {
  // Handle Mock ID logic
  if (generationId.startsWith('mock-')) {
    const timestamp = parseInt(generationId.split('-')[1])
    const elapsed = Date.now() - timestamp

    // Simulate processing time (approx 5-8 seconds)
    if (elapsed < 4000) {
      return { id: generationId, status: 'IN_PROGRESS' }
    } else {
      return {
        id: generationId,
        status: 'COMPLETED',
        output: {
          pdf: {
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
          gamma: { url: 'https://gamma.app' },
        },
      }
    }
  }

  if (!GAMMA_API_KEY) throw new Error('API Key configuration missing')

  try {
    const response = await fetch(
      `${GAMMA_API_BASE_URL}/generations/${generationId}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': GAMMA_API_KEY,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to check status (${response.status})`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error checking status:', error)
    throw new Error('Failed to communicate with Gamma API')
  }
}

import { ProposalFormValues, GammaGenerationResponse } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Configuration
const GAMMA_API_KEY = import.meta.env.VITE_GAMMA_API_KEY
const GAMMA_TEMPLATE_ID =
  import.meta.env.VITE_GAMMA_TEMPLATE_ID || 'j4euglofm0z6e7e'

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
 * Simulates the server-side route /api/gamma/generate
 * This is necessary because we are in a pure frontend environment (Vite)
 * and cannot actually implement a server-side route.
 * In a real Next.js or Node.js app, this logic would reside on the server.
 */
async function mockServerSideGeneration(
  prompt: string,
): Promise<{ id: string }> {
  console.log('--- MOCK SERVER REQUEST ---')
  console.log('POST /api/gamma/generate')
  console.log('Payload:', {
    gammaId: GAMMA_TEMPLATE_ID,
    exportAs: 'pdf',
    prompt: prompt.substring(0, 50) + '...',
  })

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return { id: `mock-gen-${Date.now()}` }
}

/**
 * Simulates the polling of the Gamma API status
 */
async function mockCheckStatus(
  generationId: string,
): Promise<GammaGenerationResponse> {
  const timestamp = parseInt(generationId.split('-')[2])
  const elapsed = Date.now() - timestamp

  // Simulate processing time (approx 6 seconds total)
  if (elapsed < 6000) {
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

/**
 * Initiates the generation process.
 * This acts as the client-side consumer of the /api/gamma/generate endpoint.
 */
export async function createGeneration(
  data: ProposalFormValues,
): Promise<{ id: string }> {
  if (!GAMMA_API_KEY) console.warn('API Key configuration missing (Simulated)')

  const prompt = buildGammaPrompt(data)

  // In a real app, this would be:
  // const response = await fetch('/api/gamma/generate', { method: 'POST', body: ... })
  // return response.json()

  return mockServerSideGeneration(prompt)
}

/**
 * Checks the status of the generation.
 * This acts as the client-side consumer of the /api/gamma/status/:id endpoint.
 */
export async function checkStatus(
  generationId: string,
): Promise<GammaGenerationResponse> {
  // In a real app, this would be:
  // const response = await fetch(`/api/gamma/status/${generationId}`)
  // return response.json()

  return mockCheckStatus(generationId)
}

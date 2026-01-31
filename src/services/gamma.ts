import { ProposalFormValues } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const GAMMA_API_KEY = import.meta.env.VITE_GAMMA_API_KEY
const GAMMA_TEMPLATE_ID = import.meta.env.VITE_GAMMA_TEMPLATE_ID

export function buildGammaPrompt(data: ProposalFormValues): string {
  const economy = (data.originalValue || 0) - (data.discountedValue || 0)

  // Explicit mapping of fields to placeholders as per requirements
  const placeholders = {
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

export async function triggerGammaGeneration(data: ProposalFormValues) {
  if (!GAMMA_API_KEY) throw new Error('API Key configuration missing')
  if (!GAMMA_TEMPLATE_ID) throw new Error('Template ID configuration missing')

  const prompt = buildGammaPrompt(data)

  const response = await fetch(
    'https://public-api.gamma.app/v1.0/generations/from-template',
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
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to start generation')
  }

  return await response.json()
}

export async function checkGammaStatus(generationId: string) {
  if (!GAMMA_API_KEY) throw new Error('API Key configuration missing')

  const response = await fetch(
    `https://public-api.gamma.app/v1.0/generations/${generationId}`,
    {
      method: 'GET',
      headers: {
        'X-API-KEY': GAMMA_API_KEY,
      },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to check status')
  }

  return await response.json()
}

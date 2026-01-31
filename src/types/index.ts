import { z } from 'zod'

export const proposalSchema = z.object({
  // Client
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  clientPhone: z.string().optional(),

  // Property
  propertyTitle: z.string().min(1, 'Título do imóvel é obrigatório'),
  originalValue: z.number().min(0, 'Valor original é obrigatório'),
  discountedValue: z.number().min(0, 'Valor com desconto é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  area: z.string().min(1, 'Metragem é obrigatória'),
  address: z.string().min(1, 'Endereço é obrigatório'),

  // Items
  items: z.array(z.string().min(1, 'Item não pode ser vazio')).length(6),

  // Payment
  downPayment: z.number().min(0, 'Entrada é obrigatória'),
  installments: z.string().min(1, 'Número de parcelas é obrigatório'),
  annualPayment: z.number().optional(),
  financing: z.number().optional(),

  // Broker
  brokerName: z.string().min(1, 'Nome do corretor é obrigatório'),
  brokerCreci: z.string().min(1, 'CRECI é obrigatório'),
  brokerPhone: z.string().min(1, 'WhatsApp do corretor é obrigatório'),
  brokerImage: z.string().optional(),

  // Validity
  validity: z.date({ required_error: 'Data de validade é obrigatória' }),
})

export type ProposalFormValues = z.infer<typeof proposalSchema>

export interface Proposal extends ProposalFormValues {
  id: string
  createdAt: string
  generationId: string
  pdfUrl?: string
  gammaUrl?: string
}

export interface GammaGenerationResponse {
  id: string
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR' | 'FAILED'
  output?: {
    pdf?: {
      url: string
    }
    gamma?: {
      url: string
    }
  }
}

export interface GammaError {
  message: string
  code?: string
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { proposalSchema, ProposalFormValues, Proposal } from '@/types'
import { ProposalForm } from '@/components/proposal/ProposalForm'
import { ProposalProcessing } from '@/components/proposal/ProposalProcessing'
import { ProposalDelivery } from '@/components/proposal/ProposalDelivery'
import { Button } from '@/components/ui/button'
import { generateId, generateUUID } from '@/lib/utils'

export default function Index() {
  const [step, setStep] = useState<'form' | 'processing' | 'delivery'>('form')
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null)

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      items: [
        'Acabamento de alto padrão',
        'Vaga de garagem coberta',
        'Portaria 24 horas',
        'Área de lazer completa',
        'Localização privilegiada',
        'Varanda gourmet integrada',
      ],
      originalValue: 0,
      discountedValue: 0,
      downPayment: 0,
    },
  })

  const fillExample = () => {
    form.reset({
      clientName: 'Roberto Almeida',
      clientPhone: '(11) 98765-4321',
      propertyTitle: 'Residencial Horizonte Azul',
      originalValue: 1250000,
      discountedValue: 1180000,
      unit: 'Apto 142 - Torre B',
      area: '148',
      address: 'Av. Paulista, 1500 - Jardins, SP',
      items: [
        'Vista panorâmica definitiva',
        '3 Suítes plenas',
        '3 Vagas demarcadas',
        'Automação residencial pronta',
        'Piso em mármore travertino',
        'Depósito privativo no subsolo',
      ],
      downPayment: 354000,
      installments: '48x de R$ 8.500,00',
      annualPayment: 40000,
      financing: 418000,
      brokerName: 'Carlos Eduardo',
      brokerCreci: '12345-F',
      brokerPhone: '(11) 99999-8888',
      validity: new Date(new Date().setDate(new Date().getDate() + 7)),
    })
  }

  const onSubmit = (data: ProposalFormValues) => {
    const proposal: Proposal = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      generationId: generateUUID(),
    }
    setCurrentProposal(proposal)
    setStep('processing')
  }

  const handleProcessingComplete = () => {
    if (currentProposal) {
      // Save to localStorage
      const history = JSON.parse(
        localStorage.getItem('pdfcorretor_history') || '[]',
      )
      localStorage.setItem(
        'pdfcorretor_history',
        JSON.stringify([currentProposal, ...history]),
      )
      setStep('delivery')
    }
  }

  const resetFlow = () => {
    form.reset({
      items: [
        'Acabamento de alto padrão',
        'Vaga de garagem coberta',
        'Portaria 24 horas',
        'Área de lazer completa',
        'Localização privilegiada',
        'Varanda gourmet integrada',
      ],
      originalValue: 0,
      discountedValue: 0,
      downPayment: 0,
    })
    setCurrentProposal(null)
    setStep('form')
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {step === 'form' && (
        <div className="absolute top-[-3.5rem] right-0 z-20">
          <Button
            variant="secondary"
            size="sm"
            onClick={fillExample}
            className="text-xs"
          >
            Preencher Exemplo
          </Button>
        </div>
      )}

      {step === 'form' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Nova Proposta</h2>
            <p className="text-muted-foreground">
              Preencha os dados abaixo para gerar um documento comercial
              profissional.
            </p>
          </div>
          <ProposalForm form={form} onSubmit={onSubmit} />
        </div>
      )}

      {step === 'processing' && currentProposal && (
        <ProposalProcessing
          data={currentProposal}
          onComplete={handleProcessingComplete}
        />
      )}

      {step === 'delivery' && currentProposal && (
        <ProposalDelivery proposal={currentProposal} onReset={resetFlow} />
      )}
    </div>
  )
}

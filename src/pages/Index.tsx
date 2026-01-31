import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { proposalSchema, ProposalFormValues, Proposal } from '@/types'
import { ProposalForm } from '@/components/proposal/ProposalForm'
import { ProposalProcessing } from '@/components/proposal/ProposalProcessing'
import { ProposalDelivery } from '@/components/proposal/ProposalDelivery'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/utils'

// Strict initialization of all fields to prevent uncontrolled inputs
const initialValues: ProposalFormValues = {
  clientName: '',
  clientPhone: '',
  propertyTitle: '',
  originalValue: 0,
  discountedValue: 0,
  unit: '',
  area: '',
  address: '',
  items: ['', '', '', '', '', ''], // Initialize array with empty strings
  downPayment: 0,
  installments: '',
  annualPayment: 0,
  financing: 0,
  brokerName: '',
  brokerCreci: '',
  brokerPhone: '',
  brokerImage: '',
  validity: undefined as unknown as Date, // Date picker handles undefined
}

export default function Index() {
  const [step, setStep] = useState<'form' | 'processing' | 'delivery'>('form')
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null)

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: initialValues,
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
      brokerImage: '',
    })
  }

  const onSubmit = (data: ProposalFormValues) => {
    // We create an initial proposal object without the external IDs
    const proposal: Proposal = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      generationId: '', // Will be filled by Gamma integration
    }
    setCurrentProposal(proposal)
    setStep('processing')
  }

  const handleProcessingComplete = (result: Partial<Proposal>) => {
    if (currentProposal) {
      const completedProposal: Proposal = {
        ...currentProposal,
        ...result, // Merges generationId, pdfUrl, gammaUrl
      }

      setCurrentProposal(completedProposal)

      // Save to localStorage with persistence required by User Story
      // Structure: date/time, cliente, valor_com_desconto, unidade, pdf_link
      const history = JSON.parse(
        localStorage.getItem('pdfcorretor_history') || '[]',
      )

      const historyItem = {
        ...completedProposal,
        // Ensure specific Portuguese keys exist for compliance if inspected directly
        cliente: completedProposal.clientName,
        valor_com_desconto: completedProposal.discountedValue,
        unidade: completedProposal.unit,
        pdf_link: completedProposal.pdfUrl,
        date: completedProposal.createdAt,
      }

      localStorage.setItem(
        'pdfcorretor_history',
        JSON.stringify([historyItem, ...history]),
      )

      setStep('delivery')
    }
  }

  const resetFlow = () => {
    form.reset(initialValues)
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
              profissional via Gamma AI.
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

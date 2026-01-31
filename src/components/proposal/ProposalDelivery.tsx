import { Proposal } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ProposalDeliveryProps {
  proposal: Proposal
  onReset: () => void
}

export function ProposalDelivery({ proposal, onReset }: ProposalDeliveryProps) {
  const handlePrint = () => {
    // Open the print route in a new window
    window.open(`/print/${proposal.id}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">
        Proposta gerada com sucesso!
      </h2>
      <p className="text-slate-500 mb-10 text-center max-w-md">
        O documento foi criado e salvo no seu histórico. Você pode baixar o PDF
        ou visualizar a versão online.
      </p>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
        {/* Preview Card */}
        <Card className="overflow-hidden border-2 border-primary/10 shadow-xl bg-slate-50/50">
          <CardHeader className="bg-white border-b pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium text-slate-500 uppercase tracking-wider">
                Resumo
              </CardTitle>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                {proposal.generationId}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-dashed pb-3">
              <span className="text-slate-500">Cliente</span>
              <span className="font-semibold">{proposal.clientName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed pb-3">
              <span className="text-slate-500">Imóvel</span>
              <span className="font-semibold">{proposal.propertyTitle}</span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed pb-3">
              <span className="text-slate-500">Valor Final</span>
              <span className="font-bold text-emerald-600 text-lg">
                {formatCurrency(proposal.discountedValue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Corretor</span>
              <span className="font-semibold">{proposal.brokerName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col justify-center space-y-4">
          <Button
            onClick={handlePrint}
            size="lg"
            className="h-14 text-lg w-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            <Download className="mr-2 h-5 w-5" />
            Baixar PDF
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="lg"
            className="h-14 text-lg w-full bg-white hover:bg-slate-50"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Abrir versão online
          </Button>

          <div className="pt-4">
            <Button
              onClick={onReset}
              variant="ghost"
              className="w-full text-slate-400 hover:text-slate-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar outra proposta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

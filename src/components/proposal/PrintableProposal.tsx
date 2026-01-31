import { Proposal } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect } from 'react'
import { MapPin, CheckCircle2, Building2, User } from 'lucide-react'

export function PrintableProposal({ proposal }: { proposal: Proposal }) {
  useEffect(() => {
    // Auto-trigger print when component mounts
    document.title = `Proposta - ${proposal.clientName}`
    setTimeout(() => {
      window.print()
    }, 1000) // Small delay to ensure images load
  }, [proposal])

  return (
    <div className="bg-white text-slate-900 min-h-screen p-0 md:p-8 max-w-[210mm] mx-auto print:max-w-none print:p-0">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 md:p-12 print:p-8 rounded-t-xl print:rounded-none">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Proposta Comercial</h1>
            <p className="text-slate-400">
              Gerada em{' '}
              {format(new Date(proposal.createdAt), 'PPP', { locale: ptBR })}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">pdfcorretor</h2>
            <p className="text-sm text-slate-400">{proposal.generationId}</p>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 mt-4">
          <p className="text-lg">Preparada especialmente para</p>
          <h2 className="text-4xl font-bold mt-2 text-white">
            {proposal.clientName}
          </h2>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="grid grid-cols-3 gap-1 mt-1">
        <div className="col-span-2 h-64 bg-slate-100 overflow-hidden relative">
          <img
            src="https://img.usecurling.com/p/800/600?q=luxury%20apartment"
            className="w-full h-full object-cover"
            alt="Main Property"
          />
        </div>
        <div className="col-span-1 grid grid-rows-2 gap-1">
          <div className="h-32 bg-slate-100 overflow-hidden relative">
            <img
              src="https://img.usecurling.com/p/400/300?q=modern%20kitchen"
              className="w-full h-full object-cover"
              alt="Detail 1"
            />
          </div>
          <div className="h-32 bg-slate-100 overflow-hidden relative">
            <img
              src="https://img.usecurling.com/p/400/300?q=living%20room"
              className="w-full h-full object-cover"
              alt="Detail 2"
            />
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12 print:p-8 space-y-10">
        {/* Property Details */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Building2 className="h-6 w-6" />
            <h3 className="text-2xl font-bold text-slate-900">O Imóvel</h3>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-xl font-bold text-slate-800">
                {proposal.propertyTitle}
              </h4>
              <div className="flex items-center text-slate-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {proposal.address}
              </div>
            </div>
            <div className="text-right">
              <span className="block text-sm text-slate-500 uppercase tracking-wider">
                Unidade
              </span>
              <span className="block text-xl font-bold">{proposal.unit}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg print:border print:border-slate-200">
              <span className="block text-sm text-slate-500">
                Metragem Privativa
              </span>
              <span className="block text-xl font-bold text-slate-900">
                {proposal.area}m²
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg print:border print:border-slate-200">
              <span className="block text-sm text-slate-500">
                Valor de Tabela
              </span>
              <span className="block text-xl font-bold text-slate-500 line-through">
                {formatCurrency(proposal.originalValue)}
              </span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg print:border print:border-emerald-100">
              <span className="block text-sm text-emerald-700 font-medium">
                Condição Especial
              </span>
              <span className="block text-xl font-bold text-emerald-700">
                {formatCurrency(proposal.discountedValue)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {proposal.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Payment */}
        <section>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Fluxo de Pagamento
          </h3>
          <div className="bg-slate-50 rounded-xl p-6 print:border print:border-slate-200">
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <span className="block text-sm text-slate-500 mb-1">
                  Entrada / Ato
                </span>
                <span className="block text-xl font-bold text-slate-900">
                  {formatCurrency(proposal.downPayment)}
                </span>
              </div>
              <div>
                <span className="block text-sm text-slate-500 mb-1">
                  Mensais
                </span>
                <span className="block text-xl font-bold text-slate-900">
                  {proposal.installments}
                </span>
              </div>
              {proposal.annualPayment && (
                <div>
                  <span className="block text-sm text-slate-500 mb-1">
                    Intermediárias / Anuais
                  </span>
                  <span className="block text-xl font-bold text-slate-900">
                    {formatCurrency(proposal.annualPayment)}
                  </span>
                </div>
              )}
              {proposal.financing && (
                <div>
                  <span className="block text-sm text-slate-500 mb-1">
                    Financiamento Bancário
                  </span>
                  <span className="block text-xl font-bold text-slate-900">
                    {formatCurrency(proposal.financing)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            * Valores sujeitos a alteração sem aviso prévio. Proposta válida até{' '}
            {format(new Date(proposal.validity), 'dd/MM/yyyy')}.
          </p>
        </section>

        <hr className="border-slate-200" />

        {/* Broker */}
        <section className="flex items-center gap-6 bg-slate-900 text-white p-6 rounded-xl print:bg-white print:text-slate-900 print:border print:border-slate-200">
          <div className="h-20 w-20 rounded-full bg-slate-700 overflow-hidden shrink-0 print:bg-slate-100">
            <img
              src={
                proposal.brokerImage ||
                'https://img.usecurling.com/ppl/medium?gender=male'
              }
              className="w-full h-full object-cover"
              alt="Broker"
            />
          </div>
          <div>
            <h4 className="text-xl font-bold">{proposal.brokerName}</h4>
            <div className="flex items-center gap-4 mt-2 text-slate-300 print:text-slate-600">
              <span className="flex items-center gap-1 text-sm">
                <User className="h-4 w-4" /> CRECI {proposal.brokerCreci}
              </span>
              <span className="text-sm">{proposal.brokerPhone}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

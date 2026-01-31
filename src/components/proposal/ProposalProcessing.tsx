import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProposalFormValues } from '@/types'

interface ProposalProcessingProps {
  data: ProposalFormValues
  onComplete: () => void
}

export function ProposalProcessing({
  data,
  onComplete,
}: ProposalProcessingProps) {
  const [step, setStep] = useState(0)
  const steps = [
    { label: 'Validando dados...', duration: 800 },
    { label: 'Enviando para Gamma API...', duration: 1200 },
    { label: 'Gerando layout PDF...', duration: 1800 },
    { label: 'Finalizando documento...', duration: 600 },
  ]

  useEffect(() => {
    let currentStep = 0
    let timeoutId: NodeJS.Timeout

    const runStep = () => {
      if (currentStep >= steps.length) {
        onComplete()
        return
      }

      timeoutId = setTimeout(() => {
        setStep((prev) => prev + 1)
        currentStep++
        runStep()
      }, steps[currentStep].duration)
    }

    runStep()

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[600px] animate-in fade-in duration-500">
      {/* Left: Stepper */}
      <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border flex flex-col justify-center items-center md:items-start">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-800">
            Processando Proposta
          </h2>
          <p className="text-slate-500">
            Aguarde enquanto nossa IA gera seu documento.
          </p>
        </div>

        <div className="space-y-6 w-full max-w-sm">
          {steps.map((s, index) => {
            const isActive = index === step
            const isCompleted = index < step

            return (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500',
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-600 scale-110'
                      : isActive
                        ? 'bg-primary/10 text-primary scale-110'
                        : 'bg-slate-100 text-slate-300',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      'font-medium transition-colors duration-300',
                      isCompleted
                        ? 'text-emerald-700'
                        : isActive
                          ? 'text-primary'
                          : 'text-slate-400',
                    )}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Technical Log */}
      <div className="flex-1 bg-slate-900 rounded-xl p-6 font-mono text-xs text-green-400 overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50 animate-pulse" />
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
          <span className="text-slate-400">gamma-api-log.json</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            v2.1.0
          </span>
        </div>

        <div className="space-y-2 opacity-90">
          <p className="text-slate-500">{'// Request Payload'}</p>
          <div className="pl-4 border-l-2 border-slate-700">
            <p>POST /api/v1/generate</p>
            <p>Content-Type: application/json</p>
            <p>{'{'}</p>
            <p className="pl-4">
              <span className="text-purple-400">"gammaId"</span>:{' '}
              <span className="text-yellow-300">"TEMPLATE_REAL_ESTATE_01"</span>
              ,
            </p>
            <p className="pl-4">
              <span className="text-purple-400">"requestId"</span>:{' '}
              <span className="text-yellow-300">
                "req_{Math.random().toString(36).substr(2, 9)}"
              </span>
              ,
            </p>
            <p className="pl-4">
              <span className="text-purple-400">"data"</span>: {'{'}
            </p>
            <p className="pl-8">
              <span className="text-blue-300">"client"</span>: "
              {data.clientName}",
            </p>
            <p className="pl-8">
              <span className="text-blue-300">"property"</span>: "
              {data.propertyTitle}",
            </p>
            <p className="pl-8">
              <span className="text-blue-300">"value"</span>:{' '}
              {data.discountedValue},
            </p>
            <p className="pl-8">
              <span className="text-blue-300">"broker"</span>: "
              {data.brokerName}"
            </p>
            <p className="pl-4">{'}'}</p>
            <p>{'}'}</p>
          </div>

          <div className="mt-8">
            <p className="text-slate-500">{'// Response Stream'}</p>
            {step > 0 && (
              <p className="animate-fade-in text-yellow-300">
                {'>'} Validating schema...
              </p>
            )}
            {step > 1 && (
              <p className="animate-fade-in text-blue-300">
                {'>'} Uploading assets to CDN...
              </p>
            )}
            {step > 2 && (
              <p className="animate-fade-in text-purple-300">
                {'>'} Rendering PDF pages [1/3]...
              </p>
            )}
            {step > 3 && (
              <p className="animate-fade-in text-green-300">
                {'>'} Document ready. buffer_size: 2.4MB
              </p>
            )}
          </div>
        </div>

        {step < 3 && (
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent" />
        )}
      </div>
    </div>
  )
}

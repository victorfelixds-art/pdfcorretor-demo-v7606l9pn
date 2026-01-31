import { useEffect, useState, useRef } from 'react'
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProposalFormValues, Proposal } from '@/types'
import { triggerGammaGeneration, checkGammaStatus } from '@/services/gamma'
import { toast } from 'sonner'

interface ProposalProcessingProps {
  data: ProposalFormValues
  onComplete: (result: Partial<Proposal>) => void
}

export function ProposalProcessing({
  data,
  onComplete,
}: ProposalProcessingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const steps = [
    { label: 'Validando dados...', key: 'validating' },
    { label: 'Enviando para Gamma API...', key: 'sending' },
    { label: 'Gerando documento...', key: 'generating' },
    { label: 'Finalizando...', key: 'finalizing' },
  ]

  const addLog = (msg: string, color: string = 'text-slate-400') => {
    setLogs((prev) => [...prev, `<span class="${color}">${msg}</span>`])
  }

  useEffect(() => {
    let isMounted = true

    const process = async () => {
      try {
        // Step 0: Validation (Mock)
        addLog('> Starting validation...', 'text-yellow-300')
        await new Promise((r) => setTimeout(r, 800))
        if (!isMounted) return
        setCurrentStep(1)
        addLog('> Validation successful', 'text-green-400')

        // Step 1: Sending to API
        addLog('> Initializing Gamma API connection...', 'text-blue-300')
        addLog(
          `> Template ID: ${import.meta.env.VITE_GAMMA_TEMPLATE_ID}`,
          'text-slate-500',
        )

        let generationId: string
        try {
          const generationResponse = await triggerGammaGeneration(data)
          generationId = generationResponse.id
          if (!isMounted) return
          setCurrentStep(2)
          addLog(`> Generation started: ${generationId}`, 'text-purple-300')
          addLog('> Waiting for PDF rendering...', 'text-purple-300')
        } catch (apiError: any) {
          if (!isMounted) return
          addLog(`> API Error: ${apiError.message}`, 'text-red-500')
          throw apiError
        }

        // Step 2: Polling
        const poll = async () => {
          try {
            if (!isMounted) return

            const statusResponse = await checkGammaStatus(generationId)
            const status = statusResponse.status

            if (status === 'COMPLETED') {
              if (!isMounted) return
              setCurrentStep(3)
              addLog('> Generation completed successfully!', 'text-green-400')

              if (statusResponse.output?.pdf?.url) {
                addLog(
                  `> PDF URL: ${statusResponse.output.pdf.url.substring(0, 40)}...`,
                  'text-slate-500',
                )
              }

              // Give a small delay for UI smoothness
              setTimeout(() => {
                onComplete({
                  generationId: generationId,
                  pdfUrl: statusResponse.output?.pdf?.url,
                  gammaUrl: statusResponse.output?.gamma?.url,
                })
              }, 1500)
            } else if (status === 'ERROR' || status === 'FAILED') {
              throw new Error('Gamma generation status: FAILED')
            } else {
              // Still processing
              if (isMounted) {
                addLog(`> Status: ${status} - Polling...`, 'text-slate-500')
                pollingRef.current = setTimeout(poll, 2000)
              }
            }
          } catch (err: any) {
            console.error(err)
            if (isMounted) {
              setError(err.message || 'Erro ao verificar status da geração.')
              addLog(`> Error polling status: ${err.message}`, 'text-red-500')
              toast.error('Erro na comunicação com Gamma API')
            }
          }
        }

        poll()
      } catch (err: any) {
        console.error(err)
        if (isMounted) {
          setError(err.message || 'Ocorreu um erro inesperado.')
          addLog(`> Fatal Error: ${err.message}`, 'text-red-500')
          toast.error('Falha na geração da proposta')
        }
      }
    }

    process()

    return () => {
      isMounted = false
      if (pollingRef.current) clearTimeout(pollingRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[600px] animate-in fade-in duration-500">
      {/* Left: Stepper */}
      <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border flex flex-col justify-center items-center md:items-start relative overflow-hidden">
        {error && (
          <div className="absolute top-0 left-0 w-full bg-red-50 p-4 border-b border-red-100 flex items-center gap-2 text-red-700 animate-in slide-in-from-top">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="mb-8 text-center md:text-left mt-8 md:mt-0">
          <h2 className="text-2xl font-bold text-slate-800">
            Processando Proposta
          </h2>
          <p className="text-slate-500">
            Integração Gamma API v1.0 em andamento.
          </p>
        </div>

        <div className="space-y-6 w-full max-w-sm">
          {steps.map((s, index) => {
            const isActive = index === currentStep && !error
            const isCompleted = index < currentStep
            const isError = index === currentStep && error

            return (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500',
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-600 scale-110'
                      : isError
                        ? 'bg-red-100 text-red-600'
                        : isActive
                          ? 'bg-primary/10 text-primary scale-110'
                          : 'bg-slate-100 text-slate-300',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isError ? (
                    <AlertCircle className="h-5 w-5" />
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
                        : isError
                          ? 'text-red-600'
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
      <div className="flex-1 bg-slate-900 rounded-xl p-6 font-mono text-xs text-green-400 overflow-hidden relative shadow-2xl flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50 animate-pulse" />
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2 shrink-0">
          <span className="text-slate-400">gamma-api-stream.log</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            v1.0
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 opacity-90 pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <p className="text-slate-500">{'// Initializing session...'}</p>
          {logs.map((log, i) => (
            <p
              key={i}
              className="animate-fade-in"
              dangerouslySetInnerHTML={{ __html: log }}
            />
          ))}
          {currentStep === 2 && (
            <p className="animate-pulse text-slate-500">_</p>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

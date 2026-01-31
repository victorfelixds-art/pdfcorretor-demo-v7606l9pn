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

  // Mapped exactly to User Story requirements: Enviando -> Gerando -> Finalizando
  const steps = [
    { label: 'Enviando', key: 'sending' },
    { label: 'Gerando', key: 'generating' },
    { label: 'Finalizando', key: 'finalizing' },
  ]

  const addLog = (msg: string, color: string = 'text-slate-400') => {
    setLogs((prev) => [...prev, `<span class="${color}">${msg}</span>`])
  }

  useEffect(() => {
    let isMounted = true

    const process = async () => {
      try {
        // Step 1: Enviando (Sending)
        addLog('> Inicializando conexão segura com API...', 'text-blue-300')
        addLog('> Preparando prompt fixo do template...', 'text-slate-500')

        // Simulate "Validating" internally before showing step completion
        await new Promise((r) => setTimeout(r, 1000))

        let generationId: string
        try {
          const generationResponse = await triggerGammaGeneration(data)
          generationId = generationResponse.id

          if (!isMounted) return
          setCurrentStep(1) // Move to 'Gerando'
          addLog(`> ID de Geração recebido: ${generationId}`, 'text-purple-300')
        } catch (apiError: any) {
          if (!isMounted) return
          addLog(`> Erro de API: ${apiError.message}`, 'text-red-500')
          throw apiError
        }

        // Step 2: Gerando (Generating - Polling)
        addLog('> Aguardando renderização do PDF...', 'text-yellow-300')

        const poll = async () => {
          try {
            if (!isMounted) return

            const statusResponse = await checkGammaStatus(generationId)
            const status = statusResponse.status

            if (status === 'COMPLETED') {
              if (!isMounted) return
              setCurrentStep(2) // Move to 'Finalizando'
              addLog('> Geração concluída com sucesso!', 'text-green-400')

              if (statusResponse.output?.pdf?.url) {
                addLog(
                  `> PDF URL: ${statusResponse.output.pdf.url.substring(0, 40)}...`,
                  'text-slate-500',
                )
              }

              // Step 3: Finalizando (Finalizing)
              await new Promise((r) => setTimeout(r, 1500)) // Artificial delay to show "Finalizando" state

              onComplete({
                generationId: generationId,
                pdfUrl: statusResponse.output?.pdf?.url,
                gammaUrl: statusResponse.output?.gamma?.url,
              })
            } else if (status === 'ERROR' || status === 'FAILED') {
              throw new Error('Falha na geração Gamma')
            } else {
              // Still processing
              if (isMounted) {
                addLog(
                  `> Status: ${status} - Verificando novamente...`,
                  'text-slate-500',
                )
                pollingRef.current = setTimeout(poll, 2000)
              }
            }
          } catch (err: any) {
            console.error(err)
            if (isMounted) {
              setError(err.message || 'Erro ao verificar status da geração.')
              addLog(`> Erro polling: ${err.message}`, 'text-red-500')
              toast.error('Erro na comunicação com Gamma API')
            }
          }
        }

        poll()
      } catch (err: any) {
        console.error(err)
        if (isMounted) {
          setError(err.message || 'Ocorreu um erro inesperado.')
          addLog(`> Erro Fatal: ${err.message}`, 'text-red-500')
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
    <div className="flex flex-col md:flex-row gap-8 h-[500px] animate-in fade-in duration-500">
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
            Gerando Proposta
          </h2>
          <p className="text-slate-500">
            Aguarde enquanto processamos seu documento.
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
                    'h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 border-2',
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                      : isError
                        ? 'bg-red-50 border-red-500 text-red-600'
                        : isActive
                          ? 'bg-primary/5 border-primary text-primary animate-pulse'
                          : 'bg-slate-50 border-slate-200 text-slate-300',
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
                      'font-medium text-lg transition-colors duration-300',
                      isCompleted
                        ? 'text-emerald-700'
                        : isError
                          ? 'text-red-600'
                          : isActive
                            ? 'text-primary font-bold'
                            : 'text-slate-400',
                    )}
                  >
                    {s.label}
                  </p>
                  {isActive && (
                    <p className="text-xs text-muted-foreground animate-pulse">
                      Processando...
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Technical Log */}
      <div className="flex-1 bg-slate-950 rounded-xl p-6 font-mono text-xs text-emerald-400 overflow-hidden relative shadow-2xl flex flex-col border border-slate-800">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2 shrink-0">
          <span className="text-slate-400 font-semibold">
            backend-proxy.log
          </span>
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 opacity-90 pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {logs.map((log, i) => (
            <p
              key={i}
              className="animate-fade-in break-words leading-relaxed"
              dangerouslySetInnerHTML={{ __html: log }}
            />
          ))}
          {!error && (
            <div className="flex items-center gap-1 text-emerald-500/50 animate-pulse">
              <span>_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState, useRef } from 'react'
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Terminal,
  Lock,
} from 'lucide-react'
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
    { label: 'Enviando', key: 'sending' },
    { label: 'Gerando', key: 'generating' },
    { label: 'Finalizando', key: 'finalizing' },
  ]

  const addLog = (
    msg: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info',
  ) => {
    let colorClass = 'text-slate-400'
    let prefix = '>'

    switch (type) {
      case 'success':
        colorClass = 'text-emerald-400'
        prefix = '✓'
        break
      case 'error':
        colorClass = 'text-red-400'
        prefix = '✗'
        break
      case 'warning':
        colorClass = 'text-yellow-400'
        prefix = '!'
        break
      case 'info':
      default:
        colorClass = 'text-blue-300'
        break
    }

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour12: false })
    const logHtml = `<span class="text-slate-600 mr-2">[${timestamp}]</span><span class="${colorClass} font-bold mr-2">${prefix}</span><span class="${colorClass}">${msg}</span>`

    setLogs((prev) => [...prev, logHtml])
  }

  useEffect(() => {
    let isMounted = true

    const process = async () => {
      try {
        // Step 1: Enviando (Sending)
        addLog('Iniciando conexão segura...', 'info')
        addLog('POST /api/gamma/generate', 'info')

        let generationId: string
        try {
          const generationResponse = await triggerGammaGeneration(data)
          generationId = generationResponse.id

          if (!isMounted) return
          setCurrentStep(1) // Move to 'Gerando'
          addLog(`Job Created: ${generationId}`, 'success')
          addLog('Gamma API: Processing...', 'warning')
        } catch (apiError: any) {
          if (!isMounted) return

          let errorObj
          try {
            errorObj = JSON.parse(apiError.message)
          } catch {
            errorObj = { message: apiError.message, status: 500 }
          }

          addLog(`HTTP ${errorObj.status} - ${errorObj.message}`, 'error')
          if (errorObj.details) {
            addLog(`Body: ${JSON.stringify(errorObj.details)}`, 'error')
          }
          throw apiError
        }

        // Step 2: Gerando (Generating - Polling)
        const poll = async () => {
          try {
            if (!isMounted) return

            const statusResponse = await checkGammaStatus(generationId)
            const status = statusResponse.status

            if (status === 'COMPLETED') {
              if (!isMounted) return
              setCurrentStep(2) // Move to 'Finalizando'
              addLog('Gamma API: Generation COMPLETED', 'success')

              if (statusResponse.output?.pdf?.url) {
                addLog('PDF URL resolved successfully', 'success')
              } else {
                addLog('PDF URL not found in response', 'warning')
              }

              // Step 3: Finalizando (Finalizing)
              // Small delay for UX transition
              await new Promise((r) => setTimeout(r, 800))

              onComplete({
                generationId: generationId,
                pdfUrl: statusResponse.output?.pdf?.url,
                gammaUrl: statusResponse.output?.gamma?.url,
              })
            } else if (status === 'ERROR' || status === 'FAILED') {
              throw new Error('Gamma API reported FAILED status')
            } else {
              // Still processing
              if (isMounted) {
                // addLog(`Polling... [${status}]`, 'info') // Optional: reduce noise
                pollingRef.current = setTimeout(poll, 3000)
              }
            }
          } catch (err: any) {
            console.error(err)
            if (isMounted) {
              setError('Falha na verificação de status')
              addLog(`Polling Error: ${err.message}`, 'error')
              toast.error('Erro na comunicação com Gamma API')
            }
          }
        }

        // Start Polling
        setTimeout(poll, 2000)
      } catch (err: any) {
        console.error(err)
        if (isMounted) {
          let msg = err.message
          try {
            const parsed = JSON.parse(err.message)
            msg = parsed.message
          } catch {
            // Ignore JSON parse error
          }

          setError(msg || 'Ocorreu um erro inesperado.')
          addLog(`Process Terminated: ${msg}`, 'error')
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
    <div className="flex flex-col lg:flex-row gap-8 min-h-[500px] animate-in fade-in duration-500">
      {/* Left: Stepper */}
      <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border flex flex-col justify-center relative overflow-hidden">
        {error && (
          <div className="absolute top-0 left-0 w-full bg-red-50 p-4 border-b border-red-100 flex items-center gap-2 text-red-700 animate-in slide-in-from-top">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="mb-8 mt-8 lg:mt-0">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Processando Proposta
            <span className="text-xs font-normal px-2 py-1 bg-slate-100 rounded-full text-slate-500 border">
              v2.1 (Live)
            </span>
          </h2>
          <p className="text-slate-500 mt-1">
            Geração em tempo real via Gamma AI. Aguarde...
          </p>
        </div>

        <div className="space-y-6 w-full max-w-sm">
          {steps.map((s, index) => {
            const isActive = index === currentStep && !error
            const isCompleted = index < currentStep
            const isError = index === currentStep && error

            return (
              <div key={index} className="flex items-center gap-4 group">
                <div
                  className={cn(
                    'h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-sm',
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600 scale-100'
                      : isError
                        ? 'bg-red-50 border-red-500 text-red-600'
                        : isActive
                          ? 'bg-white border-primary text-primary shadow-primary/20 scale-110'
                          : 'bg-slate-50 border-slate-200 text-slate-300',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : isError ? (
                    <AlertCircle className="h-6 w-6" />
                  ) : isActive ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Circle className="h-6 w-6" />
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
                  <p className="text-xs text-slate-400 h-4">
                    {isActive && index === 0 && 'Conectando ao Gamma API...'}
                    {isActive &&
                      index === 1 &&
                      'Renderizando PDF no servidor...'}
                    {isActive && index === 2 && 'Obtendo link de download...'}
                    {isCompleted && 'Concluído'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Technical Log */}
      <div className="flex-1 bg-[#0F172A] rounded-xl p-0 font-mono text-xs overflow-hidden relative shadow-2xl flex flex-col border border-slate-800">
        <div className="bg-[#1E293B] px-4 py-3 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300 font-medium">server-logs</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded text-emerald-400 border border-emerald-500/20">
              <Lock className="h-3 w-3" />
              <span className="text-[10px] font-semibold tracking-wider">
                TLS 1.3
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent font-medium bg-[#0F172A]">
          {logs.map((log, i) => (
            <div
              key={i}
              className="animate-fade-in break-words leading-relaxed border-l-2 border-slate-800 pl-3 py-0.5 hover:bg-slate-800/30 transition-colors"
              dangerouslySetInnerHTML={{ __html: log }}
            />
          ))}
          {!error && currentStep < 3 && (
            <div className="flex items-center gap-1 text-emerald-500/50 animate-pulse pl-3 pt-2">
              <span className="w-2 h-4 bg-emerald-500/50 block"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

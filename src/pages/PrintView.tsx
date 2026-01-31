import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Proposal } from '@/types'
import { PrintableProposal } from '@/components/proposal/PrintableProposal'
import { Button } from '@/components/ui/button'

export default function PrintView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState<Proposal | null>(null)

  useEffect(() => {
    const history = JSON.parse(
      localStorage.getItem('pdfcorretor_history') || '[]',
    )
    const found = history.find((p: Proposal) => p.id === id)
    if (found) {
      setProposal(found)
    } else {
      // Wait a bit, maybe it wasn't saved yet if coming directly from generation flow fast
      setTimeout(() => {
        const historyRetry = JSON.parse(
          localStorage.getItem('pdfcorretor_history') || '[]',
        )
        const foundRetry = historyRetry.find((p: Proposal) => p.id === id)
        if (foundRetry) setProposal(foundRetry)
      }, 500)
    }
  }, [id])

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">Proposta não encontrada.</p>
        <Button onClick={() => window.close()}>Fechar Janela</Button>
      </div>
    )
  }

  return <PrintableProposal proposal={proposal} />
}

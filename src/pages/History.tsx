import { useState, useEffect } from 'react'
import { Proposal } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  FileText,
  MoreHorizontal,
  Trash2,
  Download,
  ExternalLink,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export default function History() {
  const [proposals, setProposals] = useState<Proposal[]>([])

  useEffect(() => {
    const history = JSON.parse(
      localStorage.getItem('pdfcorretor_history') || '[]',
    )
    setProposals(history)
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta proposta?')) {
      const newHistory = proposals.filter((p) => p.id !== id)
      setProposals(newHistory)
      localStorage.setItem('pdfcorretor_history', JSON.stringify(newHistory))
      toast.success('Proposta removida do histórico')
    }
  }

  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Nenhuma proposta encontrada
        </h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          Você ainda não gerou nenhuma proposta comercial.
        </p>
        <Button asChild>
          <Link to="/">Criar minha primeira proposta</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Histórico</h2>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem('pdfcorretor_history')
            setProposals([])
            toast.success('Histórico limpo com sucesso')
          }}
        >
          Limpar Histórico
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Imóvel / Unidade</TableHead>
                <TableHead>Valor Final</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">
                    {format(new Date(proposal.createdAt), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{proposal.clientName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {proposal.propertyTitle}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {proposal.unit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    {formatCurrency(proposal.discountedValue)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {proposal.pdfUrl && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(proposal.pdfUrl, '_blank')
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Baixar PDF
                          </DropdownMenuItem>
                        )}

                        {proposal.gammaUrl && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(proposal.gammaUrl, '_blank')
                            }
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver no Gamma
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => handleDelete(proposal.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

import { UseFormReturn } from 'react-hook-form'
import { ProposalFormValues } from '@/types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Upload, Wand2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ProposalFormProps {
  form: UseFormReturn<ProposalFormValues>
  onSubmit: (data: ProposalFormValues) => void
}

const CurrencyInput = ({ field, ...props }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    const numberValue = Number(value) / 100
    field.onChange(numberValue)
  }

  // Ensures value is always a string, handling 0 or undefined as empty string for display
  // or formatting it if valid number.
  const displayValue = field.value
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(field.value)
    : ''

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      // Remove defaultValue to ensure strict controlled mode
      defaultValue={undefined}
    />
  )
}

export function ProposalForm({ form, onSubmit }: ProposalFormProps) {
  const originalValue = form.watch('originalValue')
  const discountedValue = form.watch('discountedValue')
  const economy = (originalValue || 0) - (discountedValue || 0)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Section A: Client */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: João da Silva"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section B: Property */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Imóvel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="propertyTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Imóvel</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Apartamento Luxo Jardins"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Original</FormLabel>
                      <FormControl>
                        <CurrencyInput field={field} placeholder="R$ 0,00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discountedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor com Desconto</FormLabel>
                      <FormControl>
                        <CurrencyInput field={field} placeholder="R$ 0,00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {economy > 0 && (
                <div className="p-3 bg-green-50 rounded-md border border-green-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                  <span className="text-sm font-medium text-green-800">
                    Economia gerada:
                  </span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(economy)}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apto 402"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metragem</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="125"
                            {...field}
                            value={field.value ?? ''}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">
                            m²
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua das Flores, 123"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section C: Items */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                Destaques do Imóvel
              </CardTitle>
              <CardDescription>
                Liste 6 diferenciais para destacar na proposta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`items.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs font-bold text-primary/40">
                              #{index + 1}
                            </span>
                            <Input
                              className="pl-8"
                              placeholder={`Destaque ${index + 1}`}
                              {...field}
                              value={field.value ?? ''}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section D: Payment */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                Condições de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="downPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entrada</FormLabel>
                      <FormControl>
                        <CurrencyInput field={field} placeholder="R$ 0,00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas (Qtd/Valor)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="60x de R$ 2.500"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="annualPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anuais (Opcional)</FormLabel>
                    <FormControl>
                      <CurrencyInput field={field} placeholder="R$ 0,00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financiamento (Opcional)</FormLabel>
                    <FormControl>
                      <CurrencyInput field={field} placeholder="R$ 0,00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section E: Broker & Validity */}
          <div className="space-y-6 h-full flex flex-col">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Corretor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
                    <Upload className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <FormField
                      control={form.control}
                      name="brokerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Nome do Corretor"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="brokerCreci"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="CRECI 12345"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="brokerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="WhatsApp"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Validade</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="validity"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto text-base px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            Gerar Proposta Profissional
          </Button>
        </div>
      </form>
    </Form>
  )
}

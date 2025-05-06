"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, MoreHorizontal, CheckCircle, Trash2, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate, formatPaymentStatus, getPaymentStatusColor } from "../../utils/formatters"
import type { Project, Payment, PaymentStatusEnum } from "../../utils/types"

interface PaymentsSectionProps {
  project: Partial<Project>
  payments: Payment[]
  handleSelectChange: (name: string, value: string) => void
  handleUpdatePaymentStatus: (paymentId: string, status: PaymentStatusEnum) => Promise<boolean>
  handleDeletePayment: (paymentId: string) => Promise<boolean>
  setIsPaymentDialogOpen: (open: boolean) => void
}

export function PaymentsSection({
  project,
  payments,
  handleSelectChange,
  handleUpdatePaymentStatus,
  handleDeletePayment,
  setIsPaymentDialogOpen,
}: PaymentsSectionProps) {
  // Calcular totais
  const totalProjectValue = project.total_value || 0
  const totalPaid = payments.filter((p) => p.status === "pago").reduce((sum, p) => sum + p.amount, 0)
  const remainingAmount = totalProjectValue - totalPaid
  const paymentPercentage = totalProjectValue > 0 ? Math.round((totalPaid / totalProjectValue) * 100) : 0

  return (
    <div className="space-y-6">
      <Card className="border border-gray-50 overflow-hidden">
        <div className="bg-[#70645C]/5 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#70645C] flex items-center">
            <CreditCard size={18} className="mr-2" /> Pagamentos
          </h2>
          <Button
            onClick={() => setIsPaymentDialogOpen(true)}
            className="bg-[#70645C] hover:bg-[#5d534c] text-white"
            size="sm"
          >
            <Plus size={16} className="mr-1" /> Adicionar Pagamento
          </Button>
        </div>
        <CardContent className="p-6">
          <div className="bg-white rounded-lg border border-gray-100 p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Resumo Financeiro</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Valor Total do Projeto</p>
                <p className="font-bold text-xl">{formatCurrency(totalProjectValue)}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Valor Pago</p>
                <p className="font-bold text-xl text-green-600">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {payments.filter((p) => p.status === "pago").length} de {payments.length} pagamentos
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Valor Restante</p>
                <p className="font-bold text-xl text-amber-600">{formatCurrency(remainingAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{paymentPercentage}% do valor total recebido</p>
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${paymentPercentage > 100 ? 100 : paymentPercentage}%` }}
              ></div>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-gray-100">
              <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum pagamento registrado</h3>
              <p className="mt-2 text-gray-500">Adicione pagamentos para acompanhar o fluxo financeiro do projeto.</p>
              <Button
                onClick={() => setIsPaymentDialogOpen(true)}
                className="mt-4 bg-[#70645C] hover:bg-[#5d534c] text-white"
              >
                <Plus size={16} className="mr-1" /> Adicionar Pagamento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 mb-2">Histórico de Pagamentos</h3>

              {payments
                .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                .map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50/50"
                  >
                    <div className="flex items-center mb-2 sm:mb-0">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          payment.status === "pago"
                            ? "bg-green-500"
                            : payment.status === "atrasado"
                              ? "bg-red-500"
                              : "bg-amber-500"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500">Vencimento: {formatDate(payment.due_date)}</p>
                        {payment.paid_at && (
                          <p className="text-sm text-green-600">Pago em: {formatDate(payment.paid_at)}</p>
                        )}
                        {payment.description && <p className="text-sm text-gray-500">{payment.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Badge className={getPaymentStatusColor(payment.status as PaymentStatusEnum)}>
                        {formatPaymentStatus(payment.status as PaymentStatusEnum)}
                      </Badge>
                      <div className="flex-1 sm:flex-none flex justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {payment.status !== "pago" && (
                              <DropdownMenuItem
                                onClick={() => handleUpdatePaymentStatus(payment.id, "pago")}
                                className="text-green-600"
                              >
                                <CheckCircle size={14} className="mr-2" /> Marcar como Pago
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDeletePayment(payment.id)} className="text-red-600">
                              <Trash2 size={14} className="mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {remainingAmount < 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
              <AlertCircle size={20} className="text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Pagamentos excedem o valor do projeto</p>
                <p className="text-sm text-amber-700 mt-1">
                  O total de pagamentos registrados excede o valor total do projeto em{" "}
                  {formatCurrency(Math.abs(remainingAmount))}. Considere ajustar o valor total do projeto ou revisar os
                  pagamentos.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

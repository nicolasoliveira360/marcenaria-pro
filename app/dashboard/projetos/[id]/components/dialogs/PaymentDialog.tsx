"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Payment } from "../../utils/types"

// Defina o tipo PaymentStatusEnum
export type PaymentStatusEnum = "pendente" | "parcialmente_pago" | "pago" | "atrasado";

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newPayment: {
    due_date: string
    amount: string
    status: PaymentStatusEnum
    paid_at?: string | null
    description?: string
  }
  setNewPayment: (payment: {
    due_date: string
    amount: string
    status: PaymentStatusEnum
    paid_at?: string | null
    description?: string
  }) => void
  handleAddPayment: () => Promise<boolean>
  projectTotalValue: number
  totalPaid: number
}

// Defina a função formatCurrency localmente para evitar problemas de importação
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "R$ 0,00"

  return new Intl.NumberFormat("pt-BR", {
    style: "currency", 
    currency: "BRL",
  }).format(value)
}

export function PaymentDialog({
  open,
  onOpenChange,
  newPayment,
  setNewPayment,
  handleAddPayment,
  projectTotalValue,
  totalPaid,
}: PaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amountError, setAmountError] = useState("")
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)

  // Garantir que os valores sejam números válidos
  const safeProjectValue = typeof projectTotalValue === 'number' && !isNaN(projectTotalValue) ? projectTotalValue : 0
  const safeTotalPaid = typeof totalPaid === 'number' && !isNaN(totalPaid) ? totalPaid : 0
  const remainingAmount = safeProjectValue - safeTotalPaid

  useEffect(() => {
    if (!open) {
      setAmountError("")
    }
  }, [open])

  // Efeito para manter a posição do cursor
  useEffect(() => {
    if (cursorPosition !== null && amountInputRef.current) {
      amountInputRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, [cursorPosition, newPayment.amount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação do valor
    if (!newPayment.amount || Number.parseFloat(newPayment.amount.replace(/[^\d,]/g, "").replace(",", ".")) <= 0) {
      setAmountError("Informe um valor válido")
      return
    }

    setIsSubmitting(true)

    try {
      const success = await handleAddPayment()
      if (success) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Erro ao salvar pagamento:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const curPos = e.target.selectionStart;
    
    // Se o usuário está tentando limpar o campo completamente
    if (inputValue === "" || inputValue === "0" || inputValue === "0,00" || inputValue === "0,0") {
      setNewPayment({ ...newPayment, amount: "" });
      setAmountError("");
      return;
    }
    
    // Remove caracteres não numéricos, exceto vírgula
    const value = inputValue.replace(/[^\d,]/g, "")

    // Substitui vírgula por ponto para cálculos
    const numericValue = value.replace(",", ".")

    if (numericValue === "") {
      setNewPayment({ ...newPayment, amount: "" })
      return
    }

    try {
      // Formata o valor como moeda
      const formattedValue = formatCurrency(Number.parseFloat(numericValue))

      // Remove o símbolo R$ e espaços
      const newValue = formattedValue.replace("R$", "").trim();
      
      // Se o valor for 0,00, deixar o campo vazio
      if (newValue === "0,00") {
        setNewPayment({ ...newPayment, amount: "" });
        return;
      }
      
      // Atualiza o valor
      setNewPayment({ ...newPayment, amount: newValue })
      
      // Programar a atualização da posição do cursor para o próximo ciclo de renderização
      setTimeout(() => {
        if (amountInputRef.current) {
          const newPosition = curPos ? curPos : 0;
          amountInputRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
      
      setAmountError("")
    } catch (error) {
      console.error("Erro ao formatar valor:", error);
    }
  }

  const handleStatusChange = (value: string) => {
    const status = value as PaymentStatusEnum
    // Se o status for "pago", definir a data de pagamento como hoje
    // Caso contrário, limpar a data de pagamento
    let paid_at = null;
    
    if (status === "pago") {
      // Cria a data sem usar toISOString para evitar problemas de fuso horário
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      paid_at = `${year}-${month}-${day}`;
    }
    
    setNewPayment({ ...newPayment, status, paid_at })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader className="bg-[#70645C]/5 border-b border-gray-200 px-6 py-4 -mx-6 -mt-6 rounded-t-lg">
          <DialogTitle className="text-[#70645C] text-lg font-semibold">Adicionar Pagamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="grid gap-4 py-4">
            {/* Removendo as informações redundantes */}

            <div className="grid gap-2">
              <Label htmlFor="due_date" className="text-gray-700 text-sm font-medium">
                Data de Vencimento
              </Label>
              <Input
                id="due_date"
                type="date"
                value={newPayment.due_date}
                onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
                required
                className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-gray-700 text-sm font-medium">
                Valor do Pagamento
              </Label>
              <Input
                id="amount"
                placeholder="R$ 0,00"
                value={newPayment.amount}
                onChange={handleAmountChange}
                ref={amountInputRef}
                required
                className={`h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${amountError ? "border-red-500" : ""}`}
              />
              {amountError && <p className="text-sm text-red-500">{amountError}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-gray-700 text-sm font-medium">
                Status
              </Label>
              <Select value={newPayment.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="status" className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 text-gray-700">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="parcialmente_pago">Parcialmente Pago</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo de data de pagamento, visível apenas quando o status é "pago" */}
            {newPayment.status === "pago" && (
              <div className="grid gap-2">
                <Label htmlFor="paid_at" className="text-gray-700 text-sm font-medium">
                  Data de Pagamento
                </Label>
                <Input
                  id="paid_at"
                  type="date"
                  value={newPayment.paid_at || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, paid_at: e.target.value })}
                  required
                  className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-gray-700 text-sm font-medium">
                Descrição (opcional)
              </Label>
              <Textarea
                id="description"
                value={newPayment.description || ""}
                onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                placeholder="Ex: Entrada, Parcela 1, Pagamento final..."
                className="resize-none border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-gray-200 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-200 text-gray-500 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#70645C] hover:bg-[#5d534c] text-white border border-[#70645C]/20 transition-colors duration-300" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Payment } from "../utils/types"

// Definir o tipo PaymentStatusEnum localmente para evitar problemas de importação
export type PaymentStatusEnum = "pendente" | "parcialmente_pago" | "pago" | "atrasado";

export function usePayments(
  supabase: SupabaseClient,
  projectId: string,
  isNewProject: boolean,
  setProject: (project: any) => void,
) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [newPayment, setNewPayment] = useState({
    due_date: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    amount: "",
    status: "pendente" as PaymentStatusEnum,
    paid_at: null as string | null,
    description: "",
  })

  useEffect(() => {
    if (!isNewProject && projectId) {
      fetchPayments()
    }
  }, [isNewProject, projectId])

  const fetchPayments = async () => {
    if (!projectId) return

    try {
      const { data } = await supabase.from("payments").select("*").eq("project_id", projectId).order("due_date")
      setPayments(data || [])
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error)
    }
  }

  const handleAddPayment = async () => {
    if (!projectId || isNewProject) return false

    try {
      // Converte o valor de string para número
      const amountStr = newPayment.amount.replace(/[^\d,]/g, "").replace(",", ".")
      const amount = Number.parseFloat(amountStr)

      if (isNaN(amount) || amount <= 0) {
        alert("Por favor, insira um valor válido.")
        return false
      }

      // Criar objeto de pagamento conforme a estrutura da tabela
      const paymentData: {
        project_id: string;
        due_date: string;
        amount: number;
        status: PaymentStatusEnum;
        paid_at: string | null;
        description?: string | null;
      } = {
        project_id: projectId,
        due_date: newPayment.due_date,
        amount: amount,
        status: newPayment.status,
        paid_at: null,
        description: newPayment.description || null
      }
      
      // Definir a data de pagamento, se aplicável, sem converter para ISO String
      if (newPayment.status === "pago") {
        paymentData.paid_at = newPayment.paid_at || newPayment.due_date;
      }

      const { error } = await supabase.from("payments").insert(paymentData)

      if (error) throw error

      // Recarregar pagamentos
      await fetchPayments()

      // Usar o mesmo método para criar a data de hoje
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formattedToday = `${year}-${month}-${day}`;

      // Resetar formulário
      setNewPayment({
        due_date: formattedToday,
        amount: "",
        status: "pendente",
        paid_at: null,
        description: "",
      })

      // Atualizar apenas o status de pagamento do projeto
      await updateProjectPaymentStatus()

      return true
    } catch (error) {
      console.error("Erro ao adicionar pagamento:", error)
      return false
    }
  }

  const handleUpdatePaymentStatus = async (paymentId: string, status: PaymentStatusEnum) => {
    try {
      const updates: any = { status }

      // Se o status for "pago", definir a data de pagamento
      if (status === "pago" && !payments.find((p) => p.id === paymentId)?.paid_at) {
        // Criar data sem usar toISOString para evitar problemas de fuso horário
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        updates.paid_at = `${year}-${month}-${day}`;
      } else if (status !== "pago") {
        updates.paid_at = null
      }

      const { error } = await supabase.from("payments").update(updates).eq("id", paymentId)

      if (error) throw error

      // Atualizar estado local usando o mesmo formato
      setPayments(
        payments.map((payment) => {
          if (payment.id === paymentId) {
            let paid_at = null;
            if (status === "pago") {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              paid_at = `${year}-${month}-${day}`;
            }
            return { ...payment, status, paid_at };
          }
          return payment;
        }),
      )

      // Atualizar apenas o status de pagamento do projeto
      await updateProjectPaymentStatus()
      return true
    } catch (error) {
      console.error("Erro ao atualizar status do pagamento:", error)
      return false
    }
  }

  const updateProjectPaymentStatus = async () => {
    if (!projectId) return

    try {
      // Recarregar pagamentos para ter os dados mais atualizados
      const { data: updatedPayments } = await supabase.from("payments").select("*").eq("project_id", projectId)

      if (!updatedPayments || updatedPayments.length === 0) return

      // Determinar o status geral de pagamento
      const allPaid = updatedPayments.every((p) => p.status === "pago")
      const anyPaid = updatedPayments.some((p) => p.status === "pago")
      const anyLate = updatedPayments.some((p) => p.status === "atrasado")

      let newStatus: PaymentStatusEnum = "pendente"

      if (allPaid) {
        newStatus = "pago"
      } else if (anyLate) {
        newStatus = "atrasado"
      } else if (anyPaid) {
        newStatus = "parcialmente_pago"
      }

      // Atualizar APENAS o status de pagamento do projeto, não o valor total
      const { error } = await supabase.from("projects").update({ payment_status: newStatus }).eq("id", projectId)

      if (error) throw error

      // Atualizar estado local - apenas o status de pagamento
      setProject((prev: any) => ({ ...prev, payment_status: newStatus }))
    } catch (error) {
      console.error("Erro ao atualizar status de pagamento do projeto:", error)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase.from("payments").delete().eq("id", paymentId)

      if (error) throw error

      // Atualizar estado local
      setPayments(payments.filter((payment) => payment.id !== paymentId))

      // Atualizar apenas o status de pagamento do projeto
      await updateProjectPaymentStatus()
      return true
    } catch (error) {
      console.error("Erro ao excluir pagamento:", error)
      return false
    }
  }

  return {
    payments,
    newPayment,
    setNewPayment,
    handleAddPayment,
    handleUpdatePaymentStatus,
    handleDeletePayment,
  }
}

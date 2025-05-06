import React from 'react'
import { FileText, FileImage, FileArchive, FileSpreadsheet, FileCode, File } from "lucide-react"

// Formata um valor numérico como moeda (R$)
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00"

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Formata uma data no padrão brasileiro (dia/mês/ano)
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-"

  // Processar string de data no formato ISO (YYYY-MM-DD)
  if (typeof date === "string") {
    // Se a data for uma string no formato YYYY-MM-DD (sem hora)
    if (date.length === 10 && date.includes("-")) {
      // Extrair partes da data (ano, mês, dia)
      const [year, month, day] = date.split("-").map(Number)
      
      // Formatar manualmente usando Intl.DateTimeFormat
      return new Intl.NumberFormat("pt-BR", {
        minimumIntegerDigits: 2
      }).format(day) + "/" + 
      new Intl.NumberFormat("pt-BR", {
        minimumIntegerDigits: 2
      }).format(month) + "/" + year
    }
  }

  // Caso a data não seja uma string simples YYYY-MM-DD
  // Usar o construtor de Date (que pode causar problemas com timezone)
  const dateObj = typeof date === "string" ? new Date(date) : date

  return dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC" // Forçar UTC para evitar ajustes de fuso horário
  })
}

// Retorna a classe CSS de cor com base no status de pagamento
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case "pago":
      return "bg-green-100 text-green-600 border-green-200"
    case "parcialmente_pago":
      return "bg-yellow-100 text-yellow-600 border-yellow-200"
    case "atrasado":
      return "bg-red-100 text-red-600 border-red-200"
    case "pendente":
    default:
      return "bg-blue-100 text-blue-600 border-blue-200"
  }
}

// Retorna a classe CSS de cor com base no status do projeto
export function getStatusColor(status: string | null): string {
  if (!status) return "bg-[#e5e7eb] text-[#475569]"

  switch (status.toLowerCase()) {
    case "em_andamento":
      return "bg-blue-500"
    case "concluido":
      return "bg-green-500"
    case "atrasado":
      return "bg-red-500"
    case "aguardando":
      return "bg-yellow-500"
    case "cancelado":
      return "bg-gray-500"
    default:
      return "bg-[#e5e7eb]"
  }
}

// Formata o status de pagamento para exibição
export function formatPaymentStatus(status: string): string {
  switch (status) {
    case "pago":
      return "Pago"
    case "parcialmente_pago":
      return "Parcialmente Pago"
    case "atrasado":
      return "Atrasado"
    case "pendente":
    default:
      return "Pendente"
  }
}

// Formata um valor de entrada como moeda
export function formatCurrencyInput(value: string): string {
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/[^\d]/g, "")

  if (numericValue === "") {
    return ""
  }

  // Converte para número e divide por 100 para obter o valor em reais
  const floatValue = Number.parseInt(numericValue, 10) / 100

  // Formata como moeda brasileira
  return formatCurrency(floatValue).replace("R$", "").trim()
}

// Formata o tamanho do arquivo
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return "0 B"

  if (bytes === 0) return "0 B"

  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Retorna o ícone apropriado para o tipo de arquivo
export function getFileIcon(mimeType: string | null | undefined) {
  if (!mimeType) return <File size={40} className="text-[#475569]" />

  if (mimeType.startsWith("image/")) {
    return <FileImage size={40} className="text-blue-500" />
  } else if (mimeType.startsWith("text/")) {
    return <FileText size={40} className="text-yellow-600" />
  } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet size={40} className="text-green-600" />
  } else if (mimeType.includes("zip") || mimeType.includes("compressed")) {
    return <FileArchive size={40} className="text-purple-600" />
  } else if (
    mimeType.includes("javascript") ||
    mimeType.includes("json") ||
    mimeType.includes("html") ||
    mimeType.includes("css")
  ) {
    return <FileCode size={40} className="text-[#70645C]" />
  } else {
    return <FileText size={40} className="text-[#475569]" />
  }
}

// Formata o status do projeto
export function formatProjectStatus(status: string): string {
  switch (status) {
    case "em_andamento":
      return "Em andamento"
    case "concluido":
      return "Concluído"
    case "atrasado":
      return "Atrasado"
    case "aguardando":
      return "Aguardando"
    case "cancelado":
      return "Cancelado"
    default:
      return status
  }
} 
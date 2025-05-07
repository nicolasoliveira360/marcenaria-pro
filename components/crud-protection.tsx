"use client"

import React from "react"
import { useCrudGuard } from "@/hooks/use-crud-guard"
import { SubscriptionRequiredDialog } from "./subscription-required-dialog"

interface CrudProtectionProps {
  children: React.ReactNode
  // Opção para exibir uma versão simplificada/limitada em vez de ocultar completamente
  fallback?: React.ReactNode
}

export function CrudProtection({ children, fallback }: CrudProtectionProps) {
  const { dialogOpen, setDialogOpen, canPerformCrud } = useCrudGuard()

  // Se pode realizar operações CRUD, retorna o conteúdo normal
  if (canPerformCrud) {
    return <>{children}</>
  }

  // Se há um fallback (versão limitada), mostra ele
  if (fallback) {
    return (
      <>
        {fallback}
        <SubscriptionRequiredDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
      </>
    )
  }

  // Caso contrário, mostra o conteúdo com estilo desabilitado
  return (
    <>
      <div 
        className="opacity-70 pointer-events-none" 
        aria-disabled="true"
        onClick={() => setDialogOpen(true)}
      >
        {children}
      </div>
      <SubscriptionRequiredDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
} 
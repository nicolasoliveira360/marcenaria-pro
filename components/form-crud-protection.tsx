"use client"

import React from "react"
import { Lock, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCrudGuard } from "@/contexts/crud-guard-provider"
import { Button } from "@/components/ui/button"

interface FormCrudProtectionProps {
  children: React.ReactNode
  formTitle?: string
}

export function FormCrudProtection({ children, formTitle }: FormCrudProtectionProps) {
  const router = useRouter()
  const { canPerformCrud } = useCrudGuard()

  // Se o usuário pode realizar operações CRUD, renderiza o formulário normalmente
  if (canPerformCrud) {
    return <>{children}</>
  }

  // Caso contrário, mostra um aviso e desabilita o formulário
  return (
    <div className="space-y-6">
      <div className="p-6 border border-yellow-100 rounded-lg bg-yellow-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">
              {formTitle ? `${formTitle} indisponível` : "Formulário bloqueado"}
            </h3>
            <p className="text-yellow-700 mt-1 mb-3 text-sm">
              Esta funcionalidade está disponível apenas para usuários com plano ativo.
              Faça upgrade do seu plano para ter acesso a todos os recursos.
            </p>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.back()}
                className="text-yellow-700 border-yellow-200 hover:bg-yellow-100"
              >
                Voltar
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/dashboard/faturamento")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Lock className="mr-2 h-4 w-4" />
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário desabilitado com sobreposição */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 rounded-lg flex items-center justify-center">
          <div className="p-8 rounded-lg">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-center text-gray-500 font-medium">
              Recurso exclusivo para assinantes
            </p>
          </div>
        </div>
        <div className="opacity-50 pointer-events-none" aria-disabled="true">
          {children}
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Lock, CreditCard, X, Sparkles, CheckCircle2, ArrowRight } from "lucide-react"
import { useCompany } from "@/hooks/use-company"
import { isPremiumActive } from "@/lib/premium"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SubscriptionRequiredDialogProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
}

export function SubscriptionRequiredDialog({
  isOpen,
  onClose,
  featureName = "CRUD de dados"
}: SubscriptionRequiredDialogProps) {
  const router = useRouter()
  const { company } = useCompany()
  
  const handleUpgrade = () => {
    router.push("/dashboard/faturamento")
    onClose()
  }

  // Detalhes do status atual do plano
  const getPlanStatus = () => {
    if (!company) return "Sem plano"
    
    const planType = company.plan === 'paid' ? 'Premium' : 'Free'
    
    return planType
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-4">
            <Lock className="h-7 w-7 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">Recurso Premium</DialogTitle>
          <DialogDescription className="text-center mt-1">
            <span className="font-medium text-amber-700">"{featureName}"</span> está disponível 
            apenas no plano Premium.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-2">
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden">
            <CardHeader className="pb-2 bg-amber-100/50 border-b border-amber-200">
              <CardTitle className="text-sm font-medium flex items-center">
                <span className="mr-2">Status do seu plano</span> 
                <span className="text-xs py-0.5 px-2 rounded-full bg-white border border-amber-200 text-amber-800">
                  {getPlanStatus()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="text-green-500 h-4 w-4" />
                  <span>Todas as funcionalidades CRUD desbloqueadas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="text-green-500 h-4 w-4" />
                  <span>Cadastro ilimitado de projetos e clientes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="text-green-500 h-4 w-4" />
                  <span>Suporte prioritário</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            Fechar
          </Button>
          <Button 
            className="gap-2 sm:flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            onClick={handleUpgrade}
          >
            {company?.plan === 'paid' ? (
              <>
                <CreditCard className="h-4 w-4" />
                Gerenciar assinatura
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Ativar Premium <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
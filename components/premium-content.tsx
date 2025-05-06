"use client"

import { useRouter } from 'next/navigation'
import { usePremiumGuard } from '@/hooks/use-premium-guard'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Lock } from 'lucide-react'

interface PremiumContentProps {
  children: React.ReactNode
  fallbackMessage?: string
}

export function PremiumContent({ 
  children, 
  fallbackMessage = "Este conteúdo é exclusivo para assinantes do plano premium."
}: PremiumContentProps) {
  const router = useRouter()
  const { isLoading, isPremium } = usePremiumGuard()
  
  if (isLoading) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }
  
  if (!isPremium) {
    return (
      <div className="p-6 border border-yellow-100 rounded-lg bg-yellow-50">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Conteúdo Premium Bloqueado</h3>
            <p className="text-yellow-700 mt-1 mb-3 text-sm">{fallbackMessage}</p>
            <Button 
              size="sm" 
              onClick={() => router.push('/dashboard/faturamento')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Lock className="mr-2 h-4 w-4" />
              Fazer Upgrade
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
} 
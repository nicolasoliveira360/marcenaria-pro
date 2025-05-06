import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCompany } from './use-company'
import { isPremiumActive } from '@/lib/billing'

/**
 * Hook para proteger rotas ou recursos premium
 * Redireciona para a página de faturamento se o usuário não tiver assinatura ativa
 */
export function usePremiumGuard() {
  const router = useRouter()
  const { company, loading, error } = useCompany()
  
  useEffect(() => {
    // Só verificamos depois de carregar os dados da empresa
    if (!loading && !error) {
      // Se não tem empresa ou não tem assinatura ativa, redireciona
      if (!company || !isPremiumActive(company.plan, company.lastlink_status)) {
        router.push('/dashboard/faturamento')
      }
    }
  }, [company, loading, error, router])
  
  return {
    isLoading: loading,
    isPremium: company ? isPremiumActive(company.plan, company.lastlink_status) : false,
    company
  }
} 
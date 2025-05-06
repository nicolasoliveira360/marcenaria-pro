import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCompany } from "@/hooks/use-company"
import { isPremiumActive } from "@/lib/billing"

interface PremiumGuardProps {
  children: React.ReactNode
}

export function PremiumGuard({ children }: PremiumGuardProps) {
  const router = useRouter()
  const { company, loading } = useCompany()

  useEffect(() => {
    // Só redireciona após o carregamento e se não tiver plano ativo
    if (!loading && !isPremiumActive(company?.plan, company?.lastlink_status)) {
      router.push("/dashboard/faturamento")
    }
  }, [loading, company, router])

  // Enquanto carrega, não mostra nada
  if (loading) {
    return null
  }

  // Se tiver acesso premium, mostra o conteúdo
  if (isPremiumActive(company?.plan, company?.lastlink_status)) {
    return <>{children}</>
  }

  // Se não tiver acesso, não mostra nada (o redirecionamento já foi feito no useEffect)
  return null
} 
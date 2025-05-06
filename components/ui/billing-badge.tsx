import { Badge } from "@/components/ui/badge"
import { formatPeriodEnd } from "@/lib/billing"

interface BillingBadgeProps {
  plan: string | null | undefined
  billing_interval: string | null | undefined
  lastlink_status: string | null | undefined
  nextRenewal: string | null | undefined
}

export function BillingBadge({ 
  plan, 
  billing_interval, 
  lastlink_status, 
  nextRenewal 
}: BillingBadgeProps) {
  // Free Plan
  if (plan === 'free') {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        Plano Gratuito
      </Badge>
    )
  }

  // Paid Plan
  if (plan === 'paid') {
    // Active Subscription
    if (lastlink_status === 'active') {
      const interval = billing_interval === 'monthly' ? 'mensal' : 'anual'
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Plano Pago ({interval}) • Renovação em {formatPeriodEnd(nextRenewal || null)}
        </Badge>
      )
    }
    
    // Past Due
    if (lastlink_status === 'past_due') {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Pagamento Pendente
        </Badge>
      )
    }
    
    // Canceled or Expired
    if (lastlink_status === 'canceled' || lastlink_status === 'expired') {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Assinatura Cancelada
        </Badge>
      )
    }
  }
  
  // Default / Incomplete
  return (
    <Badge variant="outline" className="bg-gray-100 text-gray-800">
      Aguardando Configuração
    </Badge>
  )
} 
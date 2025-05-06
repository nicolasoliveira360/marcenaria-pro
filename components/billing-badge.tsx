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
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
  
  // Free Plan
  if (plan === 'free') {
    return (
      <div className={`${baseStyles} border-gray-200 bg-gray-100 text-gray-800`}>
        Plano Gratuito
      </div>
    )
  }

  // Paid Plan
  if (plan === 'paid') {
    // Active Subscription
    if (lastlink_status === 'active') {
      const interval = billing_interval === 'monthly' ? 'mensal' : 'anual'
      return (
        <div className={`${baseStyles} border-green-200 bg-green-100 text-green-800`}>
          Plano Pago ({interval}) • Renovação em {formatPeriodEnd(nextRenewal || null)}
        </div>
      )
    }
    
    // Past Due
    if (lastlink_status === 'past_due') {
      return (
        <div className={`${baseStyles} border-yellow-200 bg-yellow-100 text-yellow-800`}>
          Pagamento Pendente
        </div>
      )
    }
    
    // Canceled or Expired
    if (lastlink_status === 'canceled' || lastlink_status === 'expired') {
      return (
        <div className={`${baseStyles} border-red-200 bg-red-100 text-red-800`}>
          Assinatura Cancelada
        </div>
      )
    }
  }
  
  // Default / Incomplete
  return (
    <div className={`${baseStyles} border-gray-200 bg-gray-100 text-gray-800`}>
      Aguardando Configuração
    </div>
  )
} 
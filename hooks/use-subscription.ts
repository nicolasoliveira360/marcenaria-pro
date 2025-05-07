import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from './use-supabase'
import { useCompany } from './use-company'

interface SubscriptionData {
  plan: 'free' | 'paid'
  status: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired'
  billingInterval: 'monthly' | 'annual' | null
  currentPeriodEnd: string | null
  formattedPeriodEnd: string | null
  isActive: boolean
  isPaid: boolean
}

export function useSubscription() {
  const { company } = useCompany()
  const { supabase } = useSupabase()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSubscription = useCallback(async () => {
    if (!company) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('plan, lastlink_status, billing_interval, current_period_end, lastlink_sub_id')
        .eq('id', company.id)
        .single()

      if (error) throw error

      const currentPeriodEnd = data.current_period_end
      let formattedPeriodEnd = null

      if (currentPeriodEnd) {
        const date = new Date(currentPeriodEnd)
        formattedPeriodEnd = new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date)
      }

      const subscriptionData: SubscriptionData = {
        plan: data.plan || 'free',
        status: data.lastlink_status || 'incomplete',
        billingInterval: data.billing_interval,
        currentPeriodEnd: data.current_period_end,
        formattedPeriodEnd,
        isActive: data.lastlink_status === 'active',
        isPaid: data.plan === 'paid'
      }

      setSubscription(subscriptionData)
    } catch (err) {
      console.error('Erro ao buscar dados da assinatura:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [company, supabase])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const refresh = useCallback(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return {
    subscription,
    isLoading,
    error,
    refresh
  }
} 
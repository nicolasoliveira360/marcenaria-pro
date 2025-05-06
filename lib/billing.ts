export const PRODUCT_ID = {
  monthly: 'dc179e76-e8e6-4b98-aefe-f9ad70a8ab67',
  annual: '6dab7ff1-3e93-43f3-8cbd-b7592846c8bb'
} as const

export type BillingInterval = keyof typeof PRODUCT_ID

export const isPremiumActive = (
  plan: string | null | undefined,
  lastlinkStatus: string | null | undefined
): boolean => {
  return plan === 'paid' && lastlinkStatus === 'active'
}

// Helper para formatação de data no fuso BR
export const formatPeriodEnd = (date: string | null): string => {
  if (!date) return 'N/A'
  
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  })
} 
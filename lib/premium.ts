/**
 * Funções utilitárias para verificação de plano premium
 */

/**
 * Verifica se um plano está ativo com base apenas no tipo de plano
 */
export const isPremiumActive = (
  plan: string | null | undefined
): boolean => {
  return plan === 'paid'
}

/**
 * Verifica se um usuário tem acesso às funcionalidades CRUD
 * baseado nos dados da empresa
 */
export const hasCrudAccess = (company: any | null): boolean => {
  if (!company) return false
  return isPremiumActive(company.plan)
}

/**
 * Cria uma mensagem explicativa sobre o bloqueio de recursos
 */
export const getPremiumBlockMessage = (): string => {
  return 'Esta funcionalidade requer um plano pago. Faça upgrade do seu plano para usar todos os recursos.'
}

/**
 * Cria uma mensagem para botões bloqueados
 */
export const getPremiumButtonText = (originalText: string): string => {
  return `Plano necessário: ${originalText}`
} 
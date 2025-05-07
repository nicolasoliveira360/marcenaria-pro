import { createClient } from '@/lib/supabase/client'

/**
 * Verifica se uma empresa tem um plano premium ativo
 */
export async function hasActivePremiumPlan(companyId: string): Promise<boolean> {
  if (!companyId) return false
  
  const supabase = createClient()
  
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('plan, lastlink_status')
      .eq('id', companyId)
      .single()
    
    return !!(company && company.plan === 'paid' && company.lastlink_status === 'active')
  } catch (error) {
    console.error('Erro ao verificar plano da empresa:', error)
    return false
  }
}

/**
 * Wrapper para operações CRUD que verifica se a empresa tem plano premium
 */
export async function protectedCrudOperation<T>(
  companyId: string, 
  operation: () => Promise<T>,
  options?: { throwError?: boolean }
): Promise<{ data: T | null; error: string | null }> {
  try {
    // Verificar plano premium
    const hasPremium = await hasActivePremiumPlan(companyId)
    
    if (!hasPremium) {
      const error = 'Plano premium necessário para esta operação'
      
      if (options?.throwError) {
        throw new Error(error)
      }
      
      return { data: null, error }
    }
    
    // Executar operação CRUD se tiver plano premium
    const result = await operation()
    return { data: result, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao executar operação'
    
    if (options?.throwError) {
      throw error
    }
    
    return { data: null, error: errorMessage }
  }
} 
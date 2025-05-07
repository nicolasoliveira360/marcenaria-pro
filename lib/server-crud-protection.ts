import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Verifica se uma empresa tem plano premium ativo (server-side)
 */
export async function serverHasActivePremiumPlan(companyId: string): Promise<boolean> {
  if (!companyId) return false
  
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('plan')
      .eq('id', companyId)
      .single()
    
    return !!(company && company.plan === 'paid')
  } catch (error) {
    console.error('Erro ao verificar plano da empresa (server):', error)
    return false
  }
}

/**
 * Wrapper para operações CRUD server-side que verifica plano premium
 */
export async function serverProtectedCrudOperation<T>(
  companyId: string, 
  operation: () => Promise<T>,
  options?: { throwError?: boolean }
): Promise<{ data: T | null; error: string | null; code?: string }> {
  try {
    // Verificar plano premium
    const hasPremium = await serverHasActivePremiumPlan(companyId)
    
    if (!hasPremium) {
      const error = 'É necessário um plano premium ativo para realizar esta operação'
      
      if (options?.throwError) {
        throw new Error(error)
      }
      
      return { 
        data: null, 
        error,
        code: 'SUBSCRIPTION_REQUIRED'
      }
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
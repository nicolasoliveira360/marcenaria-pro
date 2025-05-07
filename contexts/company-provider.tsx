import { createContext, useEffect, useState } from 'react'
import { useSupabase } from '@/hooks/use-supabase'

export type CompanyData = {
  id: string
  name: string
  plan: 'free' | 'paid'
  billing_interval: 'monthly' | 'annual' | null
  lastlink_status: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired'
  current_period_end: string | null
  tax_id: string
  email: string
  phone: string | null
  logo_url: string | null
}

type CompanyContextType = {
  company: CompanyData | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export default function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { supabase, user } = useSupabase()
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCompany = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Buscar o vínculo do usuário com a empresa
      const { data: userRole, error: userRoleError } = await supabase
        .from('company_user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .single()

      if (userRoleError) {
        throw new Error('Usuário não está vinculado a nenhuma empresa')
      }

      // Buscar dados da empresa
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userRole.company_id)
        .single()

      if (companyError) {
        throw new Error('Não foi possível encontrar a empresa')
      }

      setCompany({
        id: companyData.id,
        name: companyData.name,
        plan: companyData.plan || 'free',
        billing_interval: companyData.billing_interval,
        lastlink_status: companyData.lastlink_status || 'incomplete',
        current_period_end: companyData.current_period_end,
        tax_id: companyData.tax_id,
        email: companyData.email,
        phone: companyData.phone,
        logo_url: companyData.logo_url
      })
    } catch (err) {
      console.error('Erro ao buscar empresa:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCompany()
  }, [user])

  // Configurar canal realtime para a empresa se tiver um ID
  useEffect(() => {
    if (!company?.id) return

    const channel = supabase
      .channel(`company-${company.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies',
          filter: `id=eq.${company.id}`
        },
        () => {
          fetchCompany()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [company?.id, supabase])

  return (
    <CompanyContext.Provider
      value={{
        company,
        isLoading,
        error,
        refresh: fetchCompany
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
} 
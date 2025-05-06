import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type CompanyData = {
  id: string
  name: string
  plan: 'free' | 'paid'
  billing_interval: 'monthly' | 'annual' | null
  lastlink_status: 'active' | 'past_due' | 'canceled' | 'expired' | 'incomplete'
  current_period_end: string | null
  tax_id: string
  email: string
  phone: string | null
  logo_url: string | null
}

export function useCompany() {
  const supabase = createClient()
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let companyChannel: RealtimeChannel | null = null

    async function getCompany() {
      try {
        setLoading(true)
        setError(null)

        // Obter dados do usuário logado
        console.log("Buscando usuário autenticado...");
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error("Erro ao obter usuário:", userError.message);
          throw new Error(`Erro ao obter usuário: ${userError.message}`);
        }

        if (!user) {
          console.error("Usuário não autenticado");
          throw new Error('Usuário não autenticado')
        }
        
        console.log("Usuário autenticado encontrado:", { id: user.id, email: user.email });

        // Primeiro, buscar dados básicos da empresa que sabemos que existem
        console.log("Buscando registro da empresa para o usuário...");
        
        // Modificação: Verificar primeiro se o usuário está vinculado a uma empresa
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('company_user_roles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
          
        if (userRoleError) {
          console.error("Erro ao buscar vínculo do usuário com empresa:", userRoleError.message);
          
          if (userRoleError.code === 'PGRST116') {
            // Usuário não está vinculado a nenhuma empresa
            console.error("Usuário não está vinculado a nenhuma empresa");
            throw new Error('Usuário não está vinculado a nenhuma empresa. Por favor, verifique seu cadastro ou entre em contato com o administrador.')
          } else {
            throw userRoleError;
          }
        }
        
        if (!userRoleData || !userRoleData.company_id) {
          console.error("Vínculo com empresa não encontrado para o usuário");
          throw new Error('Vínculo com empresa não encontrado para o usuário')
        }
        
        console.log("Vínculo com empresa encontrado:", userRoleData);
        
        // Agora que temos o company_id, buscar os dados da empresa
        const { data: companyBasic, error: basicError } = await supabase
          .from('companies')
          .select('id, name, email, phone, logo_url')
          .eq('id', userRoleData.company_id)
          .single()

        if (basicError) {
          console.error("Erro ao buscar dados básicos da empresa:", basicError);
          
          if (basicError.code === 'PGRST116') {
            console.error("Registro de empresa não encontrado para o ID:", userRoleData.company_id);
            throw new Error(`Registro de empresa não encontrado para o ID: ${userRoleData.company_id}. A empresa pode ter sido removida.`)
          } else {
            throw basicError
          }
        }
        
        console.log("Dados básicos da empresa encontrados:", companyBasic);

        // Usar o email do usuário caso a empresa não tenha email
        const companyEmail = companyBasic.email || user.email || ''
        
        // Se companyEmail difere do email atual da empresa, atualizar
        if (companyEmail && companyBasic.email !== companyEmail) {
          try {
            await supabase
              .from('companies')
              .update({ email: companyEmail })
              .eq('id', companyBasic.id)
            
            console.log('Email da empresa atualizado com o email do usuário')
            companyBasic.email = companyEmail
          } catch (updateError) {
            console.warn('Não foi possível atualizar o email da empresa:', updateError)
          }
        }

        // Se temos dados básicos, tente buscar campos de faturamento
        if (companyBasic) {
          try {
            // Tentar buscar diretamente todos os campos da empresa incluindo faturamento
            console.log('Buscando dados completos da empresa:', companyBasic.id);
            const { data: fullCompanyData, error: fullCompanyError } = await supabase
              .from('companies')
              .select('*')
              .eq('id', companyBasic.id)
              .single()
            
            if (fullCompanyError) {
              console.error('Erro ao buscar dados completos da empresa:', fullCompanyError);
              throw fullCompanyError;
            }
            
            console.log('Dados brutos da empresa:', fullCompanyData);
            
            // Usar type assertion para evitar erros de TypeScript
            const companyDataRaw = fullCompanyData as any;
            
            // Normalizar os valores para garantir tipos corretos
            const normalizedPlan = 
              companyDataRaw.plan === 'paid' ? 'paid' : 'free';
            
            const normalizedBillingInterval = 
              companyDataRaw.billing_interval === 'monthly' ? 'monthly' : 
              companyDataRaw.billing_interval === 'annual' ? 'annual' : null;
            
            const normalizedStatus = 
              companyDataRaw.lastlink_status === 'active' ? 'active' :
              companyDataRaw.lastlink_status === 'past_due' ? 'past_due' :
              companyDataRaw.lastlink_status === 'canceled' ? 'canceled' :
              companyDataRaw.lastlink_status === 'expired' ? 'expired' : 'incomplete';
            
            // Criar objeto de empresa completo com valores normalizados
            const companyData: CompanyData = {
              ...companyBasic,
              plan: normalizedPlan,
              billing_interval: normalizedBillingInterval,
              lastlink_status: normalizedStatus,
              current_period_end: companyDataRaw.current_period_end || null,
              tax_id: companyDataRaw.tax_id || '',
              email: companyEmail,
            }
            
            console.log('Dados normalizados da empresa:', companyData);
            setCompany(companyData)
          } catch (billingError: any) {
            console.error('Erro ao buscar dados de faturamento:', billingError.message)
            // Tente uma abordagem alternativa se o erro for relacionado a colunas
            if (billingError.message && billingError.message.includes('column')) {
              const err = new Error(
                `As colunas necessárias para integração com LastLink não existem na tabela companies. ` +
                `É necessário executar o script de migração em 'scripts/add-lastlink-columns.sql'. ` +
                `Erro original: ${billingError.message}`
              )
              throw err
            }
            throw billingError
          }

          // Configurar canal realtime para a empresa
          companyChannel = supabase
            .channel('company_changes')
            .on(
              'postgres_changes',
              { 
                event: '*', 
                schema: 'public', 
                table: 'companies',
                filter: `id=eq.${companyBasic.id}` 
              },
              (payload) => {
                console.log('Atualização em tempo real recebida:', payload)
                
                // Normalizar valores da mesma forma para garantir consistência
                const newData = payload.new as any
                
                const normalizedPlan = 
                  newData.plan === 'paid' ? 'paid' : 'free';
                
                const normalizedBillingInterval = 
                  newData.billing_interval === 'monthly' ? 'monthly' : 
                  newData.billing_interval === 'annual' ? 'annual' : null;
                
                const normalizedStatus = 
                  newData.lastlink_status === 'active' ? 'active' :
                  newData.lastlink_status === 'past_due' ? 'past_due' :
                  newData.lastlink_status === 'canceled' ? 'canceled' :
                  newData.lastlink_status === 'expired' ? 'expired' : 'incomplete';
                
                const updatedCompany: CompanyData = {
                  id: newData.id,
                  name: newData.name,
                  plan: normalizedPlan,
                  billing_interval: normalizedBillingInterval,
                  lastlink_status: normalizedStatus,
                  current_period_end: newData.current_period_end || null,
                  tax_id: newData.tax_id || '',
                  email: newData.email || companyEmail,
                  phone: newData.phone || null,
                  logo_url: newData.logo_url || null,
                }
                
                console.log('Empresa atualizada via realtime:', updatedCompany);
                setCompany(updatedCompany)
              }
            )
            .subscribe()
        } else {
          console.error('Nenhum dado de empresa encontrado')
          throw new Error('Nenhum dado de empresa encontrado')
        }
      } catch (err: any) {
        console.error('Erro ao buscar dados da empresa:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    getCompany()

    // Limpeza ao desmontar
    return () => {
      if (companyChannel) {
        supabase.removeChannel(companyChannel)
      }
    }
  }, [supabase])

  return { company, loading, error }
} 
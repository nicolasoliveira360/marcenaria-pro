"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useCompany } from '@/hooks/use-company'
import { hasCrudAccess } from '@/lib/premium'
import { SubscriptionRequiredDialog } from '@/components/subscription-required-dialog'
import { useSupabase } from '@/hooks/use-supabase'

type CrudOperation = 'create' | 'read' | 'update' | 'delete'

// Define um tipo genérico para a função executeCrudOperation
type ExecuteCrudOperation = <T>(
  operation: () => T | Promise<T>,
  options?: { 
    operationType?: CrudOperation,
    skipPremiumCheck?: boolean,
    featureName?: string
  }
) => Promise<T | null>

interface CrudGuardContextType {
  canPerformCrud: boolean
  isLoading: boolean
  showSubscriptionRequired: (featureName?: string) => void
  executeCrudOperation: ExecuteCrudOperation
  companyData: any | null
}

export const CrudGuardContext = createContext<CrudGuardContextType | undefined>(undefined)

export function CrudGuardProvider({ children }: { children: React.ReactNode }) {
  const { company, isLoading } = useCompany()
  const { supabase, user } = useSupabase()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [companyData, setCompanyData] = useState<any>(null)
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [currentFeature, setCurrentFeature] = useState<string | undefined>(undefined)
  
  // Buscar dados da empresa diretamente do banco
  useEffect(() => {
    async function fetchCompanyData() {
      if (!user) {
        setLoadingCompany(false)
        return
      }
      
      try {
        // Buscar o vínculo do usuário com a empresa
        const { data: userRole } = await supabase
          .from('company_user_roles')
          .select('company_id')
          .eq('user_id', user.id)
          .single()
        
        if (!userRole?.company_id) {
          setLoadingCompany(false)
          return
        }

        // Buscar dados completos da empresa
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userRole.company_id)
          .single()
        
        if (company) {
          setCompanyData(company)
          console.log("Status do plano:", company.plan)
        }
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error)
      } finally {
        setLoadingCompany(false)
      }
    }
    
    fetchCompanyData()
  }, [supabase, user])

  // Verifica se o usuário pode realizar operações CRUD baseado nos dados da empresa
  const canPerformCrud = hasCrudAccess(companyData)
  
  // Função para mostrar o modal de assinatura requerida
  const showSubscriptionRequired = useCallback((featureName?: string) => {
    setCurrentFeature(featureName)
    setDialogOpen(true)
  }, [])
  
  // Função para tentar executar uma operação CRUD
  const executeCrudOperation: ExecuteCrudOperation = useCallback(
    (operation, options) => {
      // Se estiver carregando, aguarda
      if (loadingCompany) {
        return new Promise((resolve) => {
          setTimeout(() => {
            executeCrudOperation(operation, options).then(resolve)
          }, 100)
        })
      }
      
      // Se tem permissão ou o check está desabilitado, executa a operação
      if (canPerformCrud || options?.skipPremiumCheck) {
        return Promise.resolve().then(operation)
      }
      
      // Caso contrário, abre o diálogo e retorna null
      setCurrentFeature(options?.featureName)
      setDialogOpen(true)
      return Promise.resolve(null)
    },
    [loadingCompany, canPerformCrud]
  )
  
  return (
    <CrudGuardContext.Provider
      value={{
        canPerformCrud,
        isLoading: loadingCompany,
        showSubscriptionRequired,
        executeCrudOperation,
        companyData
      }}
    >
      {children}
      <SubscriptionRequiredDialog 
        isOpen={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        featureName={currentFeature}
      />
    </CrudGuardContext.Provider>
  )
}

// Hook para usar o CrudGuard
export function useCrudGuard() {
  const context = useContext(CrudGuardContext)
  
  if (!context) {
    throw new Error('useCrudGuard deve ser usado dentro de CrudGuardProvider')
  }
  
  return context
} 
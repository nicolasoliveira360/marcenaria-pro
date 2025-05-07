import { useState, useCallback } from 'react'
import { useCompany } from './use-company'
import { isPremiumActive } from '@/lib/billing'

type CrudOperation = 'create' | 'read' | 'update' | 'delete'

export function useCrudGuard() {
  const { company, isLoading } = useCompany()
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Verifica se o usuário pode realizar operações CRUD
  const canPerformCrud = company ? isPremiumActive(company.plan, company.lastlink_status) : false
  
  // Função para tentar executar uma operação CRUD
  const executeCrudOperation = useCallback(
    <T>(
      operation: () => T | Promise<T>,
      options?: { 
        operationType?: CrudOperation,
        skipPremiumCheck?: boolean 
      }
    ): Promise<T | null> => {
      // Se estiver carregando, aguarda
      if (isLoading) {
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
      setDialogOpen(true)
      return Promise.resolve(null)
    },
    [isLoading, canPerformCrud]
  )
  
  return {
    canPerformCrud,
    isLoading,
    dialogOpen,
    setDialogOpen,
    executeCrudOperation
  }
} 
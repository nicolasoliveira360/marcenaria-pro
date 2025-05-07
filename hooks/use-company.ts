import { useContext } from 'react'
import { CompanyContext } from '@/contexts/company-provider'

export function useCompany() {
  const context = useContext(CompanyContext)
  
  if (!context) {
    throw new Error('useCompany deve ser usado dentro de CompanyProvider')
  }
  
  return context
} 
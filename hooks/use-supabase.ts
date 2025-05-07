import { useContext } from 'react'
import { SupabaseContext } from '@/contexts/supabase-provider'

export function useSupabase() {
  const context = useContext(SupabaseContext)
  
  if (!context) {
    throw new Error('useSupabase deve ser usado dentro de SupabaseProvider')
  }
  
  return context
} 
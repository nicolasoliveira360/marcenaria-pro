import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Função para criar um cliente Supabase com permissões administrativas
// Isso é necessário para APIs e webhooks que precisam de permissões elevadas
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} 
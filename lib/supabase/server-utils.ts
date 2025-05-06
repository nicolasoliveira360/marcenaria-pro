import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

/**
 * Retorna um cliente Supabase configurado junto com o ID da empresa do usuário
 */
export async function getServerClientWithCompany() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  // Obter o usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Buscar a empresa do usuário
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData) {
    throw new Error("Usuário não encontrado")
  }

  // Primeiro, tentar buscar a empresa pelo email (caso seja o proprietário)
  const { data: companyData } = await supabase.from("companies").select("id").eq("email", userData.email).single()

  if (companyData) {
    return { supabase, companyId: companyData.id, userId: user.id }
  }

  // Se não encontrou pelo email, buscar através da tabela company_user_roles
  const { data: roleData } = await supabase
    .from("company_user_roles")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (!roleData) {
    throw new Error("Empresa não encontrada")
  }

  return { supabase, companyId: roleData.company_id, userId: user.id }
}

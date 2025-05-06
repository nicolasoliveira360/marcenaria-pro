import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Obter o usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar a empresa do usuário
    const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!userData) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar ID da empresa
    const { data: companyData } = await supabase.from("companies").select("id").eq("email", userData.email).single()

    if (!companyData) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    // Buscar projetos da empresa
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("company_id", companyData.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const body = await request.json()

    // Obter o usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar a empresa do usuário
    const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!userData) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar ID da empresa
    const { data: companyData } = await supabase.from("companies").select("id").eq("email", userData.email).single()

    if (!companyData) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    // Adicionar o ID da empresa ao projeto
    const projectData = {
      ...body,
      company_id: companyData.id,
    }

    // Criar o projeto
    const { data, error } = await supabase.from("projects").insert(projectData).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ project: data[0] })
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

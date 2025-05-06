import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const projectId = params.id

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

    // Buscar o projeto
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("company_id", companyData.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Erro ao buscar projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const projectId = params.id
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

    // Verificar se o projeto pertence à empresa
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("company_id", companyData.id)
      .single()

    if (!existingProject) {
      return NextResponse.json({ error: "Projeto não encontrado ou não pertence à sua empresa" }, { status: 404 })
    }

    // Atualizar o projeto
    const { data, error } = await supabase.from("projects").update(body).eq("id", projectId).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ project: data[0] })
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const projectId = params.id

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

    // Verificar se o projeto pertence à empresa
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("company_id", companyData.id)
      .single()

    if (!existingProject) {
      return NextResponse.json({ error: "Projeto não encontrado ou não pertence à sua empresa" }, { status: 404 })
    }

    // Excluir o projeto
    const { error } = await supabase.from("projects").delete().eq("id", projectId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

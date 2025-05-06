import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { name, description, client_id, total_value, payment_status } = await request.json()

    // Verificar se o usuário tem uma empresa associada
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", session.user.id)
      .single()

    if (userError || !userData?.company_id) {
      return NextResponse.json({ error: "Usuário sem empresa associada" }, { status: 400 })
    }

    const company_id = userData.company_id

    // Inserir o projeto
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .insert({
        name,
        description,
        client_id,
        company_id,
        total_value: total_value || 0,
        payment_status: payment_status || "pendente",
      })
      .select()
      .single()

    if (projectError) {
      return NextResponse.json({ error: "Erro ao criar projeto", details: projectError.message }, { status: 500 })
    }

    // Buscar status macro padrão da empresa
    const { data: macroStatuses, error: macroStatusError } = await supabase
      .from("macro_status")
      .select("*")
      .eq("company_id", company_id)
      .order("position")

    if (!macroStatusError && macroStatuses && macroStatuses.length > 0) {
      // Criar status de projeto baseado nos status macro
      const projectStatusPromises = macroStatuses.map(async (macroStatus) => {
        // Inserir status do projeto
        const { data: projectStatus, error: statusError } = await supabase
          .from("project_status")
          .insert({
            project_id: projectData.id,
            name: macroStatus.name,
            position: macroStatus.position,
          })
          .select()
          .single()

        if (statusError || !projectStatus) {
          console.error("Erro ao criar status do projeto:", statusError)
          return null
        }

        // Buscar tarefas padrão para este status macro
        const { data: macroTasks, error: tasksError } = await supabase
          .from("macro_status_task")
          .select("*")
          .eq("macro_status_id", macroStatus.id)
          .order("position")

        if (tasksError || !macroTasks) {
          console.error("Erro ao buscar tarefas padrão:", tasksError)
          return projectStatus
        }

        // Criar tarefas do projeto baseadas nas tarefas padrão
        for (const task of macroTasks) {
          await supabase.from("project_task").insert({
            project_status_id: projectStatus.id,
            name: task.name,
            position: task.position,
            is_done: false,
          })
        }

        return projectStatus
      })

      await Promise.all(projectStatusPromises)
    } else {
      // Se não houver status macro configurados, criar status padrão
      const defaultStatuses = [
        { name: "A Fazer", position: 1 },
        { name: "Em Andamento", position: 2 },
        { name: "Concluído", position: 3 },
      ]

      for (const status of defaultStatuses) {
        await supabase.from("project_status").insert({
          project_id: projectData.id,
          name: status.name,
          position: status.position,
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: projectData,
    })
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

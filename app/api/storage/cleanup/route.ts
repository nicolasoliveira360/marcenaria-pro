import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { projectId, companyId } = await request.json()

    if (!projectId || !companyId) {
      return NextResponse.json({ error: "projectId e companyId são obrigatórios" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Configurar o contexto RLS para a empresa atual
    await supabase.rpc("set_current_company", { company_id: companyId })

    // 1. Buscar todos os arquivos do projeto no banco
    const { data: dbFiles, error: dbError } = await supabase
      .from("project_files")
      .select("id, storage_path")
      .eq("project_id", projectId)

    if (dbError) {
      console.error("Erro ao buscar arquivos do banco:", dbError)
      return NextResponse.json({ error: "Erro ao buscar arquivos do banco", details: dbError }, { status: 500 })
    }

    // 2. Listar todos os arquivos no bucket para este projeto
    const { data: storageFiles, error: storageError } = await supabase.storage.from("project-gallery").list(projectId)

    if (storageError) {
      console.error("Erro ao listar arquivos no bucket:", storageError)
      return NextResponse.json({ error: "Erro ao listar arquivos no bucket", details: storageError }, { status: 500 })
    }

    // 3. Identificar arquivos órfãos (existem no bucket mas não no banco)
    const dbPaths = new Set(dbFiles?.map((file) => file.storage_path.split("/").pop()) || [])
    const orphanedFiles = storageFiles?.filter((file) => !dbPaths.has(file.name)) || []

    // 4. Remover arquivos órfãos
    const results = []

    for (const file of orphanedFiles) {
      const filePath = `${projectId}/${file.name}`
      try {
        const { error } = await supabase.storage.from("project-gallery").remove([filePath])

        results.push({
          path: filePath,
          success: !error,
          error: error ? error.message : null,
        })
      } catch (error) {
        results.push({
          path: filePath,
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    return NextResponse.json({
      message: `Limpeza concluída. ${results.filter((r) => r.success).length} de ${orphanedFiles.length} arquivos órfãos removidos.`,
      results,
    })
  } catch (error) {
    console.error("Erro ao limpar arquivos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

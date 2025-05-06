import { createClient } from "@/lib/supabase/client"

/**
 * Utilitário para limpar arquivos órfãos no bucket de armazenamento
 */
export const StorageCleanup = {
  /**
   * Verifica e remove arquivos órfãos no bucket project-gallery
   * Um arquivo é considerado órfão se existe no bucket mas não tem registro correspondente na tabela project_files
   *
   * @param projectId ID do projeto para limpar (opcional, se não fornecido limpa todos os projetos)
   * @returns Número de arquivos removidos
   */
  async cleanOrphanedFiles(projectId?: string): Promise<number> {
    const supabase = createClient()
    let removedCount = 0

    try {
      // Listar arquivos no bucket
      const { data: folders, error: listError } = await supabase.storage.from("project-gallery").list(projectId)

      if (listError) {
        console.error("Erro ao listar pastas no bucket:", listError)
        return 0
      }

      if (!folders || folders.length === 0) {
        console.log("Nenhuma pasta encontrada no bucket")
        return 0
      }

      // Para cada pasta (projeto)
      for (const folder of folders) {
        if (!folder.name) continue

        const folderPath = projectId ? `${projectId}/${folder.name}` : folder.name

        // Listar arquivos na pasta
        const { data: files, error: filesError } = await supabase.storage.from("project-gallery").list(folderPath)

        if (filesError) {
          console.error(`Erro ao listar arquivos na pasta ${folderPath}:`, filesError)
          continue
        }

        if (!files || files.length === 0) continue

        // Para cada arquivo, verificar se existe registro no banco
        for (const file of files) {
          if (!file.name) continue

          const filePath = `${folderPath}/${file.name}`

          // Verificar se existe registro no banco
          const { data: fileRecord, error: recordError } = await supabase
            .from("project_files")
            .select("id")
            .eq("storage_path", filePath)
            .maybeSingle()

          if (recordError) {
            console.error(`Erro ao verificar registro para o arquivo ${filePath}:`, recordError)
            continue
          }

          // Se não existe registro, remover o arquivo
          if (!fileRecord) {
            console.log(`Arquivo órfão encontrado: ${filePath}`)

            const { error: removeError } = await supabase.storage.from("project-gallery").remove([filePath])

            if (removeError) {
              console.error(`Erro ao remover arquivo órfão ${filePath}:`, removeError)
            } else {
              console.log(`Arquivo órfão removido: ${filePath}`)
              removedCount++
            }
          }
        }
      }

      return removedCount
    } catch (error) {
      console.error("Erro ao limpar arquivos órfãos:", error)
      return removedCount
    }
  },
}

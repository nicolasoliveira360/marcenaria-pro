import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Constantes
const BUCKET_NAME = "project-gallery"

/**
 * Utilitário para gerenciar arquivos no Supabase Storage
 * Implementa padrões de segurança e tratamento de erros
 */
export const StorageManager = {
  /**
   * Gera um caminho de arquivo único para evitar colisões
   * @param projectId ID do projeto
   * @param fileName Nome original do arquivo
   * @returns Caminho único para o arquivo
   */
  generateUniqueFilePath(projectId: string, fileName: string): string {
    // Sanitiza o nome do arquivo para evitar problemas com caracteres especiais
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")

    // Gera um UUID para garantir unicidade
    const uniqueId = uuidv4()

    // Retorna um caminho único: projectId/uuid-filename
    return `${projectId}/${uniqueId}-${sanitizedFileName}`
  },

  /**
   * Faz upload de um arquivo com transação "pseudo-ACID"
   * Se o registro no banco falhar, o arquivo é removido do storage
   *
   * @param file Arquivo a ser enviado
   * @param projectId ID do projeto
   * @param userId ID do usuário que está fazendo o upload
   * @returns Objeto com dados do arquivo ou erro
   */
  async uploadFile(file: File, projectId: string, userId: string) {
    const supabase = createClient()
    const filePath = this.generateUniqueFilePath(projectId, file.name)

    try {
      // 1. Upload do arquivo para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Registra o arquivo no banco de dados (dentro de uma transação)
      const { data: fileRecord, error: insertError } = await supabase
        .from("project_files")
        .insert({
          project_id: projectId,
          storage_path: filePath,
          mime_type: file.type,
          size_bytes: file.size,
          uploaded_by: userId,
        })
        .select()
        .single()

      if (insertError) {
        // Se falhar o INSERT, remove o arquivo para evitar órfãos
        console.error("Falha ao registrar arquivo no banco. Removendo do storage:", insertError)
        await this.removeFileFromStorage(filePath)
        throw insertError
      }

      // 3. Retorna os dados do arquivo com URL pública (se necessário)
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

      return {
        ...fileRecord,
        url: urlData.publicUrl,
      }
    } catch (error) {
      console.error("Erro durante o processo de upload:", error)
      throw error
    }
  },

  /**
   * Remove um arquivo do storage
   * Ignora erros 404 (arquivo não encontrado)
   *
   * @param filePath Caminho do arquivo no storage
   * @returns true se removido com sucesso, false se não encontrado
   */
  async removeFileFromStorage(filePath: string): Promise<boolean> {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

      if (error) {
        // Ignora erros 404 (arquivo não encontrado)
        if (error.message?.includes("404") || error.message?.includes("not found")) {
          console.warn(`Arquivo não encontrado no storage: ${filePath}`)
          return false
        }

        // Propaga outros erros
        throw error
      }

      return true
    } catch (error) {
      // Captura e loga erros não esperados
      console.error("Erro ao remover arquivo do storage:", error)
      throw error
    }
  },

  /**
   * Exclui um arquivo completamente (banco + storage)
   * Implementa transação "pseudo-ACID"
   *
   * @param fileId ID do arquivo no banco de dados
   * @returns true se excluído com sucesso
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const supabase = createClient()

    try {
      // 1. Busca o caminho do arquivo no banco
      const { data: fileData, error: fetchError } = await supabase
        .from("project_files")
        .select("storage_path")
        .eq("id", fileId)
        .single()

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          console.warn(`Arquivo com ID ${fileId} não encontrado no banco`)
          return false
        }
        throw fetchError
      }

      if (!fileData?.storage_path) {
        console.warn(`Arquivo com ID ${fileId} não tem storage_path válido`)
        return false
      }

      // 2. Remove o arquivo do storage
      const storageRemoved = await this.removeFileFromStorage(fileData.storage_path)

      // 3. Remove o registro do banco (mesmo se o arquivo não existir no storage)
      const { error: deleteError } = await supabase.from("project_files").delete().eq("id", fileId)

      if (deleteError) throw deleteError

      return true
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error)
      throw error
    }
  },

  /**
   * Busca a URL pública de um arquivo
   *
   * @param filePath Caminho do arquivo no storage
   * @returns URL pública do arquivo
   */
  getPublicUrl(filePath: string): string {
    const supabase = createClient()
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    return data.publicUrl
  },
}

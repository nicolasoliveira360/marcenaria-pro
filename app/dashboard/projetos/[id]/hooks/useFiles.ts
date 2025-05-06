"use client"

import { useState, useEffect } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ProjectFile } from "../utils/types"

export function useFiles(
  supabase: SupabaseClient,
  projectId: string,
  companyId: string | null,
  userId: string | null,
  isNewProject: boolean,
) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)

  useEffect(() => {
    if (!isNewProject && companyId) {
      fetchFiles()
    }
  }, [isNewProject, projectId, companyId, supabase])

  const fetchFiles = async () => {
    try {
      // Configurar o contexto RLS para a empresa atual
      if (companyId) {
        await supabase.rpc("set_current_company", { company_id: companyId })
      }

      const { data: filesData, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error

      if (filesData) {
        // Para cada arquivo, obter a URL pública
        const filesWithUrls = filesData.map((file) => {
          try {
            const { data } = supabase.storage.from("project-gallery").getPublicUrl(file.storage_path)
            return {
              ...file,
              url: data.publicUrl,
              // Garantir que temos o nome do arquivo mesmo se não estiver no banco
              file_name: file.file_name || file.storage_path.split("/").pop() || "arquivo",
            }
          } catch (error) {
            console.error(`Erro ao obter URL para o arquivo ${file.id}:`, error)
            return {
              ...file,
              url: "", // URL vazia em caso de erro
              file_name: file.file_name || file.storage_path.split("/").pop() || "arquivo",
            }
          }
        })
        setFiles(filesWithUrls)
      } else {
        setFiles([])
      }
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error)
      alert("Erro ao carregar arquivos. Por favor, tente novamente.")
      setFiles([])
    }
  }

  const handleFileUpload = async (fileList: FileList, customNames?: Record<string, string>) => {
    if (!fileList || fileList.length === 0 || isNewProject || !companyId || !userId) return

    try {
      setUploadingFiles(true)

      // IMPORTANTE: Configurar o contexto RLS para a empresa atual ANTES de qualquer operação
      await supabase.rpc("set_current_company", { company_id: companyId })

      // Verificar explicitamente se o usuário tem acesso ao projeto
      const { data: projectAccess, error: accessError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("company_id", companyId)
        .single()

      if (accessError || !projectAccess) {
        console.error("Usuário não tem acesso a este projeto:", accessError)
        alert("Você não tem permissão para adicionar arquivos a este projeto.")
        return
      }

      // Método direto de upload para o bucket
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        try {
          // Gerar um nome de arquivo único
          const fileExt = file.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

          // IMPORTANTE: O caminho DEVE começar com o ID do projeto para satisfazer a política RLS
          // Armazenamos apenas o caminho relativo dentro do bucket, sem o nome do bucket
          const filePath = `${projectId}/${fileName}`

          // 1. Upload do arquivo para o bucket
          const { error: uploadError } = await supabase.storage.from("project-gallery").upload(filePath, file)

          if (uploadError) {
            console.error(`Erro ao fazer upload do arquivo ${file.name}:`, uploadError)
            alert(`Erro ao fazer upload: ${uploadError.message}`)
            continue
          }

          // 2. Registrar o arquivo no banco de dados
          const { data: fileRecord, error: insertError } = await supabase
            .from("project_files")
            .insert({
              project_id: projectId,
              // Usar o nome personalizado se fornecido, caso contrário usar o nome original
              file_name: customNames && customNames[file.name] ? customNames[file.name] : file.name,
              storage_path: filePath, // Armazenamos o caminho relativo
              mime_type: file.type,
              size_bytes: file.size,
              uploaded_by: userId,
            })
            .select()
            .single()

          if (insertError) {
            console.error(`Erro ao registrar arquivo no banco:`, insertError)
            // Remover o arquivo do storage para evitar órfãos
            await supabase.storage.from("project-gallery").remove([filePath])
            continue
          }

          // 3. Obter URL pública
          const { data: urlData } = supabase.storage.from("project-gallery").getPublicUrl(filePath)

          // 4. Adicionar ao estado local
          setFiles((prevFiles) => [
            {
              ...fileRecord,
              url: urlData.publicUrl,
            },
            ...prevFiles,
          ])
        } catch (error) {
          console.error(`Erro ao fazer upload do arquivo ${file.name}:`, error)
        }
      }
    } catch (error) {
      console.error("Erro ao fazer upload de arquivos:", error)
      alert("Erro ao fazer upload de arquivos. Por favor, tente novamente.")
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      setDeletingFileId(fileId)

      // Configurar o contexto RLS para a empresa atual
      if (companyId) {
        await supabase.rpc("set_current_company", { company_id: companyId })
      }

      // 1. Buscar o caminho do arquivo no banco
      const { data: fileData, error: fetchError } = await supabase
        .from("project_files")
        .select("storage_path, file_name")
        .eq("id", fileId)
        .single()

      if (fetchError) {
        console.error("Erro ao buscar arquivo:", fetchError)
        return false
      }

      if (!fileData?.storage_path) {
        console.warn(`Arquivo com ID ${fileId} não tem storage_path válido`)
        return false
      }

      // 2. Remover o arquivo do storage
      // IMPORTANTE: O método remove() espera o caminho relativo dentro do bucket
      console.log("Tentando excluir arquivo com caminho:", fileData.storage_path)

      // Garantir que o caminho não inclui o nome do bucket
      const storagePath = fileData.storage_path.startsWith("project-gallery/")
        ? fileData.storage_path.replace("project-gallery/", "")
        : fileData.storage_path

      console.log("Caminho final para exclusão:", storagePath)

      // NOVA ABORDAGEM: Usar a API REST diretamente
      try {
        // Primeiro, tentar o método padrão
        const { error: removeError } = await supabase.storage.from("project-gallery").remove([storagePath])

        if (removeError) {
          console.error("Erro ao remover arquivo usando método padrão:", removeError)

          // Se falhar, tentar abordagem alternativa com fetch direto
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

          if (supabaseUrl && supabaseKey) {
            const deleteUrl = `${supabaseUrl}/storage/v1/object/project-gallery/${encodeURIComponent(storagePath)}`

            console.log("Tentando excluir via API REST:", deleteUrl)

            const response = await fetch(deleteUrl, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
              },
            })

            if (!response.ok) {
              const errorData = await response.json()
              console.error("Erro na exclusão via API REST:", errorData)
            } else {
              console.log("Arquivo excluído com sucesso via API REST")
            }
          }
        } else {
          console.log("Arquivo excluído com sucesso usando método padrão")
        }
      } catch (removeError) {
        console.error("Erro ao tentar remover arquivo:", removeError)
      }

      // 3. Remover o registro do banco
      const { error: deleteError } = await supabase.from("project_files").delete().eq("id", fileId)

      if (deleteError) {
        console.error("Erro ao excluir registro do arquivo:", deleteError)
        return false
      }

      // 4. Atualizar estado local
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))

      return true
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error)
      alert("Erro ao excluir arquivo. Por favor, tente novamente.")
      return false
    } finally {
      setDeletingFileId(null)
    }
  }

  return {
    files,
    uploadingFiles,
    deletingFileId,
    fetchFiles,
    handleFileUpload,
    handleDeleteFile,
  }
}

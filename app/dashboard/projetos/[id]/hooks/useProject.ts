"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Project, Client } from "../utils/types"

export function useProject(projectId: string, isNewProject: boolean) {
  const router = useRouter()
  const [supabase, setSupabase] = useState(createClient())
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Client[]>([])

  const [project, setProject] = useState<Partial<Project>>({
    name: "",
    client_id: "",
    description: "",
    total_value: 0,
    payment_status: "pendente",
    progress_status_id: null,
    slug: "",
    password_hash: "",
  })

  useEffect(() => {
    const initializeClient = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

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

        let companyId

        if (companyData) {
          companyId = companyData.id
          setSupabase(supabase)
          setCompanyId(companyId)
          setUserId(user.id)
        } else {
          // Se não encontrou pelo email, buscar através da tabela company_user_roles
          const { data: roleData } = await supabase
            .from("company_user_roles")
            .select("company_id")
            .eq("user_id", user.id)
            .single()

          if (!roleData) {
            throw new Error("Empresa não encontrada")
          }

          companyId = roleData.company_id
          setSupabase(supabase)
          setCompanyId(companyId)
          setUserId(user.id)
        }

        // Agora que temos o ID da empresa, podemos buscar os clientes
        const { data: clientsData } = await supabase
          .from("clients")
          .select("*")
          .eq("company_id", companyId)
          .order("name")

        setClients(clientsData || [])

        // Se não for um novo projeto, carregar os dados do projeto
        if (!isNewProject) {
          await fetchProjectData(supabase, companyId)
        }
      } catch (error) {
        console.error("Erro ao inicializar cliente:", error)
        alert("Erro ao inicializar cliente. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    initializeClient()
  }, [isNewProject, projectId])

  const fetchProjectData = async (supabaseClient = supabase, cId = companyId) => {
    if (!cId) return

    try {
      // Buscar dados do projeto
      const { data } = await supabaseClient
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("company_id", cId)
        .single()

      if (data) {
        setProject(data)
      }
    } catch (error) {
      console.error("Erro ao carregar dados do projeto:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "total_value") {
      // Remover caracteres não numéricos e converter para número
      const numericValue = value.replace(/[^\d,]/g, "").replace(",", ".")
      setProject((prev) => ({ ...prev, [name]: numericValue ? Number.parseFloat(numericValue) : 0 }))
    } else {
      setProject((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setProject((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProject = async () => {
    try {
      setSaving(true)

      if (!project.name || !project.client_id) {
        alert("Nome do projeto e cliente são obrigatórios.")
        return
      }

      if (!companyId) {
        throw new Error("Não foi possível determinar a empresa do usuário")
      }

      // Remover o slug se estiver vazio para evitar problemas de unicidade
      const projectData = {
        ...project,
        company_id: companyId,
      }

      // Se o slug estiver vazio, remova-o para que o banco de dados não tente inserir uma string vazia
      if (!projectData.slug) {
        delete projectData.slug
      }

      if (isNewProject) {
        // Criar novo projeto
        const { data, error } = await supabase.from("projects").insert(projectData).select()

        if (error) throw error
        if (data && data[0]) {
          const newProjectId = data[0].id

          // Buscar status macro configurados para a empresa
          const { data: macroStatuses, error: macroStatusError } = await supabase
            .from("macro_status")
            .select("*")
            .eq("company_id", companyId)
            .order("position")

          if (!macroStatusError && macroStatuses && macroStatuses.length > 0) {
            // Criar status de projeto baseado nos status macro
            const projectStatusPromises = macroStatuses.map(async (macroStatus) => {
              // Inserir status do projeto
              const { data: projectStatus, error: statusError } = await supabase
                .from("project_status")
                .insert({
                  project_id: newProjectId,
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
                project_id: newProjectId,
                name: status.name,
                position: status.position,
              })
            }
          }

          router.push(`/dashboard/projetos/${newProjectId}`)
        }
      } else {
        // Atualizar projeto existente
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", projectId)
          .eq("company_id", companyId)

        if (error) throw error

        // Recarregar dados do projeto
        await fetchProjectData()
      }
    } catch (error) {
      console.error("Erro ao salvar projeto:", error)
      alert("Erro ao salvar projeto: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    try {
      if (!companyId) return
      await supabase.from("projects").delete().eq("id", projectId).eq("company_id", companyId)
      router.push("/dashboard/projetos")
    } catch (error) {
      console.error("Erro ao excluir projeto:", error)
      alert("Erro ao excluir projeto. Por favor, tente novamente.")
    }
  }

  const handleGenerateSlug = () => {
    if (!project.name) return

    const timestamp = Date.now().toString(36)
    const randomString = Math.random().toString(36).substring(2, 6)

    const slug =
      project.name
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .substring(0, 30) +
      "-" +
      timestamp +
      "-" +
      randomString

    setProject((prev) => ({ ...prev, slug }))
  }

  const handleGeneratePassword = () => {
    const password = Math.random().toString(36).substring(2, 10).toUpperCase()
    setProject((prev) => ({ ...prev, password_hash: password }))
  }

  return {
    loading,
    saving,
    clients,
    project,
    companyId,
    userId,
    supabase,
    setProject,
    handleInputChange,
    handleSelectChange,
    handleSaveProject,
    handleDeleteProject,
    handleGenerateSlug,
    handleGeneratePassword,
  }
}

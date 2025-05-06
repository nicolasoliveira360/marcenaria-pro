"use client"

import { useState, useEffect } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ProjectStatus } from "../utils/types"

export function useStatus(supabase: SupabaseClient, projectId: string, isNewProject: boolean) {
  const [statusColumns, setStatusColumns] = useState<ProjectStatus[]>([])
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null)
  const [newStatusName, setNewStatusName] = useState("")

  useEffect(() => {
    if (!isNewProject) {
      fetchStatusColumns()
    }
  }, [isNewProject, projectId, supabase])

  const fetchStatusColumns = async () => {
    const { data } = await supabase.from("project_status").select("*").eq("project_id", projectId).order("position")

    setStatusColumns(data || [])

    // Selecionar o primeiro status por padrão para novas tarefas
    if (data && data.length > 0 && !selectedStatusId) {
      setSelectedStatusId(data[0].id)
    }
  }

  const handleAddStatus = async () => {
    if (!newStatusName.trim() || isNewProject) return

    try {
      // Encontrar a maior posição atual
      const maxPosition = statusColumns.length > 0 ? Math.max(...statusColumns.map((s) => s.position)) : 0

      const { data, error } = await supabase
        .from("project_status")
        .insert({
          project_id: projectId,
          name: newStatusName,
          position: maxPosition + 1,
        })
        .select()

      if (error) throw error

      // Recarregar status
      await fetchStatusColumns()
      setNewStatusName("")
      return true
    } catch (error) {
      console.error("Erro ao adicionar status:", error)
      return false
    }
  }

  return {
    statusColumns,
    selectedStatusId,
    setSelectedStatusId,
    newStatusName,
    setNewStatusName,
    fetchStatusColumns,
    handleAddStatus,
  }
}

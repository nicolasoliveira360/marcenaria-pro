"use client"

import { useState, useEffect } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ProjectTask } from "../utils/types"

export function useTasks(
  supabase: SupabaseClient,
  projectId: string,
  selectedStatusId: string | null,
  isNewProject: boolean,
) {
  const [tasks, setTasks] = useState<(ProjectTask & { status_name?: string })[]>([])
  const [newTask, setNewTask] = useState("")

  useEffect(() => {
    if (!isNewProject) {
      fetchTasks()
    }
  }, [isNewProject, projectId, supabase])

  const fetchTasks = async () => {
    // Buscar todas as tarefas do projeto através dos status
    const { data: statusData } = await supabase.from("project_status").select("id, name").eq("project_id", projectId)

    if (statusData && statusData.length > 0) {
      const allTasks: (ProjectTask & { status_name?: string })[] = []

      for (const status of statusData) {
        const { data: taskData } = await supabase
          .from("project_task")
          .select("*")
          .eq("project_status_id", status.id)
          .order("position")

        if (taskData) {
          // Adicionar o nome do status a cada tarefa
          const tasksWithStatus = taskData.map((task) => ({
            ...task,
            status_name: status.name,
          }))

          allTasks.push(...tasksWithStatus)
        }
      }

      setTasks(allTasks)
    } else {
      setTasks([])
    }
  }

  const handleAddTask = async () => {
    if (!newTask.trim() || isNewProject || !selectedStatusId) return

    try {
      // Encontrar a maior posição atual para o status selecionado
      const statusTasks = tasks.filter((t) => t.project_status_id === selectedStatusId)
      const maxPosition = statusTasks.length > 0 ? Math.max(...statusTasks.map((t) => t.position)) : 0

      const { data, error } = await supabase
        .from("project_task")
        .insert({
          project_status_id: selectedStatusId,
          name: newTask,
          position: maxPosition + 1,
          is_done: false,
        })
        .select()

      if (error) throw error

      // Recarregar tarefas
      await fetchTasks()
      setNewTask("")
      return true
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error)
      return false
    }
  }

  const handleToggleTask = async (taskId: string, isDone: boolean) => {
    try {
      await supabase.from("project_task").update({ is_done: !isDone }).eq("id", taskId)

      // Atualizar estado local
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, is_done: !isDone } : task)))
      return true
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      return false
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await supabase.from("project_task").delete().eq("id", taskId)

      // Atualizar estado local
      setTasks(tasks.filter((task) => task.id !== taskId))
      return true
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error)
      return false
    }
  }

  return {
    tasks,
    newTask,
    setNewTask,
    fetchTasks,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
  }
}

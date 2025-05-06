"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Save, X, ChevronDown, ChevronUp, Settings, ListChecks } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

type MacroStatus = {
  id: string
  name: string
  position: number
  tasks: MacroStatusTask[]
  isExpanded?: boolean
  isEditing?: boolean
}

type MacroStatusTask = {
  id: string
  name: string
  position: number
  description: string | null
  isEditing?: boolean
}

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [macroStatuses, setMacroStatuses] = useState<MacroStatus[]>([])
  const [newStatusName, setNewStatusName] = useState("")
  const [addingStatus, setAddingStatus] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  const [selectedStatus, setSelectedStatus] = useState<MacroStatus | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [savingTask, setSavingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<MacroStatusTask | null>(null)

  const [companyId, setCompanyId] = useState<string | null>(null)

  // Carregar status e tarefas
  useEffect(() => {
    async function loadMacroStatuses() {
      setLoading(true)

      try {
        // Obter o ID da empresa do usuário logado
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

        // Buscar ID da empresa
        const { data: companyData } = await supabase.from("companies").select("id").eq("email", userData.email).single()

        if (!companyData) {
          throw new Error("Empresa não encontrada")
        }

        setCompanyId(companyData.id)

        // Buscar status macro
        const { data: statusData, error: statusError } = await supabase
          .from("macro_status")
          .select("*")
          .eq("company_id", companyData.id)
          .order("position")

        if (statusError) throw statusError

        // Para cada status, buscar suas tarefas
        const statusesWithTasks = await Promise.all(
          statusData.map(async (status) => {
            const { data: taskData, error: taskError } = await supabase
              .from("macro_status_task")
              .select("*")
              .eq("macro_status_id", status.id)
              .order("position")

            if (taskError) throw taskError

            return {
              ...status,
              tasks: taskData || [],
              isExpanded: true,
            }
          }),
        )

        setMacroStatuses(statusesWithTasks)
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
        toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as configurações. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadMacroStatuses()
  }, [supabase, toast])

  // Adicionar novo status
  const handleAddStatus = async () => {
    if (!newStatusName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o status.",
        variant: "destructive",
      })
      return
    }

    if (!companyId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado. Tente recarregar a página.",
        variant: "destructive",
      })
      return
    }

    setSavingStatus(true)

    try {
      // Determinar a próxima posição
      const nextPosition = macroStatuses.length > 0 ? Math.max(...macroStatuses.map((s) => s.position)) + 1 : 1

      // Inserir novo status
      const { data, error } = await supabase
        .from("macro_status")
        .insert({
          name: newStatusName.trim(),
          position: nextPosition,
          company_id: companyId, // Incluir o ID da empresa
        })
        .select()

      if (error) throw error

      // Adicionar o novo status à lista
      if (data && data[0]) {
        setMacroStatuses([...macroStatuses, { ...data[0], tasks: [], isExpanded: true }])
        setNewStatusName("")
        setAddingStatus(false)

        toast({
          title: "Status adicionado",
          description: `O status "${newStatusName}" foi adicionado com sucesso.`,
        })
      }
    } catch (error: any) {
      console.error("Erro ao adicionar status:", error)
      toast({
        title: "Erro ao adicionar status",
        description: error.message || "Não foi possível adicionar o status. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSavingStatus(false)
    }
  }

  // Atualizar status
  const handleUpdateStatus = async (status: MacroStatus) => {
    if (!status.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O status precisa ter um nome.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("macro_status").update({ name: status.name.trim() }).eq("id", status.id)

      if (error) throw error

      // Atualizar a lista local
      setMacroStatuses(
        macroStatuses.map((s) => (s.id === status.id ? { ...s, name: status.name.trim(), isEditing: false } : s)),
      )

      toast({
        title: "Status atualizado",
        description: `O status foi atualizado com sucesso.`,
      })
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Excluir status
  const handleDeleteStatus = async (statusId: string) => {
    if (!confirm("Tem certeza que deseja excluir este status? Todas as tarefas associadas também serão excluídas.")) {
      return
    }

    try {
      const { error } = await supabase.from("macro_status").delete().eq("id", statusId)

      if (error) throw error

      // Remover da lista local
      setMacroStatuses(macroStatuses.filter((s) => s.id !== statusId))

      toast({
        title: "Status excluído",
        description: "O status e suas tarefas foram excluídos com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao excluir status:", error)
      toast({
        title: "Erro ao excluir status",
        description: error.message || "Não foi possível excluir o status. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Mover status para cima ou para baixo
  const handleMoveStatus = async (statusId: string, direction: "up" | "down") => {
    const currentIndex = macroStatuses.findIndex((s) => s.id === statusId)
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === macroStatuses.length - 1)
    ) {
      return
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const statusToSwap = macroStatuses[newIndex]

    try {
      // Primeiro, atualize a interface para feedback imediato
      const newStatuses = [...macroStatuses]
      const tempPosition = newStatuses[currentIndex].position
      newStatuses[currentIndex] = { ...newStatuses[currentIndex], position: statusToSwap.position }
      newStatuses[newIndex] = { ...newStatuses[newIndex], position: tempPosition }
      newStatuses.sort((a, b) => a.position - b.position)

      setMacroStatuses(newStatuses)

      // Use uma posição temporária para evitar conflito de chave única
      const TEMP_POSITION = -9999 // Uma posição temporária que não deve existir no banco

      // Primeiro, mova um status para uma posição temporária
      const { error: errorTemp } = await supabase
        .from("macro_status")
        .update({ position: TEMP_POSITION })
        .eq("id", statusId)

      if (errorTemp) throw errorTemp

      // Agora, atualize a posição do segundo status
      const { error: error1 } = await supabase
        .from("macro_status")
        .update({ position: tempPosition })
        .eq("id", statusToSwap.id)

      if (error1) throw error1

      // Finalmente, defina a posição correta para o primeiro status
      const { error: error2 } = await supabase
        .from("macro_status")
        .update({ position: statusToSwap.position })
        .eq("id", statusId)

      if (error2) throw error2

      toast({
        title: "Ordem atualizada",
        description: "A ordem dos status foi atualizada com sucesso.",
        duration: 2000,
      })
    } catch (error) {
      console.error("Erro ao reordenar status:", error)
      toast({
        title: "Erro ao reordenar",
        description: "Não foi possível reordenar os status. Tente novamente.",
        variant: "destructive",
      })

      // Reverter a mudança na interface em caso de erro
      const originalStatuses = [...macroStatuses]
      setMacroStatuses(originalStatuses)
    }
  }

  // Adicionar nova tarefa
  const handleAddTask = async () => {
    if (!selectedStatus) return

    if (!newTaskName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a tarefa.",
        variant: "destructive",
      })
      return
    }

    setSavingTask(true)

    try {
      // Determinar a próxima posição
      const tasks = selectedStatus.tasks || []
      const nextPosition = tasks.length > 0 ? Math.max(...tasks.map((t) => t.position)) + 1 : 1

      // Inserir nova tarefa
      const { data, error } = await supabase
        .from("macro_status_task")
        .insert({
          macro_status_id: selectedStatus.id,
          name: newTaskName.trim(),
          description: newTaskDescription.trim() || null,
          position: nextPosition,
        })
        .select()

      if (error) throw error

      // Adicionar a nova tarefa à lista
      if (data && data[0]) {
        const updatedStatuses = macroStatuses.map((status) => {
          if (status.id === selectedStatus.id) {
            return {
              ...status,
              tasks: [...status.tasks, data[0]],
            }
          }
          return status
        })

        setMacroStatuses(updatedStatuses)
        setNewTaskName("")
        setNewTaskDescription("")
        setIsTaskDialogOpen(false)

        toast({
          title: "Tarefa adicionada",
          description: `A tarefa "${newTaskName}" foi adicionada com sucesso.`,
        })
      }
    } catch (error: any) {
      console.error("Erro ao adicionar tarefa:", error)
      toast({
        title: "Erro ao adicionar tarefa",
        description: error.message || "Não foi possível adicionar a tarefa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSavingTask(false)
    }
  }

  // Atualizar tarefa
  const handleUpdateTask = async () => {
    if (!editingTask || !selectedStatus) return

    if (!editingTask.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "A tarefa precisa ter um nome.",
        variant: "destructive",
      })
      return
    }

    setSavingTask(true)

    try {
      const { error } = await supabase
        .from("macro_status_task")
        .update({
          name: editingTask.name.trim(),
          description: editingTask.description?.trim() || null,
        })
        .eq("id", editingTask.id)

      if (error) throw error

      // Atualizar a lista local
      const updatedStatuses = macroStatuses.map((status) => {
        if (status.id === selectedStatus.id) {
          return {
            ...status,
            tasks: status.tasks.map((task) =>
              task.id === editingTask.id
                ? {
                    ...task,
                    name: editingTask.name.trim(),
                    description: editingTask.description?.trim() || null,
                  }
                : task,
            ),
          }
        }
        return status
      })

      setMacroStatuses(updatedStatuses)
      setEditingTask(null)
      setIsTaskDialogOpen(false)

      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao atualizar tarefa:", error)
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message || "Não foi possível atualizar a tarefa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSavingTask(false)
    }
  }

  // Excluir tarefa
  const handleDeleteTask = async (statusId: string, taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
      return
    }

    try {
      const { error } = await supabase.from("macro_status_task").delete().eq("id", taskId)

      if (error) throw error

      // Remover da lista local
      const updatedStatuses = macroStatuses.map((status) => {
        if (status.id === statusId) {
          return {
            ...status,
            tasks: status.tasks.filter((task) => task.id !== taskId),
          }
        }
        return status
      })

      setMacroStatuses(updatedStatuses)

      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao excluir tarefa:", error)
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message || "Não foi possível excluir a tarefa. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Mover tarefa para cima ou para baixo
  const handleMoveTask = async (statusId: string, taskId: string, direction: "up" | "down") => {
    const status = macroStatuses.find((s) => s.id === statusId)
    if (!status) return

    const tasks = status.tasks
    const currentIndex = tasks.findIndex((t) => t.id === taskId)

    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === tasks.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const taskToSwap = tasks[newIndex]

    try {
      // Primeiro, atualize a interface para feedback imediato
      const newTasks = [...tasks]
      const tempPosition = newTasks[currentIndex].position
      newTasks[currentIndex] = { ...newTasks[currentIndex], position: taskToSwap.position }
      newTasks[newIndex] = { ...newTasks[newIndex], position: tempPosition }
      newTasks.sort((a, b) => a.position - b.position)

      const updatedStatuses = macroStatuses.map((s) => {
        if (s.id === statusId) {
          return { ...s, tasks: newTasks }
        }
        return s
      })

      setMacroStatuses(updatedStatuses)

      // Use uma posição temporária para evitar conflito de chave única
      const TEMP_POSITION = -9999 // Uma posição temporária que não deve existir no banco

      // Primeiro, mova uma tarefa para uma posição temporária
      const { error: errorTemp } = await supabase
        .from("macro_status_task")
        .update({ position: TEMP_POSITION })
        .eq("id", taskId)

      if (errorTemp) throw errorTemp

      // Agora, atualize a posição da segunda tarefa
      const { error: error1 } = await supabase
        .from("macro_status_task")
        .update({ position: tempPosition })
        .eq("id", taskToSwap.id)

      if (error1) throw error1

      // Finalmente, defina a posição correta para a primeira tarefa
      const { error: error2 } = await supabase
        .from("macro_status_task")
        .update({ position: taskToSwap.position })
        .eq("id", taskId)

      if (error2) throw error2

      toast({
        title: "Ordem atualizada",
        description: "A ordem das tarefas foi atualizada com sucesso.",
        duration: 2000,
      })
    } catch (error) {
      console.error("Erro ao reordenar tarefa:", error)
      toast({
        title: "Erro ao reordenar",
        description: "Não foi possível reordenar as tarefas. Tente novamente.",
        variant: "destructive",
      })

      // Reverter a mudança na interface em caso de erro
      const originalStatuses = [...macroStatuses]
      setMacroStatuses(originalStatuses)
    }
  }

  // Alternar expansão do card de status
  const toggleStatusExpansion = (statusId: string) => {
    setMacroStatuses(
      macroStatuses.map((status) => (status.id === statusId ? { ...status, isExpanded: !status.isExpanded } : status)),
    )
  }

  // Iniciar edição de status
  const startEditingStatus = (status: MacroStatus) => {
    setMacroStatuses(
      macroStatuses.map((s) => (s.id === status.id ? { ...s, isEditing: true } : { ...s, isEditing: false })),
    )
  }

  // Cancelar edição de status
  const cancelEditingStatus = (statusId: string) => {
    setMacroStatuses(macroStatuses.map((s) => (s.id === statusId ? { ...s, isEditing: false } : s)))
  }

  // Abrir diálogo para adicionar tarefa
  const openAddTaskDialog = (status: MacroStatus) => {
    setSelectedStatus(status)
    setNewTaskName("")
    setNewTaskDescription("")
    setEditingTask(null)
    setIsTaskDialogOpen(true)
  }

  // Abrir diálogo para editar tarefa
  const openEditTaskDialog = (status: MacroStatus, task: MacroStatusTask) => {
    setSelectedStatus(status)
    setEditingTask({ ...task })
    setIsTaskDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#70645C]" />
          <h1 className="text-2xl font-bold text-[#0f172a]">Configurações</h1>
        </div>
      </div>

      <Tabs defaultValue="workflow" className="w-full">
        <TabsList className="bg-white border border-[#e5e7eb] p-1 shadow-sm">
          <TabsTrigger 
            value="workflow" 
            className="data-[state=active]:bg-[#70645C] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Fluxo de Trabalho
          </TabsTrigger>
          <TabsTrigger 
            value="general" 
            disabled
            className="data-[state=active]:bg-[#70645C] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Geral
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            disabled
            className="data-[state=active]:bg-[#70645C] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6 mt-6">
          <Card className="border border-[#e5e7eb] shadow-sm overflow-hidden">
            <CardHeader className="bg-[#70645C]/5 border-b border-[#e5e7eb] px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-[#70645C] flex items-center">
                <ListChecks className="mr-2 h-5 w-5" /> Status de Andamento Padrão
              </CardTitle>

              {!addingStatus ? (
                <Button 
                  onClick={() => setAddingStatus(true)} 
                  className="bg-[#70645C] hover:bg-[#5d534c] text-white border border-[#70645C]/20 transition-colors duration-300"
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar Status
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nome do status"
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    className="h-11 w-64 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  />
                  <Button
                    onClick={handleAddStatus}
                    disabled={savingStatus}
                    className="bg-[#70645C] hover:bg-[#5d534c] text-white border border-[#70645C]/20 transition-colors duration-300"
                  >
                    {savingStatus ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAddingStatus(false)}
                    className="border-[#e5e7eb] text-[#475569] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {loading ? (
                  // Esqueletos de carregamento
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border border-[#e5e7eb] shadow-sm bg-white">
                      <CardHeader className="pb-3">
                        <Skeleton className="h-6 w-1/3" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : macroStatuses.length === 0 ? (
                  <Alert className="bg-yellow-50 border-yellow-200 text-yellow-600">
                    <AlertDescription>
                      Nenhum status de andamento configurado. Adicione status para definir o fluxo de trabalho padrão dos
                      seus projetos.
                    </AlertDescription>
                  </Alert>
                ) : (
                  // Lista de status
                  macroStatuses.map((status, index) => (
                    <Card key={status.id} className="border border-[#e5e7eb] shadow-sm bg-white overflow-hidden">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between bg-[#f9fafb] border-b border-[#e5e7eb]">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex flex-col">
                            <ChevronUp
                              size={18}
                              className={`cursor-pointer text-[#475569] hover:text-[#70645C] transition-colors duration-300 ${index === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => handleMoveStatus(status.id, "up")}
                            />
                            <ChevronDown
                              size={18}
                              className={`cursor-pointer text-[#475569] hover:text-[#70645C] transition-colors duration-300 ${index === macroStatuses.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => handleMoveStatus(status.id, "down")}
                            />
                          </div>

                          {status.isEditing ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={status.name}
                                onChange={(e) => {
                                  const updatedStatuses = macroStatuses.map((s) =>
                                    s.id === status.id ? { ...s, name: e.target.value } : s,
                                  )
                                  setMacroStatuses(updatedStatuses)
                                }}
                                className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(status)}
                                className="bg-[#70645C] hover:bg-[#5d534c] text-white border border-[#70645C]/20 transition-colors duration-300"
                              >
                                <Save size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => cancelEditingStatus(status.id)}
                                className="border-[#e5e7eb] text-[#475569] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <CardTitle
                                className="text-lg text-[#0f172a] flex items-center gap-2 cursor-pointer"
                                onClick={() => toggleStatusExpansion(status.id)}
                              >
                                {status.name}
                                <Badge variant="outline" className="ml-2 border-[#e5e7eb] text-[#475569]">
                                  {status.tasks.length} {status.tasks.length === 1 ? "tarefa" : "tarefas"}
                                </Badge>
                              </CardTitle>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!status.isEditing && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => startEditingStatus(status)}
                                className="h-9 border-[#e5e7eb] text-[#70645C] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                              >
                                <Edit size={16} className="mr-1" />
                                Editar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => openAddTaskDialog(status)}
                                className="h-9 border-[#e5e7eb] text-[#70645C] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                              >
                                <Plus size={16} className="mr-1" />
                                Tarefa
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors duration-300"
                                onClick={() => handleDeleteStatus(status.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardHeader>

                      {status.isExpanded && (
                        <CardContent className="p-4">
                          {status.tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-[#475569]">
                              <p>Nenhuma tarefa configurada para este status.</p>
                              <Button 
                                variant="link" 
                                onClick={() => openAddTaskDialog(status)} 
                                className="text-[#70645C] hover:text-[#5d534c] transition-colors duration-300"
                              >
                                Adicionar tarefa
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {status.tasks.map((task, taskIndex) => (
                                <div
                                  key={task.id}
                                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f9fafb] border border-[#e5e7eb] transition-colors duration-300"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                      <ChevronUp
                                        size={16}
                                        className={`cursor-pointer text-[#475569] hover:text-[#70645C] transition-colors duration-300 ${taskIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => handleMoveTask(status.id, task.id, "up")}
                                      />
                                      <ChevronDown
                                        size={16}
                                        className={`cursor-pointer text-[#475569] hover:text-[#70645C] transition-colors duration-300 ${taskIndex === status.tasks.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => handleMoveTask(status.id, task.id, "down")}
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium text-[#0f172a]">{task.name}</p>
                                      {task.description && (
                                        <p className="text-sm text-[#475569] line-clamp-1">{task.description}</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => openEditTaskDialog(status, task)}
                                      className="h-8 border-[#e5e7eb] text-[#70645C] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                                    >
                                      <Edit size={16} className="mr-1" />
                                      Editar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteTask(status.id, task.id)}
                                      className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors duration-300"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de adicionar/editar tarefa */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0f172a]">
              {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="taskName" className="text-[#0f172a] text-sm font-medium">
                Nome da Tarefa
              </label>
              <Input
                id="taskName"
                value={editingTask ? editingTask.name : newTaskName}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, name: e.target.value })
                    : setNewTaskName(e.target.value)
                }
                className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                placeholder="Ex: Desenhar projeto"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="taskDescription" className="text-[#0f172a] text-sm font-medium">
                Descrição (opcional)
              </label>
              <Textarea
                id="taskDescription"
                value={editingTask ? editingTask.description || "" : newTaskDescription}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, description: e.target.value })
                    : setNewTaskDescription(e.target.value)
                }
                className="border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                placeholder="Descrição da tarefa ou instruções"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button 
                variant="outline" 
                className="border-[#e5e7eb] text-[#475569] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={editingTask ? handleUpdateTask : handleAddTask}
              disabled={savingTask}
              className="bg-[#70645C] hover:bg-[#5d534c] text-white border border-[#70645C]/20 transition-colors duration-300"
            >
              {savingTask ? "Salvando..." : editingTask ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

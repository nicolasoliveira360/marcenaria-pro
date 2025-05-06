"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ListTodo, Plus, X } from "lucide-react"
import type { ProjectStatus, ProjectTask } from "../../utils/types"

interface TasksSectionProps {
  statusColumns: ProjectStatus[]
  tasks: (ProjectTask & { status_name?: string })[]
  selectedStatusId: string | null
  setSelectedStatusId: (id: string) => void
  newTask: string
  setNewTask: (task: string) => void
  handleAddTask: () => Promise<boolean>
  handleToggleTask: (taskId: string, isDone: boolean) => Promise<boolean>
  handleDeleteTask: (taskId: string) => Promise<boolean>
}

export function TasksSection({
  statusColumns,
  tasks,
  selectedStatusId,
  setSelectedStatusId,
  newTask,
  setNewTask,
  handleAddTask,
  handleToggleTask,
  handleDeleteTask,
}: TasksSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-50 overflow-hidden">
        <div className="bg-[#70645C]/5 px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#70645C] flex items-center">
            <ListTodo size={18} className="mr-2" /> Tarefas do Projeto
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Select value={selectedStatusId || ""} onValueChange={setSelectedStatusId}>
                <SelectTrigger className="border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {statusColumns.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-[2] flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Adicionar nova tarefa..."
                className="border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                disabled={!selectedStatusId}
              />
              <Button
                onClick={handleAddTask}
                disabled={!newTask.trim() || !selectedStatusId}
                className="bg-[#70645C] hover:bg-[#5d534c] text-white shrink-0"
              >
                <Plus size={16} className="mr-2" /> Adicionar
              </Button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-gray-100">
              <ListTodo className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma tarefa adicionada</h3>
              <p className="mt-2 text-gray-500">Adicione tarefas para acompanhar o progresso do projeto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {statusColumns.map((status) => {
                const statusTasks = tasks.filter((task) => task.project_status_id === status.id)
                const completedTasks = statusTasks.filter((t) => t.is_done).length
                const totalTasks = statusTasks.length

                return (
                  <div key={status.id} className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-medium flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#70645C] mr-2"></span>
                        {status.name}
                      </h3>
                      {totalTasks > 0 && (
                        <span className="text-xs font-medium bg-[#70645C]/10 text-[#70645C] px-2 py-0.5 rounded-full">
                          {completedTasks}/{totalTasks}
                        </span>
                      )}
                    </div>

                    <div className="p-3 max-h-[400px] overflow-y-auto">
                      {statusTasks.length === 0 ? (
                        <p className="text-center py-6 text-sm text-gray-500">Nenhuma tarefa neste status</p>
                      ) : (
                        <div className="space-y-2">
                          {statusTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                                task.is_done
                                  ? "bg-gray-50 border border-gray-100"
                                  : "bg-white border border-gray-200 hover:border-[#70645C]/30"
                              }`}
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <Checkbox
                                  checked={task.is_done}
                                  onCheckedChange={() => handleToggleTask(task.id, task.is_done)}
                                  className={`mr-3 ${task.is_done ? "border-[#70645C]" : "border-gray-300"}`}
                                />
                                <div className="min-w-0">
                                  <span
                                    className={`${
                                      task.is_done ? "line-through text-gray-500" : "text-gray-900"
                                    } transition-colors`}
                                  >
                                    {task.name}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  ListTodo,
  FileImage,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Upload,
  LinkIcon,
  Copy,
  CheckCircle,
} from "lucide-react"
import type { Project, ProjectStatus, ProjectTask, ProjectFile, Payment } from "../../utils/types"
import { formatCurrency, formatPaymentStatus, getPaymentStatusColor } from "../../utils/formatters"

interface DashboardSectionProps {
  project: Partial<Project>
  statusColumns: ProjectStatus[]
  tasks: ProjectTask[]
  files: ProjectFile[]
  payments: Payment[]
  setActiveSection: (section: string) => void
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  uploadingFiles: boolean
  linkCopied: boolean
  handleCopyLink: () => void
}

export function DashboardSection({
  project,
  statusColumns,
  tasks,
  files,
  payments,
  setActiveSection,
  handleFileUpload,
  uploadingFiles,
  linkCopied,
  handleCopyLink,
}: DashboardSectionProps) {
  // Calcular progresso das tarefas
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.is_done).length
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calcular progresso dos pagamentos
  const totalPaymentAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const paidAmount = payments
    .filter((payment) => payment.status === "pago")
    .reduce((sum, payment) => sum + payment.amount, 0)
  const paymentProgress = totalPaymentAmount > 0 ? Math.round((paidAmount / totalPaymentAmount) * 100) : 0

  // Próximos pagamentos
  const upcomingPayments = payments
    .filter((payment) => payment.status !== "pago")
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3)

  // Tarefas recentes
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <Card className="border border-[#e5e7eb] shadow-sm bg-white overflow-hidden">
        <div className="bg-[#f9fafb] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <LayoutDashboard size={18} className="mr-2 text-[#70645C]" /> Visão Geral do Projeto
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge className={`${getPaymentStatusColor(project.payment_status || "pendente")}`}>
                  {formatPaymentStatus(project.payment_status || "pendente")}
                </Badge>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {statusColumns.find((s) => s.id === project.progress_status_id)?.name || "Não definido"}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
                <CreditCard size={16} className="text-[#70645C]" />
              </div>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(project.total_value || 0)}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Tarefas</h3>
                <ListTodo size={16} className="text-[#70645C]" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-900">{tasks.length}</p>
                <span className="text-sm text-gray-500">{completedTasks} concluídas</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Arquivos</h3>
                <FileImage size={16} className="text-[#70645C]" />
              </div>
              <p className="text-lg font-semibold text-gray-900">{files.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-medium mb-3 flex items-center">
                  <ListTodo size={16} className="mr-2 text-[#70645C]" /> Progresso das Tarefas
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    {completedTasks} de {totalTasks} tarefas concluídas
                  </span>
                  <span className="text-sm font-medium">{taskProgress}%</span>
                </div>
                <Progress value={taskProgress} className="h-2" />
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSection("tasks")}
                    className="text-gray-500 border-gray-200 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                  >
                    Ver Todas as Tarefas
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-medium mb-3 flex items-center">
                  <CreditCard size={16} className="mr-2 text-[#70645C]" /> Progresso dos Pagamentos
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    {formatCurrency(paidAmount)} de {formatCurrency(project.total_value || 0)} pago
                  </span>
                  <span className="text-sm font-medium">
                    {project.total_value && project.total_value > 0
                      ? Math.round((paidAmount / project.total_value) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    project.total_value && project.total_value > 0
                      ? Math.round((paidAmount / project.total_value) * 100)
                      : 0
                  }
                  className="h-2"
                />
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSection("payments")}
                    className="text-gray-500 border-gray-200 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                  >
                    Ver Todos os Pagamentos
                  </Button>
                </div>
              </div>

              {project.slug && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h3 className="text-base font-medium mb-3 flex items-center">
                    <LinkIcon size={16} className="mr-2 text-[#70645C]" /> Link de Acesso
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-sm truncate flex items-center">
                      <span className="text-gray-500">{typeof window !== "undefined" ? window.location.origin : ""}/p/</span>
                      <span className="font-medium">{project.slug}</span>
                    </div>
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="sm"
                      className="text-gray-500 border-gray-200 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300 shrink-0"
                    >
                      {linkCopied ? (
                        <>
                          <CheckCircle size={14} className="mr-1" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="mr-1" /> Copiar Link
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSection("access")}
                      className="text-gray-500 border-gray-200 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                    >
                      Configurar Acesso
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-medium mb-3 flex items-center">
                  <Calendar size={16} className="mr-2 text-[#70645C]" /> Próximos Pagamentos
                </h3>
                {upcomingPayments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p>Todos os pagamentos foram realizados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-md"
                      >
                        <div>
                          <div className="flex items-center">
                            <Calendar size={14} className="text-gray-400 mr-2" />
                            <span className="text-sm font-medium">
                              {new Date(payment.due_date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <Badge className={`mt-1 ${getPaymentStatusColor(payment.status)}`}>
                            {formatPaymentStatus(payment.status)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSection("payments")}
                        className="text-gray-500 border-gray-200 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                      >
                        Ver Todos
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-medium mb-3 flex items-center">
                  <Clock size={16} className="mr-2 text-[#70645C]" /> Tarefas Recentes
                </h3>
                {recentTasks.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <ListTodo className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p>Nenhuma tarefa adicionada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center p-2 rounded-md ${
                          task.is_done ? "bg-gray-50 text-gray-500" : "bg-white"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${
                            task.is_done ? "bg-green-500" : "bg-blue-500"
                          }`}
                        ></div>
                        <span className={task.is_done ? "line-through" : ""}>{task.name}</span>
                      </div>
                    ))}
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSection("tasks")}
                        className="text-gray-500 border-gray-200 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
                      >
                        Ver Todas
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-medium mb-3 flex items-center">
                  <FileImage size={16} className="mr-2 text-[#70645C]" /> Arquivos
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label
                      htmlFor="dashboard-file-upload"
                      className={`inline-flex items-center rounded-md bg-[#70645C] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#5d534c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#70645C] cursor-pointer transition-colors duration-300 ${
                        uploadingFiles ? "opacity-75 cursor-wait" : ""
                      }`}
                    >
                      {uploadingFiles ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Enviando...
                        </div>
                      ) : (
                        <>
                          <Upload size={16} className="mr-2" />
                          Enviar Arquivos
                        </>
                      )}
                      <input
                        id="dashboard-file-upload"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="sr-only"
                        disabled={uploadingFiles}
                      />
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSection("gallery")}
                    className="text-gray-500 border-gray-200 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300 flex-1 sm:flex-none"
                  >
                    Ver Galeria
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

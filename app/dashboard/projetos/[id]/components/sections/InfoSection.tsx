"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, FileText, Layers, CreditCard, ListTodo, FileIcon } from "lucide-react"
import type { Project, Client, ProjectStatus } from "../../utils/types"
import { formatCurrency } from "../../utils/formatters"

interface InfoSectionProps {
  project: Partial<Project>
  clients: Client[]
  statusColumns: ProjectStatus[]
  tasks: any[]
  files: any[]
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  isNewProject: boolean
}

export function InfoSection({
  project,
  clients,
  statusColumns,
  tasks,
  files,
  handleInputChange,
  handleSelectChange,
  isNewProject,
}: InfoSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-[#e5e7eb] shadow-sm bg-white overflow-hidden">
        <div className="bg-[#f9fafb] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Info size={18} className="mr-2 text-[#70645C]" /> Informações Gerais
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 text-sm font-medium">Nome do Projeto *</Label>
                <Input
                  id="name"
                  name="name"
                  value={project.name}
                  onChange={handleInputChange}
                  placeholder="Nome do projeto"
                  className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id" className="text-gray-700 text-sm font-medium">Cliente *</Label>
                <Select
                  value={project.client_id?.toString() || ""}
                  onValueChange={(value) => handleSelectChange("client_id", value)}
                >
                  <SelectTrigger className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <div className="p-2 text-center text-gray-500">Nenhum cliente encontrado</div>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {clients.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Nenhum cliente encontrado. Adicione clientes antes de criar um projeto.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_value" className="text-gray-700 text-sm font-medium">Valor Total do Projeto</Label>
                <Input
                  id="total_value"
                  name="total_value"
                  value={project.total_value !== null ? formatCurrency(project.total_value) : ""}
                  onChange={handleInputChange}
                  placeholder="R$ 0,00"
                  className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                />
                <p className="text-xs text-gray-500">
                  Este valor será atualizado automaticamente com base nas parcelas adicionadas.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium">Status de Andamento</Label>
                <Select
                  value={project.progress_status_id || ""}
                  onValueChange={(value) => handleSelectChange("progress_status_id", value)}
                >
                  <SelectTrigger className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusColumns.length === 0 ? (
                      <div className="p-2 text-center text-gray-500">Nenhum status encontrado</div>
                    ) : (
                      statusColumns.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium">Data de Criação</Label>
                <div className="p-2.5 h-10 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                  {project.created_at ? new Date(project.created_at).toLocaleDateString("pt-BR") : "-"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium">Última Atualização</Label>
                <div className="p-2.5 h-10 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                  {project.updated_at ? new Date(project.updated_at).toLocaleDateString("pt-BR") : "-"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#e5e7eb] shadow-sm bg-white overflow-hidden">
        <div className="bg-[#f9fafb] px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText size={18} className="mr-2 text-[#70645C]" /> Descrição do Projeto
          </h2>
        </div>
        <CardContent className="p-6">
          <Textarea
            name="description"
            value={project.description || ""}
            onChange={handleInputChange}
            placeholder="Descreva os detalhes do projeto, especificações, materiais, etc."
            className="min-h-[150px] border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
          />
        </CardContent>
      </Card>

      {!isNewProject && (
        <Card className="border border-[#e5e7eb] shadow-sm bg-white overflow-hidden">
          <div className="bg-[#f9fafb] px-6 py-4 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Info size={18} className="mr-2 text-[#70645C]" /> Resumo do Projeto
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Layers size={16} className="text-[#70645C]" />
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
                  <span className="text-sm text-gray-500">{tasks.filter((t) => t.is_done).length} concluídas</span>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Arquivos</h3>
                  <FileIcon size={16} className="text-[#70645C]" />
                </div>
                <p className="text-lg font-semibold text-gray-900">{files.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layers, PlusCircle } from "lucide-react"
import type { Project, ProjectStatus } from "../../utils/types"

interface StatusSectionProps {
  project: Partial<Project>
  statusColumns: ProjectStatus[]
  handleSelectChange: (name: string, value: string) => void
  setIsStatusDialogOpen: (open: boolean) => void
}

export function StatusSection({
  project,
  statusColumns,
  handleSelectChange,
  setIsStatusDialogOpen,
}: StatusSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-50 overflow-hidden">
        <div className="bg-[#70645C]/5 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#70645C] flex items-center">
            <Layers size={18} className="mr-2" /> Status de Andamento
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStatusDialogOpen(true)}
            className="text-[#70645C] border-[#70645C] hover:bg-[#70645C]/5"
          >
            <PlusCircle size={16} className="mr-1" /> Novo Status
          </Button>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status Atual</Label>
              <Select
                value={project.progress_status_id || ""}
                onValueChange={(value) => handleSelectChange("progress_status_id", value)}
              >
                <SelectTrigger className="border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {statusColumns.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#70645C] mr-2"></div>
                        {status.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <h3 className="text-base font-medium mb-3">Todos os Status</h3>
              {statusColumns.length === 0 ? (
                <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-gray-100">
                  <Layers className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum status definido</h3>
                  <p className="mt-2 text-gray-500">Adicione status para organizar as tarefas do projeto.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statusColumns.map((status) => (
                    <div
                      key={status.id}
                      className={`p-4 border rounded-md cursor-pointer transition-all ${
                        project.progress_status_id === status.id
                          ? "border-[#70645C] bg-[#70645C]/5 shadow-sm"
                          : "border-gray-200 hover:border-[#70645C]/30 hover:bg-[#70645C]/5"
                      }`}
                      onClick={() => {
                        handleSelectChange("progress_status_id", status.id)
                      }}
                    >
                      <div className="font-medium flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#70645C] mr-2"></span>
                        {status.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                        <span>Posição: {status.position}</span>
                        {project.progress_status_id === status.id && (
                          <Badge variant="outline" className="bg-[#70645C]/10 text-[#70645C] border-[#70645C]/20">
                            Atual
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

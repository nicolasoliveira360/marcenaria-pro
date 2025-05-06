"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Save, Pencil, User } from "lucide-react"
import type { Project, Client } from "../utils/types"
import { formatPaymentStatus, getPaymentStatusColor } from "../utils/formatters"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

interface ProjectHeaderProps {
  project: Partial<Project>
  clients: Client[]
  isNewProject: boolean
  saving: boolean
  handleSaveProject: () => Promise<void>
  router: AppRouterInstance
  setActiveSection: (section: string) => void
}

export function ProjectHeader({
  project,
  clients,
  isNewProject,
  saving,
  handleSaveProject,
  router,
  setActiveSection,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/projetos")}
          className="mr-2 text-gray-500 hover:text-[#70645C] hover:bg-[#70645C]/10 transition-colors duration-300"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {isNewProject ? "Novo Projeto" : project.name}
            {!isNewProject && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full text-gray-500 hover:text-[#70645C] hover:bg-[#70645C]/10 transition-colors duration-300"
                      onClick={() => {
                        const nameInput = document.getElementById("name")
                        if (nameInput) {
                          setActiveSection("info")
                          setTimeout(() => nameInput.focus(), 100)
                        }
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar nome</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h1>
          {!isNewProject && project.client_id && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <User size={14} className="mr-1 text-[#70645C]" />
              Cliente: {clients.find((c) => c.id === project.client_id)?.name || "Não especificado"}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {!isNewProject && (
          <Badge className={`${getPaymentStatusColor(project.payment_status || "pendente")} px-3 py-1 text-xs`}>
            {formatPaymentStatus(project.payment_status || "pendente")}
          </Badge>
        )}
        <Button
          onClick={handleSaveProject}
          disabled={saving}
          className="bg-[#70645C] hover:bg-[#5d534c] text-white text-sm px-4 py-2 h-10 rounded-md flex items-center justify-center gap-2 transition-colors duration-300 w-full sm:w-auto"
        >
          {saving ? (
            <>Salvando...</>
          ) : (
            <>
              <Save size={16} className="mr-2" /> Salvar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

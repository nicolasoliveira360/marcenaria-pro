"use client"
// Página de detalhes do projeto atualizada com o design system

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

import { ProjectHeader } from "./components/ProjectHeader"
import { ProjectSidebar } from "./components/ProjectSidebar"
import { DashboardSection } from "./components/sections/DashboardSection"
import { InfoSection } from "./components/sections/InfoSection"
import { TasksSection } from "./components/sections/TasksSection"
import { StatusSection } from "./components/sections/StatusSection"
import { GallerySection } from "./components/sections/GallerySection"
import { PaymentsSection } from "./components/sections/PaymentsSection"
import { DescriptionSection } from "./components/sections/DescriptionSection"
import { AccessSection } from "./components/sections/AccessSection"
import { SettingsSection } from "./components/sections/SettingsSection"

import { PaymentDialog } from "./components/dialogs/PaymentDialog"
import { StatusDialog } from "./components/dialogs/StatusDialog"
import { DeleteDialog } from "./components/dialogs/DeleteDialog"

import { useProject } from "./hooks/useProject"
import { useStatus } from "./hooks/useStatus"
import { useTasks } from "./hooks/useTasks"
import { useFiles } from "./hooks/useFiles"
import { usePayments } from "./hooks/usePayments"
import { sidebarItems } from "./utils/sidebarItems"

export default function ProjetoDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const isNewProject = projectId === "novo"

  const [activeSection, setActiveSection] = useState(isNewProject ? "info" : "dashboard")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const {
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
  } = useProject(projectId, isNewProject)

  const { statusColumns, selectedStatusId, setSelectedStatusId, newStatusName, setNewStatusName, handleAddStatus } =
    useStatus(supabase, projectId, isNewProject)

  const { tasks, newTask, setNewTask, handleAddTask, handleToggleTask, handleDeleteTask } = useTasks(
    supabase,
    projectId,
    selectedStatusId,
    isNewProject,
  )

  const { files, uploadingFiles, handleFileUpload, handleDeleteFile } = useFiles(
    supabase,
    projectId,
    companyId,
    userId,
    isNewProject,
  )

  const { payments, newPayment, setNewPayment, handleAddPayment, handleUpdatePaymentStatus, handleDeletePayment } =
    usePayments(supabase, projectId, isNewProject, setProject)

  const handleCopyLink = () => {
    if (!project.slug) return

    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${project.slug}`
    navigator.clipboard.writeText(link)

    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const renderContent = () => {
    if (isNewProject && activeSection !== "info") {
      return (
        <div className="text-center py-12 bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Salve o projeto primeiro</h3>
          <p className="mt-2 text-gray-500">Para acessar esta seção, primeiro salve o projeto.</p>
        </div>
      )
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardSection
            project={project}
            statusColumns={statusColumns}
            tasks={tasks}
            files={files}
            payments={payments}
            setActiveSection={setActiveSection}
            handleFileUpload={handleFileUpload}
            uploadingFiles={uploadingFiles}
            linkCopied={linkCopied}
            handleCopyLink={handleCopyLink}
          />
        )
      case "info":
        return (
          <InfoSection
            project={project}
            clients={clients}
            statusColumns={statusColumns}
            tasks={tasks}
            files={files}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            isNewProject={isNewProject}
          />
        )
      case "tasks":
        return (
          <TasksSection
            statusColumns={statusColumns}
            tasks={tasks}
            selectedStatusId={selectedStatusId}
            setSelectedStatusId={setSelectedStatusId}
            newTask={newTask}
            setNewTask={setNewTask}
            handleAddTask={handleAddTask}
            handleToggleTask={handleToggleTask}
            handleDeleteTask={handleDeleteTask}
          />
        )
      case "status":
        return (
          <StatusSection
            project={project}
            statusColumns={statusColumns}
            handleSelectChange={handleSelectChange}
            setIsStatusDialogOpen={setIsStatusDialogOpen}
          />
        )
      case "gallery":
        return (
          <GallerySection
            files={files}
            uploadingFiles={uploadingFiles}
            handleFileUpload={handleFileUpload}
            handleDeleteFile={handleDeleteFile}
          />
        )
      case "payments":
        return (
          <PaymentsSection
            project={project}
            payments={payments}
            handleSelectChange={handleSelectChange}
            handleUpdatePaymentStatus={handleUpdatePaymentStatus}
            handleDeletePayment={handleDeletePayment}
            setIsPaymentDialogOpen={setIsPaymentDialogOpen}
          />
        )
      case "description":
        return <DescriptionSection project={project} handleInputChange={handleInputChange} />
      case "access":
        return (
          <AccessSection
            project={project}
            handleInputChange={handleInputChange}
            handleGenerateSlug={handleGenerateSlug}
            handleGeneratePassword={handleGeneratePassword}
            linkCopied={linkCopied}
            handleCopyLink={handleCopyLink}
          />
        )
      case "settings":
        return <SettingsSection setIsDeleteDialogOpen={setIsDeleteDialogOpen} />
      default:
        return (
          <div className="text-center py-12 bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
            <p className="text-gray-500">Esta seção ainda não foi implementada.</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
        <p className="text-[#475569]">Carregando projeto...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        clients={clients}
        isNewProject={isNewProject}
        saving={saving}
        handleSaveProject={handleSaveProject}
        router={router}
        setActiveSection={setActiveSection}
      />

      <div className="block md:hidden mb-6">
        <ScrollArea className="w-full">
          <Tabs defaultValue={activeSection} onValueChange={setActiveSection} className="w-full">
            <TabsList className="w-full justify-start bg-[#f9fafb] p-0 h-auto overflow-x-auto">
              {sidebarItems.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className={`px-3 py-2 rounded-md text-sm data-[state=active]:bg-[#70645C]/10 data-[state=active]:text-[#70645C] data-[state=active]:shadow-none data-[state=active]:font-medium text-[#475569] hover:bg-[#70645C]/5 transition-colors duration-300 ease-in-out`}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </ScrollArea>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <ProjectSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="flex-1">{renderContent()}</div>
      </div>

      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        handleAddPayment={handleAddPayment}
      />

      <StatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        newStatusName={newStatusName}
        setNewStatusName={setNewStatusName}
        handleAddStatus={handleAddStatus}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        handleDeleteProject={handleDeleteProject}
      />
    </div>
  )
}

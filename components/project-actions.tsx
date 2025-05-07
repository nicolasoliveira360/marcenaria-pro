"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCrudGuard } from "@/contexts/crud-guard-provider"
import { useSupabase } from "@/hooks/use-supabase"

interface ProjectActionsProps {
  projectId: string
}

export function ProjectActions({ projectId }: ProjectActionsProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { executeCrudOperation } = useCrudGuard()
  const [isDeleting, setIsDeleting] = useState(false)

  // Exemplo de função para editar um projeto
  const handleEdit = () => {
    // Aqui usamos o executeCrudOperation para verificar se o usuário pode editar
    executeCrudOperation(() => {
      router.push(`/dashboard/projetos/editar/${projectId}`)
    })
  }

  // Exemplo de função para adicionar um arquivo ao projeto
  const handleAddFile = () => {
    executeCrudOperation(() => {
      router.push(`/dashboard/projetos/${projectId}/arquivos/novo`)
    })
  }

  // Exemplo de função para deletar um projeto
  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      // Usar o executeCrudOperation para verificar se o usuário pode deletar
      await executeCrudOperation(async () => {
        // Esta operação só será executada se o usuário tiver um plano ativo
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", projectId)
        
        if (error) throw error
        
        // Redirecionar após deletar
        router.push("/dashboard/projetos")
        router.refresh()
        
        return { success: true }
      })
    } catch (error) {
      console.error("Erro ao deletar projeto:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleEdit}
      >
        <Edit size={14} />
        Editar
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleAddFile}
      >
        <FilePlus size={14} />
        Adicionar Arquivo
      </Button>
      
      <Button 
        variant="destructive"
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash size={14} />
        {isDeleting ? "Excluindo..." : "Excluir"}
      </Button>
    </div>
  )
} 
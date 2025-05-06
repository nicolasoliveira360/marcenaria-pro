"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle, Trash2 } from "lucide-react"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  handleDeleteProject: () => Promise<void>
}

export function DeleteDialog({ open, onOpenChange, handleDeleteProject }: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita e todos os dados relacionados
            serão perdidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-red-50 p-4 rounded-md my-4 border border-red-100">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Atenção</h4>
              <p className="text-sm text-red-700 mt-1">
                A exclusão do projeto também removerá todas as tarefas, arquivos e pagamentos associados.
              </p>
            </div>
          </div>
        </div>
        <AlertDialogFooter className="bg-gray-50 p-4 rounded-b-lg">
          <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-100">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteProject} className="bg-[#70645C] hover:bg-[#5d534c] text-white">
            <Trash2 size={16} className="mr-2" /> Excluir Permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

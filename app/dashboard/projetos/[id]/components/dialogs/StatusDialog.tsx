"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newStatusName: string
  setNewStatusName: (name: string) => void
  handleAddStatus: () => Promise<boolean>
}

export function StatusDialog({
  open,
  onOpenChange,
  newStatusName,
  setNewStatusName,
  handleAddStatus,
}: StatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const success = await handleAddStatus()
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Adicionar Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status_name">Nome do Status</Label>
            <Input
              id="status_name"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              placeholder="Ex: Em andamento, Concluído, etc."
              className="border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !newStatusName.trim()}
            className="bg-[#70645C] hover:bg-[#5d534c] text-white"
          >
            {isSubmitting ? "Adicionando..." : "Adicionar Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

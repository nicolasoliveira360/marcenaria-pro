"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface SettingsSectionProps {
  setIsDeleteDialogOpen: (open: boolean) => void
}

export function SettingsSection({ setIsDeleteDialogOpen }: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-50">
        <CardHeader>
          <CardTitle>Configurações do Projeto</CardTitle>
          <CardDescription>Gerencie as configurações avançadas do projeto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" /> Excluir Projeto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

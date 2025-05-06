"use client"

import type React from "react"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { Project } from "../../utils/types"

interface DescriptionSectionProps {
  project: Partial<Project>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function DescriptionSection({ project, handleInputChange }: DescriptionSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-50">
        <CardHeader>
          <CardTitle>Descrição do Projeto</CardTitle>
          <CardDescription>Detalhes e especificações do projeto</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="description"
            value={project.description || ""}
            onChange={handleInputChange}
            placeholder="Descreva os detalhes do projeto, especificações, materiais, etc."
            className="min-h-[300px] border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
          />
        </CardContent>
      </Card>
    </div>
  )
}

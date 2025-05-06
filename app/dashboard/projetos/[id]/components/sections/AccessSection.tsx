"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LinkIcon, Grip, Copy, CheckCircle, Eye } from "lucide-react"
import type { Project } from "../../utils/types"

interface AccessSectionProps {
  project: Partial<Project>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleGenerateSlug: () => void
  handleGeneratePassword: () => void
  linkCopied: boolean
  handleCopyLink: () => void
}

export function AccessSection({
  project,
  handleInputChange,
  handleGenerateSlug,
  handleGeneratePassword,
  linkCopied,
  handleCopyLink,
}: AccessSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-50 overflow-hidden">
        <div className="bg-[#70645C]/5 px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#70645C] flex items-center">
            <LinkIcon size={18} className="mr-2" /> Acesso ao Projeto
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2">Compartilhamento com o Cliente</h3>
              <p className="text-sm text-gray-500 mb-4">
                Configure um link personalizado e senha para compartilhar o projeto com seu cliente.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-gray-700">
                    Link personalizado
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-1">
                      <div className="flex items-center border border-r-0 rounded-l-md bg-gray-50 px-3 text-gray-500 border-gray-200">
                        {typeof window !== "undefined" ? window.location.origin : ""}/p/
                      </div>
                      <Input
                        id="slug"
                        name="slug"
                        value={project.slug || ""}
                        onChange={handleInputChange}
                        placeholder="link-personalizado"
                        className="rounded-l-none border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 flex-1"
                      />
                    </div>
                    <Button
                      onClick={handleGenerateSlug}
                      className="bg-[#70645C] hover:bg-[#5d534c] text-white shrink-0"
                    >
                      <Grip size={16} className="mr-2" /> Gerar Link
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_hash" className="text-gray-700">
                    Senha de acesso
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="password_hash"
                      name="password_hash"
                      value={project.password_hash || ""}
                      onChange={handleInputChange}
                      placeholder="Senha para acesso"
                      className="border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                    />
                    <Button
                      onClick={handleGeneratePassword}
                      className="bg-[#70645C] hover:bg-[#5d534c] text-white shrink-0"
                    >
                      <Grip size={16} className="mr-2" /> Gerar Senha
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {project.password_hash
                      ? "O cliente precisará informar esta senha para acessar o projeto."
                      : "Deixe em branco para permitir acesso sem senha."}
                  </p>
                </div>
              </div>
            </div>

            {project.slug && (
              <div className="bg-[#70645C]/5 p-6 rounded-lg border border-[#70645C]/20">
                <h3 className="font-medium text-[#70645C] mb-3 flex items-center">
                  <Eye size={18} className="mr-2" /> Link de Acesso
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 p-3 bg-white border border-gray-200 rounded-md text-sm truncate flex items-center">
                    <span className="text-gray-500">{typeof window !== "undefined" ? window.location.origin : ""}/p/</span>
                    <span className="font-medium">{project.slug}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyLink}
                      className="bg-[#70645C] hover:bg-[#5d534c] text-white flex-1 sm:flex-none"
                    >
                      {linkCopied ? (
                        <>
                          <CheckCircle size={16} className="mr-2" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={16} className="mr-2" /> Copiar Link
                        </>
                      )}
                    </Button>
                    <a
                      href={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${project.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-white border border-[#70645C] text-[#70645C] rounded-md hover:bg-[#70645C]/5 transition-colors"
                    >
                      <Eye size={16} className="mr-2" /> Visualizar
                    </a>
                  </div>
                </div>
                <p className="text-sm text-[#70645C]/80 mt-3">
                  Compartilhe este link com o cliente para que ele possa acessar o projeto.
                  {project.password_hash && " O cliente precisará informar a senha para acessar."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

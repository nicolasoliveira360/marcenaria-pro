"use client"

import { useState, useRef } from "react"
import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileImage, Upload, Eye, Download, Trash2, Filter, Search, AlertTriangle } from "lucide-react"
import type { ProjectFile } from "../../utils/types"
import { formatFileSize, getFileIcon } from "../../utils/formatters"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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

interface GallerySectionProps {
  files: ProjectFile[]
  uploadingFiles: boolean
  handleFileUpload: (files: FileList, customNames?: Record<string, string>) => Promise<void>
  handleDeleteFile: (fileId: string) => Promise<boolean>
}

export function GallerySection({ files, uploadingFiles, handleFileUpload, handleDeleteFile }: GallerySectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [fileNames, setFileNames] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Inicializar os nomes dos arquivos com os nomes originais
    const initialNames: Record<string, string> = {}
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      initialNames[file.name] = file.name
    }

    setFileNames(initialNames)
    setSelectedFiles(files)
    setShowUploadDialog(true)
  }

  const handleConfirmUpload = async () => {
    if (selectedFiles) {
      await handleFileUpload(selectedFiles, fileNames)
      setShowUploadDialog(false)
      setSelectedFiles(null)
      setFileNames({})

      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleCancelUpload = () => {
    setShowUploadDialog(false)
    setSelectedFiles(null)
    setFileNames({})

    // Limpar o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const updateFileName = (originalName: string, newName: string) => {
    setFileNames((prev) => ({
      ...prev,
      [originalName]: newName,
    }))
  }

  const confirmDelete = async () => {
    if (fileToDelete) {
      setIsDeleting(true)
      try {
        await handleDeleteFile(fileToDelete)
      } finally {
        setIsDeleting(false)
        setFileToDelete(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-50 overflow-hidden">
        <div className="bg-[#70645C]/5 px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#70645C] flex items-center">
            <FileImage size={18} className="mr-2" /> Galeria de Arquivos
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50/70 rounded-lg border border-dashed border-gray-200">
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-medium text-gray-900">Adicionar Arquivos</h3>
                <p className="text-sm text-gray-500 mt-1">Arraste e solte arquivos aqui ou clique para selecionar</p>
              </div>
              <div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-[#70645C] hover:bg-[#5d534c] text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Upload size={16} className="mr-2" />
                  Selecionar Arquivos
                </label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileSelection}
                  className="hidden"
                  disabled={uploadingFiles}
                  ref={fileInputRef}
                />
              </div>
            </div>
            {uploadingFiles && (
              <div className="mt-3 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#70645C] mr-2"></div>
                <span className="text-sm text-gray-500">Enviando arquivos...</span>
              </div>
            )}
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-gray-100">
              <FileImage className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum arquivo adicionado</h3>
              <p className="mt-2 text-gray-500">Adicione imagens e documentos para o projeto.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700">{files.length} arquivos</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-gray-500">
                    <Filter size={14} className="mr-1" /> Filtrar
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-500">
                    <Search size={14} className="mr-1" /> Buscar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => {
                  const isImage = file.mime_type?.startsWith("image/")
                  const fileName = file.file_name || file.storage_path.split("/").pop() || "arquivo"

                  return (
                    <div key={file.id} className="border border-gray-100 rounded-lg overflow-hidden group">
                      <div className="relative">
                        {isImage ? (
                          <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img
                              src={file.url || "/placeholder.svg"}
                              alt={fileName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-gray-50 flex items-center justify-center">
                            {getFileIcon(file.mime_type)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors"
                          >
                            <Eye size={18} />
                          </a>
                          <a
                            href={file.url}
                            download
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors"
                          >
                            <Download size={18} />
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFileToDelete(file.id)}
                            className="p-2 bg-white/20 rounded-full hover:bg-red-500/80 text-white transition-colors"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium truncate" title={fileName}>
                          {fileName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{formatFileSize(file.size_bytes)}</p>
                          <p className="text-xs text-gray-500">
                            {file.created_at ? new Date(file.created_at).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmação de upload */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-[#70645C] text-xl">Confirmar Upload de Arquivos</DialogTitle>
            <DialogDescription className="text-gray-500">
              Personalize os nomes dos arquivos antes de fazer o upload.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {selectedFiles &&
              Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="space-y-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`file-name-${index}`} className="text-xs font-medium text-gray-700">
                      Nome do arquivo
                    </Label>
                    <Input
                      id={`file-name-${index}`}
                      value={fileNames[file.name] || ""}
                      onChange={(e) => updateFileName(file.name, e.target.value)}
                      className="h-8 text-sm mt-1 border-gray-200 focus:border-[#70645C] focus:ring-[#70645C]/20"
                      placeholder="Digite um nome para o arquivo"
                    />
                  </div>
                </div>
              ))}
          </div>
          <DialogFooter className="sm:justify-between border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              disabled={uploadingFiles}
              className="border-gray-200"
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmUpload} disabled={uploadingFiles} className="bg-[#70645C] hover:bg-[#5d534c]">
              {uploadingFiles ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Enviando...
                </>
              ) : (
                <>Fazer Upload</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent className="bg-white border border-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#70645C] flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" /> Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-gray-100 pt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-800"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, Save, Plus, Trash2, Check, Building2, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Definindo o enum PlanTierEnum
type PlanTierEnum = "free" | "basic" | "pro"

// Função para formatar CPF/CNPJ
function formatCpfCnpj(value: string) {
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, "")

  // Verifica se é CPF ou CNPJ pelo tamanho
  if (numericValue.length <= 11) {
    // Formata como CPF: 000.000.000-00
    return numericValue
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  } else {
    // Formata como CNPJ: 00.000.000/0000-00
    return numericValue
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
  }
}

// Função para formatar telefone
function formatPhone(value: string) {
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, "")

  // Formata como telefone: (00) 00000-0000
  return numericValue.replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2")
}

// Mapeamento de planos para exibição
const planLabels: Record<PlanTierEnum, { label: string; color: string; description: string; price: string }> = {
  free: {
    label: "Gratuito",
    color: "bg-gray-100 text-[#475569] border-[#e5e7eb]",
    description: "Até 5 projetos e 10 clientes",
    price: "R$ 0,00/mês",
  },
  basic: {
    label: "Básico",
    color: "bg-blue-100 text-blue-600 border-blue-200",
    description: "Até 20 projetos e clientes ilimitados",
    price: "R$ 49,90/mês",
  },
  pro: {
    label: "Profissional",
    color: "bg-[#70645C]/10 text-[#70645C] border-[#70645C]/20",
    description: "Projetos e clientes ilimitados + recursos avançados",
    price: "R$ 99,90/mês",
  },
}

// Interface para os dados da empresa conforme o esquema do banco
interface CompanyData {
  id: string
  name: string
  tax_id: string
  email: string
  phone: string | null
  address_street: string | null
  address_neigh: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  logo_url: string | null
  plan_tier: PlanTierEnum
  created_at: string
  updated_at: string
}

export default function EmpresaPage() {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  // Estado para o formulário
  const [formData, setFormData] = useState({
    name: "",
    tax_id: "",
    email: "",
    phone: "",
    address_street: "",
    address_neigh: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    logo_url: null as string | null,
  })

  // Estado para validação
  const [errors, setErrors] = useState({
    name: "",
    tax_id: "",
    email: "",
  })

  // Estado para o upload de logo
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Estado para diálogos
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false)
  const [isDeleteLogoDialogOpen, setIsDeleteLogoDialogOpen] = useState(false)

  // Carregar dados da empresa
  useEffect(() => {
    async function loadCompanyData() {
      setLoading(true)

      try {
        // Obter o usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Buscar dados do usuário
        const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (!userData) {
          throw new Error("Usuário não encontrado")
        }

        // Buscar dados da empresa
        const { data: companyData, error } = await supabase
          .from("companies")
          .select("*")
          .eq("email", userData.email)
          .single()

        if (error) throw error

        if (companyData) {
          setCompany(companyData)

          // Preencher o formulário com os dados existentes
          setFormData({
            name: companyData.name || "",
            tax_id: companyData.tax_id ? formatCpfCnpj(companyData.tax_id) : "",
            email: companyData.email || "",
            phone: companyData.phone ? formatPhone(companyData.phone) : "",
            address_street: companyData.address_street || "",
            address_neigh: companyData.address_neigh || "",
            address_city: companyData.address_city || "",
            address_state: companyData.address_state || "",
            address_zip: companyData.address_zip || "",
            logo_url: companyData.logo_url,
          })

          // Definir preview da logo se existir
          if (companyData.logo_url) {
            setLogoPreview(companyData.logo_url)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados da empresa:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados da empresa. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCompanyData()
  }, [supabase, router, toast])

  // Validar formulário
  const validateForm = () => {
    let isValid = true
    const newErrors = { name: "", tax_id: "", email: "" }

    if (!formData.name.trim()) {
      newErrors.name = "Nome da empresa é obrigatório"
      isValid = false
    }

    if (!formData.tax_id.trim()) {
      newErrors.tax_id = "CPF/CNPJ é obrigatório"
      isValid = false
    } else {
      // Validar formato de CPF/CNPJ
      const numericValue = formData.tax_id.replace(/\D/g, "")
      if (numericValue.length !== 11 && numericValue.length !== 14) {
        newErrors.tax_id = "CPF/CNPJ inválido"
        isValid = false
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
      isValid = false
    } else {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email inválido"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  // Manipular mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Limpar erro quando o usuário digita
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: "" })
    }

    if (name === "tax_id") {
      // Aplicar máscara de CPF/CNPJ
      setFormData({
        ...formData,
        [name]: formatCpfCnpj(value),
      })
    } else if (name === "phone") {
      // Aplicar máscara de telefone
      setFormData({
        ...formData,
        [name]: formatPhone(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Manipular upload de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Verificar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive",
        })
        return
      }

      // Verificar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 2MB.",
          variant: "destructive",
        })
        return
      }

      setLogoFile(file)

      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Fazer upload da logo
  const uploadLogo = async () => {
    if (!logoFile || !company) return null

    setUploadingLogo(true)

    try {
      // Criar nome único para o arquivo
      const fileExt = logoFile.name.split(".").pop()
      const fileName = `${company.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Fazer upload para o bucket correto
      const { error: uploadError } = await supabase.storage.from("company-logos").upload(filePath, logoFile, {
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data } = supabase.storage.from("company-logos").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Erro ao fazer upload da logo:", error)
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive",
      })
      return null
    } finally {
      setUploadingLogo(false)
    }
  }

  // Remover logo
  const handleRemoveLogo = async () => {
    if (!company) return

    try {
      // Atualizar empresa no banco de dados
      const { error } = await supabase.from("companies").update({ logo_url: null }).eq("id", company.id)

      if (error) throw error

      // Atualizar estado local
      setFormData({ ...formData, logo_url: null })
      setLogoPreview(null)
      setLogoFile(null)
      setIsDeleteLogoDialogOpen(false)

      toast({
        title: "Logo removida",
        description: "A logo da empresa foi removida com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao remover logo:", error)
      toast({
        title: "Erro ao remover logo",
        description: "Não foi possível remover a logo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Salvar dados da empresa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!company) return

    // Validar formulário
    if (!validateForm()) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      // Fazer upload da logo se houver uma nova
      let logoUrl = formData.logo_url
      if (logoFile) {
        const uploadedUrl = await uploadLogo()
        if (uploadedUrl) {
          logoUrl = uploadedUrl
        }
      }

      // Atualizar dados da empresa conforme o esquema do banco
      const { error } = await supabase
        .from("companies")
        .update({
          name: formData.name,
          tax_id: formData.tax_id.replace(/\D/g, ""), // Remover formatação
          email: formData.email,
          phone: formData.phone || null,
          address_street: formData.address_street || null,
          address_neigh: formData.address_neigh || null,
          address_city: formData.address_city || null,
          address_state: formData.address_state || null,
          address_zip: formData.address_zip || null,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", company.id)

      if (error) throw error

      // Atualizar estado local
      setCompany({
        ...company,
        name: formData.name,
        tax_id: formData.tax_id.replace(/\D/g, ""),
        email: formData.email,
        phone: formData.phone || null,
        address_street: formData.address_street || null,
        address_neigh: formData.address_neigh || null,
        address_city: formData.address_city || null,
        address_state: formData.address_state || null,
        address_zip: formData.address_zip || null,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "Dados salvos",
        description: "As informações da empresa foram atualizadas com sucesso.",
      })

      // Mostrar alerta de sucesso
      setShowSuccessAlert(true)

      // Esconder o alerta após 5 segundos
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 5000)
    } catch (error: any) {
      console.error("Erro ao salvar dados da empresa:", error)

      // Tratamento específico para erros de unicidade
      if (error.message?.includes("duplicate key") && error.message?.includes("tax_id")) {
        setErrors((prev) => ({ ...prev, tax_id: "Este CPF/CNPJ já está cadastrado para outra empresa" }))
        toast({
          title: "Erro ao salvar",
          description: "Este CPF/CNPJ já está cadastrado para outra empresa.",
          variant: "destructive",
        })
      } else if (error.message?.includes("duplicate key") && error.message?.includes("email")) {
        setErrors((prev) => ({ ...prev, email: "Este email já está cadastrado para outra empresa" }))
        toast({
          title: "Erro ao salvar",
          description: "Este email já está cadastrado para outra empresa.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as informações. Tente novamente.",
          variant: "destructive",
        })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
        </div>
        <Card className="border border-[#e5e7eb] shadow-sm bg-white">
          <CardHeader className="pb-3 bg-[#70645C]/5 border-b border-[#e5e7eb]">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-24 w-full" />
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho - estilo atualizado para seguir padrão da página clientes */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Empresa</h1>
        <p className="text-gray-500 mt-1">Gerencie as informações da sua empresa</p>
      </div>

      <div className="flex items-center justify-between">
        {/* Badge do plano atual */}
        {company && company.plan_tier && (
          <Badge className={`${
            planLabels[company.plan_tier as PlanTierEnum]?.color || "bg-gray-100 text-[#475569] border-[#e5e7eb]"
          } text-xs px-2 py-0.5`}>
            Plano: {planLabels[company.plan_tier as PlanTierEnum]?.label || "Não definido"}
          </Badge>
        )}
      </div>

      {showSuccessAlert && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Dados da empresa salvos com sucesso!</AlertDescription>
        </Alert>
      )}

      <Card className="border border-[#e5e7eb] shadow-sm bg-white">
        <CardHeader className="pb-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
          <CardTitle className="text-lg text-gray-900 flex items-center">
            <Building2 size={18} className="mr-2 text-[#70645C]" /> Dados Cadastrais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna 1 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={`text-gray-700 text-sm font-medium ${errors.name ? "text-red-500" : ""}`}>
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id" className={`text-gray-700 text-sm font-medium ${errors.tax_id ? "text-red-500" : ""}`}>
                    CPF/CNPJ *
                  </Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleChange}
                    required
                    maxLength={18} // Tamanho máximo para CNPJ formatado
                    className={`h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${
                      errors.tax_id ? "border-red-500" : ""
                    }`}
                  />
                  {errors.tax_id && <p className="text-red-500 text-xs mt-1">{errors.tax_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={`text-gray-700 text-sm font-medium ${errors.email ? "text-red-500" : ""}`}>
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 text-sm font-medium">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    maxLength={15} // Tamanho máximo para telefone formatado
                    className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  />
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="address_street" className="text-[#0f172a] text-sm font-medium">Rua/Avenida</Label>
                    <Input
                      id="address_street"
                      name="address_street"
                      value={formData.address_street || ""}
                      onChange={handleChange}
                      className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_neigh" className="text-[#0f172a] text-sm font-medium">Bairro</Label>
                    <Input
                      id="address_neigh"
                      name="address_neigh"
                      value={formData.address_neigh || ""}
                      onChange={handleChange}
                      className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="address_city" className="text-[#0f172a] text-sm font-medium">Cidade</Label>
                    <Input
                      id="address_city"
                      name="address_city"
                      value={formData.address_city || ""}
                      onChange={handleChange}
                      className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_state" className="text-[#0f172a] text-sm font-medium">Estado</Label>
                    <Input
                      id="address_state"
                      name="address_state"
                      value={formData.address_state || ""}
                      onChange={handleChange}
                      className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_zip" className="text-[#0f172a] text-sm font-medium">CEP</Label>
                  <Input
                    id="address_zip"
                    name="address_zip"
                    value={formData.address_zip || ""}
                    onChange={handleChange}
                    className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#0f172a] text-sm font-medium">Logomarca</Label>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-16 h-16 border border-[#e5e7eb] rounded-md overflow-hidden bg-[#f9fafb] flex items-center justify-center cursor-pointer transition-all hover:border-[#70645C]/30"
                      onClick={() => logoPreview && setIsLogoDialogOpen(true)}
                    >
                      {logoPreview ? (
                        <Image
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo da empresa"
                          width={64}
                          height={64}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <div className="text-[#475569] text-xs text-center p-1">Sem logo</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex items-center gap-1 bg-[#70645C] hover:bg-[#5d534c] text-white px-3 py-2 rounded-md text-sm transition-colors duration-300 ease-in-out">
                          <Upload size={16} />
                          <span>Selecionar arquivo</span>
                        </div>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 transition-colors duration-300 ease-in-out"
                          onClick={() => setIsDeleteLogoDialogOpen(true)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Remover logo
                        </Button>
                      )}
                      <p className="text-xs text-[#475569]">Formatos: JPG, PNG. Tamanho máx: 2MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de salvar */}
            <div className="flex justify-end pt-4 border-t border-[#e5e7eb]">
              <Button
                type="submit"
                disabled={saving || uploadingLogo}
                className="bg-[#70645C] hover:bg-[#5d534c] text-white text-sm px-4 py-2 h-10 rounded-md flex items-center justify-center gap-2 transition-colors duration-300"
              >
                <Save size={16} />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Diálogo para visualizar logo */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0f172a]">Logo da Empresa</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {logoPreview && (
              <div className="border border-[#e5e7eb] rounded-md overflow-hidden bg-[#f9fafb] p-2">
                <Image
                  src={logoPreview || "/placeholder.svg"}
                  alt="Logo da empresa"
                  width={300}
                  height={300}
                  className="object-contain max-h-[300px]"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="bg-[#70645C] hover:bg-[#5d534c] text-white transition-colors duration-300 ease-in-out">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar remoção da logo */}
      <AlertDialog open={isDeleteLogoDialogOpen} onOpenChange={setIsDeleteLogoDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0f172a]">Remover Logo</AlertDialogTitle>
            <AlertDialogDescription className="text-[#475569]">
              Tem certeza que deseja remover a logo da empresa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e5e7eb] text-[#475569] hover:bg-[#f9fafb] transition-colors duration-300 ease-in-out">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveLogo} 
              className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300 ease-in-out">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

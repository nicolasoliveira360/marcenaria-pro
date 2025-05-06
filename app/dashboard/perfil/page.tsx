"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, User, Lock } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card"

interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showPasswordSuccessAlert, setShowPasswordSuccessAlert] = useState(false)

  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  })

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  // Função para formatar o telefone
  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, "")

    // Aplica a máscara de acordo com o tamanho
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  // Função para remover a formatação do telefone
  const unformatPhone = (value: string) => {
    return value.replace(/\D/g, "")
  }

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/login")
          return
        }

        // Buscar dados do usuário no banco
        const { data, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

        if (error) {
          console.error("Erro ao buscar dados do usuário:", error)
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do perfil.",
            variant: "destructive",
          })
          return
        }

        if (data) {
          setUser(data)
          setFormData({
            full_name: data.full_name || "",
            email: data.email || "",
            phone: data.phone ? formatPhone(data.phone) : "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar seu perfil.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [supabase, router, toast])

  const validateForm = () => {
    const newErrors = {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    }

    let isValid = true

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Nome é obrigatório"
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
      isValid = false
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return isValid
  }

  const validatePasswordForm = () => {
    const newErrors = {
      password: "",
      confirmPassword: "",
    }

    let isValid = true

    if (!passwordData.password) {
      newErrors.password = "Nova senha é obrigatória"
      isValid = false
    } else if (passwordData.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres"
      isValid = false
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória"
      isValid = false
    } else if (passwordData.password !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
      isValid = false
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return isValid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Aplicar máscara ao telefone
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Limpar erro quando o usuário começa a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro quando o usuário começa a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)

    try {
      // Preparar os dados para atualização
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone ? unformatPhone(formData.phone) : null,
        updated_at: new Date().toISOString(),
      }

      // Atualizar dados no banco
      const { error } = await supabase.from("users").update(updateData).eq("id", user?.id)

      if (error) {
        console.error("Erro ao atualizar perfil:", error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar seu perfil.",
          variant: "destructive",
        })
        return
      }

      // Se o email mudou, atualizar também na autenticação
      if (formData.email !== user?.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email,
        })

        if (authError) {
          console.error("Erro ao atualizar email:", authError)
          toast({
            title: "Erro",
            description: "Não foi possível atualizar seu email. " + authError.message,
            variant: "destructive",
          })
          return
        }

        // Atualizar email na tabela users também
        await supabase.from("users").update({ email: formData.email }).eq("id", user?.id)
      }

      // Atualizar o estado do usuário
      setUser((prev) =>
        prev
          ? {
              ...prev,
              full_name: formData.full_name,
              email: formData.email,
              phone: formData.phone ? unformatPhone(formData.phone) : null,
              updated_at: new Date().toISOString(),
            }
          : null,
      )

      // Mostrar mensagem de sucesso
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      })

      // Mostrar alerta de sucesso
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 5000)
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar seu perfil.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) return

    setChangingPassword(true)

    try {
      // Usar a API do Supabase Auth para atualizar a senha
      const { error } = await supabase.auth.updateUser({
        password: passwordData.password,
      })

      if (error) {
        console.error("Erro ao alterar senha:", error)
        toast({
          title: "Erro",
          description: "Não foi possível alterar sua senha. " + error.message,
          variant: "destructive",
        })
        return
      }

      // Limpar campos de senha
      setPasswordData({
        password: "",
        confirmPassword: "",
      })

      // Mostrar mensagem de sucesso
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      })

      // Mostrar alerta de sucesso
      setShowPasswordSuccessAlert(true)
      setTimeout(() => setShowPasswordSuccessAlert(false), 5000)
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar sua senha.",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return null // O componente de loading será exibido automaticamente
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
        <h1 className="text-2xl font-bold text-[#0f172a]">Meu Perfil</h1>
      </div>

      {/* Formulário de perfil */}
      <Card className="border border-[#e5e7eb] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#70645C]/5 border-b border-[#e5e7eb] px-6">
          <CardTitle className="text-[#70645C] flex items-center">
            <User className="mr-2 h-5 w-5" /> Informações Pessoais
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {showSuccessAlert && (
            <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-4 flex items-center mb-4">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
              <span>Perfil atualizado com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[#0f172a] text-sm font-medium">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${errors.full_name ? "border-red-500" : ""}`}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0f172a] text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#0f172a] text-sm font-medium">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <CardFooter className="px-0 pt-4 border-t border-[#e5e7eb] justify-end">
              <Button 
                type="submit" 
                disabled={saving} 
                className="bg-[#70645C] hover:bg-[#5d534c] text-white border border-[#70645C]/20 transition-colors duration-300"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* Formulário de alteração de senha */}
      <Card className="border border-[#e5e7eb] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#70645C]/5 border-b border-[#e5e7eb] px-6">
          <CardTitle className="text-[#70645C] flex items-center">
            <Lock className="mr-2 h-5 w-5" /> Alterar Senha
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {showPasswordSuccessAlert && (
            <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-4 flex items-center mb-4">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
              <span>Senha alterada com sucesso!</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0f172a] text-sm font-medium">
                  Nova senha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#0f172a] text-sm font-medium">
                  Confirmar senha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <CardFooter className="px-0 pt-4 border-t border-[#e5e7eb] justify-end">
              <Button 
                type="submit" 
                disabled={changingPassword} 
                className="bg-[#70645C] hover:bg-[#5d534c] text-white border border-[#70645C]/20 transition-colors duration-300"
              >
                {changingPassword ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

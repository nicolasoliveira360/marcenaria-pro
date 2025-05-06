"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/client"

export default function Cadastro() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    taxId: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    fullName: "",
    companyName: "",
    email: "",
    taxId: "",
    password: "",
    confirmPassword: "",
    form: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nome completo é obrigatório"
      isValid = false
    }

    // Validate company name
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Nome da empresa é obrigatório"
      isValid = false
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido"
      isValid = false
    }

    // Validate CPF/CNPJ
    if (!formData.taxId.trim()) {
      newErrors.taxId = "CPF/CNPJ é obrigatório"
      isValid = false
    } else {
      // Simple validation for CPF (11 digits) or CNPJ (14 digits)
      const taxIdClean = formData.taxId.replace(/\D/g, "")
      if (taxIdClean.length !== 11 && taxIdClean.length !== 14) {
        newErrors.taxId = "CPF/CNPJ inválido"
        isValid = false
      }
    }

    // Validate password
    if (formData.password.length < 8) {
      newErrors.password = "A senha deve ter pelo menos 8 caracteres"
      isValid = false
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({ ...errors, form: "" })

    try {
      // 1. Criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Inserir na tabela users
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          full_name: formData.fullName,
          email: formData.email,
        })

        if (userError) throw userError

        // 3. Inserir na tabela companies
        const { data: companyData, error: companyError } = await supabase.from("companies").insert({
          name: formData.companyName,
          tax_id: formData.taxId.replace(/\D/g, ""), // Remove caracteres não numéricos
          email: formData.email,
          plan: "free",
        }).select('id')

        if (companyError) throw companyError

        // 4. Criar vínculo do usuário como administrador da empresa
        if (companyData && companyData[0]) {
          const { error: roleError } = await supabase.from("company_user_roles").insert({
            company_id: companyData[0].id,
            user_id: authData.user.id,
            role: 'admin' // Usando o tipo de role 'admin' conforme a definição enum do banco
          })

          if (roleError) {
            console.error("Erro ao criar vínculo de usuário com empresa:", roleError)
            throw roleError
          }
        }

        // Redirecionar para o dashboard
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error)

      // Tratamento de erros específicos
      if (error.message?.includes("email")) {
        setErrors((prev) => ({ ...prev, email: "Este email já está em uso" }))
      } else if (error.message?.includes("tax_id")) {
        setErrors((prev) => ({ ...prev, taxId: "Este CPF/CNPJ já está cadastrado" }))
      } else {
        setErrors((prev) => ({ ...prev, form: "Erro ao criar conta. Por favor, tente novamente." }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Crie sua conta</h1>
          <p className="mt-2 text-[#475569]">Comece a gerenciar seus projetos de marcenaria de forma eficiente</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[#0f172a] text-sm font-medium">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${
                  errors.fullName ? "border-[#dc2626]" : ""
                }`}
                placeholder="Digite seu nome completo"
              />
              {errors.fullName && <p className="text-[#dc2626] text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-[#0f172a] text-sm font-medium">
                Nome da Empresa
              </Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${
                  errors.companyName ? "border-[#dc2626]" : ""
                }`}
                placeholder="Digite o nome da sua empresa"
              />
              {errors.companyName && <p className="text-[#dc2626] text-sm mt-1">{errors.companyName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0f172a] text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${
                  errors.email ? "border-[#dc2626]" : ""
                }`}
                placeholder="seu@email.com"
              />
              {errors.email && <p className="text-[#dc2626] text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId" className="text-[#0f172a] text-sm font-medium">
                CPF/CNPJ
              </Label>
              <Input
                id="taxId"
                name="taxId"
                type="text"
                value={formData.taxId}
                onChange={handleChange}
                className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 ${
                  errors.taxId ? "border-[#dc2626]" : ""
                }`}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
              {errors.taxId && <p className="text-[#dc2626] text-sm mt-1">{errors.taxId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0f172a] text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 pr-10 ${
                    errors.password ? "border-[#dc2626]" : ""
                  }`}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[#dc2626] text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#0f172a] text-sm font-medium">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 pr-10 ${
                    errors.confirmPassword ? "border-[#dc2626]" : ""
                  }`}
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[#dc2626] text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#70645C] hover:bg-[#5d534c] text-white font-medium rounded-lg"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-[#475569]">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-[#70645C] hover:underline font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

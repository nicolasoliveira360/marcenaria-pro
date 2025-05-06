"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface InviteData {
  id: string
  email: string
  company_id: string
  temp_password_hash: string
  expires_at: string
  companies: {
    name: string
  }
  role?: string
}

export default function AceitarConvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const inviteId = searchParams.get("id")
  const inviteEmail = searchParams.get("email")
  const inviteRole = searchParams.get("role") || "collaborator"

  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [inviteValid, setInviteValid] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!inviteId || !inviteEmail) {
      setError("Link de convite inválido. Verifique se você está usando o link correto.")
      setVerifying(false)
      setLoading(false)
      return
    }

    verifyInvite()
  }, [inviteId, inviteEmail])

  const verifyInvite = async () => {
    try {
      setVerifying(true)

      // Buscar o convite
      const { data: invite, error } = await supabase
        .from("company_invites")
        .select("*, companies(*)")
        .eq("id", inviteId)
        .eq("email", inviteEmail)
        .eq("status", "pending")
        .single()

      if (error || !invite) {
        setError("Convite não encontrado ou já utilizado.")
        setInviteValid(false)
        return
      }

      // Verificar se o convite não expirou
      const expiresAt = new Date(invite.expires_at)
      const now = new Date()

      if (expiresAt < now) {
        // Atualizar status do convite para expirado
        await supabase.from("company_invites").update({ status: "expired" }).eq("id", inviteId)
        setError("Este convite expirou. Solicite um novo convite ao administrador.")
        setInviteValid(false)
        return
      }

      setInviteData(invite)
      setInviteValid(true)
    } catch (error) {
      console.error("Erro ao verificar convite:", error)
      setError("Ocorreu um erro ao verificar o convite. Tente novamente mais tarde.")
      setInviteValid(false)
    } finally {
      setVerifying(false)
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (!password) {
      errors.password = "Senha é obrigatória"
    } else if (password.length < 6) {
      errors.password = "A senha deve ter pelo menos 6 caracteres"
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)

      if (!inviteData) {
        throw new Error("Dados do convite não encontrados")
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail!,
        password: password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("Erro ao criar usuário")
      }

      // Adicionar usuário na tabela users
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user.id,
        full_name: name,
        email: inviteEmail!,
        phone: null,
      })

      if (userError) {
        throw userError
      }

      // Adicionar função do usuário na tabela company_user_roles
      const { error: roleError } = await supabase.from("company_user_roles").insert({
        company_id: inviteData.company_id,
        user_id: authData.user.id,
        role: inviteRole,
      })

      if (roleError) {
        throw roleError
      }

      // Atualizar status do convite
      const { error: inviteError } = await supabase
        .from("company_invites")
        .update({ status: "accepted" })
        .eq("id", inviteId)

      if (inviteError) {
        throw inviteError
      }

      // Redirecionar para o dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Erro ao aceitar convite:", error)
      setError(error.message || "Ocorreu um erro ao aceitar o convite. Tente novamente mais tarde.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <header className="bg-white border-b border-gray-100 py-4">
          <div className="container mx-auto px-4">
            <Logo />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Verificando convite...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4">
          <Logo />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-gray-100">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{inviteValid ? "Aceitar Convite" : "Verificação de Convite"}</CardTitle>
            <CardDescription>
              {inviteValid
                ? `Você foi convidado para se juntar a ${inviteData?.companies?.name}`
                : "Verificando seu convite..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {inviteValid ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="bg-[#70645C]/10 border border-[#70645C]/20 rounded-md p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-[#70645C]" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-[#70645C]">Convite válido para {inviteEmail}</p>
                        <p className="text-sm text-[#70645C]/80 mt-1">
                          Função:{" "}
                          {inviteRole === "admin"
                            ? "Administrador"
                            : inviteRole === "collaborator"
                              ? "Colaborador"
                              : "Visualizador de Cliente"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={inviteEmail || ""} disabled className="bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`border-gray-200 focus:border-[#70645C] focus:ring-[#70645C]/10 ${formErrors.name ? "border-red-500" : ""}`}
                    />
                    {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`border-gray-200 focus:border-[#70645C] focus:ring-[#70645C]/10 ${formErrors.password ? "border-red-500" : ""}`}
                    />
                    {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`border-gray-200 focus:border-[#70645C] focus:ring-[#70645C]/10 ${formErrors.confirmPassword ? "border-red-500" : ""}`}
                    />
                    {formErrors.confirmPassword && <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-[#70645C] hover:bg-[#5d534b] text-white" disabled={submitting}>
                    {submitting ? "Processando..." : "Aceitar Convite"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">{error}</p>
                <p className="text-gray-500 text-sm">
                  Entre em contato com o administrador para obter um novo convite.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-[#70645C] hover:underline">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

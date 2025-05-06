"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/client"

export default function RecuperarSenha() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: "error", text: "Por favor, insira um email válido." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (error) throw error

      setMessage({
        type: "success",
        text: "Enviamos um link para redefinir sua senha. Por favor, verifique seu email.",
      })
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error)
      setMessage({
        type: "error",
        text: "Ocorreu um erro ao enviar o email de recuperação. Por favor, tente novamente.",
      })
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
          <h1 className="text-3xl font-bold text-[#0f172a]">Recuperar Senha</h1>
          <p className="mt-2 text-[#475569]">Enviaremos um link para redefinir sua senha</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          {message && (
            <div
              className={`mb-6 p-4 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-600"
                  : "bg-red-50 border border-red-200 text-red-600"
              } rounded-lg text-sm`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0f172a] text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-[#e5e7eb] focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                placeholder="seu@email.com"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#70645C] hover:bg-[#5d534c] text-white font-medium rounded-lg"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-[#475569]">
              Lembrou sua senha?{" "}
              <Link href="/login" className="text-[#70645C] hover:underline font-medium">
                Voltar para o login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

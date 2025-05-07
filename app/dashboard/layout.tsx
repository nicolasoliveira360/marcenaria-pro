"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Users, FolderOpen, Settings, LogOut, Menu, X, Building, User, Shield, CreditCard } from "lucide-react"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import CompanyProvider from "@/contexts/company-provider"
import SupabaseProvider from "@/contexts/supabase-provider"

// Definir o tipo de enum para funções de usuário
type RoleEnum = "admin" | "collaborator" | "client_viewer"

// Interface para os itens de navegação
interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  allowedRoles: RoleEnum[] // Funções que podem acessar este item
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<RoleEnum>("collaborator") // Padrão para fallback
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Definir todos os itens de navegação com suas permissões
  const allNavItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home, allowedRoles: ["admin", "collaborator", "client_viewer"] },
    { name: "Clientes", href: "/dashboard/clientes", icon: Users, allowedRoles: ["admin", "collaborator"] },
    {
      name: "Projetos",
      href: "/dashboard/projetos",
      icon: FolderOpen,
      allowedRoles: ["admin", "collaborator", "client_viewer"],
    },
    { name: "Empresa", href: "/dashboard/empresa", icon: Building, allowedRoles: ["admin"] },
    { name: "Colaboradores", href: "/dashboard/colaboradores", icon: Users, allowedRoles: ["admin"] },
    { name: "Faturamento", href: "/dashboard/faturamento", icon: CreditCard, allowedRoles: ["admin"] },
    { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings, allowedRoles: ["admin"] },
    { name: "Perfil", href: "/dashboard/perfil", icon: User, allowedRoles: ["admin", "collaborator", "client_viewer"] },
  ]

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Buscar dados do usuário no banco
          const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

          if (userData) {
            setUser(userData)

            // Buscar a função do usuário
            // Primeiro, verificar se é o proprietário da empresa (admin)
            const { data: companyData } = await supabase
              .from("companies")
              .select("id")
              .eq("email", userData.email)
              .single()

            if (companyData) {
              // É o proprietário da empresa, então é admin
              setUserRole("admin")
            } else {
              // Buscar a função na tabela company_user_roles
              const { data: roleData } = await supabase
                .from("company_user_roles")
                .select("role")
                .eq("user_id", user.id)
                .single()

              if (roleData) {
                setUserRole(roleData.role as RoleEnum)
              }
            }
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase, router])

  // Filtrar os itens de navegação com base na função do usuário
  const navigation = allNavItems.filter((item) => item.allowedRoles.includes(userRole))

  // Função para obter o nome e cor da badge da função
  const getRoleBadge = () => {
    switch (userRole) {
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
            <Shield size={12} /> Administrador
          </Badge>
        )
      case "collaborator":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Colaborador</Badge>
      case "client_viewer":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Visualizador</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <p className="text-[#475569]">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div
          className="fixed inset-0 bg-black/20 z-40"
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
          style={{ display: mobileMenuOpen ? "block" : "none" }}
        />

        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-[#e5e7eb]">
            <Logo />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#475569] hover:text-[#70645C]">
              <X size={20} />
            </button>
          </div>
          <nav className="mt-5 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive ? "bg-[#70645C]/10 text-[#70645C]" : "text-[#475569] hover:bg-[#f9fafb]"
                  } transition-colors duration-300 ease-in-out`}
                >
                  <item.icon size={18} className={`mr-3 ${isActive ? "text-[#70645C]" : "text-[#475569]"}`} />
                  {item.name}
                </Link>
              )
            })}
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-[#475569] hover:bg-[#f9fafb] rounded-lg transition-colors duration-300 ease-in-out"
            >
              <LogOut size={18} className="mr-3 text-[#475569]" />
              Sair
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-[#e5e7eb] bg-white">
            <div className="flex items-center h-16 px-6 border-b border-[#e5e7eb]">
              <Logo />
            </div>
            <div className="flex flex-col flex-grow overflow-y-auto">
              <nav className="flex-1 px-4 mt-5 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                        isActive ? "bg-[#70645C]/10 text-[#70645C]" : "text-[#475569] hover:bg-[#f9fafb]"
                      } transition-colors duration-300 ease-in-out`}
                    >
                      <item.icon size={18} className={`mr-3 ${isActive ? "text-[#70645C]" : "text-[#475569]"}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
              <div className="flex-shrink-0 p-4 border-t border-[#e5e7eb]">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-[#475569] hover:bg-[#f9fafb] rounded-lg transition-colors duration-300 ease-in-out"
                >
                  <LogOut size={18} className="mr-3 text-[#475569]" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top header */}
          <header className="flex items-center h-16 px-6 border-b border-[#e5e7eb] bg-white">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 mr-4 text-[#475569] lg:hidden hover:text-[#70645C] transition-colors duration-300 ease-in-out">
              <Menu size={20} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#0f172a]">{user?.full_name}</p>
                      {getRoleBadge()}
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[#70645C] flex items-center justify-center text-white font-medium">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-6">
            <SupabaseProvider>
              <CompanyProvider>
                {children}
              </CompanyProvider>
            </SupabaseProvider>
          </main>
        </div>
      </div>
    </div>
  )

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }
}

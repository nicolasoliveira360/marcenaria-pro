"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  RefreshCw,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  X,
  Users,
  Copy,
  Link,
} from "lucide-react"
import { toast } from "sonner"
import { useToast } from "@/components/ui/use-toast"

// Definir o tipo de enum para status de convite
type InviteStatusEnum = "pending" | "accepted" | "rejected" | "expired"
// Definir o tipo de enum para funções de usuário
type RoleEnum = "admin" | "collaborator" | "client_viewer"

interface Collaborator {
  id: string
  full_name: string
  email: string
  phone: string | null
  role?: RoleEnum
}

interface Invite {
  id: string
  email: string
  status: InviteStatusEnum
  created_at: string
  temp_password_hash?: string
}

export default function ColaboradoresPage() {
  const supabase = createClient()
  const { toast: toastUI } = useToast()
  const [loading, setLoading] = useState(true)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)

  // Estados para diálogos de confirmação
  const [deleteInviteId, setDeleteInviteId] = useState<string | null>(null)
  const [deleteCollaboratorId, setDeleteCollaboratorId] = useState<string | null>(null)
  const [resendInviteId, setResendInviteId] = useState<string | null>(null)
  const [resendInviteEmail, setResendInviteEmail] = useState<string>("")

  // Estado para diálogo de alteração de função
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false)
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null)
  const [selectedRole, setSelectedRole] = useState<RoleEnum>("collaborator")

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [generateRandomPassword, setGenerateRandomPassword] = useState(true)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [initialRole, setInitialRole] = useState<RoleEnum>("collaborator")

  useEffect(() => {
    fetchCollaboratorsAndInvites()
  }, [])

  const fetchCollaboratorsAndInvites = async () => {
    try {
      setLoading(true)

      // Obter o usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      setCurrentUserId(user.id)

      // Obter a empresa do usuário
      const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (!userData) {
        throw new Error("Dados do usuário não encontrados")
      }

      // Obter ID da empresa
      const { data: companyData } = await supabase.from("companies").select("id").eq("email", userData.email).single()

      if (!companyData) {
        throw new Error("Empresa não encontrada")
      }

      setCompanyId(companyData.id)

      // Buscar colaboradores (usuários vinculados à empresa através da tabela company_user_roles)
      const { data: rolesData, error: rolesError } = await supabase
        .from("company_user_roles")
        .select("user_id, role, users(id, full_name, email, phone)")
        .eq("company_id", companyData.id)

      if (rolesError) {
        console.error("Erro ao buscar funções:", rolesError)
      }

      // Transformar os dados para o formato esperado
      let collaboratorsData: Collaborator[] = []

      if (rolesData && rolesData.length > 0) {
        collaboratorsData = rolesData.map((item) => ({
          id: item.users.id,
          full_name: item.users.full_name,
          email: item.users.email,
          phone: item.users.phone,
          role: item.role as RoleEnum,
        }))
      } else {
        // Se não houver dados na tabela de funções, adicionar o usuário atual como admin
        collaboratorsData = [
          {
            id: user.id,
            full_name: userData.full_name,
            email: userData.email,
            phone: userData.phone,
            role: "admin" as RoleEnum,
          },
        ]

        // Inserir o usuário atual como admin na tabela de funções
        await supabase.from("company_user_roles").insert({
          company_id: companyData.id,
          user_id: user.id,
          role: "admin",
        })
      }

      // Buscar convites pendentes
      const { data: invitesData } = await supabase
        .from("company_invites")
        .select("id, email, status, created_at, temp_password_hash")
        .eq("company_id", companyData.id)

      setCollaborators(collaboratorsData)

      if (invitesData) {
        setInvites(invitesData)
      }
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error)
      toast.error("Erro ao carregar colaboradores")
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    // Remove tudo que não for dígito
    const digits = value.replace(/\D/g, "")

    if (digits.length <= 2) {
      return digits
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const unformatPhone = (value: string) => {
    return value.replace(/\D/g, "")
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value)
    setPhone(formattedValue)
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let result = ""
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (!email.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email inválido"
    }

    if (!generateRandomPassword && !password.trim()) {
      errors.password = "Senha é obrigatória"
    } else if (!generateRandomPassword && password.length < 6) {
      errors.password = "Senha deve ter pelo menos 6 caracteres"
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

      if (!companyId) {
        throw new Error("ID da empresa não encontrado")
      }

      // Gerar senha aleatória se a opção estiver marcada
      const finalPassword = generateRandomPassword ? generatePassword() : password

      // Criar hash da senha temporária
      // Na prática, você deve usar uma função de hash segura
      // Aqui estamos apenas simulando o hash para fins de demonstração
      const tempPasswordHash = btoa(finalPassword) // NÃO use isso em produção!

      // Definir data de expiração (30 dias a partir de agora)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      // Criar convite
      const { data: invite, error } = await supabase
        .from("company_invites")
        .insert({
          company_id: companyId,
          email: email,
          temp_password_hash: tempPasswordHash,
          invited_by: currentUserId,
          expires_at: expiresAt.toISOString(),
          status: "pending" as InviteStatusEnum,
        })
        .select()

      if (error) {
        if (error.code === "23505") {
          // Código de violação de unicidade
          throw new Error("Este email já foi convidado")
        }
        throw error
      }

      // Enviar email com convite (simulado)
      console.log(`Enviando email para ${email} com senha temporária: ${finalPassword}`)
      console.log(
        `Link de convite: ${window.location.origin}/aceitar-convite?id=${invite[0].id}&email=${email}&role=${initialRole}`,
      )

      // Atualizar lista de convites
      fetchCollaboratorsAndInvites()

      // Mostrar mensagem de sucesso
      setAlertMessage(
        `Convite enviado para ${email}${generateRandomPassword ? ` com senha temporária: ${finalPassword}` : ""} como ${getRoleName(initialRole)}`,
      )
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 5000)

      // Fechar o diálogo e limpar o formulário
      resetForm()
      setIsDialogOpen(false)

      toast.success("Convite enviado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao enviar convite:", error)
      toast.error(error.message || "Erro ao enviar convite")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setGenerateRandomPassword(true)
    setInitialRole("collaborator")
    setFormErrors({})
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleDeleteInvite = async () => {
    if (!deleteInviteId) return

    try {
      const { error } = await supabase.from("company_invites").delete().eq("id", deleteInviteId)

      if (error) throw error

      toast.success("Convite excluído com sucesso")
      fetchCollaboratorsAndInvites()
    } catch (error) {
      console.error("Erro ao excluir convite:", error)
      toast.error("Erro ao excluir convite")
    } finally {
      setDeleteInviteId(null)
    }
  }

  const handleDeleteCollaborator = async () => {
    if (!deleteCollaboratorId || !companyId) return

    try {
      // Buscar o email do colaborador
      const collaborator = collaborators.find((c) => c.id === deleteCollaboratorId)

      if (!collaborator) {
        throw new Error("Colaborador não encontrado")
      }

      // Não permitir excluir o próprio usuário
      if (deleteCollaboratorId === currentUserId) {
        throw new Error("Você não pode excluir sua própria conta")
      }

      // Remover da tabela de funções
      const { error: deleteRoleError } = await supabase
        .from("company_user_roles")
        .delete()
        .eq("company_id", companyId)
        .eq("user_id", deleteCollaboratorId)

      if (deleteRoleError) throw deleteRoleError

      // Excluir o usuário da tabela users
      const { error: deleteUserError } = await supabase.from("users").delete().eq("id", deleteCollaboratorId)

      if (deleteUserError) throw deleteUserError

      // Excluir o usuário do Supabase Auth
      // Nota: Em um ambiente de produção, isso geralmente seria feito por uma função serverless
      // com permissões de admin, pois o cliente não tem permissão para excluir usuários
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(deleteCollaboratorId)

      if (deleteAuthError) {
        console.error("Erro ao excluir usuário do Auth:", deleteAuthError)
        // Continuar mesmo com erro, pois o usuário já foi removido do banco de dados
      }

      toast.success("Colaborador excluído com sucesso")
      fetchCollaboratorsAndInvites()
    } catch (error: any) {
      console.error("Erro ao excluir colaborador:", error)
      toast.error(error.message || "Erro ao excluir colaborador")
    } finally {
      setDeleteCollaboratorId(null)
    }
  }

  const handleResendInvite = async () => {
    if (!resendInviteId) return

    try {
      // Gerar nova senha temporária
      const newPassword = generatePassword()
      const tempPasswordHash = btoa(newPassword) // NÃO use isso em produção!

      // Definir nova data de expiração (30 dias a partir de agora)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      // Atualizar o convite
      const { error } = await supabase
        .from("company_invites")
        .update({
          temp_password_hash: tempPasswordHash,
          expires_at: expiresAt.toISOString(),
          status: "pending" as InviteStatusEnum,
        })
        .eq("id", resendInviteId)

      if (error) throw error

      // Enviar email com convite (simulado)
      console.log(`Reenviando email para ${resendInviteEmail} com senha temporária: ${newPassword}`)
      console.log(
        `Link de convite: ${window.location.origin}/aceitar-convite?id=${resendInviteId}&email=${resendInviteEmail}`,
      )

      toast.success("Convite reenviado com sucesso")
      fetchCollaboratorsAndInvites()

      // Mostrar mensagem com a senha
      setAlertMessage(`Convite reenviado para ${resendInviteEmail} com senha temporária: ${newPassword}`)
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 10000) // Mostrar por mais tempo para dar tempo de copiar a senha
    } catch (error) {
      console.error("Erro ao reenviar convite:", error)
      toast.error("Erro ao reenviar convite")
    } finally {
      setResendInviteId(null)
      setResendInviteEmail("")
    }
  }

  /**
   * Processa a aceitação de um convite, criando o usuário e o relacionamento com a empresa,
   * e então excluindo o convite da tabela company_invites.
   */
  const handleAcceptInvite = async (inviteId: string, userData: any) => {
    if (!companyId) return

    try {
      // 1. Buscar o convite para obter os detalhes
      const { data: invite, error: inviteError } = await supabase
        .from("company_invites")
        .select("*")
        .eq("id", inviteId)
        .single()

      if (inviteError || !invite) {
        throw new Error("Convite não encontrado ou já foi processado")
      }

      // 2. Verificar se o convite não expirou
      const expiresAt = new Date(invite.expires_at)
      if (expiresAt < new Date()) {
        throw new Error("Este convite expirou")
      }

      // 3. Criar ou atualizar o usuário
      // Nota: Em uma aplicação real, isso provavelmente seria feito em uma função serverless
      // com as permissões adequadas, não diretamente do cliente

      // 4. Criar a relação entre usuário e empresa na tabela company_user_roles
      const { error: roleError } = await supabase
        .from("company_user_roles")
        .insert({
          company_id: invite.company_id,
          user_id: userData.id,
          role: "collaborator", // ou o papel definido no convite
        })

      if (roleError) throw roleError

      // 5. Excluir o convite depois que for aceito - essa é a mudança principal
      const { error: deleteError } = await supabase
        .from("company_invites")
        .delete()
        .eq("id", inviteId)

      if (deleteError) throw deleteError

      toast.success("Convite aceito com sucesso!")
      
      // 6. Atualizar a lista de colaboradores
      fetchCollaboratorsAndInvites()
      
      return true
    } catch (error: any) {
      console.error("Erro ao aceitar convite:", error)
      toast.error(error.message || "Erro ao aceitar convite")
      return false
    }
  }

  const handleChangeRole = async () => {
    if (!selectedCollaborator || !companyId) return

    try {
      // Não permitir alterar a própria função se for o único admin
      if (
        selectedCollaborator.id === currentUserId &&
        selectedCollaborator.role === "admin" &&
        selectedRole !== "admin"
      ) {
        const adminCount = collaborators.filter((c) => c.role === "admin").length
        if (adminCount <= 1) {
          throw new Error("Você não pode rebaixar sua própria função pois é o único administrador")
        }
      }

      // Atualizar a função na tabela company_user_roles
      const { error } = await supabase
        .from("company_user_roles")
        .update({ role: selectedRole })
        .eq("company_id", companyId)
        .eq("user_id", selectedCollaborator.id)

      if (error) throw error

      toast.success(`Função de ${selectedCollaborator.full_name} alterada para ${getRoleName(selectedRole)}`)

      // Atualizar a lista de colaboradores
      fetchCollaboratorsAndInvites()

      // Fechar o diálogo
      setChangeRoleDialogOpen(false)
      setSelectedCollaborator(null)
    } catch (error: any) {
      console.error("Erro ao alterar função:", error)
      toast.error(error.message || "Erro ao alterar função")
    }
  }

  const openChangeRoleDialog = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator)
    setSelectedRole(collaborator.role || "collaborator")
    setChangeRoleDialogOpen(true)
  }

  const getRoleName = (role: RoleEnum): string => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "collaborator":
        return "Colaborador"
      case "client_viewer":
        return "Visualizador"
      default:
        return "Desconhecido"
    }
  }

  const getRoleBadge = (role: RoleEnum) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-[#70645C]/10 text-[#70645C] border border-[#70645C]/20 hover:bg-[#70645C]/10">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case "collaborator":
        return (
          <Badge className="bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-100">
            <UserPlus className="h-3 w-3 mr-1" />
            Colaborador
          </Badge>
        )
      case "client_viewer":
        return (
          <Badge className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Visualizador
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusBadge = (status: InviteStatusEnum) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-600 border border-green-200 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aceito
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-600 border border-red-200 hover:bg-red-100">
            <X className="h-3 w-3 mr-1" />
            Rejeitado
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100">
            <Clock className="h-3 w-3 mr-1" />
            Expirado
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return dateString
    }
  }

  // ... add function to copy invitation link to clipboard ...
  const copyInviteLink = (inviteId: string, email: string) => {
    const link = `${window.location.origin}/aceitar-convite?id=${inviteId}&email=${email}`;
    navigator.clipboard.writeText(link).then(
      () => {
        toast.success("Link de convite copiado para a área de transferência!");
        // Adiciona estado para indicar qual botão foi copiado
        setCopiedInviteId(inviteId);
        // Reseta após 3 segundos
        setTimeout(() => {
          setCopiedInviteId(null);
        }, 3000);
      },
      (err) => {
        console.error("Não foi possível copiar o link: ", err);
        toast.error("Erro ao copiar o link");
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-[#70645C]" />
          Colaboradores
        </h2>
        <Button 
          onClick={() => {
            resetForm()
            setIsDialogOpen(true)
          }}
          className="bg-[#70645C] hover:bg-[#70645C]/90 text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Colaborador
        </Button>
      </div>

      {showAlert && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4 flex items-start">
          <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
          <div>
            <p>{alertMessage}</p>
          </div>
          <button 
            onClick={() => setShowAlert(false)} 
            className="ml-auto"
          >
            <X className="h-5 w-5 text-green-500 hover:text-green-700" />
          </button>
        </div>
      )}

      {/* Colaboradores Ativos */}
      <Card className="border border-gray-100 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-lg font-medium text-gray-900">Colaboradores Ativos</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Pessoas com acesso ao seu ambiente
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full mt-4" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {collaborators.map((collaborator) => (
                <div 
                  key={collaborator.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#70645C]/10 flex items-center justify-center text-[#70645C] font-medium">
                        {collaborator.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{collaborator.full_name}</h3>
                        <p className="text-sm text-gray-500">{collaborator.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(collaborator.role || "collaborator")}
                      
                      {/* Não mostrar dropdown para o próprio usuário */}
                      {collaborator.id !== currentUserId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white">
                            <DropdownMenuItem
                              onClick={() => openChangeRoleDialog(collaborator)}
                              className="cursor-pointer text-gray-700 hover:text-[#70645C] hover:bg-[#70645C]/10"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Alterar Função
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteCollaboratorId(collaborator.id)}
                              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remover Acesso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convites Pendentes */}
      {invites.filter(invite => invite.status === "pending").length > 0 && (
        <Card className="border border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-lg font-medium text-gray-900">Convites Pendentes</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Convites enviados que ainda não foram aceitos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {invites
                .filter(invite => invite.status === "pending")
                .map((invite) => (
                <div key={invite.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{invite.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(invite.status)}
                        <span className="text-xs text-gray-500">
                          Enviado em {formatDate(invite.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={copiedInviteId === invite.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => copyInviteLink(invite.id, invite.email)}
                        className={copiedInviteId === invite.id 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "border-gray-200 hover:border-[#70645C] hover:text-[#70645C]"}
                      >
                        {copiedInviteId === invite.id ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Link className="h-3.5 w-3.5 mr-1" />
                            Copiar Link
                          </>
                        )}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setResendInviteId(invite.id)
                          setResendInviteEmail(invite.email)
                        }}
                        className="bg-[#70645C] hover:bg-[#70645C]/90 text-white"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Reenviar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteInviteId(invite.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo para adicionar colaborador */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Adicionar Colaborador</DialogTitle>
            <DialogDescription className="text-gray-500">
              Preencha os dados para convidar um novo colaborador
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do colaborador"
                  className={`border-gray-200 focus:border-[#70645C] focus:ring-[#70645C] ${
                    formErrors.name ? "border-red-500" : ""
                  }`}
                  />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className={`border-gray-200 focus:border-[#70645C] focus:ring-[#70645C] ${
                    formErrors.email ? "border-red-500" : ""
                  }`}
                  />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                  className="border-gray-200 focus:border-[#70645C] focus:ring-[#70645C]"
                  />
                </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">Senha</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generate-password"
                      checked={generateRandomPassword}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setGenerateRandomPassword(true)
                          setPassword("")
                        } else {
                          setGenerateRandomPassword(false)
                        }
                      }}
                      className="data-[state=checked]:bg-[#70645C] data-[state=checked]:border-[#70645C]"
                    />
                    <label
                      htmlFor="generate-password"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                    >
                      Gerar senha automática
                    </label>
                  </div>
                </div>
                {!generateRandomPassword && (
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    className={`border-gray-200 focus:border-[#70645C] focus:ring-[#70645C] ${
                      formErrors.password ? "border-red-500" : ""
                    }`}
                    disabled={generateRandomPassword}
                    />
                )}
                {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Função do usuário</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={initialRole === "admin" ? "default" : "outline"}
                    onClick={() => setInitialRole("admin")}
                    className={
                      initialRole === "admin"
                        ? "bg-[#70645C] hover:bg-[#70645C]/90 text-white"
                        : "border-gray-200 hover:border-[#70645C] hover:text-[#70645C]"
                    }
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant={initialRole === "collaborator" ? "default" : "outline"}
                    onClick={() => setInitialRole("collaborator")}
                    className={
                      initialRole === "collaborator"
                        ? "bg-[#70645C] hover:bg-[#70645C]/90 text-white"
                        : "border-gray-200 hover:border-[#70645C] hover:text-[#70645C]"
                    }
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Colaborador
                  </Button>
                  <Button
                    type="button"
                    variant={initialRole === "client_viewer" ? "default" : "outline"}
                    onClick={() => setInitialRole("client_viewer")}
                    className={
                      initialRole === "client_viewer"
                        ? "bg-[#70645C] hover:bg-[#70645C]/90 text-white"
                        : "border-gray-200 hover:border-[#70645C] hover:text-[#70645C]"
                    }
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Visualizador
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline" type="button" className="border-gray-200">Cancelar</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-[#70645C] hover:bg-[#70645C]/90 text-white"
              >
                {submitting ? "Enviando..." : "Enviar convite"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      {/* Diálogo para alterar função */}
      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Alterar Função</DialogTitle>
            <DialogDescription className="text-gray-500">
              {selectedCollaborator ? `Alterar a função de ${selectedCollaborator.full_name}` : "Selecione uma nova função para o colaborador"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={selectedRole === "admin" ? "default" : "outline"}
                onClick={() => setSelectedRole("admin")}
                className={
                  selectedRole === "admin"
                    ? "bg-[#70645C] hover:bg-[#70645C]/90 text-white"
                    : "border-gray-200 hover:border-[#70645C] hover:text-[#70645C]"
                }
                >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button
                type="button"
                variant={selectedRole === "collaborator" ? "default" : "outline"}
                onClick={() => setSelectedRole("collaborator")}
                className={
                  selectedRole === "collaborator"
                    ? "bg-[#70645C] hover:bg-[#70645C]/90 text-white"
                    : "border-gray-200 hover:border-[#70645C] hover:text-[#70645C]"
                }
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Colaborador
              </Button>
              <Button
                type="button"
                variant={selectedRole === "client_viewer" ? "default" : "outline"}
                onClick={() => setSelectedRole("client_viewer")}
                className={
                  selectedRole === "client_viewer"
                    ? "bg-[#70645C] hover:bg-[#70645C]/90 text-white"
                    : "border-gray-200 hover:border-[#70645C] hover:text-[#70645C]"
                }
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Visualizador
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" className="border-gray-200">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleChangeRole}
              className="bg-[#70645C] hover:bg-[#70645C]/90"
            >
              Salvar alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para excluir convite */}
      <AlertDialog open={!!deleteInviteId} onOpenChange={(open) => !open && setDeleteInviteId(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Excluir convite</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Tem certeza que deseja excluir este convite? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteInvite}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmação para remover colaborador */}
      <AlertDialog
        open={!!deleteCollaboratorId}
        onOpenChange={(open) => !open && setDeleteCollaboratorId(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Remover acesso</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Tem certeza que deseja remover o acesso deste colaborador? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCollaborator}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              Remover acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmação para reenviar convite */}
      <AlertDialog
        open={!!resendInviteId}
        onOpenChange={(open) => !open && setResendInviteId(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Reenviar convite</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Deseja reenviar o convite para {resendInviteEmail}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResendInvite}
              className="bg-[#70645C] hover:bg-[#70645C]/90 text-white"
            >
              Reenviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

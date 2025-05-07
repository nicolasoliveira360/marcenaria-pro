"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Users,
  FolderOpen,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  BarChart3,
  LucideActivity,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompany } from "@/hooks/use-company"
import { getProjects } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Building } from "lucide-react"

// Tipo para projetos
type Project = {
  id: string
  name: string
  status_name: string
  total_value: number
  payment_status: string
  progress: number
  client_name: string | null
}

// Tipo para tarefas
type Task = {
  id: string
  name: string
  is_done: boolean
  project_id: string
  project_name: string
  status_name: string
}

// Tipo para pagamentos
type Payment = {
  id: string
  amount: number
  due_date: string
  status: string
  project_name: string
  project_id: string
}

// Tipo para resumo de status
type ProjectStatusSummary = {
  status: string
  count: number
  color: string
}

// Adicionar o tipo de período após as outras definições de tipos
type PeriodFilter = "all" | "this_month" | "last_month" | "this_quarter" | "last_quarter" | "this_year"

// Modificar o componente Dashboard para incluir o estado do filtro de período
export default function Dashboard() {
  const supabase = createClient()
  const { company, loading, error } = useCompany()
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjects: 0,
    totalValue: 0,
    pendingPayments: 0,
    completedProjects: 0,
    tasksInProgress: 0,
  })
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [projectStatusSummary, setProjectStatusSummary] = useState<ProjectStatusSummary[]>([])
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all")

  // Adicionar função para calcular datas de início e fim com base no período
  const getDateRangeFromPeriod = (period: PeriodFilter): { startDate: string; endDate: string } => {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (period) {
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case "this_quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1)
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0)
        break
      case "last_quarter":
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1
        const yearOfLastQuarter = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear()
        const actualLastQuarter = lastQuarter < 0 ? 3 : lastQuarter
        startDate = new Date(yearOfLastQuarter, actualLastQuarter * 3, 1)
        endDate = new Date(yearOfLastQuarter, (actualLastQuarter + 1) * 3, 0)
        break
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      case "all":
      default:
        startDate = new Date(2000, 0, 1) // Uma data bem antiga para pegar tudo
        endDate = new Date(now.getFullYear() + 10, 11, 31) // Uma data bem futura
        break
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    }
  }

  // Modificar o useEffect para incluir o periodFilter como dependência
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoadingProjects(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Buscar empresa do usuário
          const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

          if (userData) {
            // Primeiro, tentar buscar a empresa pelo email (caso seja o proprietário)
            let companyId = null
            const { data: companyData } = await supabase
              .from("companies")
              .select("id")
              .eq("email", userData.email)
              .single()

            if (companyData) {
              companyId = companyData.id
            } else {
              // Se não encontrou pelo email, buscar através da tabela company_user_roles
              const { data: roleData } = await supabase
                .from("company_user_roles")
                .select("company_id")
                .eq("user_id", user.id)
                .single()

              if (roleData) {
                companyId = roleData.company_id
              }
            }

            if (companyId) {
              console.log("Company ID encontrado:", companyId)

              const dateRange = getDateRangeFromPeriod(periodFilter)

              // Buscar estatísticas básicas
              await fetchBasicStats(companyId, dateRange)

              // Buscar projetos recentes
              await fetchRecentProjects(companyId, dateRange)

              // Buscar tarefas pendentes
              await fetchPendingTasks(companyId, dateRange)

              // Buscar próximos pagamentos
              await fetchUpcomingPayments(companyId, dateRange)

              // Buscar resumo de projetos por status
              await fetchProjectStatusSummary(companyId, dateRange)
            } else {
              console.error("Não foi possível encontrar o ID da empresa")
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
      } finally {
        setLoadingProjects(false)
      }
    }

    // Modificar as funções para aceitar o parâmetro dateRange
    async function fetchBasicStats(companyId: string, dateRange: { startDate: string; endDate: string }) {
      try {
        // Buscar estatísticas
        const { count: clientsCount, error: clientsError } = await supabase
          .from("clients")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId)
          .gte("created_at", dateRange.startDate)
          .lte("created_at", dateRange.endDate + "T23:59:59")

        if (clientsError) throw clientsError

        const {
          data: projectsData,
          count: projectsCount,
          error: projectsError,
        } = await supabase
          .from("projects")
          .select("*", { count: "exact" })
          .eq("company_id", companyId)
          .gte("created_at", dateRange.startDate)
          .lte("created_at", dateRange.endDate + "T23:59:59")

        if (projectsError) throw projectsError

        // Calcular valor total dos projetos
        let totalValue = 0
        if (projectsData) {
          totalValue = projectsData.reduce((sum, project) => sum + (project.total_value || 0), 0)
        }

        // Contar projetos concluídos (vamos considerar projetos com payment_status = 'pago')
        const { count: completedCount, error: completedError } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId)
          .eq("payment_status", "pago")
          .gte("created_at", dateRange.startDate)
          .lte("created_at", dateRange.endDate + "T23:59:59")

        if (completedError) throw completedError

        // Contar tarefas em andamento (não concluídas)
        const { count: tasksInProgressCount, error: tasksError } = await supabase
          .from("project_task")
          .select("*, project_status!inner(project_id, projects!inner(company_id))", { count: "exact", head: true })
          .eq("project_status.projects.company_id", companyId)
          .eq("is_done", false)
          .gte("created_at", dateRange.startDate)
          .lte("created_at", dateRange.endDate + "T23:59:59")

        if (tasksError) throw tasksError

        // Buscar pagamentos pendentes
        const { data: pendingPaymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("amount, projects!inner(company_id)")
          .eq("status", "pendente")
          .eq("projects.company_id", companyId)
          .gte("due_date", dateRange.startDate)
          .lte("due_date", dateRange.endDate)

        if (paymentsError) throw paymentsError

        const pendingPaymentsTotal = pendingPaymentsData
          ? pendingPaymentsData.reduce((sum, payment) => sum + payment.amount, 0)
          : 0

        setStats({
          totalClients: clientsCount || 0,
          totalProjects: projectsCount || 0,
          totalValue: totalValue,
          pendingPayments: pendingPaymentsTotal,
          completedProjects: completedCount || 0,
          tasksInProgress: tasksInProgressCount || 0,
        })
      } catch (error) {
        console.error("Erro ao buscar estatísticas básicas:", error)
      }
    }

    async function fetchRecentProjects(companyId: string, dateRange: { startDate: string; endDate: string }) {
      try {
        console.log("Buscando projetos recentes para company_id:", companyId)

        // Buscar projetos com seus status e clientes
        const { data: projects, error } = await supabase
          .from("projects")
          .select(`
            id, 
            name,
            total_value,
            payment_status,
            clients(name),
            progress_status_id,
            project_status(name)
          `)
          .eq("company_id", companyId)
          .gte("created_at", dateRange.startDate)
          .lte("created_at", dateRange.endDate + "T23:59:59")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error

        console.log("Projetos recentes encontrados:", projects?.length || 0)

        if (projects && projects.length > 0) {
          // Para cada projeto, calcular o progresso com base nas tarefas
          const projectsWithProgress = await Promise.all(
            projects.map(async (project) => {
              // Buscar todas as tarefas do projeto
              const { data: statuses } = await supabase.from("project_status").select("id").eq("project_id", project.id)

              const statusIds = statuses?.map((status) => status.id) || []

              let totalTasks = 0
              let completedTasks = 0

              if (statusIds.length > 0) {
                // Buscar contagem de todas as tarefas
                const { count: totalCount } = await supabase
                  .from("project_task")
                  .select("*", { count: "exact", head: true })
                  .in("project_status_id", statusIds)

                // Buscar contagem de tarefas concluídas
                const { count: completedCount } = await supabase
                  .from("project_task")
                  .select("*", { count: "exact", head: true })
                  .in("project_status_id", statusIds)
                  .eq("is_done", true)

                totalTasks = totalCount || 0
                completedTasks = completedCount || 0
              }

              // Calcular progresso
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              return {
                id: project.id,
                name: project.name,
                status_name:
                  project.project_status?.length > 0 ? project.project_status[0].name : project.payment_status,
                total_value: project.total_value,
                payment_status: project.payment_status,
                progress,
                client_name: project.clients?.name || null,
              }
            }),
          )

          setRecentProjects(projectsWithProgress)
        } else {
          setRecentProjects([])
        }
      } catch (error) {
        console.error("Erro ao buscar projetos recentes:", error)
        setRecentProjects([])
      }
    }

    async function fetchPendingTasks(companyId: string, dateRange: { startDate: string; endDate: string }) {
      try {
        console.log("Buscando tarefas pendentes para company_id:", companyId)

        // Buscar tarefas não concluídas com seus projetos
        const { data: tasks, error } = await supabase
          .from("project_task")
          .select(`
            id,
            name,
            is_done,
            project_status!inner(
              id,
              name,
              project_id,
              projects!inner(
                id,
                name,
                company_id
              )
            )
          `)
          .eq("project_status.projects.company_id", companyId)
          .eq("is_done", false)
          .gte("created_at", dateRange.startDate)
          .lte("created_at", dateRange.endDate + "T23:59:59")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error

        console.log("Tarefas pendentes encontradas:", tasks?.length || 0)

        if (tasks && tasks.length > 0) {
          setPendingTasks(
            tasks.map((task) => ({
              id: task.id,
              name: task.name,
              is_done: task.is_done,
              project_id: task.project_status.projects.id,
              project_name: task.project_status.projects.name,
              status_name: task.project_status.name,
            })),
          )
        } else {
          setPendingTasks([])
        }
      } catch (error) {
        console.error("Erro ao buscar tarefas pendentes:", error)
        setPendingTasks([])
      }
    }

    async function fetchUpcomingPayments(companyId: string, dateRange: { startDate: string; endDate: string }) {
      try {
        const today = new Date().toISOString().split("T")[0]

        // Buscar pagamentos pendentes com seus projetos
        const { data: payments, error } = await supabase
          .from("payments")
          .select(`
            id, 
            amount, 
            due_date, 
            status,
            projects!inner(
              id,
              name,
              company_id
            )
          `)
          .eq("status", "pendente")
          .eq("projects.company_id", companyId)
          .gte("due_date", today)
          .lte("due_date", dateRange.endDate)
          .order("due_date", { ascending: true })
          .limit(5)

        if (error) throw error

        if (payments && payments.length > 0) {
          setUpcomingPayments(
            payments.map((payment) => ({
              id: payment.id,
              amount: payment.amount,
              due_date: payment.due_date,
              status: payment.status,
              project_name: payment.projects.name,
              project_id: payment.projects.id,
            })),
          )
        } else {
          setUpcomingPayments([])
        }
      } catch (error) {
        console.error("Erro ao buscar próximos pagamentos:", error)
        setUpcomingPayments([])
      }
    }

    async function fetchProjectStatusSummary(companyId: string, dateRange: { startDate: string; endDate: string }) {
      try {
        console.log("Buscando resumo de status para company_id:", companyId)

        // Buscar todos os status de projetos
        const { data: statusData, error: statusError } = await supabase
          .from("project_status")
          .select(`
            name,
            projects!inner(company_id, created_at)
          `)
          .eq("projects.company_id", companyId)
          .gte("projects.created_at", dateRange.startDate)
          .lte("projects.created_at", dateRange.endDate + "T23:59:59")

        if (statusError) throw statusError

        // Contar projetos por status
        const statusCounts: Record<string, number> = {}

        if (statusData && statusData.length > 0) {
          statusData.forEach((status) => {
            const statusName = status.name || "Sem status"
            statusCounts[statusName] = (statusCounts[statusName] || 0) + 1
          })

          // Adicionar projetos sem status (payment_status)
          const { data: projectsWithoutStatus, error: projectsError } = await supabase
            .from("projects")
            .select("payment_status")
            .eq("company_id", companyId)
            .is("progress_status_id", null)
            .gte("created_at", dateRange.startDate)
            .lte("created_at", dateRange.endDate + "T23:59:59")

          if (projectsError) throw projectsError

          if (projectsWithoutStatus && projectsWithoutStatus.length > 0) {
            projectsWithoutStatus.forEach((project) => {
              const statusName = project.payment_status || "Sem status"
              statusCounts[statusName] = (statusCounts[statusName] || 0) + 1
            })
          }
        } else {
          // Se não houver status, usar payment_status como fallback
          const { data: projects, error: projectsError } = await supabase
            .from("projects")
            .select("payment_status")
            .eq("company_id", companyId)
            .gte("created_at", dateRange.startDate)
            .lte("created_at", dateRange.endDate + "T23:59:59")

          if (projectsError) throw projectsError

          if (projects && projects.length > 0) {
            projects.forEach((project) => {
              const statusName = project.payment_status || "Sem status"
              statusCounts[statusName] = (statusCounts[statusName] || 0) + 1
            })
          }
        }

        console.log("Status counts:", statusCounts)

        // Mapear para o formato esperado com cores
        const statusColors: Record<string, string> = {
          Orçamento: "#f59e0b",
          Aprovado: "#3b82f6",
          "Em produção": "#8b5cf6",
          Montagem: "#ec4899",
          Concluído: "#10b981",
          Cancelado: "#ef4444",
          pendente: "#f59e0b",
          parcialmente_pago: "#3b82f6",
          pago: "#10b981",
          atrasado: "#ef4444",
          "Sem status": "#6b7280",
        }

        const summary: ProjectStatusSummary[] = Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count,
          color: statusColors[status] || "#6b7280", // default to gray
        }))

        setProjectStatusSummary(summary)
      } catch (error) {
        console.error("Erro ao buscar resumo de status:", error)
        setProjectStatusSummary([])
      }
    }

    fetchDashboardData()
  }, [supabase, periodFilter]) // Adicionar periodFilter como dependência

  // Mostrar mensagem de erro específica sobre empresa não encontrada
  if (error && (
    error.message?.includes("Registro de empresa não encontrado") || 
    error.message?.includes("Usuário não está vinculado a nenhuma empresa")
  )) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Building className="h-8 w-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Vínculo com empresa não encontrado</h2>
        <p className="text-gray-500 text-center max-w-lg mb-6">
          {error.message?.includes("Usuário não está vinculado") 
            ? "Você ainda não está vinculado a nenhuma empresa. Por favor, verifique se você recebeu um convite ou entre em contato com o administrador."
            : "Não conseguimos encontrar os registros da sua empresa. Isso pode acontecer por diversos motivos:"}
        </p>
        
        {!error.message?.includes("Usuário não está vinculado") && (
          <ul className="text-gray-600 mb-6 list-disc pl-8 text-left w-full max-w-lg">
            <li className="mb-2">A empresa foi removida do sistema</li>
            <li className="mb-2">Seu acesso foi revogado</li>
            <li className="mb-2">Há um problema temporário com o banco de dados</li>
          </ul>
        )}
        
        <div className="flex gap-4">
          <Button 
            asChild 
            variant="default"
            className="bg-[#70645C] hover:bg-[#5d534c] text-white"
          >
            <Link href="/login">
              Voltar para o login
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline"
            className="border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10"
          >
            <Link href="/cadastro">
              Criar uma nova empresa
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Erro genérico
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Icons.warning className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Erro ao carregar dados</h2>
        <p className="text-gray-500 text-center max-w-lg mb-6">
          {error.message || 'Ocorreu um erro inesperado ao carregar os dados. Por favor, tente novamente mais tarde.'}
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-[#70645C] hover:bg-[#5d534c] text-white"
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (loadingProjects) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-10 w-52 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-36 bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-40 animate-pulse" />
            ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-40 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-56 animate-pulse" />
              ))}
          </div>
        </div>
      </div>
    )
  }

  const renderSkeleton = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <Skeleton width={120} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton width={80} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <Skeleton width={150} />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              <Skeleton width={150} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <Skeleton width={200} />
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  <Skeleton width={180} />
                </div>
                <Skeleton width={100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              <Skeleton width={150} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <Skeleton width={200} />
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  <Skeleton width={180} />
                </div>
                <Skeleton width={100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              <Skeleton width={200} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton width={20} height={20} className="rounded-full" />
                  <Skeleton width={120} />
                </div>
                <Skeleton width={50} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    let color = "neutral"
    switch (status) {
      case "Orçamento":
        color = "yellow"
        break
      case "Aprovado":
        color = "blue"
        break
      case "Em produção":
        color = "purple"
        break
      case "Montagem":
        color = "pink"
        break
      case "Concluído":
        color = "green"
        break
      case "Cancelado":
        color = "red"
        break
      default:
        color = "neutral"
        break
    }

    return (
      <Badge variant={color} className="capitalize">
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const renderDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diff = due.getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 3600 * 24))

    if (days < 0) {
      return <div className="text-red-500 text-xs">Atrasado</div>
    } else if (days === 0) {
      return <div className="text-orange-500 text-xs">Vence hoje</div>
    } else if (days <= 7) {
      return <div className="text-yellow-500 text-xs">Vence em {days} dias</div>
    } else {
      return <div className="text-gray-500 text-xs">Vence em {days} dias</div>
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Dashboard</h1>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodFilter)}>
            <SelectTrigger className="w-full md:w-[180px] border-[#e5e7eb] focus:ring-[#70645C] focus:ring-opacity-20">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">Este mês</SelectItem>
              <SelectItem value="last_month">Mês passado</SelectItem>
              <SelectItem value="this_quarter">Este trimestre</SelectItem>
              <SelectItem value="last_quarter">Trimestre passado</SelectItem>
              <SelectItem value="this_year">Este ano</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
          <Card className="bg-[#70645C] text-white border-none w-full md:w-auto">
            <CardContent className="flex items-center justify-center p-2">
              <Calendar size={14} className="mr-1" /> {new Date().toLocaleDateString("pt-BR")}
            </CardContent>
          </Card>
        </div>
      </div>

      {loadingProjects ? (
        renderSkeleton()
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="border border-[#e5e7eb] hover:shadow-md transition-shadow duration-300 ease-in-out bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#475569]">Total de Clientes</CardTitle>
                <Users size={18} className="text-[#70645C]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0f172a]">{stats.totalClients}</div>
                <p className="text-xs text-[#475569] mt-1">Clientes cadastrados</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/dashboard/clientes" className="text-xs text-[#70645C] hover:underline flex items-center transition-colors duration-300 ease-in-out">
                  Ver todos <ArrowRight size={12} className="ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="border border-[#e5e7eb] hover:shadow-md transition-shadow duration-300 ease-in-out bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#475569]">Projetos</CardTitle>
                <FolderOpen size={18} className="text-[#70645C]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0f172a]">{stats.totalProjects}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-xs text-[#16a34a] flex items-center">
                    <CheckCircle2 size={12} className="mr-1" /> {stats.completedProjects} concluídos
                  </div>
                  <div className="text-xs text-blue-600 flex items-center">
                    <LucideActivity size={12} className="mr-1" /> {stats.totalProjects - stats.completedProjects} em
                    andamento
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/dashboard/projetos" className="text-xs text-[#70645C] hover:underline flex items-center transition-colors duration-300 ease-in-out">
                  Ver todos <ArrowRight size={12} className="ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="border border-[#e5e7eb] hover:shadow-md transition-shadow duration-300 ease-in-out bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#475569]">Valor Total</CardTitle>
                <BarChart3 size={18} className="text-[#70645C]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0f172a]">{formatCurrency(stats.totalValue)}</div>
                <p className="text-xs text-[#475569] mt-1">Valor total dos projetos</p>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-xs text-[#70645C] flex items-center">
                  <DollarSign size={12} className="mr-1" /> Média:{" "}
                  {formatCurrency(stats.totalProjects > 0 ? stats.totalValue / stats.totalProjects : 0)}
                </div>
              </CardFooter>
            </Card>

            <Card className="border border-[#e5e7eb] hover:shadow-md transition-shadow duration-300 ease-in-out bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#475569]">Pagamentos Pendentes</CardTitle>
                <Clock size={18} className="text-[#70645C]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0f172a]">{formatCurrency(stats.pendingPayments)}</div>
                <p className="text-xs text-[#475569] mt-1">Valores a receber</p>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-xs text-yellow-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> {upcomingPayments.length} pagamentos próximos
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="border border-[#e5e7eb] bg-white">
              <CardHeader className="pb-2 bg-[#70645C]/10 border-b border-[#e5e7eb]">
                <CardTitle className="text-[#70645C] flex items-center text-lg font-medium">
                  <FolderOpen size={18} className="mr-2" /> Projetos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <div key={project.id} className="border-b border-[#e5e7eb] pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <Link
                          href={`/dashboard/projetos/${project.id}`}
                          className="font-medium text-[#0f172a] hover:text-[#70645C] hover:underline transition-colors duration-300 ease-in-out"
                        >
                          {project.name}
                        </Link>
                        {getStatusBadge(project.status_name)}
                      </div>
                      <div className="text-sm text-[#475569] mb-1">
                        Cliente: {project.client_name || "Sem cliente"} • {formatCurrency(project.total_value)}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-[#475569]">
                          <span>Progresso: {project.progress}%</span>
                        </div>
                      </div>
                      <Progress value={project.progress} className="h-1 mt-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[#475569]">Nenhum projeto encontrado</div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6">
                <Link href="/dashboard/projetos" className="text-sm text-[#70645C] hover:underline flex items-center transition-colors duration-300 ease-in-out">
                  Ver todos os projetos <ArrowRight size={14} className="ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Tabs defaultValue="tasks" className="w-full">
              <CardHeader className="pb-0 pt-4 px-4 bg-[#70645C]/10 border-b border-[#e5e7eb]">
                <div className="flex justify-between items-center">
                  <TabsList className="grid w-full grid-cols-2 h-9">
                    <TabsTrigger value="tasks" className="text-xs">
                      <Clock size={14} className="mr-1" /> Tarefas Pendentes
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="text-xs">
                      <DollarSign size={14} className="mr-1" /> Próximos Pagamentos
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>

              <TabsContent value="tasks" className="mt-0">
                <Card className="border-0 shadow-none bg-white">
                  <CardContent className="space-y-4 pt-4 p-6">
                    {pendingTasks.length > 0 ? (
                      pendingTasks.map((task) => (
                        <div key={task.id} className="border-b border-[#e5e7eb] pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-[#0f172a]">{task.name}</div>
                              <Link
                                href={`/dashboard/projetos/${task.project_id}`}
                                className="text-sm text-[#475569] hover:text-[#70645C] hover:underline transition-colors duration-300 ease-in-out"
                              >
                                {task.project_name} • {task.status_name}
                              </Link>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-600 border-yellow-200">Pendente</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-[#475569]">Nenhuma tarefa pendente</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <Card className="border-0 shadow-none bg-white">
                  <CardContent className="space-y-4 pt-4 p-6">
                    {upcomingPayments.length > 0 ? (
                      upcomingPayments.map((payment) => (
                        <div key={payment.id} className="border-b border-[#e5e7eb] pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-[#0f172a]">{formatCurrency(payment.amount)}</div>
                              <Link
                                href={`/dashboard/projetos/${payment.project_id}`}
                                className="text-sm text-[#475569] hover:text-[#70645C] hover:underline transition-colors duration-300 ease-in-out"
                              >
                                {payment.project_name}
                              </Link>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-[#0f172a]">{formatDate(payment.due_date)}</div>
                              {payment.due_date && renderDaysRemaining(payment.due_date)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-[#475569]">Nenhum pagamento próximo</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="border border-[#e5e7eb] bg-white">
              <CardHeader className="pb-2 bg-[#70645C]/10 border-b border-[#e5e7eb]">
                <CardTitle className="text-[#70645C] flex items-center text-lg font-medium">
                  <BarChart3 size={18} className="mr-2" /> Resumo de Projetos por Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {projectStatusSummary.length > 0 ? (
                  <div className="space-y-4">
                    {projectStatusSummary.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="capitalize text-[#0f172a]">{item.status.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-40 bg-[#f9fafb] rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                width: `${(item.count / stats.totalProjects) * 100}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[#0f172a]">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[#475569]">Nenhum projeto encontrado</div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6">
                <Link href="/dashboard/projetos" className="text-sm text-[#70645C] hover:underline flex items-center transition-colors duration-300 ease-in-out">
                  Gerenciar projetos <ArrowRight size={14} className="ml-1" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
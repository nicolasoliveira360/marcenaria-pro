"use client"

// Vamos melhorar a UI e UX do módulo de projetos, mantendo a identidade visual

// Substituir o componente inteiro por uma versão melhorada
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Calendar, DollarSign, FileText, Filter, Search, User, SortAsc, SortDesc, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]
type Client = Database["public"]["Tables"]["clients"]["Row"]
type ProjectStatus = Database["public"]["Tables"]["project_status"]["Row"]

export default function ProjetosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [projects, setProjects] = useState<
    (Project & { client_name: string; status_name: string | null; task_count: number; completed_tasks: number })[]
  >([])
  const [clients, setClients] = useState<Client[]>([])
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClient, setFilterClient] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPayment, setFilterPayment] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [activeView, setActiveView] = useState<string>("grid")
  const [filtersVisible, setFiltersVisible] = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
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
            const { data: clientsData } = await supabase
              .from("clients")
              .select("*")
              .eq("company_id", companyId)
              .order("name")

            setClients(clientsData || [])
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
    }
  }

  // Modificar a função fetchProjects para usar a nova lógica
  async function fetchProjects() {
    try {
      setLoading(true)
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
            // Buscar projetos da empresa
            const { data: projectsData } = await supabase
              .from("projects")
              .select("*, clients(name)")
              .eq("company_id", companyId)
              .order(sortField, { ascending: sortDirection === "asc" })

            if (projectsData) {
              // Criar um mapa de status para evitar múltiplas consultas
              const statusMap: { [key: string]: string } = {}

              // Buscar status de cada projeto e contar tarefas
              const projectsWithDetails = await Promise.all(
                projectsData.map(async (project: any) => {
                  let statusName = null

                  // Verificar se já temos o status em cache
                  if (project.progress_status_id && statusMap[project.progress_status_id]) {
                    statusName = statusMap[project.progress_status_id]
                  }
                  // Se não, buscar do banco
                  else if (project.progress_status_id) {
                    const { data: statusData } = await supabase
                      .from("project_status")
                      .select("name")
                      .eq("id", project.progress_status_id)
                      .single()

                    if (statusData) {
                      statusName = statusData.name
                      statusMap[project.progress_status_id] = statusName
                    }
                  }

                  // Buscar todos os status do projeto
                  const { data: projectStatuses } = await supabase
                    .from("project_status")
                    .select("id")
                    .eq("project_id", project.id)

                  // Inicializar contadores de tarefas
                  let taskCount = 0
                  let completedTasks = 0

                  // Se temos status, buscar tarefas para cada um
                  if (projectStatuses && projectStatuses.length > 0) {
                    for (const status of projectStatuses) {
                      const { data: tasks } = await supabase
                        .from("project_task")
                        .select("id, is_done")
                        .eq("project_status_id", status.id)

                      if (tasks && tasks.length > 0) {
                        taskCount += tasks.length
                        completedTasks += tasks.filter((t) => t.is_done).length
                      }
                    }
                  }

                  return {
                    ...project,
                    client_name: project.clients?.name || "Cliente não especificado",
                    status_name: statusName,
                    task_count: taskCount,
                    completed_tasks: completedTasks,
                  }
                }),
              )

              setProjects(projectsWithDetails)
              setStatuses(statusMap)
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar projetos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Função para aplicar todos os filtros
  const filteredProjects = projects.filter((project) => {
    // Filtro de busca
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de cliente
    const matchesClient = filterClient === "all" || project.client_id === filterClient

    // Filtro de status
    const matchesStatus = filterStatus === "all" || project.progress_status_id === filterStatus

    // Filtro de pagamento
    const matchesPayment = filterPayment === "all" || project.payment_status === filterPayment

    return matchesSearch && matchesClient && matchesStatus && matchesPayment
  })

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-600 border-yellow-200"
      case "parcialmente_pago":
        return "bg-blue-100 text-blue-600 border-blue-200"
      case "pago":
        return "bg-green-100 text-green-600 border-green-200"
      case "atrasado":
        return "bg-red-100 text-red-600 border-red-200"
      default:
        return "bg-gray-100 text-[#475569] border-gray-200"
    }
  }

  const formatPaymentStatus = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente"
      case "parcialmente_pago":
        return "Parcialmente Pago"
      case "pago":
        return "Pago"
      case "atrasado":
        return "Atrasado"
      default:
        return status
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return "R$ --"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFilterClient("all")
    setFilterStatus("all")
    setFilterPayment("all")
  }

  // Extrair status únicos dos projetos para o filtro
  const uniqueStatuses = Object.entries(statuses).map(([id, name]) => ({ id, name }))

  return (
    <div className="space-y-6">
      {/* Cabeçalho com título e botão de novo projeto */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-500 mt-1">Gerencie todos os seus projetos em um só lugar</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/projetos/novo")}
          className="bg-[#70645C] hover:bg-[#5d534c] text-white text-sm px-4 py-2 h-10 rounded-md flex items-center justify-center gap-2 transition-colors duration-300"
        >
          <Plus size={16} /> Novo Projeto
        </Button>
      </div>

      {/* Barra de busca e filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#70645C]" size={18} />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#e5e7eb] focus-visible:ring-[#70645C] focus-visible:ring-opacity-20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#475569] hover:text-[#70645C] transition-colors duration-300 ease-in-out"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#e5e7eb] text-[#475569] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300 ease-in-out"
              onClick={() => setFiltersVisible(!filtersVisible)}
            >
              <Filter size={16} className="mr-2" />
              Filtros
              {(filterClient !== "all" || filterStatus !== "all" || filterPayment !== "all") && (
                <Badge className="ml-2 bg-[#70645C] text-white border-[#70645C]/20">
                  {(filterClient !== "all" ? 1 : 0) +
                    (filterStatus !== "all" ? 1 : 0) +
                    (filterPayment !== "all" ? 1 : 0)}
                </Badge>
              )}
            </Button>

            <Tabs value={activeView} onValueChange={setActiveView} className="hidden md:block">
              <TabsList className="bg-[#f9fafb]">
                <TabsTrigger 
                  value="grid" 
                  className="data-[state=active]:bg-white data-[state=active]:text-[#70645C] data-[state=active]:shadow-sm"
                >
                  <div className="grid grid-cols-2 gap-0.5 h-4 w-4 mr-2"></div>
                  Cards
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="data-[state=active]:bg-white data-[state=active]:text-[#70645C] data-[state=active]:shadow-sm"
                >
                  <div className="flex flex-col gap-0.5 justify-center h-4 w-4 mr-2">
                    <div className="h-0.5 w-full bg-current"></div>
                    <div className="h-0.5 w-full bg-current"></div>
                    <div className="h-0.5 w-full bg-current"></div>
                  </div>
                  Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Filtros expandidos */}
        {filtersVisible && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[#e5e7eb]">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cliente</label>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="border-gray-200 focus:ring-[#70645C] focus:ring-opacity-20 h-10">
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-gray-200 focus:ring-[#70645C] focus:ring-opacity-20 h-10">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Pagamento</label>
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger className="border-gray-200 focus:ring-[#70645C] focus:ring-opacity-20 h-10">
                  <SelectValue placeholder="Todos os pagamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os pagamentos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="parcialmente_pago">Parcialmente Pago</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ordenar por</label>
              <div className="flex gap-2">
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="border-gray-200 focus:ring-[#70645C] focus:ring-opacity-20 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Data de criação</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="total_value">Valor</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  className="border-gray-200 text-gray-500 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300 h-10 w-10"
                >
                  {sortDirection === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
                </Button>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters} 
                className="text-gray-500 border-gray-200 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300 h-9"
              >
                <X size={14} className="mr-1" /> Limpar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-[#e5e7eb] animate-pulse bg-white">
              <CardHeader className="pb-2">
                <div className="h-6 bg-[#f9fafb] rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-[#f9fafb] rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="h-4 bg-[#f9fafb] rounded w-1/3"></div>
                  <div className="h-4 bg-[#f9fafb] rounded w-2/3"></div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-[#e5e7eb]">
                <div className="h-5 bg-[#f9fafb] rounded w-1/4"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum projeto encontrado</h3>
          <p className="mt-2 text-gray-500">
            {searchTerm || filterClient !== "all" || filterStatus !== "all" || filterPayment !== "all"
              ? "Nenhum projeto corresponde aos filtros aplicados."
              : "Você ainda não tem projetos cadastrados. Crie seu primeiro projeto!"}
          </p>
          <div className="mt-6">
            {searchTerm || filterClient !== "all" || filterStatus !== "all" || filterPayment !== "all" ? (
              <Button 
                onClick={resetFilters} 
                variant="outline" 
                className="mr-2 border-gray-200 text-gray-500 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
              >
                <X size={16} className="mr-2" /> Limpar filtros
              </Button>
            ) : null}
            <Button
              onClick={() => router.push("/dashboard/projetos/novo")}
              className="bg-[#70645C] hover:bg-[#5d534c] text-white text-sm px-4 py-2 h-10 rounded-md flex items-center justify-center gap-2 transition-colors duration-300"
            >
              <Plus size={16} /> Novo Projeto
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeView} className="w-full">
          {/* Visualização em Cards */}
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="border border-[#e5e7eb] shadow-sm hover:shadow transition-all duration-300 ease-in-out cursor-pointer group bg-white"
                  onClick={() => router.push(`/dashboard/projetos/${project.id}`)}
                >
                  <CardHeader className="pb-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-gray-900 line-clamp-1 transition-colors">
                        {project.name}
                      </CardTitle>
                      {project.status_name && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">{project.status_name}</Badge>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <User size={14} className="text-[#70645C] mr-1.5" />
                      <p className="text-sm text-gray-500">{project.client_name}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 p-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <DollarSign size={16} className="mr-2 text-gray-500" />
                        <span className="font-medium text-gray-900">{formatCurrency(project.total_value)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={16} className="mr-2" />
                        <span>Criado em {formatDate(project.created_at)}</span>
                      </div>

                      {/* Progresso e status de pagamento */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progresso</span>
                          <span className="font-medium text-gray-900">
                            {project.task_count > 0
                              ? Math.round((project.completed_tasks / project.task_count) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            project.task_count > 0
                              ? Math.round((project.completed_tasks / project.task_count) * 100)
                              : 0
                          }
                          className="h-1.5 bg-gray-100"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t border-[#e5e7eb] p-4">
                    <Badge className={getPaymentStatusColor(project.payment_status || "pendente")}>
                      {formatPaymentStatus(project.payment_status || "pendente")}
                    </Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Visualização em Lista */}
          <TabsContent value="list" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f9fafb] text-left">
                      <th className="px-4 py-3 text-sm font-medium text-[#475569]">
                        <button 
                          className="flex items-center hover:text-[#70645C] transition-colors duration-300 ease-in-out" 
                          onClick={() => toggleSort("name")}
                        >
                          Nome
                          {sortField === "name" &&
                            (sortDirection === "asc" ? (
                              <SortAsc size={14} className="ml-1" />
                            ) : (
                              <SortDesc size={14} className="ml-1" />
                            ))}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-[#475569]">Cliente</th>
                      <th className="px-4 py-3 text-sm font-medium text-[#475569]">Status</th>
                      <th className="px-4 py-3 text-sm font-medium text-[#475569]">
                        <button 
                          className="flex items-center hover:text-[#70645C] transition-colors duration-300 ease-in-out" 
                          onClick={() => toggleSort("total_value")}
                        >
                          Valor
                          {sortField === "total_value" &&
                            (sortDirection === "asc" ? (
                              <SortAsc size={14} className="ml-1" />
                            ) : (
                              <SortDesc size={14} className="ml-1" />
                            ))}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-[#475569]">Pagamento</th>
                      <th className="px-4 py-3 text-sm font-medium text-[#475569]">
                        <button 
                          className="flex items-center hover:text-[#70645C] transition-colors duration-300 ease-in-out" 
                          onClick={() => toggleSort("created_at")}
                        >
                          Data
                          {sortField === "created_at" &&
                            (sortDirection === "asc" ? (
                              <SortAsc size={14} className="ml-1" />
                            ) : (
                              <SortDesc size={14} className="ml-1" />
                            ))}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-[#475569]">Progresso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-t border-[#e5e7eb] hover:bg-[#f9fafb] cursor-pointer transition-colors duration-300 ease-in-out"
                        onClick={() => router.push(`/dashboard/projetos/${project.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#0f172a]">{project.name}</div>
                        </td>
                        <td className="px-4 py-3 text-[#475569]">{project.client_name}</td>
                        <td className="px-4 py-3">
                          {project.status_name ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">{project.status_name}</Badge>
                          ) : (
                            <span className="text-[#475569]/50">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#0f172a]">{formatCurrency(project.total_value)}</td>
                        <td className="px-4 py-3">
                          <Badge className={getPaymentStatusColor(project.payment_status)}>
                            {formatPaymentStatus(project.payment_status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[#475569] whitespace-nowrap">{formatDate(project.created_at)}</td>
                        <td className="px-4 py-3">
                          {project.task_count > 0 ? (
                            <div className="w-32">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#475569]">
                                  {Math.round((project.completed_tasks / project.task_count) * 100)}%
                                </span>
                                <span className="text-[#475569]">
                                  {project.completed_tasks}/{project.task_count}
                                </span>
                              </div>
                              <Progress
                                value={(project.completed_tasks / project.task_count) * 100}
                                className="h-1.5 bg-[#f9fafb]"
                              />
                            </div>
                          ) : (
                            <span className="text-[#475569]/50">Sem tarefas</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Resumo */}
      {!loading && filteredProjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-4 text-sm text-[#475569]">
          Exibindo {filteredProjects.length} de {projects.length} projetos
          {(searchTerm || filterClient !== "all" || filterStatus !== "all" || filterPayment !== "all") && (
            <>
              {" "}
              (filtrados)
              <Button 
                variant="link" 
                onClick={resetFilters} 
                className="text-[#70645C] font-medium px-2 py-0 h-auto hover:text-[#5d534c] transition-colors duration-300 ease-in-out"
              >
                Limpar filtros
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

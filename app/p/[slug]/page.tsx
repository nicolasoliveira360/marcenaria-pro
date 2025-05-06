"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Lock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  ExternalLink,
  Globe,
  Building,
  Clock,
  CheckCircle2,
  FileText,
  CreditCard,
  ImageIcon,
  Info,
  ChevronRight,
  DollarSign,
  Percent,
} from "lucide-react"
import { Logo } from "@/components/logo"
import {
  formatCurrency,
  formatDate,
  getPaymentStatusColor,
  getFileIcon,
  formatFileSize,
  getStatusColor,
} from "@/app/dashboard/projetos/[id]/utils/formatters"
import Image from "next/image"

import type { Database } from "@/lib/supabase/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]
type Client = Database["public"]["Tables"]["clients"]["Row"]
type Company = Database["public"]["Tables"]["companies"]["Row"]
type Payment = Database["public"]["Tables"]["payments"]["Row"]
type ProjectFile = Database["public"]["Tables"]["project_files"]["Row"] & { url?: string }
type ProjectStatus = Database["public"]["Tables"]["project_status"]["Row"]

export default function PublicProjectPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)

        // Buscar projeto pelo slug
        const { data: projectData, error } = await supabase.from("projects").select("*").eq("slug", slug).single()

        if (error || !projectData) {
          router.push("/404")
          return
        }

        setProject(projectData)

        // Verificar se precisa de senha
        if (projectData.password_hash) {
          setNeedsPassword(true)
        } else {
          setAuthenticated(true)
          await loadProjectData(projectData)
        }
      } catch (error) {
        console.error("Erro ao buscar projeto:", error)
        router.push("/404")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [slug, router, supabase])

  const loadProjectData = async (projectData: Project) => {
    try {
      // Buscar cliente
      if (projectData.client_id) {
        const { data: clientData } = await supabase.from("clients").select("*").eq("id", projectData.client_id).single()

        if (clientData) {
          setClient(clientData)
        }
      }

      // Buscar empresa
      if (projectData.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("id", projectData.company_id)
          .single()

        if (companyData) {
          setCompany(companyData)

          // Buscar logo da empresa
          if (companyData.logo_path) {
            try {
              const { data } = supabase.storage.from("company-logos").getPublicUrl(companyData.logo_path)
              setCompanyLogo(data.publicUrl)
            } catch (error) {
              console.error("Erro ao obter logo da empresa:", error)
            }
          } else if (companyData.logo_url) {
            setCompanyLogo(companyData.logo_url)
          }
        }
      }

      // Buscar status do projeto
      if (projectData.progress_status_id) {
        const { data: statusData } = await supabase
          .from("project_status")
          .select("*")
          .eq("id", projectData.progress_status_id)
          .single()

        if (statusData) {
          setProjectStatus(statusData)
        }
      }

      // Buscar pagamentos
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("project_id", projectData.id)
        .order("due_date")

      setPayments(paymentsData || [])

      // Buscar arquivos
      const { data: filesData } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectData.id)
        .order("created_at", { ascending: false })

      // Adicionar URLs públicas para os arquivos
      if (filesData && filesData.length > 0) {
        const filesWithUrls = await Promise.all(
          filesData.map(async (file) => {
            try {
              const { data } = supabase.storage.from("project-gallery").getPublicUrl(file.storage_path)

              return {
                ...file,
                url: data.publicUrl,
              }
            } catch (error) {
              console.error(`Erro ao obter URL para o arquivo ${file.id}:`, error)
              return file
            }
          }),
        )
        setFiles(filesWithUrls)
      }
    } catch (error) {
      console.error("Erro ao carregar dados do projeto:", error)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!project || !password) return

    if (password === project.password_hash) {
      setAuthenticated(true)
      setPasswordError(false)
      await loadProjectData(project)
    } else {
      setPasswordError(true)
    }
  }

  const calculateProgress = () => {
    if (!project || !payments.length) return 0

    const totalPaid = payments
      .filter((payment) => payment.status === "pago")
      .reduce((sum, payment) => sum + Number(payment.amount), 0)

    const totalValue = Number(project.total_value) || 0

    if (totalValue === 0) return 0
    return Math.min(100, Math.round((totalPaid / totalValue) * 100))
  }

  const getTotalPaid = () => {
    return payments
      .filter((payment) => payment.status === "pago")
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
  }

  const getRemainingAmount = () => {
    const totalValue = Number(project.total_value) || 0
    const totalPaid = getTotalPaid()
    return Math.max(0, totalValue - totalPaid)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500"
    if (progress >= 75) return "bg-emerald-500"
    if (progress >= 50) return "bg-amber-500"
    if (progress >= 25) return "bg-orange-500"
    return "bg-rose-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#70645C] border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (needsPassword && !authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f9fafb] to-[#f0f0f0]">
        <header className="bg-white border-b border-gray-100 py-4 shadow-sm">
          <div className="container mx-auto px-4">
            <Logo />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border border-gray-100 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-[#0f172a]">Acesso Protegido</CardTitle>
              <CardDescription className="text-gray-500">
                Este projeto requer autenticação para ser visualizado
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-[#70645C]/10 rounded-full flex items-center justify-center">
                  <Lock size={36} className="text-[#70645C]" />
                </div>
              </div>

              <p className="text-center mb-6 text-gray-600">
                Este projeto está protegido por senha. Por favor, insira a senha fornecida pelo responsável do projeto.
              </p>

              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Digite a senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20 h-12 text-base ${
                        passwordError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    {passwordError && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                        Senha incorreta. Tente novamente.
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#70645C] hover:bg-[#5d534c] text-white h-12 text-base font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Acessar Projeto
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <p className="text-[#475569] font-medium">Projeto não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <header className="bg-white border-b border-gray-100 py-4 px-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          {company && (
            <div className="flex items-center">
              {companyLogo ? (
                <div className="h-10 w-10 mr-3 overflow-hidden rounded-md border border-gray-100 bg-white p-1 shadow-sm">
                  <Image
                    src={companyLogo || "/placeholder.svg"}
                    alt={company.name}
                    width={40}
                    height={40}
                    className="object-contain h-full w-full"
                  />
                </div>
              ) : null}
              <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">{company.name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#70645C]"></div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</span>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-[#70645C]">{client?.name || "Cliente"}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2">{project.name}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className="bg-[#70645C] text-white px-2.5 py-0.5 text-xs font-medium">
                  {formatCurrency(project.total_value)}
                </Badge>
                <Badge className={`${getPaymentStatusColor(project.payment_status)} px-2.5 py-0.5 text-xs font-medium`}>
                  {project.payment_status === "pago"
                    ? "Pago"
                    : project.payment_status === "parcialmente_pago"
                      ? "Parcialmente Pago"
                      : project.payment_status === "atrasado"
                        ? "Atrasado"
                        : "Pendente"}
                </Badge>
                {projectStatus && (
                  <Badge className={`${getStatusColor(projectStatus.name)} px-2.5 py-0.5 text-xs font-medium`}>
                    {projectStatus.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm text-gray-500 mb-1">Criado em</div>
              <div className="font-medium">{formatDate(project.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Progresso de Pagamento */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gray-100">
              <div
                className={`h-full ${getProgressColor(calculateProgress())}`}
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <DollarSign size={18} className="mr-2 text-[#70645C]" />
                Progresso Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#70645C]"></div>
                    <span className="text-sm font-medium">Progresso</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold">{calculateProgress()}%</span>
                    <Percent size={14} className="text-gray-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Valor Pago</div>
                    <div className="text-base font-bold text-green-600">{formatCurrency(getTotalPaid())}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Valor Restante</div>
                    <div className="text-base font-bold text-amber-600">{formatCurrency(getRemainingAmount())}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Status do Projeto */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gray-100">
              <div
                className={`h-full ${projectStatus ? getStatusColor(projectStatus.name) : "bg-gray-300"}`}
                style={{ width: "100%" }}
              ></div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle2 size={18} className="mr-2 text-[#70645C]" />
                Status do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#70645C]" />
                    <span className="text-sm font-medium">Status Atual</span>
                  </div>
                  {projectStatus ? (
                    <Badge className={`${getStatusColor(projectStatus.name)} px-3 py-1`}>{projectStatus.name}</Badge>
                  ) : (
                    <span className="text-gray-500 italic text-sm">Não definido</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Data de Criação</div>
                    <div className="text-sm font-medium">{formatDate(project.created_at)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Prazo de Entrega</div>
                    <div className="text-sm font-medium">
                      {project.deadline ? formatDate(project.deadline) : "Não definido"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Informações da Empresa */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-[#70645C]"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Building size={18} className="mr-2 text-[#70645C]" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company ? (
                <div className="space-y-4">
                  {/* Logo e Nome da Empresa */}
                  <div className="flex items-center">
                    {companyLogo ? (
                      <div className="h-12 w-12 mr-3 border border-gray-100 rounded-md p-1 flex items-center justify-center bg-white shadow-sm">
                        <Image
                          src={companyLogo || "/placeholder.svg"}
                          alt={company.name}
                          width={40}
                          height={40}
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 mr-3 bg-gray-100 rounded-md flex items-center justify-center">
                        <Building size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{company.name}</h3>
                      {company.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{company.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-gray-100">
                    {company.phone && (
                      <div className="flex items-start">
                        <Phone size={14} className="mr-2 text-[#70645C] mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{company.phone}</span>
                      </div>
                    )}

                    {company.email && (
                      <div className="flex items-start">
                        <Mail size={14} className="mr-2 text-[#70645C] mt-0.5 flex-shrink-0" />
                        <span className="text-sm break-all">{company.email}</span>
                      </div>
                    )}

                    {company.website && (
                      <div className="flex items-start">
                        <Globe size={14} className="mr-2 text-[#70645C] mt-0.5 flex-shrink-0" />
                        <a
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}

                    {company.address && (
                      <div className="flex items-start">
                        <MapPin size={14} className="mr-2 text-[#70645C] mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{company.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Informações de contato não disponíveis.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-100">
              <div className="container mx-auto">
                <TabsList className="bg-transparent h-14 p-0 w-full flex justify-start">
                  <TabsTrigger
                    value="info"
                    className={`h-full px-6 data-[state=active]:border-b-2 data-[state=active]:border-[#70645C] data-[state=active]:shadow-none rounded-none text-base font-medium transition-all ${
                      activeTab === "info" ? "text-[#70645C]" : "text-gray-500"
                    }`}
                  >
                    <Info size={18} className="mr-2" />
                    Informações
                  </TabsTrigger>
                  <TabsTrigger
                    value="payments"
                    className={`h-full px-6 data-[state=active]:border-b-2 data-[state=active]:border-[#70645C] data-[state=active]:shadow-none rounded-none text-base font-medium transition-all ${
                      activeTab === "payments" ? "text-[#70645C]" : "text-gray-500"
                    }`}
                  >
                    <CreditCard size={18} className="mr-2" />
                    Pagamentos
                  </TabsTrigger>
                  <TabsTrigger
                    value="files"
                    className={`h-full px-6 data-[state=active]:border-b-2 data-[state=active]:border-[#70645C] data-[state=active]:shadow-none rounded-none text-base font-medium transition-all ${
                      activeTab === "files" ? "text-[#70645C]" : "text-gray-500"
                    }`}
                  >
                    <FileText size={18} className="mr-2" />
                    Arquivos
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="info" className="p-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Detalhes do Projeto</h2>
                {project.description ? (
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">{project.description}</div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 italic">Nenhuma descrição disponível para este projeto.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="p-6 focus-visible:outline-none focus-visible:ring-0">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pagamentos</h2>
              {payments.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <CreditCard size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 italic">Nenhum pagamento registrado para este projeto.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          Data de Vencimento
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          Valor
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          Status
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          Data de Pagamento
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          Descrição
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3.5 px-4 text-sm text-gray-700">{formatDate(payment.due_date)}</td>
                          <td className="py-3.5 px-4 text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              className={`${getPaymentStatusColor(
                                payment.status,
                              )} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                            >
                              {payment.status === "pago"
                                ? "Pago"
                                : payment.status === "parcialmente_pago"
                                  ? "Parcialmente Pago"
                                  : payment.status === "atrasado"
                                    ? "Atrasado"
                                    : "Pendente"}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-sm text-gray-700">
                            {payment.paid_at ? formatDate(payment.paid_at) : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-sm text-gray-700 max-w-xs truncate">
                            {payment.description || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="p-6 focus-visible:outline-none focus-visible:ring-0">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Arquivos do Projeto</h2>
              {files.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 italic">Nenhum arquivo disponível para este projeto.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="border border-gray-100 rounded-lg p-4 flex flex-col bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-md mr-3">
                          {getFileIcon(file.mime_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-900">
                            {file.file_name || file.storage_path.split("/").pop()}
                          </p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size_bytes)}</p>
                        </div>
                      </div>
                      <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-100">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(file.created_at)}
                        </span>
                        <div className="flex gap-2">
                          {file.url && file.mime_type?.startsWith("image/") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                              onClick={() => window.open(file.url, "_blank")}
                            >
                              <ExternalLink size={14} className="mr-1" /> Ver
                            </Button>
                          )}
                          {file.url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 text-[#70645C] border-[#70645C] hover:bg-[#70645C] hover:text-white"
                              asChild
                            >
                              <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                <Download size={14} className="mr-1" /> Baixar
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Logo className="mr-2" />
            <span className="text-sm text-gray-500">© {new Date().getFullYear()} Todos os direitos reservados.</span>
          </div>
          {company && (
            <div className="flex items-center text-sm text-gray-500">
              <Building size={14} className="mr-1.5" />
              <span>{company.name}</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Grid3X3,
  List,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Trash,
  User,
  X,
  Lock,
} from "lucide-react"
import { getClientWithCompany } from "@/lib/supabase/client-utils"
import { useCrudGuard } from "@/contexts/crud-guard-provider"

// Atualizar o tipo Cliente para usar a tabela correta
type Cliente = Database["public"]["Tables"]["clients"]["Row"]

export default function ClientesPage() {
  const supabase = createClientComponentClient<Database>()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  // Atualizar o estado formData para usar os nomes de campos corretos
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    address_neigh: "",
    company_id: "",
  })
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [showFilters, setShowFilters] = useState(false)
  const [cityFilter, setCityFilter] = useState<string>("")
  // Atualizar o estado sortField para usar o nome de campo correto
  const [sortField, setSortField] = useState<keyof Cliente>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [uniqueCities, setUniqueCities] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { executeCrudOperation, canPerformCrud } = useCrudGuard()

  useEffect(() => {
    async function initialize() {
      try {
        // Obter o ID da empresa do usuário logado
        const { companyId: userCompanyId } = await getClientWithCompany()
        setCompanyId(userCompanyId)

        // Atualizar o formData com o company_id
        setFormData((prev) => ({ ...prev, company_id: userCompanyId }))

        // Buscar os clientes
        await fetchClientes(userCompanyId)
      } catch (error) {
        console.error("Error initializing:", error)
      }
    }

    initialize()
  }, [])

  // Atualizar a função fetchClientes para usar a tabela "clients" em vez de "clientes"
  async function fetchClientes(companyIdParam?: string) {
    try {
      setLoading(true)
      const companyIdToUse = companyIdParam || companyId

      if (!companyIdToUse) {
        throw new Error("ID da empresa não encontrado")
      }

      const { data, error } = await supabase.from("clients").select("*").eq("company_id", companyIdToUse).order("name")

      if (error) {
        throw error
      }

      if (data) {
        setClientes(data)

        // Extract unique cities for filtering
        const cities = [...new Set(data.map((cliente) => cliente.address_city).filter(Boolean))]
        setUniqueCities(cities as string[])
      }
    } catch (error) {
      console.error("Error fetching clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Garantir que o company_id esteja definido
      if (!companyId) {
        throw new Error("ID da empresa não encontrado")
      }

      // Garantir que o company_id esteja no formData
      const dataToSubmit = {
        ...formData,
        company_id: companyId,
      }

      if (currentCliente) {
        // Update existing cliente
        const { error } = await supabase.from("clients").update(dataToSubmit).eq("id", currentCliente.id)

        if (error) throw error
      } else {
        // Insert new cliente
        const { error } = await supabase.from("clients").insert([dataToSubmit])

        if (error) throw error
      }

      setOpenDialog(false)
      resetForm()
      fetchClientes()
    } catch (error) {
      console.error("Error saving cliente:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Atualizar a função handleEdit para usar os nomes de campos corretos
  const handleEdit = (cliente: Cliente) => {
    setCurrentCliente(cliente)
    setFormData({
      name: cliente.name || "",
      email: cliente.email || "",
      phone: cliente.phone || "",
      address_street: cliente.address_street || "",
      address_city: cliente.address_city || "",
      address_state: cliente.address_state || "",
      address_zip: cliente.address_zip || "",
      address_neigh: cliente.address_neigh || "",
      company_id: cliente.company_id || companyId || "",
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id)

      if (error) throw error

      fetchClientes()
    } catch (error) {
      console.error("Error deleting cliente:", error)
    }
  }

  // Atualizar a função resetForm para usar os nomes de campos corretos
  const resetForm = () => {
    setCurrentCliente(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      address_street: "",
      address_city: "",
      address_state: "",
      address_zip: "",
      address_neigh: "",
      company_id: companyId || "",
    })
  }

  const handleAddNew = () => {
    resetForm()
    setOpenDialog(true)
  }

  const handleSort = (field: keyof Cliente) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: keyof Cliente) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />
  }

  // Atualizar a função filteredClientes para usar os nomes de campos corretos
  const filteredClientes = clientes
    .filter((cliente) => {
      const matchesSearch =
        cliente.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.phone?.includes(searchTerm)

      const matchesCity = !cityFilter || cliente.address_city === cityFilter

      return matchesSearch && matchesCity
    })
    .sort((a, b) => {
      const aValue = a[sortField] || ""
      const bValue = b[sortField] || ""

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-[250px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[180px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[120px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-[100px]" />
          </TableCell>
        </TableRow>
      ))
  }

  const renderCardSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, i) => (
        <Card key={i} className="overflow-hidden border border-[#e5e7eb]">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[220px]" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-[100px]" />
          </CardFooter>
        </Card>
      ))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500 mt-1">Gerencie todos os seus clientes em um só lugar</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#70645C]" size={18} />
          <Input
            placeholder="Buscar clientes..."
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
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} className="mr-2" />
            Filtros
            {showFilters ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
          </Button>

          <div className="flex border rounded-md overflow-hidden border-[#e5e7eb]">
            <Button
              variant="ghost"
              className={`px-3 rounded-none transition-colors duration-300 ease-in-out ${
                viewMode === "table" ? "bg-[#70645C] text-white" : "hover:bg-[#70645C]/10 hover:text-[#70645C] text-[#475569]"
              }`}
              onClick={() => setViewMode("table")}
            >
              <List size={18} />
            </Button>
            <Button
              variant="ghost"
              className={`px-3 rounded-none transition-colors duration-300 ease-in-out ${
                viewMode === "cards" ? "bg-[#70645C] text-white" : "hover:bg-[#70645C]/10 hover:text-[#70645C] text-[#475569]"
              }`}
              onClick={() => setViewMode("cards")}
            >
              <Grid3X3 size={18} />
            </Button>
          </div>

          <Button 
            className={`bg-[#70645C] hover:bg-[#5d534c] text-white transition-colors duration-300 ease-in-out ${!canPerformCrud ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => executeCrudOperation(() => setOpenDialog(true))}
            disabled={!canPerformCrud}
          >
            {canPerformCrud ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Recurso Premium
              </>
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="border-gray-200 shadow-sm animate-in fade-in-50 duration-200 bg-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cityFilter" className="text-gray-700 text-sm font-medium">Filtrar por cidade</Label>
                <select
                  id="cityFilter"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70645C] focus-visible:ring-opacity-20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todas as cidades</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="sortField" className="text-gray-700 text-sm font-medium">Ordenar por</Label>
                <select
                  id="sortField"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as keyof Cliente)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70645C] focus-visible:ring-opacity-20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="name">Nome</option>
                  <option value="email">Email</option>
                  <option value="address_city">Cidade</option>
                  <option value="address_state">Estado</option>
                </select>
              </div>

              <div>
                <Label htmlFor="sortDirection" className="text-gray-700 text-sm font-medium">Direção</Label>
                <select
                  id="sortDirection"
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70645C] focus-visible:ring-opacity-20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="asc">Crescente</option>
                  <option value="desc">Decrescente</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "table" ? (
        <Card className="border-[#e5e7eb] shadow-sm bg-white">
          <CardHeader className="pb-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
            <CardTitle className="text-lg text-gray-900 flex items-center">
              <User size={18} className="mr-2 text-[#70645C]" /> Lista de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f9fafb] hover:bg-[#f9fafb]">
                  <TableHead className="cursor-pointer hover:text-[#70645C] transition-colors duration-300 ease-in-out" onClick={() => handleSort("name")}>
                    <div className="flex items-center">Nome {getSortIcon("name")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-[#70645C] transition-colors duration-300 ease-in-out" onClick={() => handleSort("email")}>
                    <div className="flex items-center">Email {getSortIcon("email")}</div>
                  </TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="cursor-pointer hover:text-[#70645C] transition-colors duration-300 ease-in-out" onClick={() => handleSort("address_city")}>
                    <div className="flex items-center">Cidade {getSortIcon("address_city")}</div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-[#70645C] transition-colors duration-300 ease-in-out"
                    onClick={() => handleSort("address_state")}
                  >
                    <div className="flex items-center">Estado {getSortIcon("address_state")}</div>
                  </TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  renderSkeletons()
                ) : filteredClientes.length > 0 ? (
                  filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-[#f9fafb]">
                      <TableCell className="font-medium text-[#0f172a]">{cliente.name}</TableCell>
                      <TableCell>
                        {cliente.email && (
                          <a
                            href={`mailto:${cliente.email}`}
                            className="text-[#70645C] hover:underline flex items-center transition-colors duration-300 ease-in-out"
                          >
                            <Mail size={14} className="mr-1" />
                            {cliente.email}
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        {cliente.phone && (
                          <a href={`tel:${cliente.phone}`} className="text-[#475569] hover:text-[#70645C] hover:underline flex items-center transition-colors duration-300 ease-in-out">
                            <Phone size={14} className="mr-1" />
                            {cliente.phone}
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-[#475569]">{cliente.address_city}</TableCell>
                      <TableCell className="text-[#475569]">{cliente.address_state}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cliente)}
                            className="h-8 border-[#e5e7eb] text-[#70645C] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300 ease-in-out"
                          >
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors duration-300 ease-in-out"
                              >
                                <Trash size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="text-[#475569]">
                                  Tem certeza que deseja excluir o cliente {cliente.name}? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-[#e5e7eb] text-[#475569] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300 ease-in-out">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cliente.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300 ease-in-out"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#475569]">
                      {searchTerm || cityFilter ? (
                        <div className="flex flex-col items-center">
                          <Search size={40} className="text-[#70645C]/30 mb-2" />
                          <p>Nenhum cliente encontrado com os filtros atuais.</p>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm("")
                              setCityFilter("")
                            }}
                            className="text-[#70645C] mt-1 hover:text-[#5d534c] transition-colors duration-300 ease-in-out"
                          >
                            Limpar filtros
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <User size={40} className="text-[#70645C]/30 mb-2" />
                          <p>Nenhum cliente cadastrado ainda.</p>
                          <Button 
                            variant="link" 
                            onClick={() => executeCrudOperation(() => setOpenDialog(true))}
                            disabled={!canPerformCrud}
                            className="text-[#70645C] mt-1 hover:text-[#5d534c] transition-colors duration-300 ease-in-out"
                          >
                            Adicionar seu primeiro cliente
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            renderCardSkeletons()
          ) : filteredClientes.length > 0 ? (
            filteredClientes.map((cliente) => (
              <Card className="border border-[#e5e7eb] shadow-sm bg-white hover:shadow transition-all duration-300 ease-in-out">
                <CardHeader className="pb-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <User size={18} className="mr-2 text-[#70645C]" />
                    {cliente.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4">
                  {cliente.email && (
                    <a href={`mailto:${cliente.email}`} className="text-[#70645C] hover:underline flex items-center transition-colors duration-300 ease-in-out">
                      <Mail size={16} className="mr-2" />
                      {cliente.email}
                    </a>
                  )}
                  {cliente.phone && (
                    <a href={`tel:${cliente.phone}`} className="text-[#475569] hover:text-[#70645C] hover:underline flex items-center transition-colors duration-300 ease-in-out">
                      <Phone size={16} className="mr-2" />
                      {cliente.phone}
                    </a>
                  )}
                  {(cliente.address_city || cliente.address_state) && (
                    <div className="flex items-center text-[#475569]">
                      <MapPin size={16} className="mr-2" />
                      {[cliente.address_city, cliente.address_state].filter(Boolean).join(" - ")}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between pt-2 border-t border-[#e5e7eb] p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cliente)}
                    className="border-[#e5e7eb] text-[#70645C] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300 ease-in-out"
                  >
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors duration-300 ease-in-out"
                      >
                        <Trash size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#475569]">
                          Tem certeza que deseja excluir o cliente {cliente.name}? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-[#e5e7eb] text-[#475569] hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300 ease-in-out">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(cliente.id)}
                          className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300 ease-in-out"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-[#475569]">
              {searchTerm || cityFilter ? (
                <div className="flex flex-col items-center">
                  <Search size={48} className="text-[#70645C]/30 mb-3" />
                  <p className="text-lg">Nenhum cliente encontrado com os filtros atuais.</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchTerm("")
                      setCityFilter("")
                    }}
                    className="text-[#70645C] mt-2 hover:text-[#5d534c] transition-colors duration-300 ease-in-out"
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <User size={48} className="text-[#70645C]/30 mb-3" />
                  <p className="text-lg">Nenhum cliente cadastrado ainda.</p>
                  <Button 
                    variant="link" 
                    onClick={() => executeCrudOperation(() => setOpenDialog(true))}
                    disabled={!canPerformCrud}
                    className="text-[#70645C] mt-2 hover:text-[#5d534c] transition-colors duration-300 ease-in-out"
                  >
                    Adicionar seu primeiro cliente
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[550px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#0f172a]">{currentCliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription className="text-[#475569]">
              {currentCliente
                ? "Edite as informações do cliente abaixo."
                : "Preencha as informações para adicionar um novo cliente."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 text-sm font-medium">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 text-sm font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_zip" className="text-gray-700 text-sm font-medium">
                    CEP
                  </Label>
                  <Input
                    id="address_zip"
                    name="address_zip"
                    value={formData.address_zip}
                    onChange={handleInputChange}
                    className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_street" className="text-gray-700 text-sm font-medium">
                  Endereço
                </Label>
                <Input
                  id="address_street"
                  name="address_street"
                  value={formData.address_street}
                  onChange={handleInputChange}
                  className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_neigh" className="text-gray-700 text-sm font-medium">
                  Bairro
                </Label>
                <Input
                  id="address_neigh"
                  name="address_neigh"
                  value={formData.address_neigh}
                  onChange={handleInputChange}
                  className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_city" className="text-gray-700 text-sm font-medium">
                    Cidade
                  </Label>
                  <Input
                    id="address_city"
                    name="address_city"
                    value={formData.address_city}
                    onChange={handleInputChange}
                    className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state" className="text-gray-700 text-sm font-medium">
                    Estado
                  </Label>
                  <Input
                    id="address_state"
                    name="address_state"
                    value={formData.address_state}
                    onChange={handleInputChange}
                    className="h-10 border-gray-200 focus:border-[#70645C] focus:ring focus:ring-[#70645C] focus:ring-opacity-20"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="border-gray-200 text-gray-500 hover:bg-[#70645C]/10 hover:text-[#70645C] hover:border-[#70645C]/30 transition-colors duration-300"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-[#70645C] hover:bg-[#5d534c] text-white text-sm px-4 py-2 h-10 rounded-md flex items-center justify-center gap-2 transition-colors duration-300"
              >
                {isSubmitting ? "Salvando..." : currentCliente ? "Salvar Alterações" : "Adicionar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

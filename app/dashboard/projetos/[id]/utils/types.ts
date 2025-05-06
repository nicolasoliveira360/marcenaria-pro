export interface Project {
  id: string
  name: string
  description: string | null
  client_id: string | null
  company_id: string
  status_id: string | null
  deadline: string | null
  total_value: number | null
  payment_status: string | null
  slug: string | null
  password_hash: string | null
  created_at: string
  updated_at: string
}

export interface ProjectStatus {
  id: string
  project_id: string
  name: string
  position: number
  created_at: string
}

export interface ProjectTask {
  id: string
  project_status_id: string
  name: string
  position: number
  is_done: boolean
  created_at: string
}

export interface ProjectFile {
  id: string
  project_id: string
  file_name: string
  storage_path: string
  mime_type: string | null
  size_bytes: number | null
  uploaded_by: string | null
  created_at: string
  url?: string // Campo adicional para URL pública
}

export interface Payment {
  id: string
  project_id: string
  due_date: string
  amount: number
  status: string
  paid_at: string | null
  created_at: string
  description: string | null
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  address_street: string | null
  address_neigh: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  created_at: string
}

export interface StatusOption {
  id: string
  name: string
}

export interface FormattedTask {
  id: string
  title: string
  completed: boolean
  status: string
}

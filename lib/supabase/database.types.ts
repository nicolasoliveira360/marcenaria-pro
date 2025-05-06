export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          company_id: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          company_id: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          company_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          id: string
          created_at: string
          name: string
          owner_id: string
          logo_url: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          owner_id: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          owner_id?: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_user_roles: {
        Row: {
          id: string
          created_at: string
          company_id: string
          user_id: string
          role: string
          status: string
          invitation_token: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          company_id: string
          user_id: string
          role: string
          status?: string
          invitation_token?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          company_id?: string
          user_id?: string
          role?: string
          status?: string
          invitation_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_user_roles_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_user_roles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          project_id: string
          due_date: string
          amount: number
          status: string
          paid_at: string | null
          created_at: string
          description: string | null
        }
        Insert: {
          id?: string
          project_id: string
          due_date: string
          amount: number
          status?: string
          paid_at?: string | null
          created_at?: string
          description?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          due_date?: string
          amount?: number
          status?: string
          paid_at?: string | null
          created_at?: string
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          email: string | null
          current_company_id: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
          current_company_id?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
          current_company_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_company_id_fkey"
            columns: ["current_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          id: string
          created_at: string
          project_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          uploaded_by: string
          company_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          uploaded_by: string
          company_id: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          uploaded_by?: string
          company_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_status: {
        Row: {
          id: string
          created_at: string
          name: string
          company_id: string
          project_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          company_id: string
          project_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          company_id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_status_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_status_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_task: {
        Row: {
          id: string
          created_at: string
          title: string
          completed: boolean
          project_id: string
          status_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          completed?: boolean
          project_id: string
          status_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          completed?: boolean
          project_id?: string
          status_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_task_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_task_status_id_fkey"
            columns: ["status_id"]
            referencedRelation: "project_status"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          client_id: string | null
          company_id: string
          progress_status_id: string | null
          deadline: string | null
          total_value: number | null
          payment_status: string | null
          slug: string | null
          password_hash: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          client_id?: string | null
          company_id: string
          progress_status_id?: string | null
          deadline?: string | null
          total_value?: number | null
          payment_status?: string | null
          slug?: string | null
          password_hash?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          client_id?: string | null
          company_id?: string
          progress_status_id?: string | null
          deadline?: string | null
          total_value?: number | null
          payment_status?: string | null
          slug?: string | null
          password_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_progress_status_id_fkey"
            columns: ["progress_status_id"]
            referencedRelation: "project_status"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

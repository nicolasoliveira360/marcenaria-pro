export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          tax_id: string
          email: string
          phone: string | null
          address_street: string | null
          address_neigh: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
          logo_url: string | null
          created_at: string | null
          updated_at: string | null
          plan: 'free' | 'paid' | null
          billing_interval: 'monthly' | 'annual' | null
          lastlink_status: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired' | null
          lastlink_sub_id: string | null
          current_period_end: string | null
        }
        Insert: {
          id?: string
          name: string
          tax_id: string
          email: string
          phone?: string | null
          address_street?: string | null
          address_neigh?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          plan?: 'free' | 'paid' | null
          billing_interval?: 'monthly' | 'annual' | null
          lastlink_status?: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired' | null
          lastlink_sub_id?: string | null
          current_period_end?: string | null
        }
        Update: {
          id?: string
          name?: string
          tax_id?: string
          email?: string
          phone?: string | null
          address_street?: string | null
          address_neigh?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          plan?: 'free' | 'paid' | null
          billing_interval?: 'monthly' | 'annual' | null
          lastlink_status?: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired' | null
          lastlink_sub_id?: string | null
          current_period_end?: string | null
        }
        Relationships: []
      }
      company_user_roles: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'collaborator'
          created_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'collaborator'
          created_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'collaborator'
          created_at?: string | null
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lastlink_subscriptions: {
        Row: {
          id: string
          company_id: string
          subscription_id: string
          product_id: string
          status: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired'
          current_period_end: string | null
          created_at: string | null
          updated_at: string | null
          billing_interval: 'monthly' | 'annual' | null
        }
        Insert: {
          id?: string
          company_id: string
          subscription_id: string
          product_id: string
          status: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired'
          current_period_end?: string | null
          created_at?: string | null
          updated_at?: string | null
          billing_interval?: 'monthly' | 'annual' | null
        }
        Update: {
          id?: string
          company_id?: string
          subscription_id?: string
          product_id?: string
          status?: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired'
          current_period_end?: string | null
          created_at?: string | null
          updated_at?: string | null
          billing_interval?: 'monthly' | 'annual' | null
        }
        Relationships: [
          {
            foreignKeyName: "lastlink_subscriptions_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      lastlink_products: {
        Row: {
          product_id: string
          billing_interval: 'monthly' | 'annual'
        }
        Insert: {
          product_id: string
          billing_interval: 'monthly' | 'annual'
        }
        Update: {
          product_id?: string
          billing_interval?: 'monthly' | 'annual'
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      handle_lastlink_active: {
        Args: {
          p_company_id: string
          p_sub_id: string
          p_product_id: string
          p_period_end: string | null
        }
        Returns: Json
      }
      handle_lastlink_canceled: {
        Args: {
          p_company_id: string
          p_sub_id: string
          p_period_end: string | null
        }
        Returns: Json
      }
      handle_lastlink_expired: {
        Args: {
          p_company_id: string
          p_sub_id: string
          p_period_end: string | null
        }
        Returns: Json
      }
      handle_lastlink_past_due: {
        Args: {
          p_company_id: string
          p_sub_id: string
          p_period_end: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      billing_interval_enum: 'monthly' | 'annual'
      lastlink_status_enum: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired'
      plan_enum: 'free' | 'paid'
      role_enum: 'owner' | 'admin' | 'collaborator'
    }
  }
} 
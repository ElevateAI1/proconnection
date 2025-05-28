export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      affiliate_codes: {
        Row: {
          code: string
          commission_rate: number
          created_at: string
          discount_rate: number
          id: string
          is_active: boolean
          psychologist_id: string
          secondary_commission_rate: number
          updated_at: string
        }
        Insert: {
          code: string
          commission_rate?: number
          created_at?: string
          discount_rate?: number
          id?: string
          is_active?: boolean
          psychologist_id: string
          secondary_commission_rate?: number
          updated_at?: string
        }
        Update: {
          code?: string
          commission_rate?: number
          created_at?: string
          discount_rate?: number
          id?: string
          is_active?: boolean
          psychologist_id?: string
          secondary_commission_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_codes_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_codes_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          psychologist_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          psychologist_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          psychologist_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_code_id: string
          commission_earned: number | null
          created_at: string
          discount_applied: number | null
          id: string
          referred_psychologist_id: string
          referrer_psychologist_id: string
          status: string
          subscription_start_date: string | null
          updated_at: string
        }
        Insert: {
          affiliate_code_id: string
          commission_earned?: number | null
          created_at?: string
          discount_applied?: number | null
          id?: string
          referred_psychologist_id: string
          referrer_psychologist_id: string
          status?: string
          subscription_start_date?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_code_id?: string
          commission_earned?: number | null
          created_at?: string
          discount_applied?: number | null
          id?: string
          referred_psychologist_id?: string
          referrer_psychologist_id?: string
          status?: string
          subscription_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_code_id_fkey"
            columns: ["affiliate_code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_referred_psychologist_id_fkey"
            columns: ["referred_psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_referred_psychologist_id_fkey"
            columns: ["referred_psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_referrer_psychologist_id_fkey"
            columns: ["referrer_psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_referrer_psychologist_id_fkey"
            columns: ["referrer_psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          preferred_date: string
          preferred_time: string
          psychologist_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          preferred_date: string
          preferred_time: string
          psychologist_id: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          preferred_date?: string
          preferred_time?: string
          psychologist_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_appointment_requests_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment_requests_psychologist"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment_requests_psychologist"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          duration_minutes: number | null
          id: string
          meeting_url: string | null
          notes: string | null
          patient_id: string
          psychologist_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          patient_id: string
          psychologist_id: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string
          psychologist_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          patient_id: string
          psychologist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          patient_id: string
          psychologist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          patient_id?: string
          psychologist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_documents: {
        Row: {
          content: Json
          created_at: string
          id: string
          patient_id: string
          psychologist_id: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          patient_id: string
          psychologist_id: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          patient_id?: string
          psychologist_id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          psychologist_id: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          first_name: string
          id: string
          last_name: string
          notes?: string | null
          phone?: string | null
          psychologist_id: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          psychologist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_patients_psychologist"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patients_psychologist"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
          user_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      psychologists: {
        Row: {
          affiliate_code_id: string | null
          affiliate_earnings: number | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          license_number: string | null
          phone: string | null
          professional_code: string
          specialization: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          total_referrals: number | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
        }
        Insert: {
          affiliate_code_id?: string | null
          affiliate_earnings?: number | null
          created_at?: string
          first_name: string
          id: string
          last_name: string
          license_number?: string | null
          phone?: string | null
          professional_code: string
          specialization?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          total_referrals?: number | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_code_id?: string | null
          affiliate_earnings?: number | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          license_number?: string | null
          phone?: string | null
          professional_code?: string
          specialization?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          total_referrals?: number | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologists_affiliate_code_id_fkey"
            columns: ["affiliate_code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologists_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: string[]
          id: string
          is_recommended: boolean
          original_price_display: string | null
          period: string
          plan_key: string
          price_cents: number
          price_display: string
          savings_text: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          features: string[]
          id?: string
          is_recommended?: boolean
          original_price_display?: string | null
          period: string
          plan_key: string
          price_cents: number
          price_display: string
          savings_text?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: string[]
          id?: string
          is_recommended?: boolean
          original_price_display?: string | null
          period?: string
          plan_key?: string
          price_cents?: number
          price_display?: string
          savings_text?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      psychologist_stats: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          is_expired: boolean | null
          last_name: string | null
          professional_code: string | null
          subscription_days_remaining: number | null
          subscription_end_date: string | null
          subscription_status: string | null
          trial_days_remaining: number | null
          trial_end_date: string | null
          trial_start_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychologists_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_update_subscription_status: {
        Args: {
          psychologist_id: string
          new_status: string
          subscription_days?: number
        }
        Returns: undefined
      }
      admin_update_trial_days: {
        Args: { psychologist_id: string; additional_days: number }
        Returns: undefined
      }
      calculate_affiliate_commission: {
        Args: { affiliate_code_id: string; subscription_amount: number }
        Returns: number
      }
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_professional_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_trial_days_remaining: {
        Args: { psychologist_id: string }
        Returns: number
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_trial_expired: {
        Args: { psychologist_id: string }
        Returns: boolean
      }
      validate_affiliate_code: {
        Args: { input_code: string }
        Returns: string
      }
      validate_professional_code: {
        Args: { code: string }
        Returns: string
      }
      verify_user_email: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

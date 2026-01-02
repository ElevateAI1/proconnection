export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounting_reports: {
        Row: {
          ai_analysis: string | null
          amount_by_payment_method: Json
          amount_by_receipt_type: Json | null
          annual_accumulated: number
          auto_approved_receipts: number | null
          created_at: string
          generation_date: string | null
          id: string
          manually_reviewed_receipts: number | null
          monotax_alert: Json | null
          monthly_growth_percentage: number | null
          psychologist_id: string
          report_file_url: string | null
          report_month: number
          report_year: number
          sent_date: string | null
          status: string
          total_amount: number
          total_receipts: number
          updated_at: string
        }
        Insert: {
          ai_analysis?: string | null
          amount_by_payment_method?: Json
          amount_by_receipt_type?: Json | null
          annual_accumulated?: number
          auto_approved_receipts?: number | null
          created_at?: string
          generation_date?: string | null
          id?: string
          manually_reviewed_receipts?: number | null
          monotax_alert?: Json | null
          monthly_growth_percentage?: number | null
          psychologist_id: string
          report_file_url?: string | null
          report_month: number
          report_year: number
          sent_date?: string | null
          status?: string
          total_amount?: number
          total_receipts?: number
          updated_at?: string
        }
        Update: {
          ai_analysis?: string | null
          amount_by_payment_method?: Json
          amount_by_receipt_type?: Json | null
          annual_accumulated?: number
          auto_approved_receipts?: number | null
          created_at?: string
          generation_date?: string | null
          id?: string
          manually_reviewed_receipts?: number | null
          monotax_alert?: Json | null
          monthly_growth_percentage?: number | null
          psychologist_id?: string
          report_file_url?: string | null
          report_month?: number
          report_year?: number
          sent_date?: string | null
          status?: string
          total_amount?: number
          total_receipts?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_reports_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_reports_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_reports_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
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
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "affiliate_admin_stats"
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
            referencedRelation: "affiliate_admin_stats"
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
      ai_configurations: {
        Row: {
          ai_enabled: boolean | null
          custom_prompt: string | null
          excluded_chats: Json | null
          id: number
          response_type: string | null
          updated_at: string | null
        }
        Insert: {
          ai_enabled?: boolean | null
          custom_prompt?: string | null
          excluded_chats?: Json | null
          id?: number
          response_type?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_enabled?: boolean | null
          custom_prompt?: string | null
          excluded_chats?: Json | null
          id?: number
          response_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appointment_confirmations: {
        Row: {
          appointment_id: string
          confirmation_token: string
          confirmed_at: string | null
          created_at: string
          expires_at: string
          id: string
          status: string
        }
        Insert: {
          appointment_id: string
          confirmation_token: string
          confirmed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          status?: string
        }
        Update: {
          appointment_id?: string
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      appointment_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          payment_amount: number | null
          payment_proof_url: string | null
          payment_status: string | null
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
          payment_amount?: number | null
          payment_proof_url?: string | null
          payment_status?: string | null
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
          payment_amount?: number | null
          payment_proof_url?: string | null
          payment_status?: string | null
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
            referencedRelation: "affiliate_admin_stats"
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
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
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
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
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
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
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
            referencedRelation: "affiliate_admin_stats"
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
      bot_configuration: {
        Row: {
          config_key: string
          config_value: Json | null
          created_at: string | null
          description: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      clinical_records: {
        Row: {
          created_at: string
          diagnosis: string | null
          id: string
          main_symptoms: string | null
          medication: string | null
          next_steps: string | null
          observations: string | null
          patient_id: string
          psychologist_id: string
          session_date: string
          session_type: string
          treatment: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          id?: string
          main_symptoms?: string | null
          medication?: string | null
          next_steps?: string | null
          observations?: string | null
          patient_id: string
          psychologist_id: string
          session_date: string
          session_type?: string
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          id?: string
          main_symptoms?: string | null
          medication?: string | null
          next_steps?: string | null
          observations?: string | null
          patient_id?: string
          psychologist_id?: string
          session_date?: string
          session_type?: string
          treatment?: string | null
          updated_at?: string
        }
        Relationships: []
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
            referencedRelation: "affiliate_admin_stats"
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
      document_notifications: {
        Row: {
          created_at: string
          document_id: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          recipient_id: string
          recipient_type: string
          title: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          recipient_id: string
          recipient_type: string
          title: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_notifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          created_at: string
          document_type: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          psychologist_id: string
          template_content: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          psychologist_id: string
          template_content?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          psychologist_id?: string
          template_content?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          error_message: string | null
          error_type: string | null
          id: number
          resolved: boolean | null
          stack_trace: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error_message?: string | null
          error_type?: string | null
          id?: number
          resolved?: boolean | null
          stack_trace?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error_message?: string | null
          error_type?: string | null
          id?: number
          resolved?: boolean | null
          stack_trace?: string | null
        }
        Relationships: []
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
      monotax_categories: {
        Row: {
          annual_limit: number
          category_code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          monthly_limit: number
          updated_at: string
        }
        Insert: {
          annual_limit: number
          category_code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monthly_limit: number
          updated_at?: string
        }
        Update: {
          annual_limit?: number
          category_code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monthly_limit?: number
          updated_at?: string
        }
        Relationships: []
      }
      patient_documents: {
        Row: {
          content: Json
          created_at: string
          due_date: string | null
          id: string
          patient_id: string
          priority: string | null
          psychologist_id: string
          status: string
          title: string
          type: string
          updated_at: string
          workflow_step: number | null
        }
        Insert: {
          content: Json
          created_at?: string
          due_date?: string | null
          id?: string
          patient_id: string
          priority?: string | null
          psychologist_id: string
          status?: string
          title: string
          type: string
          updated_at?: string
          workflow_step?: number | null
        }
        Update: {
          content?: Json
          created_at?: string
          due_date?: string | null
          id?: string
          patient_id?: string
          priority?: string | null
          psychologist_id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          workflow_step?: number | null
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
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "affiliate_admin_stats"
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
      payment_receipts: {
        Row: {
          amount: number | null
          auto_approved: boolean | null
          created_at: string
          extracted_data: Json | null
          extraction_status: string
          id: string
          include_in_report: boolean
          original_file_url: string
          patient_cuit: string | null
          patient_id: string | null
          payment_method: string | null
          psychologist_id: string
          receipt_date: string | null
          receipt_number: string | null
          receipt_type: string | null
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          validation_notes: string | null
          validation_status: string
        }
        Insert: {
          amount?: number | null
          auto_approved?: boolean | null
          created_at?: string
          extracted_data?: Json | null
          extraction_status?: string
          id?: string
          include_in_report?: boolean
          original_file_url: string
          patient_cuit?: string | null
          patient_id?: string | null
          payment_method?: string | null
          psychologist_id: string
          receipt_date?: string | null
          receipt_number?: string | null
          receipt_type?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          validation_status?: string
        }
        Update: {
          amount?: number | null
          auto_approved?: boolean | null
          created_at?: string
          extracted_data?: Json | null
          extraction_status?: string
          id?: string
          include_in_report?: boolean
          original_file_url?: string
          patient_cuit?: string | null
          patient_id?: string | null
          payment_method?: string | null
          psychologist_id?: string
          receipt_date?: string | null
          receipt_number?: string | null
          receipt_type?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_specialties: {
        Row: {
          category: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          profession_type: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          profession_type: string
        }
        Update: {
          category?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          profession_type?: string
        }
        Relationships: []
      }
      profile_specialties: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          specialty_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          specialty_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "professional_specialties"
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
      psychologist_directories: {
        Row: {
          created_at: string
          directory_id: string
          directory_name: string
          id: string
          notes: string | null
          profile_url: string | null
          psychologist_id: string
          registration_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          directory_id: string
          directory_name: string
          id?: string
          notes?: string | null
          profile_url?: string | null
          psychologist_id: string
          registration_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          directory_id?: string
          directory_name?: string
          id?: string
          notes?: string | null
          profile_url?: string | null
          psychologist_id?: string
          registration_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_directories_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_directories_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_directories_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_rates: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean
          price: number
          psychologist_id: string
          session_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          price: number
          psychologist_id: string
          session_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          price?: number
          psychologist_id?: string
          session_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_rates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_rates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_rates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_seo_config: {
        Row: {
          created_at: string
          custom_url: string | null
          description: string | null
          id: string
          keywords: string | null
          local_seo: string | null
          psychologist_id: string
          structured_data: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_url?: string | null
          description?: string | null
          id?: string
          keywords?: string | null
          local_seo?: string | null
          psychologist_id: string
          structured_data?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_url?: string | null
          description?: string | null
          id?: string
          keywords?: string | null
          local_seo?: string | null
          psychologist_id?: string
          structured_data?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_seo_config_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_seo_config_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_seo_config_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_social_strategy: {
        Row: {
          content_strategy: Json | null
          created_at: string
          id: string
          platform_id: string
          platform_name: string
          posting_frequency: string | null
          profile_url: string | null
          psychologist_id: string
          status: string
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          content_strategy?: Json | null
          created_at?: string
          id?: string
          platform_id: string
          platform_name: string
          posting_frequency?: string | null
          profile_url?: string | null
          psychologist_id: string
          status?: string
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          content_strategy?: Json | null
          created_at?: string
          id?: string
          platform_id?: string
          platform_name?: string
          posting_frequency?: string | null
          profile_url?: string | null
          psychologist_id?: string
          status?: string
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_social_strategy_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_social_strategy_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_social_strategy_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
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
          monotax_category: string | null
          pdf_contact_info: Json | null
          pdf_logo_url: string | null
          pdf_primary_color: string | null
          phone: string | null
          plan_type: string | null
          profession_type: string
          professional_code: string
          profile_image_url: string | null
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
          monotax_category?: string | null
          pdf_contact_info?: Json | null
          pdf_logo_url?: string | null
          pdf_primary_color?: string | null
          phone?: string | null
          plan_type?: string | null
          profession_type?: string
          professional_code: string
          profile_image_url?: string | null
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
          monotax_category?: string | null
          pdf_contact_info?: Json | null
          pdf_logo_url?: string | null
          pdf_primary_color?: string | null
          phone?: string | null
          plan_type?: string | null
          profession_type?: string
          professional_code?: string
          profile_image_url?: string | null
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
          {
            foreignKeyName: "psychologists_monotax_category_fkey"
            columns: ["monotax_category"]
            isOneToOne: false
            referencedRelation: "monotax_categories"
            referencedColumns: ["category_code"]
          },
        ]
      }
      public_psychologist_profiles: {
        Row: {
          about_description: string | null
          created_at: string
          custom_url: string
          id: string
          is_active: boolean
          last_viewed_at: string | null
          profession_type: string | null
          profile_data: Json
          psychologist_id: string
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          therapeutic_approach: string | null
          updated_at: string
          view_count: number
          years_experience: number | null
        }
        Insert: {
          about_description?: string | null
          created_at?: string
          custom_url: string
          id?: string
          is_active?: boolean
          last_viewed_at?: string | null
          profession_type?: string | null
          profile_data?: Json
          psychologist_id: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          therapeutic_approach?: string | null
          updated_at?: string
          view_count?: number
          years_experience?: number | null
        }
        Update: {
          about_description?: string | null
          created_at?: string
          custom_url?: string
          id?: string
          is_active?: boolean
          last_viewed_at?: string | null
          profession_type?: string | null
          profile_data?: Json
          psychologist_id?: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          therapeutic_approach?: string | null
          updated_at?: string
          view_count?: number
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_psychologist_profiles_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_psychologist_profiles_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_psychologist_profiles_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_settings: {
        Row: {
          created_at: string
          custom_message: string | null
          delivery_methods: string[]
          enabled: boolean
          hours_before: number
          id: string
          psychologist_id: string
          reminder_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_message?: string | null
          delivery_methods?: string[]
          enabled?: boolean
          hours_before?: number
          id?: string
          psychologist_id: string
          reminder_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_message?: string | null
          delivery_methods?: string[]
          enabled?: boolean
          hours_before?: number
          id?: string
          psychologist_id?: string
          reminder_type?: string
          updated_at?: string
        }
        Relationships: []
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
      system_notifications: {
        Row: {
          created_at: string | null
          id: number
          message: string | null
          metadata: Json | null
          notification_type: string
          priority: string | null
          recipient_phone: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          message?: string | null
          metadata?: Json | null
          notification_type: string
          priority?: string | null
          recipient_phone?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string | null
          metadata?: Json | null
          notification_type?: string
          priority?: string | null
          recipient_phone?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visibility_module_scores: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          last_updated: string
          module_data: Json | null
          module_type: string
          psychologist_id: string
          score: number
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          last_updated?: string
          module_data?: Json | null
          module_type: string
          psychologist_id: string
          score?: number
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          last_updated?: string
          module_data?: Json | null
          module_type?: string
          psychologist_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_module_scores_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "affiliate_admin_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_module_scores_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_module_scores_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologists"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_bot_stats: {
        Row: {
          avg_response_time: number | null
          created_at: string | null
          errors_count: number | null
          id: number
          messages_received: number | null
          messages_sent: number | null
          metadata: Json | null
          stat_date: string
          success_rate: number | null
          unique_contacts: number | null
          updated_at: string | null
          uptime_seconds: number | null
        }
        Insert: {
          avg_response_time?: number | null
          created_at?: string | null
          errors_count?: number | null
          id?: number
          messages_received?: number | null
          messages_sent?: number | null
          metadata?: Json | null
          stat_date?: string
          success_rate?: number | null
          unique_contacts?: number | null
          updated_at?: string | null
          uptime_seconds?: number | null
        }
        Update: {
          avg_response_time?: number | null
          created_at?: string | null
          errors_count?: number | null
          id?: number
          messages_received?: number | null
          messages_sent?: number | null
          metadata?: Json | null
          stat_date?: string
          success_rate?: number | null
          unique_contacts?: number | null
          updated_at?: string | null
          uptime_seconds?: number | null
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_contacts: {
        Row: {
          created_at: string | null
          id: number
          is_business: boolean | null
          last_message_at: string | null
          metadata: Json | null
          name: string | null
          phone_number: string
          profile_pic_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_business?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          name?: string | null
          phone_number: string
          profile_pic_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_business?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          name?: string | null
          phone_number?: string
          profile_pic_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          ack_status: number | null
          body: string | null
          contact_phone: string | null
          created_at: string | null
          direction: string | null
          from_number: string
          id: number
          media_url: string | null
          message_id: string | null
          message_timestamp: string | null
          message_type: string | null
          metadata: Json | null
          status: string | null
          to_number: string
        }
        Insert: {
          ack_status?: number | null
          body?: string | null
          contact_phone?: string | null
          created_at?: string | null
          direction?: string | null
          from_number: string
          id?: number
          media_url?: string | null
          message_id?: string | null
          message_timestamp?: string | null
          message_type?: string | null
          metadata?: Json | null
          status?: string | null
          to_number: string
        }
        Update: {
          ack_status?: number | null
          body?: string | null
          contact_phone?: string | null
          created_at?: string | null
          direction?: string | null
          from_number?: string
          id?: number
          media_url?: string | null
          message_id?: string | null
          message_timestamp?: string | null
          message_type?: string | null
          metadata?: Json | null
          status?: string | null
          to_number?: string
        }
        Relationships: []
      }
      whatsapp_session_storage: {
        Row: {
          created_at: string | null
          id: string
          session_data: Json
          session_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_data: Json
          session_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_data?: Json
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: number
          last_seen: string | null
          phone_number: string | null
          qr_code: string | null
          session_data: Json | null
          session_key: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: number
          last_seen?: string | null
          phone_number?: string | null
          qr_code?: string | null
          session_data?: Json | null
          session_key?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: number
          last_seen?: string | null
          phone_number?: string | null
          qr_code?: string | null
          session_data?: Json | null
          session_key?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      affiliate_admin_stats: {
        Row: {
          active_referrals: number | null
          affiliate_code: string | null
          affiliate_earnings: number | null
          commission_rate: number | null
          discount_rate: number | null
          first_name: string | null
          id: string | null
          last_name: string | null
          paid_amount: number | null
          pending_payments: number | null
          professional_code: string | null
          total_referrals: number | null
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
      public_profile_detailed_view: {
        Row: {
          about_description: string | null
          config_custom_url: string | null
          config_description: string | null
          config_keywords: string | null
          config_title: string | null
          custom_url: string | null
          first_name: string | null
          id: string | null
          is_active: boolean | null
          last_name: string | null
          last_viewed_at: string | null
          profession_type: string | null
          professional_code: string | null
          profile_data: Json | null
          selected_specialties: Json | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          specialization: string | null
          therapeutic_approach: string | null
          view_count: number | null
          years_experience: number | null
        }
        Relationships: []
      }
      public_profile_view: {
        Row: {
          config_custom_url: string | null
          config_description: string | null
          config_keywords: string | null
          config_title: string | null
          custom_url: string | null
          first_name: string | null
          id: string | null
          is_active: boolean | null
          last_name: string | null
          last_viewed_at: string | null
          professional_code: string | null
          profile_data: Json | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          specialization: string | null
          view_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_update_plan_type: {
        Args: { psychologist_id: string; new_plan_type: string }
        Returns: undefined
      }
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
      calculate_annual_accumulated: {
        Args: { psychologist_id_param: string; year_param: number }
        Returns: number
      }
      cancel_appointment: {
        Args: { appointment_id: string; cancellation_reason?: string }
        Returns: undefined
      }
      create_appointment_confirmation: {
        Args: { appointment_id: string }
        Returns: string
      }
      create_missing_appointment_reminders: {
        Args: Record<PropertyKey, never>
        Returns: {
          appointment_id: string
          patient_name: string
          reminders_created: number
          status: string
        }[]
      }
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_confirmation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_professional_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_plan_capabilities: {
        Args: { psychologist_id: string }
        Returns: Json
      }
      get_trial_days_remaining: {
        Args: { psychologist_id: string }
        Returns: number
      }
      increment_profile_view: {
        Args: { profile_url: string }
        Returns: undefined
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_trial_expired: {
        Args: { psychologist_id: string }
        Returns: boolean
      }
      log_whatsapp_message: {
        Args: {
          session_id_param: string
          from_number_param: string
          to_number_param: string
          message_body_param: string
          direction_param: string
          whatsapp_message_id_param?: string
          notification_id_param?: string
        }
        Returns: string
      }
      process_affiliate_commission: {
        Args: { referred_psychologist_id: string; subscription_amount: number }
        Returns: undefined
      }
      process_affiliate_referral: {
        Args: { new_psychologist_id: string; affiliate_code_param: string }
        Returns: undefined
      }
      update_receipt_from_n8n: {
        Args: {
          receipt_id_param: string
          extracted_data_param: Json
          validation_status_param?: string
          auto_approved_param?: boolean
        }
        Returns: undefined
      }
      update_whatsapp_session_status: {
        Args: {
          session_id_param: string
          new_status: string
          qr_code_param?: string
          phone_number_param?: string
          device_info_param?: Json
        }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

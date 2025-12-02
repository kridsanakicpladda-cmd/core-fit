export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string | null
          candidate_id: string
          id: string
          notes: string | null
          position_id: string
          stage: string
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          candidate_id: string
          id?: string
          notes?: string | null
          position_id: string
          stage?: string
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          candidate_id?: string
          id?: string
          notes?: string | null
          position_id?: string
          stage?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "job_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          ai_fit_score: number | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          resume_url: string | null
          source: string
          updated_at: string | null
        }
        Insert: {
          ai_fit_score?: number | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          resume_url?: string | null
          source: string
          updated_at?: string | null
        }
        Update: {
          ai_fit_score?: number | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          resume_url?: string | null
          source?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          ai_fit_score_weights: Json | null
          company_email: string | null
          company_name: string | null
          created_at: string | null
          id: string
          microsoft_365_connected: boolean | null
          microsoft_365_token: string | null
          updated_at: string | null
        }
        Insert: {
          ai_fit_score_weights?: Json | null
          company_email?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          microsoft_365_connected?: boolean | null
          microsoft_365_token?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_fit_score_weights?: Json | null
          company_email?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          microsoft_365_connected?: boolean | null
          microsoft_365_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      interviews: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          interviewer_id: string | null
          notes: string | null
          result: string | null
          scheduled_at: string | null
          score: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          interviewer_id?: string | null
          notes?: string | null
          result?: string | null
          scheduled_at?: string | null
          score?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          interviewer_id?: string | null
          notes?: string | null
          result?: string | null
          scheduled_at?: string | null
          score?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_positions: {
        Row: {
          created_at: string | null
          department: string
          description: string | null
          employment_type: string | null
          end_date: string | null
          id: string
          job_grade: string | null
          location: string | null
          required_count: number | null
          requirements: string | null
          responsibilities: string | null
          salary_max: number | null
          salary_min: number | null
          start_date: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          job_grade?: string | null
          location?: string | null
          required_count?: number | null
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          start_date: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          job_grade?: string | null
          location?: string | null
          required_count?: number | null
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_requisitions: {
        Row: {
          created_at: string | null
          date_needed: string
          department: string
          experience_in: string | null
          field_of_study: string | null
          gender: string | null
          hiring_type: string
          id: string
          jd_file_url: string | null
          job_description_no: string | null
          job_grade: string | null
          justification: string
          marital_status: string | null
          max_age: string | null
          min_education: string | null
          min_experience: string | null
          other_skills: string | null
          position: string
          quantity: number
          replacement_date: string | null
          replacement_for: string | null
          reports_to: string
          requested_by: string
          requisition_form_url: string | null
          requisition_number: string
          status: string
          temporary_duration: string | null
          updated_at: string | null
          work_location: string
        }
        Insert: {
          created_at?: string | null
          date_needed: string
          department: string
          experience_in?: string | null
          field_of_study?: string | null
          gender?: string | null
          hiring_type: string
          id?: string
          jd_file_url?: string | null
          job_description_no?: string | null
          job_grade?: string | null
          justification: string
          marital_status?: string | null
          max_age?: string | null
          min_education?: string | null
          min_experience?: string | null
          other_skills?: string | null
          position: string
          quantity?: number
          replacement_date?: string | null
          replacement_for?: string | null
          reports_to: string
          requested_by: string
          requisition_form_url?: string | null
          requisition_number: string
          status?: string
          temporary_duration?: string | null
          updated_at?: string | null
          work_location: string
        }
        Update: {
          created_at?: string | null
          date_needed?: string
          department?: string
          experience_in?: string | null
          field_of_study?: string | null
          gender?: string | null
          hiring_type?: string
          id?: string
          jd_file_url?: string | null
          job_description_no?: string | null
          job_grade?: string | null
          justification?: string
          marital_status?: string | null
          max_age?: string | null
          min_education?: string | null
          min_experience?: string | null
          other_skills?: string | null
          position?: string
          quantity?: number
          replacement_date?: string | null
          replacement_for?: string | null
          reports_to?: string
          requested_by?: string
          requisition_form_url?: string | null
          requisition_number?: string
          status?: string
          temporary_duration?: string | null
          updated_at?: string | null
          work_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_requisitions_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          candidate_name: string | null
          created_at: string
          description: string
          id: string
          is_read: boolean
          new_status: string | null
          old_status: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          candidate_name?: string | null
          created_at?: string
          description: string
          id?: string
          is_read?: boolean
          new_status?: string | null
          old_status?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          candidate_name?: string | null
          created_at?: string
          description?: string
          id?: string
          is_read?: boolean
          new_status?: string | null
          old_status?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recruitment_costs: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          period_end: string
          period_start: string
          source: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          period_end: string
          period_start: string
          source: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          period_end?: string
          period_start?: string
          source?: string
        }
        Relationships: []
      }
      requisition_approvals: {
        Row: {
          action: string
          approver_id: string
          comment: string | null
          created_at: string | null
          id: string
          requisition_id: string
        }
        Insert: {
          action: string
          approver_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          requisition_id: string
        }
        Update: {
          action?: string
          approver_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          requisition_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requisition_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisition_approvals_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "job_requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          allowed: boolean
          created_at: string | null
          id: string
          resource: string
          role: string
          updated_at: string | null
        }
        Insert: {
          action: string
          allowed?: boolean
          created_at?: string | null
          id?: string
          resource: string
          role: string
          updated_at?: string | null
        }
        Update: {
          action?: string
          allowed?: boolean
          created_at?: string | null
          id?: string
          resource?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_requisition_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "hr_manager"
        | "recruiter"
        | "interviewer"
        | "viewer"
        | "manager"
        | "ceo"
        | "candidate"
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
    Enums: {
      app_role: [
        "admin",
        "hr_manager",
        "recruiter",
        "interviewer",
        "viewer",
        "manager",
        "ceo",
        "candidate",
      ],
    },
  },
} as const

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
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["role_enum"] | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["role_enum"] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["role_enum"] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_sapeur_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      qr_interactions: {
        Row: {
          amount: number | null
          calendars_count: number | null
          completed_at: string | null
          created_at: string | null
          donator_email: string | null
          donator_name: string | null
          expires_at: string | null
          id: string
          interaction_id: string
          ip_address: unknown | null
          status: string | null
          stripe_session_id: string | null
          team_id: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          amount?: number | null
          calendars_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          donator_email?: string | null
          donator_name?: string | null
          expires_at?: string | null
          id?: string
          interaction_id: string
          ip_address?: unknown | null
          status?: string | null
          stripe_session_id?: string | null
          team_id: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          amount?: number | null
          calendars_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          donator_email?: string | null
          donator_name?: string | null
          expires_at?: string | null
          id?: string
          interaction_id?: string
          ip_address?: unknown | null
          status?: string | null
          stripe_session_id?: string | null
          team_id?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_interactions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_interactions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_sapeur_dashboard"
            referencedColumns: ["team_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          calendars_target: number | null
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          calendars_target?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          calendars_target?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tournees: {
        Row: {
          calendars_distributed: number | null
          calendars_initial: number
          calendars_remaining: number | null
          created_at: string | null
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["tournee_status_enum"] | null
          team_id: string | null
          total_amount: number | null
          total_transactions: number | null
          updated_at: string | null
          user_id: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          calendars_distributed?: number | null
          calendars_initial: number
          calendars_remaining?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["tournee_status_enum"] | null
          team_id?: string | null
          total_amount?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          calendars_distributed?: number | null
          calendars_initial?: number
          calendars_remaining?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["tournee_status_enum"] | null
          team_id?: string | null
          total_amount?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournees_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournees_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_sapeur_dashboard"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "tournees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_sapeur_dashboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournees_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournees_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "v_sapeur_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          calendars_given: number | null
          cheque_banque: string | null
          cheque_date_emission: string | null
          cheque_deposited_at: string | null
          cheque_numero: string | null
          cheque_tireur: string | null
          created_at: string | null
          donator_address: string | null
          donator_email: string | null
          donator_name: string | null
          id: string
          idempotency_key: string | null
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          processed_at: string | null
          qr_verification_code: string | null
          receipt_generated_at: string | null
          receipt_metadata: Json | null
          receipt_number: string | null
          receipt_requested_at: string | null
          receipt_status:
            | Database["public"]["Enums"]["receipt_status_enum"]
            | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["transaction_status_enum"] | null
          stripe_session_id: string | null
          team_id: string | null
          tournee_id: string | null
          user_id: string
          validated_team_at: string | null
          validated_tresorier_at: string | null
        }
        Insert: {
          amount: number
          calendars_given?: number | null
          cheque_banque?: string | null
          cheque_date_emission?: string | null
          cheque_deposited_at?: string | null
          cheque_numero?: string | null
          cheque_tireur?: string | null
          created_at?: string | null
          donator_address?: string | null
          donator_email?: string | null
          donator_name?: string | null
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          processed_at?: string | null
          qr_verification_code?: string | null
          receipt_generated_at?: string | null
          receipt_metadata?: Json | null
          receipt_number?: string | null
          receipt_requested_at?: string | null
          receipt_status?:
            | Database["public"]["Enums"]["receipt_status_enum"]
            | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["transaction_status_enum"] | null
          stripe_session_id?: string | null
          team_id?: string | null
          tournee_id?: string | null
          user_id: string
          validated_team_at?: string | null
          validated_tresorier_at?: string | null
        }
        Update: {
          amount?: number
          calendars_given?: number | null
          cheque_banque?: string | null
          cheque_date_emission?: string | null
          cheque_deposited_at?: string | null
          cheque_numero?: string | null
          cheque_tireur?: string | null
          created_at?: string | null
          donator_address?: string | null
          donator_email?: string | null
          donator_name?: string | null
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method_enum"]
          processed_at?: string | null
          qr_verification_code?: string | null
          receipt_generated_at?: string | null
          receipt_metadata?: Json | null
          receipt_number?: string | null
          receipt_requested_at?: string | null
          receipt_status?:
            | Database["public"]["Enums"]["receipt_status_enum"]
            | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["transaction_status_enum"] | null
          stripe_session_id?: string | null
          team_id?: string | null
          tournee_id?: string | null
          user_id?: string
          validated_team_at?: string | null
          validated_tresorier_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_sapeur_dashboard"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "transactions_tournee_id_fkey"
            columns: ["tournee_id"]
            isOneToOne: false
            referencedRelation: "tournees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_tournee_id_fkey"
            columns: ["tournee_id"]
            isOneToOne: false
            referencedRelation: "v_sapeur_dashboard"
            referencedColumns: ["tournee_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_sapeur_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          payment_method: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["role_enum"] | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          payment_method?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["role_enum"] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          payment_method?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["role_enum"] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_sapeur_dashboard"
            referencedColumns: ["team_id"]
          },
        ]
      }
    }
    Views: {
      v_sapeur_dashboard: {
        Row: {
          calendars_distributed: number | null
          calendars_initial: number | null
          calendars_remaining: number | null
          dons_aujourd_hui: number | null
          full_name: string | null
          montant_aujourd_hui: number | null
          role: Database["public"]["Enums"]["role_enum"] | null
          started_at: string | null
          status: Database["public"]["Enums"]["tournee_status_enum"] | null
          team_color: string | null
          team_id: string | null
          team_name: string | null
          total_amount: number | null
          total_transactions: number | null
          tournee_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      start_new_tournee: {
        Args: { p_calendars_initial: number; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      payment_method: "cash" | "check" | "card" | "transfer"
      payment_method_enum:
        | "especes"
        | "cheque"
        | "carte"
        | "virement"
        | "especes_batch"
        | "carte_qr"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      receipt_status_enum: "pending" | "generated" | "failed" | "cancelled"
      role_enum: "sapeur" | "chef_equipe" | "tresorier" | "admin"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      tournee_status_enum:
        | "en_cours"
        | "pending_validation"
        | "validated_by_lead"
        | "completed"
      transaction_status_enum:
        | "pending"
        | "validated_team"
        | "validated_tresorier"
        | "cancelled"
      user_role: "firefighter" | "team_leader" | "treasurer"
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
      payment_method: ["cash", "check", "card", "transfer"],
      payment_method_enum: [
        "especes",
        "cheque",
        "carte",
        "virement",
        "especes_batch",
        "carte_qr",
      ],
      pricing_plan_interval: ["day", "week", "month", "year"],
      pricing_type: ["one_time", "recurring"],
      receipt_status_enum: ["pending", "generated", "failed", "cancelled"],
      role_enum: ["sapeur", "chef_equipe", "tresorier", "admin"],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ],
      tournee_status_enum: [
        "en_cours",
        "pending_validation",
        "validated_by_lead",
        "completed",
      ],
      transaction_status_enum: [
        "pending",
        "validated_team",
        "validated_tresorier",
        "cancelled",
      ],
      user_role: ["firefighter", "team_leader", "treasurer"],
    },
  },
} as const

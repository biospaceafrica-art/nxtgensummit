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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          checked_in_at: string
          checked_in_by: string | null
          id: string
          method: string
          registration_id: string
        }
        Insert: {
          checked_in_at?: string
          checked_in_by?: string | null
          id?: string
          method?: string
          registration_id: string
        }
        Update: {
          checked_in_at?: string
          checked_in_by?: string | null
          id?: string
          method?: string
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      door_opener_submissions: {
        Row: {
          amount_paid: number | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          partnership_tier: string
          payment_confirmed: boolean
          payment_confirmed_at: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          partnership_tier: string
          payment_confirmed?: boolean
          payment_confirmed_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          partnership_tier?: string
          payment_confirmed?: boolean
          payment_confirmed_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_reminders: {
        Row: {
          created_at: string
          id: string
          registration_id: string | null
          reminder_type: string
          scheduled_at: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          registration_id?: string | null
          reminder_type: string
          scheduled_at: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          registration_id?: string | null
          reminder_type?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_reminders_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_gallery: {
        Row: {
          created_at: string
          description: string | null
          event_year: number
          id: string
          image_url: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_year: number
          id?: string
          image_url: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_year?: number
          id?: string
          image_url?: string
          title?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comments: string | null
          content_rating: number | null
          created_at: string
          email: string
          full_name: string
          id: string
          organization_rating: number | null
          overall_rating: number
          registration_id: string | null
          speakers_rating: number | null
          would_recommend: boolean | null
        }
        Insert: {
          comments?: string | null
          content_rating?: number | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          organization_rating?: number | null
          overall_rating: number
          registration_id?: string | null
          speakers_rating?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          comments?: string | null
          content_rating?: number | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organization_rating?: number | null
          overall_rating?: number
          registration_id?: string | null
          speakers_rating?: number | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      networking_profiles: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string
          id: string
          organization: string | null
          photo_url: string | null
          searchable_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          organization?: string | null
          photo_url?: string | null
          searchable_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          organization?: string | null
          photo_url?: string | null
          searchable_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          current_status: Database["public"]["Enums"]["attendee_status"]
          email: string
          fellowship_track: Database["public"]["Enums"]["fellowship_track"]
          full_name: string
          id: string
          payment_confirmed: boolean
          payment_confirmed_at: string | null
          phone: string | null
          selected_course: string | null
          updated_at: string
          whatsapp_group_assigned: string | null
        }
        Insert: {
          created_at?: string
          current_status: Database["public"]["Enums"]["attendee_status"]
          email: string
          fellowship_track: Database["public"]["Enums"]["fellowship_track"]
          full_name: string
          id?: string
          payment_confirmed?: boolean
          payment_confirmed_at?: string | null
          phone?: string | null
          selected_course?: string | null
          updated_at?: string
          whatsapp_group_assigned?: string | null
        }
        Update: {
          created_at?: string
          current_status?: Database["public"]["Enums"]["attendee_status"]
          email?: string
          fellowship_track?: Database["public"]["Enums"]["fellowship_track"]
          full_name?: string
          id?: string
          payment_confirmed?: boolean
          payment_confirmed_at?: string | null
          phone?: string | null
          selected_course?: string | null
          updated_at?: string
          whatsapp_group_assigned?: string | null
        }
        Relationships: []
      }
      scholarship_applicants: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: string
          status: Database["public"]["Enums"]["scholarship_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: Database["public"]["Enums"]["scholarship_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: Database["public"]["Enums"]["scholarship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          created_at: string
          email: string
          experience: string | null
          full_name: string
          id: string
          phone: string | null
          position: string
          status: string
          why_volunteer: string | null
        }
        Insert: {
          created_at?: string
          email: string
          experience?: string | null
          full_name: string
          id?: string
          phone?: string | null
          position: string
          status?: string
          why_volunteer?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          position?: string
          status?: string
          why_volunteer?: string | null
        }
        Relationships: []
      }
      whatsapp_groups: {
        Row: {
          created_at: string
          fellowship_track: Database["public"]["Enums"]["fellowship_track"]
          group_name: string
          id: string
          invite_link: string | null
          member_count: number | null
        }
        Insert: {
          created_at?: string
          fellowship_track: Database["public"]["Enums"]["fellowship_track"]
          group_name: string
          id?: string
          invite_link?: string | null
          member_count?: number | null
        }
        Update: {
          created_at?: string
          fellowship_track?: Database["public"]["Enums"]["fellowship_track"]
          group_name?: string
          id?: string
          invite_link?: string | null
          member_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "selection_team"
      attendee_status: "employed" | "unemployed" | "corp_member" | "student"
      fellowship_track: "career" | "enterprise"
      scholarship_status:
        | "pending"
        | "shortlisted"
        | "accepted"
        | "rejected"
        | "waitlist"
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
      app_role: ["admin", "user", "selection_team"],
      attendee_status: ["employed", "unemployed", "corp_member", "student"],
      fellowship_track: ["career", "enterprise"],
      scholarship_status: [
        "pending",
        "shortlisted",
        "accepted",
        "rejected",
        "waitlist",
      ],
    },
  },
} as const

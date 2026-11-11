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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      admission_applications: {
        Row: {
          address: string | null
          alt_mobile: string | null
          class_applying: string | null
          created_at: string
          email: string | null
          email_status: string
          id: string
          message: string | null
          mobile: string
          parent_name: string
          reference_number: string
          source: string
          status: string
          student_name: string
        }
        Insert: {
          address?: string | null
          alt_mobile?: string | null
          class_applying?: string | null
          created_at?: string
          email?: string | null
          email_status?: string
          id?: string
          message?: string | null
          mobile: string
          parent_name: string
          reference_number?: string
          source?: string
          status?: string
          student_name: string
        }
        Update: {
          address?: string | null
          alt_mobile?: string | null
          class_applying?: string | null
          created_at?: string
          email?: string | null
          email_status?: string
          id?: string
          message?: string | null
          mobile?: string
          parent_name?: string
          reference_number?: string
          source?: string
          status?: string
          student_name?: string
        }
        Relationships: []
      }
      admission_enquiries: {
        Row: {
          alt_mobile: string | null
          class_applying: string
          created_at: string
          email: string | null
          email_status: string
          father_name: string
          id: string
          mobile: string
          mother_name: string
          student_name: string
        }
        Insert: {
          alt_mobile?: string | null
          class_applying: string
          created_at?: string
          email?: string | null
          email_status?: string
          father_name: string
          id?: string
          mobile: string
          mother_name: string
          student_name: string
        }
        Update: {
          alt_mobile?: string | null
          class_applying?: string
          created_at?: string
          email?: string | null
          email_status?: string
          father_name?: string
          id?: string
          mobile?: string
          mother_name?: string
          student_name?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          attendance_date: string
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          attendance_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          event_date: string
          id: string
          image_url: string | null
          location: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          created_at: string
          created_by: string | null
          exam_date: string
          exam_name: string
          grade: string | null
          id: string
          marks: number
          max_marks: number
          remarks: string | null
          student_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          exam_date?: string
          exam_name: string
          grade?: string | null
          id?: string
          marks?: number
          max_marks?: number
          remarks?: string | null
          student_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          exam_date?: string
          exam_name?: string
          grade?: string | null
          id?: string
          marks?: number
          max_marks?: number
          remarks?: string | null
          student_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      faculty: {
        Row: {
          bio: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          designation: string
          experience: string
          full_name: string
          id: string
          photo_url: string | null
          published: boolean
          qualification: string
          sort_order: number
          subject: string
          updated_at: string
        }
        Insert: {
          bio?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          designation?: string
          experience?: string
          full_name: string
          id?: string
          photo_url?: string | null
          published?: boolean
          qualification?: string
          sort_order?: number
          subject?: string
          updated_at?: string
        }
        Update: {
          bio?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          designation?: string
          experience?: string
          full_name?: string
          id?: string
          photo_url?: string | null
          published?: boolean
          qualification?: string
          sort_order?: number
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          email: string | null
          email_status: string | null
          id: string
          message: string
          mobile: string | null
          name: string | null
        }
        Insert: {
          category: string
          created_at?: string
          email?: string | null
          email_status?: string | null
          id?: string
          message: string
          mobile?: string | null
          name?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          email?: string | null
          email_status?: string | null
          id?: string
          message?: string
          mobile?: string | null
          name?: string | null
        }
        Relationships: []
      }
      fees: {
        Row: {
          amount: string
          class_name: string
          id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          amount?: string
          class_name: string
          id?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amount?: string
          class_name?: string
          id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          album: string
          caption: string | null
          category: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string
          published: boolean
          sort_order: number
          title: string
        }
        Insert: {
          album?: string
          caption?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url: string
          published?: boolean
          sort_order?: number
          title: string
        }
        Update: {
          album?: string
          caption?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string
          published?: boolean
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      leadership: {
        Row: {
          created_at: string
          created_by: string | null
          designation: string
          full_name: string
          id: string
          photo_url: string | null
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          designation?: string
          full_name: string
          id?: string
          photo_url?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          designation?: string
          full_name?: string
          id?: string
          photo_url?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          expires_at: string | null
          id: string
          image_url: string | null
          notice_date: string
          pinned: boolean
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          notice_date?: string
          pinned?: boolean
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          notice_date?: string
          pinned?: boolean
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          join_date: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          join_date?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          join_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "student" | "parent" | "teacher"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "student", "parent", "teacher"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          orcid: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          orcid?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          orcid?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          email: string
          id: string
          institution: string | null
          invite_sent_at: string | null
          invited_at: string | null
          role: string
        }
        Insert: {
          accepted_at?: string | null
          email: string
          id?: string
          institution?: string | null
          invite_sent_at?: string | null
          invited_at?: string | null
          role?: string
        }
        Update: {
          accepted_at?: string | null
          email?: string
          id?: string
          institution?: string | null
          invite_sent_at?: string | null
          invited_at?: string | null
          role?: string
        }
        Relationships: []
      }
      papers: {
        Row: {
          abstract: string
          author_id: string
          content: string
          created_at: string | null
          doi: string | null
          id: string
          keywords: string[] | null
          published_at: string | null
          slug: string
          status: string
          title: string
          topics: string[] | null
          updated_at: string | null
          validation_score: number | null
        }
        Insert: {
          abstract: string
          author_id: string
          content: string
          created_at?: string | null
          doi?: string | null
          id?: string
          keywords?: string[] | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          topics?: string[] | null
          updated_at?: string | null
          validation_score?: number | null
        }
        Update: {
          abstract?: string
          author_id?: string
          content?: string
          created_at?: string | null
          doi?: string | null
          id?: string
          keywords?: string[] | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          topics?: string[] | null
          updated_at?: string | null
          validation_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "papers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      replications: {
        Row: {
          code_url: string | null
          created_at: string | null
          id: string
          notes: string | null
          paper_id: string
          replicator_id: string
          success: boolean
        }
        Insert: {
          code_url?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paper_id: string
          replicator_id: string
          success: boolean
        }
        Update: {
          code_url?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paper_id?: string
          replicator_id?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "replications_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replications_replicator_id_fkey"
            columns: ["replicator_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          institution: string | null
          last_login_at: string | null
          name: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          institution?: string | null
          last_login_at?: string | null
          name?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          institution?: string | null
          last_login_at?: string | null
          name?: string | null
          role?: string
        }
        Relationships: []
      }
      validations: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          paper_id: string
          result: string
          type: string
          validator_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          paper_id: string
          result: string
          type: string
          validator_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          paper_id?: string
          result?: string
          type?: string
          validator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validations_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validations_validator_id_fkey"
            columns: ["validator_id"]
            isOneToOne: false
            referencedRelation: "authors"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const


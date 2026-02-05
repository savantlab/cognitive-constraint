// Auto-generated types from Supabase
// Run: npx supabase gen types typescript --project-id <project-id> > packages/db/src/types.ts

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
      authors: {
        Row: {
          id: string
          email: string
          name: string
          orcid: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          orcid?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          orcid?: string | null
          bio?: string | null
          created_at?: string
        }
        Relationships: []
      }
      papers: {
        Row: {
          id: string
          title: string
          slug: string
          abstract: string
          content: string
          author_id: string
          status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PUBLISHED' | 'DISPUTED'
          validation_score: number
          doi: string | null
          keywords: string[] | null
          topics: string[] | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          abstract: string
          content: string
          author_id: string
          status?: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PUBLISHED' | 'DISPUTED'
          validation_score?: number
          doi?: string | null
          keywords?: string[] | null
          topics?: string[] | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          abstract?: string
          content?: string
          author_id?: string
          status?: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PUBLISHED' | 'DISPUTED'
          validation_score?: number
          doi?: string | null
          keywords?: string[] | null
          topics?: string[] | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "papers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          }
        ]
      }
      validations: {
        Row: {
          id: string
          paper_id: string
          validator_id: string
          type: 'MATHEMATICAL_PROOF' | 'COMPUTATIONAL_REPLICATION' | 'EXPERT_REVIEW' | 'REFUTATION_ATTEMPT'
          result: 'CONFIRMED' | 'DISPUTED' | 'FAILED'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          paper_id: string
          validator_id: string
          type: 'MATHEMATICAL_PROOF' | 'COMPUTATIONAL_REPLICATION' | 'EXPERT_REVIEW' | 'REFUTATION_ATTEMPT'
          result: 'CONFIRMED' | 'DISPUTED' | 'FAILED'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          paper_id?: string
          validator_id?: string
          type?: 'MATHEMATICAL_PROOF' | 'COMPUTATIONAL_REPLICATION' | 'EXPERT_REVIEW' | 'REFUTATION_ATTEMPT'
          result?: 'CONFIRMED' | 'DISPUTED' | 'FAILED'
          notes?: string | null
          created_at?: string
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
          }
        ]
      }
      replications: {
        Row: {
          id: string
          paper_id: string
          replicator_id: string
          success: boolean
          code_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          paper_id: string
          replicator_id: string
          success: boolean
          code_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          paper_id?: string
          replicator_id?: string
          success?: boolean
          code_url?: string | null
          notes?: string | null
          created_at?: string
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
          }
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
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Author = Tables<'authors'>
export type Paper = Tables<'papers'>
export type Validation = Tables<'validations'>
export type Replication = Tables<'replications'>

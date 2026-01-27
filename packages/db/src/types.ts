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
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
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

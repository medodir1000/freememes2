
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
      comments: {
        Row: {
          created_at: string
          id: string
          meme_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meme_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meme_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_meme_id_fkey"
            columns: ["meme_id"]
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      memes: {
        Row: {
          bottom_text: string | null
          created_at: string
          id: string
          image_url: string
          template_id: string | null
          top_text: string | null
          user_id: string
          votes: number
        }
        Insert: {
          bottom_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          template_id?: string | null
          top_text?: string | null
          user_id: string
          votes?: number
        }
        Update: {
          bottom_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          template_id?: string | null
          top_text?: string | null
          user_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "memes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badge: string | null
          email: string
          id: string
          memes_created: number
          name: string
          total_votes: number
        }
        Insert: {
          avatar_url?: string | null
          badge?: string | null
          email: string
          id: string
          memes_created?: number
          name: string
          total_votes?: number
        }
        Update: {
          avatar_url?: string | null
          badge?: string | null
          email?: string
          id?: string
          memes_created?: number
          name?: string
          total_votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: number
          meme_id: string
          user_id: string
          vote_value: number
        }
        Insert: {
          created_at?: string
          id?: number
          meme_id: string
          user_id: string
          vote_value: number
        }
        Update: {
          created_at?: string
          id?: number
          meme_id?: string
          user_id?: string
          vote_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_meme_id_fkey"
            columns: ["meme_id"]
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      winners: {
        Row: {
          avatar_url: string
          created_at: string
          id: string
          month: string
          name: string
          user_id: string
        }
        Insert: {
          avatar_url: string
          created_at?: string
          id?: string
          month: string
          name: string
          user_id: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          id?: string
          month?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "winners_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cast_vote: {
        Args: {
          meme_id_param: string
          user_id_param: string
          vote_value_param: number
        }
        Returns: { new_total_votes: number; milestone_message: string }
      }
      increment_memes_created: {
        Args: {
          user_id_param: string
        }
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

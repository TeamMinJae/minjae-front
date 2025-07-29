import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          room_id: string
          created_at: string
          is_started: boolean
          loser_id: string | null
          meme_urls: string[] | null
        }
        Insert: {
          id?: string
          room_id: string
          created_at?: string
          is_started?: boolean
          loser_id?: string | null
          meme_urls?: string[] | null
        }
        Update: {
          id?: string
          room_id?: string
          created_at?: string
          is_started?: boolean
          loser_id?: string | null
          meme_urls?: string[] | null
        }
      }
      users: {
        Row: {
          id: string
          room_id: string
          name: string
          is_host: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          name: string
          is_host?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          name?: string
          is_host?: boolean
          created_at?: string
        }
      }
    }
  }
}

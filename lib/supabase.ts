import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Comment {
  id: number
  post_slug: string
  nickname: string
  content: string
  created_at: string
  is_deleted: boolean
}

export interface CommentInsert {
  post_slug: string
  nickname: string
  content: string
  password_hash: string
}

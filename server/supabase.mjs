import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL?.trim()
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim()

if (!url || !secretKey) {
  throw new Error(
    'Supabase settings are missing. Check SUPABASE_URL and SUPABASE_SECRET_KEY in .env.',
  )
}

export const supabase = createClient(url, secretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
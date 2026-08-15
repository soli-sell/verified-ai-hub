import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knsajxxoarmskzxeatyr.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
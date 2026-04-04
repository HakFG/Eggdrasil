import { createClient } from '@supabase/supabase-js'

// Substitua pelas suas credenciais que estão no painel do Supabase (Project Settings > API)
const supabaseUrl = 'https://gpqyojiclxxisdzprpxt.supabase.co'
const supabaseAnonKey = 'sb_publishable_zYGIBOv1sznJ7wA0tKa1ww_gfpVLtiF'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
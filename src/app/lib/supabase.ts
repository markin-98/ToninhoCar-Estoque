import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente auxiliar usado APENAS para cadastrar novos usuários da equipe.
// Sem persistência de sessão: assim o signUp do novo mecânico não desloga
// a administradora que está usando o app.
export const supabaseCadastro = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

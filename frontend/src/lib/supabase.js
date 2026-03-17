import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` }
  })

export const signOut = () => supabase.auth.signOut()

// ── Brackets ─────────────────────────────────────────────────────────────────
export const saveBracket = async (userId, bracketType, picks, name) => {
  const { data, error } = await supabase
    .from('brackets')
    .upsert({
      user_id: userId,
      bracket_type: bracketType, // 'mens' | 'womens'
      picks: picks,
      name: name || `My ${bracketType === 'mens' ? "Men's" : "Women's"} Bracket`,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,bracket_type,name' })
    .select()
  return { data, error }
}

export const getUserBrackets = async (userId) => {
  const { data, error } = await supabase
    .from('brackets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  return { data, error }
}

export const deleteBracket = async (bracketId) => {
  return supabase.from('brackets').delete().eq('id', bracketId)
}

// ── Agent Chat History ────────────────────────────────────────────────────────
export const saveChat = async (userId, bracketType, messages) => {
  const { data, error } = await supabase
    .from('agent_chats')
    .upsert({
      user_id: userId,
      bracket_type: bracketType,
      messages: messages,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,bracket_type' })
    .select()
  return { data, error }
}

export const getChat = async (userId, bracketType) => {
  const { data, error } = await supabase
    .from('agent_chats')
    .select('*')
    .eq('user_id', userId)
    .eq('bracket_type', bracketType)
    .single()
  return { data, error }
}

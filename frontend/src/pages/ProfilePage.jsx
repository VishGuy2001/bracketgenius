import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAuthStore } from '../hooks/useAuthStore'
import { getUserBrackets, deleteBracket, signOut } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Trophy, Trash2, LogOut, ExternalLink, User, Brain, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data, refetch } = useQuery({
    queryKey: ['brackets', user?.id],
    queryFn: () => getUserBrackets(user?.id),
    enabled: !!user?.id
  })

  const brackets = data?.data || []

  const handleDelete = async (id) => {
    if (!confirm('Delete this bracket?')) return
    await deleteBracket(id)
    refetch()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card border border-genius-border p-6 rounded-2xl mb-8 flex items-center gap-5">
        {user?.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} className="w-16 h-16 rounded-2xl border-2 border-genius-gold/40" alt="Avatar" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-genius-gold/20 border border-genius-gold/40 flex items-center justify-center">
            <User className="w-8 h-8 text-genius-gold" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="font-display text-3xl tracking-wide text-genius-white">
            {user?.user_metadata?.full_name?.toUpperCase() || 'YOUR PROFILE'}
          </h1>
          <p className="text-genius-white/40 text-sm font-mono">{user?.email}</p>
        </div>
        <button onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-genius-white/40 hover:text-genius-orange transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Brackets', value: brackets.length, icon: <Trophy className="w-4 h-4" />, color: 'text-genius-gold' },
          { label: "Men's", value: brackets.filter(b => b.bracket_type === 'mens').length, icon: '🏀', color: 'text-genius-gold' },
          { label: "Women's", value: brackets.filter(b => b.bracket_type === 'womens').length, icon: '🏀', color: 'text-genius-pink' },
        ].map((s, i) => (
          <div key={i} className="glass-card border border-genius-border p-4 rounded-xl text-center">
            <div className={`${s.color} text-2xl font-display`}>{s.value}</div>
            <div className="text-genius-white/50 text-xs font-mono mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Brackets list */}
      <div>
        <h2 className="font-heading font-semibold text-genius-white text-lg mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-genius-gold" /> Your Brackets
        </h2>
        {brackets.length === 0 ? (
          <div className="glass-card border border-genius-border rounded-xl p-8 text-center">
            <div className="text-genius-white/30 mb-3 text-4xl">🏀</div>
            <p className="text-genius-white/40 text-sm">No brackets yet. Go build one!</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4 text-sm">
              Start Building
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {brackets.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="glass-card border border-genius-border p-4 rounded-xl flex items-center gap-4 hover:border-genius-gold/30 transition-all">
                <div className="text-2xl">{b.bracket_type === 'mens' ? '🏀' : '🏀'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading text-genius-white text-sm truncate">{b.name}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs font-mono ${b.bracket_type === 'mens' ? 'text-genius-gold' : 'text-genius-pink'}`}>
                      {b.bracket_type === 'mens' ? "MEN'S" : "WOMEN'S"}
                    </span>
                    <span className="text-genius-white/30 text-xs flex items-center gap-1">
                      <Brain className="w-3 h-3" /> {b.reasoning_mode}
                    </span>
                    <span className="text-genius-white/30 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(b.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/bracket/${b.bracket_type}`)}
                    className="p-2 rounded-lg hover:bg-genius-gold/10 text-genius-white/40 hover:text-genius-gold transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-lg hover:bg-genius-orange/10 text-genius-white/40 hover:text-genius-orange transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

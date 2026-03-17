import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../hooks/useAuthStore'
import { getUserBrackets } from '../lib/supabase'
import { Trophy, Brain, Plus, Clock, ChevronRight, TrendingUp, Activity, Users } from 'lucide-react'
import { apiFetch } from '../lib/api'


export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Champion'

  const { data: bracketsData } = useQuery({
    queryKey: ['brackets', user?.id],
    queryFn: () => getUserBrackets(user?.id),
    enabled: !!user?.id
  })

  const brackets = bracketsData?.data || []

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-genius-gold text-2xl">👋</span>
          <h1 className="font-display text-5xl tracking-wide text-genius-white">
            WELCOME BACK, <span className="text-genius-gold">{firstName.toUpperCase()}</span>
          </h1>
        </div>
        <p className="text-genius-white/50 ml-10">Your AI bracket intelligence dashboard</p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Brackets Created', value: brackets.length, icon: <Trophy className="w-4 h-4" />, color: 'text-genius-gold' },
          { label: 'AI Analyses Run', value: '—', icon: <Brain className="w-4 h-4" />, color: 'text-genius-purple' },
          { label: 'Teams Analyzed', value: '68', icon: <Users className="w-4 h-4" />, color: 'text-genius-teal' },
          { label: 'Data Points / Game', value: '47+', icon: <Activity className="w-4 h-4" />, color: 'text-genius-orange' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card border border-genius-border p-5">
            <div className={`flex items-center gap-2 mb-3 ${s.color}`}>{s.icon}<span className="text-xs font-mono uppercase tracking-wider">{s.label}</span></div>
            <div className={`font-display text-4xl ${s.color}`}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tournament cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <TournamentCard
          type="mens"
          title="Men's NCAA Tournament"
          color="genius-gold"
          colorHex="#F0B429"
          emoji="🏀"
          description="64 teams. 6 rounds. AI-powered picks with live injury data and coach performance metrics."
          onClick={() => navigate('/bracket/mens')}
        />
        <TournamentCard
          type="womens"
          title="Women's NCAA Tournament"
          color="genius-pink"
          colorHex="#EC4899"
          emoji="🏀"
          description="Equal depth AI analysis for the Women's tournament. Separate model, same genius-level intelligence."
          onClick={() => navigate('/bracket/womens')}
        />
      </div>

      {/* AI Predictions */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <AIPredictions type="mens" />
        <AIPredictions type="womens" />
      </div>

      {/* Agent CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card border border-genius-purple/30 bg-genius-purple/5 p-6 rounded-2xl flex items-center justify-between mb-10 cursor-pointer hover:border-genius-purple/60 transition-all"
        onClick={() => navigate('/agent')}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-genius-purple/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-genius-purple" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-genius-white text-lg">Chat with BracketGenius AI</h3>
            <p className="text-genius-white/50 text-sm">Ask about any team, matchup, or get personalized bracket advice</p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-genius-purple" />
      </motion.div>

      {/* Saved brackets */}
      {brackets.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-genius-white text-xl mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-genius-white/40" /> Saved Brackets
          </h2>
          <div className="grid gap-3">
            {brackets.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="glass-card border border-genius-border p-4 flex items-center justify-between hover:border-genius-gold/30 cursor-pointer transition-all"
                onClick={() => navigate(`/bracket/${b.bracket_type}`)}>
                <div className="flex items-center gap-3">
                  <span>{b.bracket_type === 'mens' ? '🏀' : '🏀'}</span>
                  <div>
                    <div className="font-heading text-genius-white text-sm">{b.name}</div>
                    <div className="text-genius-white/40 text-xs font-mono">
                      {b.bracket_type === 'mens' ? "Men's" : "Women's"} · Updated {new Date(b.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-genius-white/30" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TournamentCard({ type, title, color, colorHex, emoji, description, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`glass-card border border-${color}/20 bg-${color}/5 p-6 cursor-pointer rounded-2xl transition-all duration-300`}
      style={{ '--hover-shadow': `0 0 40px ${colorHex}33` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-3xl mb-2">{emoji}</div>
          <h3 className={`font-display text-2xl tracking-wide text-${color}`}>{title.toUpperCase()}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full bg-${color}/15 border border-${color}/30 text-xs font-mono text-${color}`}>
          {type === 'mens' ? "MEN'S" : "WOMEN'S"}
        </div>
      </div>
      <p className="text-genius-white/60 text-sm leading-relaxed mb-6">{description}</p>
      <div className={`flex items-center gap-2 text-${color} font-heading text-sm font-medium`}>
        <Plus className="w-4 h-4" />
        Build Your Bracket
        <ChevronRight className="w-4 h-4 ml-auto" />
      </div>
    </motion.div>
  )
}


function AIPredictions({ type }) {
  const { data, isLoading } = useQuery({
    queryKey: ['predictions', type],
    queryFn: async () => {
      const res = await apiFetch(`/api/bracket/${type}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })

  if (isLoading) return (
    <div className="glass-card border border-genius-purple/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-genius-purple text-sm font-mono animate-pulse">
        <Brain className="w-4 h-4" /> AI analyzing all 64 teams...
      </div>
    </div>
  )

  if (!data) return null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card border border-genius-purple/30 bg-genius-purple/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-genius-purple" />
        <h3 className="font-heading font-semibold text-genius-white">
          AI Bracket Prediction — {type === 'mens' ? "Men's" : "Women's"}
        </h3>
        <span className="ml-auto text-xs font-mono text-genius-purple border border-genius-purple/30 px-2 py-0.5 rounded-full">
          ✨ Genius
        </span>
      </div>

      {/* Champion */}
      <div className="bg-genius-gold/15 border border-genius-gold/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
        <Trophy className="w-5 h-5 text-genius-gold flex-shrink-0" />
        <div>
          <div className="text-xs font-mono text-genius-gold/70 mb-0.5">PREDICTED CHAMPION</div>
          <div className="font-display text-2xl text-genius-gold tracking-wide">{data.champion}</div>
        </div>
      </div>

      {/* Final Four */}
      <div className="mb-4">
        <div className="text-xs font-mono text-genius-white/40 mb-2">FINAL FOUR</div>
        <div className="grid grid-cols-2 gap-2">
          {data.finalFour?.map((team, i) => (
            <div key={i} className="bg-genius-card border border-genius-border rounded-lg px-3 py-2 text-sm font-heading text-genius-white">
              {team}
            </div>
          ))}
        </div>
      </div>

      {/* Analysis */}
      {data.analysis && (
        <p className="text-genius-white/60 text-sm leading-relaxed mb-3">{data.analysis}</p>
      )}

      {/* Dark horse + upset pick */}
      <div className="grid grid-cols-2 gap-3">
        {data.darkHorse && (
          <div className="bg-genius-dark rounded-lg p-3 border border-genius-border">
            <div className="text-xs font-mono text-genius-teal mb-1">🌙 DARK HORSE</div>
            <div className="text-sm font-heading text-genius-white">{data.darkHorse}</div>
          </div>
        )}
        {data.topUpsetPick && (
          <div className="bg-genius-dark rounded-lg p-3 border border-genius-border">
            <div className="text-xs font-mono text-genius-orange mb-1">🔥 TOP UPSET PICK</div>
            <div className="text-sm font-heading text-genius-white">{data.topUpsetPick}</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

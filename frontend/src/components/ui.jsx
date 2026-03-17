import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { injuryBadgeStyle, confidenceColor, confidenceLabel } from '../utils/helpers'

// ── Injury badge ─────────────────────────────────────────────────────────────
export function InjuryBadge({ player, status, impact }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${injuryBadgeStyle(impact)}`}>
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      <span className="font-mono">{player}</span>
      <span className="opacity-70">— {status}</span>
    </div>
  )
}

// ── Confidence pill ───────────────────────────────────────────────────────────
export function ConfidencePill({ prob }) {
  const color  = confidenceColor(prob)
  const label  = confidenceLabel(prob)
  const Icon   = prob >= 50 ? TrendingUp : prob >= 35 ? Minus : TrendingDown

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono"
      style={{ color, borderColor: `${color}40`, background: `${color}15` }}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  )
}

// ── Seed badge ───────────────────────────────────────────────────────────────
export function SeedBadge({ seed }) {
  if (!seed || seed === '?') return null
  const isTop = parseInt(seed) <= 4
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold ${
      isTop
        ? 'bg-genius-gold/20 text-genius-gold border border-genius-gold/30'
        : 'bg-genius-border text-genius-white/50'
    }`}>#{seed}</span>
  )
}

// ── Loading spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 'md', color = 'text-genius-gold' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={`${sz} ${color} animate-spin`}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '🏀', title, description, action }) {
  return (
    <div className="glass-card border border-genius-border rounded-2xl p-10 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-heading font-semibold text-genius-white text-lg mb-2">{title}</h3>
      {description && <p className="text-genius-white/40 text-sm mb-5">{description}</p>}
      {action}
    </div>
  )
}

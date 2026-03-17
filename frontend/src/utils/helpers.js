// ── Seed helpers ─────────────────────────────────────────────────────────────
export const seedColor = (seed) => {
  if (seed === 1)  return '#F0B429'  // gold
  if (seed <= 4)   return '#FF8C42'  // orange
  if (seed <= 8)   return '#3D7FFF'  // blue
  if (seed <= 12)  return '#8B5CF6'  // purple
  return '#6B7280'                    // gray
}

export const seedLabel = (seed) => {
  if (!seed || seed === '?') return '—'
  return `#${seed}`
}

// ── Confidence helpers ───────────────────────────────────────────────────────
export const confidenceColor = (prob) => {
  if (prob >= 70) return '#00D4AA'   // teal — high confidence
  if (prob >= 50) return '#F0B429'   // gold — medium
  return '#FF6B2B'                    // orange — low / upset watch
}

export const confidenceLabel = (prob) => {
  if (prob >= 80) return 'Strong Favorite'
  if (prob >= 65) return 'Moderate Favorite'
  if (prob >= 50) return 'Slight Favorite'
  if (prob >= 35) return 'Slight Underdog'
  return 'Upset Watch 🔥'
}

// ── Round names ──────────────────────────────────────────────────────────────
export const ROUND_NAMES = [
  'Round of 64',
  'Round of 32',
  'Sweet 16',
  'Elite Eight',
  'Final Four',
  'Championship',
]

// ── Bracket type label ───────────────────────────────────────────────────────
export const bracketLabel = (type) =>
  type === 'mens' ? "Men's NCAA" : "Women's NCAA"

// ── Date helpers ─────────────────────────────────────────────────────────────
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return formatDate(iso)
}

// ── Injury impact badge ──────────────────────────────────────────────────────
export const injuryBadgeStyle = (impact) => {
  switch (impact) {
    case 'HIGH':   return 'bg-red-500/15 text-red-400 border-red-500/30'
    case 'MEDIUM': return 'bg-genius-orange/15 text-genius-orange border-genius-orange/30'
    default:       return 'bg-genius-border text-genius-white/50 border-genius-border'
  }
}

// ── clsx-lite ────────────────────────────────────────────────────────────────
export const cx = (...classes) => classes.filter(Boolean).join(' ')

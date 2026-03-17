import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, Trophy } from 'lucide-react'

export default function TeamCard({ team, onClick }) {
  const { name, seed, record, conference, winProb, injuries, coachRating } = team

  const confidenceColor =
    winProb >= 70 ? '#00D4AA' :
    winProb >= 45 ? '#F0B429' :
    '#FF6B2B'

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card border border-genius-border rounded-xl p-3 cursor-pointer hover:border-genius-gold/30 transition-all"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            {seed && seed !== '—' && (
              <span className={`text-xs font-mono rounded px-1 py-0.5 ${
                parseInt(seed) <= 4
                  ? 'bg-genius-gold/20 text-genius-gold'
                  : 'bg-genius-border text-genius-white/50'
              }`}>#{seed}</span>
            )}
            <span className="font-heading font-semibold text-genius-white text-sm">{name}</span>
          </div>
          {conference && conference !== '—' && (
            <span className="text-genius-white/30 text-xs font-mono">{conference}</span>
          )}
        </div>
        {winProb && (
          <div className="text-right">
            <div className="text-sm font-mono font-bold" style={{ color: confidenceColor }}>{winProb}%</div>
            <div className="text-genius-white/30 text-[10px] font-mono">WIN PROB</div>
          </div>
        )}
      </div>

      {/* Record */}
      {record && record !== '—' && (
        <div className="flex items-center gap-1.5 mb-2">
          <Trophy className="w-3 h-3 text-genius-white/30" />
          <span className="text-genius-white/50 text-xs font-mono">{record}</span>
        </div>
      )}

      {/* Win prob bar */}
      {winProb && (
        <div className="mt-2">
          <div className="h-1.5 bg-genius-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${winProb}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: confidenceColor }}
            />
          </div>
        </div>
      )}

      {/* Injury flag */}
      {injuries && injuries.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-genius-orange">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs">{injuries[0].player} ({injuries[0].status})</span>
        </div>
      )}
    </motion.div>
  )
}

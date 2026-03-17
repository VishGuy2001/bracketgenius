// WinProbBar.jsx
import { motion } from 'framer-motion'

export default function WinProbBar({ team1, team2, prob1, prob2, color1 = '#F0B429', color2 = '#3D7FFF' }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-heading mb-1.5">
        <span className="text-genius-white truncate max-w-[45%]">{team1}</span>
        <span className="text-genius-white/40 font-mono text-[10px] self-center">WIN PROB</span>
        <span className="text-genius-white truncate max-w-[45%] text-right">{team2}</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-genius-border gap-px">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${prob1}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-l-full"
          style={{ background: color1 }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${prob2}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="h-full rounded-r-full"
          style={{ background: color2 }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs font-mono" style={{ color: color1 }}>{prob1}%</span>
        <span className="text-xs font-mono" style={{ color: color2 }}>{prob2}%</span>
      </div>
    </div>
  )
}

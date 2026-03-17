import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBracketStore } from '../hooks/useAuthStore'
import { Brain, ChevronDown, ChevronUp, AlertCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReasoningPanel({ matchup, type, reasoningMode }) {
  const { customWeights } = useBracketStore()
  const [showWhy, setShowWhy] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['analysis', matchup?.id, type, reasoningMode, JSON.stringify(customWeights)],
    queryFn: () => fetch('/api/analyze/matchup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchup, type, reasoningMode, customWeights })
    }).then(r => r.json()),
    enabled: !!matchup,
  })

  if (!matchup) return null
  const t1 = matchup.teams?.[0]
  const t2 = matchup.teams?.[1]

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card border border-genius-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-genius-border/50 bg-genius-card/50">
        <Brain className="w-4 h-4 text-genius-purple" />
        <span className="font-heading text-sm font-semibold text-genius-white">
          {t1?.name} vs {t2?.name}
        </span>
        {data?.mode && (
          <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full border border-genius-purple/30 text-genius-purple">
            {data.mode === 'genius' ? '✨ Genius' : data.mode === 'deep' ? '🧠 Deep' : '⚡ Quick'}
          </span>
        )}
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-genius-white/40 text-sm font-mono">
              <Brain className="w-4 h-4 animate-pulse text-genius-purple" />
              Analyzing {t1?.name} vs {t2?.name}...
            </div>
            {[70,50,85,40].map((w,i) => <div key={i} className="skeleton rounded h-3" style={{width:`${w}%`}}/>)}
          </div>
        ) : data ? (
          <div className="space-y-4">

            {/* Win probability bar */}
            <div>
              <div className="flex justify-between text-xs font-heading mb-1.5">
                <span className="text-genius-white font-medium">{t1?.name}</span>
                <span className="text-genius-white/40 font-mono">WIN PROBABILITY</span>
                <span className="text-genius-white font-medium">{t2?.name}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-genius-border gap-0.5">
                <motion.div initial={{width:0}} animate={{width:`${data.team1WinProb}%`}}
                  transition={{duration:0.8,ease:'easeOut'}}
                  className="h-full rounded-l-full bg-genius-gold"/>
                <motion.div initial={{width:0}} animate={{width:`${data.team2WinProb}%`}}
                  transition={{duration:0.8,ease:'easeOut',delay:0.1}}
                  className="h-full rounded-r-full bg-genius-blue"/>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-genius-gold text-xs font-mono font-bold">{data.team1WinProb}%</span>
                <span className="text-genius-blue text-xs font-mono font-bold">{data.team2WinProb}%</span>
              </div>
            </div>

            {/* Pick + one liner — all user sees by default */}
            <div className="flex items-start gap-3 bg-genius-gold/10 border border-genius-gold/20 rounded-xl px-4 py-3">
              <Zap className="w-4 h-4 text-genius-gold flex-shrink-0 mt-0.5"/>
              <div>
                <span className="text-genius-gold font-heading font-semibold text-sm">Pick: {data.pick} </span>
                <span className="text-genius-white/70 text-sm">{data.oneLiner}</span>
              </div>
            </div>

            {/* Upset alert */}
            {data.upsetAlert && (
              <div className="flex items-center gap-2 text-genius-orange bg-genius-orange/10 border border-genius-orange/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4"/>
                <span className="text-xs font-mono font-semibold">UPSET WATCH 🔥</span>
              </div>
            )}

            {/* Injury alerts */}
            {data.injuries?.length > 0 && (
              <div className="flex items-start gap-2 text-genius-orange bg-genius-orange/10 border border-genius-orange/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>
                <div className="text-xs">{data.injuries.join(' · ')}</div>
              </div>
            )}

            {/* Why? button */}
            <button onClick={() => setShowWhy(!showWhy)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-genius-border hover:border-genius-purple/40 hover:bg-genius-purple/5 text-genius-white/50 hover:text-genius-purple text-xs font-mono transition-all">
              {showWhy ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
              {showWhy ? 'Hide reasoning' : 'Why? Show me the reasoning'}
            </button>

            {/* Deep reasoning — hidden until user clicks Why? */}
            <AnimatePresence>
              {showWhy && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}
                  exit={{opacity:0,height:0}} className="space-y-4 overflow-hidden">

                  {/* Factor bars */}
                  {data.factors?.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {data.factors.map((f,i) => (
                        <div key={i} className="bg-genius-dark rounded-xl p-3 border border-genius-border">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-sm">{f.icon}</span>
                            <span className="text-xs font-mono text-genius-white/50 uppercase tracking-wide">{f.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-genius-border rounded-full overflow-hidden">
                              <motion.div initial={{width:0}} animate={{width:`${f.value}%`}}
                                transition={{duration:0.7,delay:i*0.1}}
                                className="h-full rounded-full" style={{background:f.color}}/>
                            </div>
                            <span className="text-xs font-mono text-genius-white/50 whitespace-nowrap">{f.edge}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI reasoning text */}
                  <div className="bg-genius-dark/60 rounded-xl p-4 border border-genius-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-3.5 h-3.5 text-genius-purple"/>
                      <span className="text-xs font-mono text-genius-purple uppercase tracking-wide">AI Reasoning</span>
                    </div>
                    <p className="text-genius-white/70 text-sm leading-relaxed">{data.reasoning}</p>
                  </div>

                  {/* Genius model comparison */}
                  {data.geniusDetail && (
                    <div className="rounded-xl border p-4 space-y-3"
                      style={{borderColor:`${data.geniusDetail.consensusColor}40`, background:`${data.geniusDetail.consensusColor}08`}}>
                      <span className="text-xs font-mono font-semibold" style={{color:data.geniusDetail.consensusColor}}>
                        {data.geniusDetail.consensusLabel}
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-genius-dark/50 rounded-lg p-2.5 border border-genius-border">
                          <div className="font-mono text-genius-white/40 mb-1">⚡ GEMINI</div>
                          <div className="font-semibold text-genius-white">{data.geniusDetail.geminiPick}</div>
                          <div className="text-genius-gold font-mono">{data.geniusDetail.geminiProb}%</div>
                          <p className="text-genius-white/50 mt-1 leading-relaxed">{data.geniusDetail.geminiReasoning}</p>
                        </div>
                        <div className="bg-genius-dark/50 rounded-lg p-2.5 border border-genius-border">
                          <div className="font-mono text-genius-white/40 mb-1">🧠 CLAUDE</div>
                          <div className="font-semibold text-genius-white">{data.geniusDetail.claudePick}</div>
                          <div className="text-genius-purple font-mono">{data.geniusDetail.claudeProb}%</div>
                          <p className="text-genius-white/50 mt-1 leading-relaxed">{data.geniusDetail.claudeReasoning}</p>
                        </div>
                      </div>
                      {data.geniusDetail.upsetSignal && (
                        <div className="text-xs text-genius-orange font-mono">
                          ⚠️ Models disagreed by {data.geniusDetail.disagreement}% — strong upset signal
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-genius-white/40 text-sm">Click a matchup to see analysis.</p>
        )}
      </div>
    </motion.div>
  )
}
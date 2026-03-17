import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../hooks/useAuthStore'
import { X, ChevronRight, ChevronLeft, Brain, Sliders, MessageSquare, Trophy, Target } from 'lucide-react'

const TOUR_STEPS = [
  {
    title: "Welcome to BracketGenius! 🧠",
    icon: <Trophy className="w-8 h-8 text-genius-gold" />,
    content: "You've just unlocked the most intelligent NCAA bracket tool ever built. Let us show you around in 60 seconds.",
    highlight: null,
  },
  {
    title: "Choose Your Tournament",
    icon: <Target className="w-8 h-8 text-genius-blue" />,
    content: "Pick Men's or Women's bracket from the dashboard. Both get the same depth of AI analysis — live data, injuries, coach stats, and 30 years of historical patterns.",
    highlight: null,
  },
  {
    title: "Three Ways to Reason",
    icon: <Brain className="w-8 h-8 text-genius-purple" />,
    content: "Pure AI mode lets the algorithm decide. Custom mode lets you weight factors like 'seed difference' vs 'coach experience' vs 'injury impact'. Chat mode is a full conversation with your AI agent.",
    highlight: null,
  },
  {
    title: "Win Probability Scores",
    icon: <Sliders className="w-8 h-8 text-genius-teal" />,
    content: "Every matchup shows a % breakdown. Green = confident AI pick. Orange = close game. The AI explains its reasoning for every single pick — no black box.",
    highlight: null,
  },
  {
    title: "Chat with the AI Agent",
    icon: <MessageSquare className="w-8 h-8 text-genius-purple" />,
    content: 'Hit "AI Agent" in the nav to ask anything: "Who are the biggest upset risks?" "Compare these two coaches" "Which team is most hurt by injuries?" The agent has real data.',
    highlight: null,
  },
  {
    title: "You're ready. Let's build.",
    icon: <span className="text-5xl">🏆</span>,
    content: "Your brackets save automatically to your account. Build as many as you want — experiment with different reasoning styles, compare outcomes, and may the best bracket win.",
    highlight: null,
    isFinal: true,
  },
]

export default function OnboardingTour() {
  const { hasSeenTour, markTourSeen } = useAuthStore()
  const [step, setStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  if (hasSeenTour || dismissed) return null

  const current = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1

  const finish = () => {
    markTourSeen()
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="glass-card border border-genius-gold/30 rounded-2xl p-8 max-w-md w-full relative shadow-gold"
        >
          {/* Close */}
          <button onClick={finish} className="absolute top-4 right-4 text-genius-white/30 hover:text-genius-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Progress dots */}
          <div className="flex gap-1.5 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? 'bg-genius-gold w-6' : i < step ? 'bg-genius-gold/40 w-3' : 'bg-genius-border w-3'
              }`} />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-genius-card border border-genius-border flex items-center justify-center">
              {current.icon}
            </div>
          </div>

          {/* Content */}
          <h2 className="font-display text-2xl tracking-wide text-genius-white text-center mb-3">{current.title.toUpperCase()}</h2>
          <p className="text-genius-white/60 text-sm leading-relaxed text-center mb-8">{current.content}</p>

          {/* Step counter */}
          <div className="text-center text-xs font-mono text-genius-white/30 mb-4">
            {step + 1} of {TOUR_STEPS.length}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {isLast ? (
              <button onClick={finish} className="btn-primary flex-1 text-sm py-2.5">
                Start Building! 🏀
              </button>
            ) : (
              <button onClick={() => setStep(step + 1)}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isLast && (
            <button onClick={finish} className="w-full text-center mt-3 text-xs text-genius-white/30 hover:text-genius-white/60 transition-colors">
              Skip tour
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

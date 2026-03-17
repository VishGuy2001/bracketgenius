import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { signInWithGoogle } from '../lib/supabase'
import { useAuthStore } from '../hooks/useAuthStore'
import { Brain, Zap, Trophy, Users, ChevronRight, Star, Target, TrendingUp } from 'lucide-react'

const TICKER_ITEMS = [
  '🏀 Duke +85% win probability', '📊 47 data points analyzed per game',
  '🧠 AI trained on 30 years of March Madness', '⚡ Real-time injury updates',
  '🎯 Seed-based upset detection', '📈 Coach performance metrics',
  '🏆 Custom reasoning weights', '🔥 Live bracket tracking',
  '💡 Women\'s & Men\'s brackets', '🤖 Conversational AI agent',
]

const FEATURES = [
  {
    icon: <Brain className="w-6 h-6" />,
    color: 'text-genius-purple',
    bg: 'bg-genius-purple/10 border-genius-purple/20',
    title: 'Deep AI Analysis',
    desc: 'Powered by Gemini 1.5 Flash + Claude. Analyzes 47 data points per team including historical performance, coach records, and injury rosters.'
  },
  {
    icon: <Target className="w-6 h-6" />,
    color: 'text-genius-gold',
    bg: 'bg-genius-gold/10 border-genius-gold/20',
    title: 'Your Reasoning, Your Bracket',
    desc: 'Set custom weights: favor stats over gut, or mix them. The AI adapts its predictions to your style of thinking.'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: 'text-genius-teal',
    bg: 'bg-genius-teal/10 border-genius-teal/20',
    title: 'Live Data Feeds',
    desc: 'ESPN real-time scores, injury reports, lineup changes, and team news — all synthesized before you make each pick.'
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'text-genius-orange',
    bg: 'bg-genius-orange/10 border-genius-orange/20',
    title: 'Win Probability Scores',
    desc: 'Every matchup gets a percentage breakdown with confidence levels. Know exactly why the AI thinks team A beats team B.'
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: 'text-genius-blue',
    bg: 'bg-genius-blue/10 border-genius-blue/20',
    title: 'Both Tournaments',
    desc: "Men's AND Women's March Madness treated with equal depth. Separate brackets, separate AI models, same genius."
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    color: 'text-genius-pink',
    bg: 'bg-genius-pink/10 border-genius-pink/20',
    title: 'Bracket History',
    desc: 'All your brackets saved to your account. Compare picks across years, see your accuracy trends, share with friends.'
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  const handleSignIn = async () => {
    setIsSigningIn(true)
    await signInWithGoogle()
    setIsSigningIn(false)
  }

  return (
    <div className="min-h-screen bg-genius-black overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] bg-genius-gold/8 top-[-200px] left-[-200px] animate-float" />
        <div className="orb w-[500px] h-[500px] bg-genius-purple/10 top-[20%] right-[-150px]" style={{animationDelay:'2s', animation:'float 8s ease-in-out infinite'}} />
        <div className="orb w-[400px] h-[400px] bg-genius-blue/8 bottom-[10%] left-[20%]" style={{animationDelay:'4s', animation:'float 10s ease-in-out infinite'}} />
      </div>

      {/* Court grid overlay */}
      <div className="fixed inset-0 court-bg opacity-100 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <LogoSVG size={36} />
          <span className="font-display text-2xl tracking-wider text-genius-white">BRACKET<span className="text-genius-gold">GENIUS</span></span>
        </div>
        <button onClick={handleSignIn} className="btn-secondary text-sm">
          Sign In with Google
        </button>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-genius-gold/30 bg-genius-gold/10 text-genius-gold text-sm font-mono tracking-wide">
            <span className="w-2 h-2 rounded-full bg-genius-gold animate-pulse" />
            2026 MARCH MADNESS — LIVE
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-display text-[clamp(4rem,12vw,9rem)] leading-none tracking-wide mb-6 max-w-5xl"
        >
          <span className="text-genius-white">BRACKET</span>
          <br />
          <span className="shimmer-text">GENIUS</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-genius-white/60 text-xl max-w-2xl mb-10 font-heading leading-relaxed"
        >
          A sample AI-powered tool for NCAA bracket prediction.
          AI-powered analysis for Men's & Women's March Madness —
          with real data, live updates, and reasoning that adapts to <em>you</em>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="btn-primary flex items-center gap-3 text-lg px-8 py-4 animate-pulse-gold"
          >
            <GoogleIcon />
            {isSigningIn ? 'Signing you in...' : 'Start Building Free'}
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-genius-white/40 text-sm font-mono">No credit card. Free forever.</span>
        </motion.div>

        {/* Floating bracket preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7 }}
          className="mt-20 relative"
        >
          <BracketPreview />
        </motion.div>
      </section>

      {/* Ticker */}
      <div className="relative z-10 border-y border-genius-border/50 bg-genius-darkest/80 backdrop-blur-sm py-3 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap w-max">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-genius-white/50 text-sm font-mono tracking-wide">{item}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-32">
        <div className="text-center mb-16">
          <h2 className="font-display text-6xl text-genius-white tracking-wide mb-4">
            BUILT DIFFERENT
          </h2>
          <p className="text-genius-white/50 text-lg max-w-xl mx-auto">
            Not another ESPN clone. BracketGenius is an AI agent that thinks, learns, and adapts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card border p-6 hover:scale-[1.02] transition-all duration-300 ${f.bg}`}
            >
              <div className={`${f.color} mb-4`}>{f.icon}</div>
              <h3 className="font-heading font-semibold text-genius-white text-lg mb-2">{f.title}</h3>
              <p className="text-genius-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-20">
        <div className="glass-card border border-genius-gold/20 p-10 text-center">
          <h2 className="font-display text-5xl text-genius-white tracking-wide mb-8">HOW IT WORKS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose Your Tournament', desc: "Pick Men's, Women's, or build both brackets side-by-side" },
              { step: '02', title: 'Set Your Reasoning', desc: 'Pure AI, custom weighted stats, or chat with the agent to refine picks round by round' },
              { step: '03', title: 'Build & Track', desc: 'Watch win probabilities update live. Save, share, and compare your bracket history' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="font-display text-5xl text-genius-gold mb-3">{item.step}</div>
                <h4 className="font-heading font-semibold text-genius-white mb-2">{item.title}</h4>
                <p className="text-genius-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <button onClick={handleSignIn} className="btn-primary mt-10 flex items-center gap-2 mx-auto">
            <GoogleIcon /> Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-genius-border/30 py-8 px-8 flex items-center justify-between max-w-7xl mx-auto text-genius-white/30 text-sm font-mono">
        <div className="flex items-center gap-2">
          <LogoSVG size={20} />
          BRACKETGENIUS © 2026
        </div>
        <span>Built with AI · Free Forever · No Ads</span>
      </footer>
    </div>
  )
}

function BracketPreview() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Glow */}
      <div className="absolute inset-0 bg-genius-gold/5 rounded-3xl blur-3xl scale-110" />
      <div className="glass-card border border-genius-gold/20 p-6 rounded-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display text-2xl tracking-wider text-genius-gold">BRACKET PREVIEW</span>
          <div className="flex gap-2">
            <span className="stat-pill text-genius-teal border-genius-teal/30">MENS</span>
            <span className="stat-pill text-genius-pink border-genius-pink/30">WOMENS</span>
          </div>
        </div>
        <svg viewBox="0 0 700 200" className="w-full" fill="none">
          {/* Left region matchups */}
          {[0,1,2,3].map(i => (
            <g key={i}>
              <rect x="10" y={i*46+10} width="130" height="18" rx="4" fill={i===0?"rgba(240,180,41,0.15)":"rgba(26,30,43,0.8)"} stroke={i===0?"rgba(240,180,41,0.4)":"rgba(37,42,58,0.6)"} strokeWidth="0.5"/>
              <text x="20" y={i*46+23} fontSize="8" fill={i===0?"#F0B429":"rgba(240,242,255,0.6)"} fontFamily="DM Sans">
                {['(1) Duke', '(8) Ohio St', '(2) UConn', '(5) St Johns'][i]}
              </text>
              <text x="130" y={i*46+23} fontSize="7" fill="rgba(240,242,255,0.35)" textAnchor="end" fontFamily="monospace">
                {['87%','13%','72%','28%'][i]}
              </text>
            </g>
          ))}
          {/* Lines */}
          <path d="M140 19 L160 19 L160 65 L140 65" stroke="rgba(240,180,41,0.3)" strokeWidth="1" fill="none"/>
          <path d="M140 101 L160 101 L160 147 L140 147" stroke="rgba(61,127,255,0.3)" strokeWidth="1" fill="none"/>
          {/* Round 2 */}
          <rect x="160" y="34" width="120" height="18" rx="4" fill="rgba(240,180,41,0.1)" stroke="rgba(240,180,41,0.3)" strokeWidth="0.5"/>
          <text x="170" y="47" fontSize="8" fill="#F0B429" fontFamily="DM Sans">(1) Duke · EAST</text>
          <text x="270" y="47" fontSize="7" fill="rgba(240,242,255,0.35)" textAnchor="end" fontFamily="monospace">87%</text>
          <rect x="160" y="116" width="120" height="18" rx="4" fill="rgba(26,30,43,0.8)" stroke="rgba(37,42,58,0.6)" strokeWidth="0.5"/>
          <text x="170" y="129" fontSize="8" fill="rgba(240,242,255,0.6)" fontFamily="DM Sans">(2) UConn</text>
          <text x="270" y="129" fontSize="7" fill="rgba(240,242,255,0.35)" textAnchor="end" fontFamily="monospace">72%</text>
          {/* Lines to elite 8 */}
          <path d="M280 43 L310 43 L310 129 L280 129" stroke="rgba(240,180,41,0.25)" strokeWidth="1" fill="none"/>
          {/* Elite 8 */}
          <rect x="310" y="78" width="130" height="22" rx="6" fill="rgba(240,180,41,0.2)" stroke="rgba(240,180,41,0.5)" strokeWidth="1"/>
          <text x="320" y="93" fontSize="9" fill="#F0B429" fontFamily="DM Sans" fontWeight="600">(1) Duke · ELITE 8</text>
          {/* AI badge */}
          <rect x="455" y="74" width="80" height="30" rx="8" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8"/>
          <text x="495" y="86" fontSize="7" fill="#8B5CF6" textAnchor="middle" fontFamily="monospace">AI PICK</text>
          <text x="495" y="98" fontSize="9" fill="#8B5CF6" textAnchor="middle" fontFamily="DM Sans" fontWeight="600">87% win</text>
          {/* Right side mirror */}
          {[0,1,2,3].map(i => (
            <g key={i}>
              <rect x="555" y={i*46+10} width="130" height="18" rx="4" fill={i===1?"rgba(0,212,170,0.1)":"rgba(26,30,43,0.8)"} stroke={i===1?"rgba(0,212,170,0.3)":"rgba(37,42,58,0.6)"} strokeWidth="0.5"/>
              <text x="565" y={i*46+23} fontSize="8" fill={i===1?"#00D4AA":"rgba(240,242,255,0.6)"} fontFamily="DM Sans">
                {['(1) South Carolina', '(2) UCLA', '(1) UConn', '(2) LSU'][i]}
              </text>
            </g>
          ))}
          <text x="350" y="170" fontSize="9" fill="rgba(240,242,255,0.3)" textAnchor="middle" fontFamily="monospace">
            ← AI ANALYZING 64 TEAMS · LIVE DATA →
          </text>
        </svg>
      </div>
    </div>
  )
}

function LogoSVG({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0B429"/>
          <stop offset="50%" stopColor="#FF6B2B"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
      <path d="M20 20 L14 20 L14 60 L20 60" stroke="url(#lg1)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M60 20 L66 20 L66 60 L60 60" stroke="url(#lg1)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="40" cy="40" r="12" stroke="url(#lg1)" strokeWidth="2" fill="none" opacity="0.5"/>
      <circle cx="40" cy="35" r="3" fill="#F0B429"/>
      <circle cx="40" cy="45" r="3" fill="#8B5CF6"/>
      <line x1="28" y1="40" x2="52" y2="40" stroke="url(#lg1)" strokeWidth="1.5"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

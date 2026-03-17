import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../hooks/useAuthStore'
import { Brain, Send, RefreshCw, Sparkles, User } from 'lucide-react'

const SUGGESTED_PROMPTS = [
  "Who are the biggest upset risks in the Men's tournament?",
  "Compare Duke vs UConn — who should I pick?",
  "Which coaches have the best March Madness records?",
  "Show me teams with major injury concerns",
  "Which #5 vs #12 matchup is most likely to upset?",
  "Build me the safest possible bracket",
  "Who is the Women's favorite to win it all?",
  "Analyze South Carolina's chances to win the Women's title",
]

export default function AgentPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey! I'm **BracketGenius AI** — your March Madness expert. I can analyze any team, predict matchups, compare coaches, check injury reports, and help you build the perfect bracket.\n\nWhat would you like to know?`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [bracketType, setBracketType] = useState('mens')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg || isThinking) return
    setInput('')

    setMessages(prev => [...prev, {
      role: 'user', content: userMsg, timestamp: new Date()
    }])

    setIsThinking(true)

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          bracketType,
          userId: user?.id,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        teams: data.teams,
        timestamp: new Date()
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-genius-white">
            AI <span className="text-genius-purple">AGENT</span>
          </h1>
          <p className="text-genius-white/40 text-sm">Your conversational bracket intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tournament toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-genius-card border border-genius-border">
            {[{id:'mens',label:"Men's"},{id:'womens',label:"Women's"}].map(t => (
              <button key={t.id} onClick={() => setBracketType(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  bracketType === t.id ? 'bg-genius-purple/30 text-genius-purple border border-genius-purple/40' : 'text-genius-white/50 hover:text-genius-white'
                }`}>{t.label}</button>
            ))}
          </div>
          <button onClick={() => setMessages([messages[0]])}
            className="p-2 rounded-lg border border-genius-border text-genius-white/40 hover:text-genius-white hover:border-genius-gold/40 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                msg.role === 'assistant'
                  ? 'bg-genius-purple/20 border border-genius-purple/40'
                  : 'bg-genius-gold/20 border border-genius-gold/40'
              }`}>
                {msg.role === 'assistant'
                  ? <Brain className="w-4 h-4 text-genius-purple" />
                  : <User className="w-4 h-4 text-genius-gold" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'assistant'
                    ? 'glass-card border border-genius-purple/20 text-genius-white/90'
                    : 'bg-genius-gold/15 border border-genius-gold/30 text-genius-white'
                }`}>
                  <MessageContent content={msg.content} />
                  {/* Team cards if returned */}
                  {msg.teams && msg.teams.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {msg.teams.map((team, j) => (
                        <div key={j} className="bg-genius-dark rounded-lg p-2 border border-genius-border">
                          <div className="text-xs font-mono text-genius-gold">#{team.seed} {team.name}</div>
                          <div className="text-xs text-genius-white/50">{team.record} · {team.conference}</div>
                          {team.winProb && (
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex-1 h-1 bg-genius-border rounded-full overflow-hidden">
                                <div className="h-full bg-genius-gold rounded-full" style={{ width: `${team.winProb}%` }} />
                              </div>
                              <span className="text-xs font-mono text-genius-teal">{team.winProb}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-genius-white/20 font-mono px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        {isThinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-genius-purple/20 border border-genius-purple/40 flex items-center justify-center">
              <Brain className="w-4 h-4 text-genius-purple animate-pulse" />
            </div>
            <div className="glass-card border border-genius-purple/20 rounded-2xl px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-genius-purple rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-genius-white/40 text-xs font-mono">Analyzing tournament data...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts (show when few messages) */}
      {messages.length <= 2 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SUGGESTED_PROMPTS.slice(0, 4).map((p, i) => (
            <button key={i} onClick={() => sendMessage(p)}
              className="text-left px-3 py-2 rounded-xl border border-genius-border bg-genius-card hover:border-genius-gold/40 hover:bg-genius-gold/5 transition-all text-xs text-genius-white/60 hover:text-genius-white">
              <Sparkles className="w-3 h-3 inline mr-1.5 text-genius-gold" />{p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about any team, matchup, or bracket strategy..."
            className="w-full bg-genius-card border border-genius-border rounded-xl px-4 py-3 text-genius-white placeholder-genius-white/30 font-heading text-sm focus:outline-none focus:border-genius-purple/60 transition-all pr-12"
          />
          <button onClick={() => sendMessage()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-genius-purple hover:text-genius-white transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageContent({ content }) {
  // Simple markdown-like rendering
  const lines = content.split('\n')
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**'))
          return <strong key={i} className="text-genius-gold block">{line.slice(2,-2)}</strong>
        if (line.startsWith('- '))
          return <div key={i} className="flex gap-2"><span className="text-genius-gold mt-1">•</span><span>{renderInline(line.slice(2))}</span></div>
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-genius-gold">{part.slice(2,-2)}</strong>
      : part
  )
}

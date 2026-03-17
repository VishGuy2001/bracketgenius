// Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../hooks/useAuthStore'
import { signOut } from '../lib/supabase'
import { LayoutDashboard, Trophy, Brain, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/bracket/mens',   icon: <Trophy className="w-5 h-5" />,         label: "Men's Bracket",   color: 'text-genius-gold' },
  { to: '/bracket/womens', icon: <Trophy className="w-5 h-5" />,         label: "Women's Bracket", color: 'text-genius-pink' },
  { to: '/agent',          icon: <Brain className="w-5 h-5" />,          label: 'AI Agent',        color: 'text-genius-purple' },
  { to: '/profile',        icon: <User className="w-5 h-5" />,           label: 'Profile' },
]

export default function Layout() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-genius-black">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-genius-border/50 bg-genius-darkest/80 backdrop-blur-xl sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-genius-border/30">
          <LogoSVG size={32} />
          <span className="font-display text-xl tracking-wider">BRACKET<span className="text-genius-gold">GENIUS</span></span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading transition-all duration-200 ${
                  isActive
                    ? 'bg-genius-gold/15 text-genius-gold border border-genius-gold/30'
                    : `text-genius-white/50 hover:text-genius-white hover:bg-genius-white/5 ${item.color || ''}`
                }`
              }
            >
              {item.icon}{item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-genius-border/30">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <img src={user?.user_metadata?.avatar_url} alt="" className="w-8 h-8 rounded-full border border-genius-border" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-heading text-genius-white truncate">{user?.user_metadata?.full_name}</div>
              <div className="text-xs text-genius-white/30 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-genius-white/40 hover:text-genius-orange hover:bg-genius-orange/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-genius-darkest/90 backdrop-blur-xl border-b border-genius-border/30">
        <span className="font-display text-lg">BRACKET<span className="text-genius-gold">GENIUS</span></span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-genius-white/60">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
          className="lg:hidden fixed inset-0 z-40 bg-genius-darkest pt-14">
          <nav className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-heading transition-all ${
                    isActive ? 'bg-genius-gold/15 text-genius-gold' : 'text-genius-white/60 hover:text-genius-white'
                  }`
                }>
                {item.icon}{item.label}
              </NavLink>
            ))}
          </nav>
        </motion.div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

function LogoSVG({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="navLg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0B429"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
      <path d="M20 20 L14 20 L14 60 L20 60" stroke="url(#navLg)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M60 20 L66 20 L66 60 L60 60" stroke="url(#navLg)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="40" cy="40" r="10" stroke="url(#navLg)" strokeWidth="1.5" fill="none"/>
      <circle cx="40" cy="35" r="2.5" fill="#F0B429"/>
      <circle cx="40" cy="45" r="2.5" fill="#8B5CF6"/>
      <line x1="30" y1="40" x2="50" y2="40" stroke="url(#navLg)" strokeWidth="1.5"/>
    </svg>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './hooks/useAuthStore'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import BracketPage from './pages/BracketPage'
import AgentPage from './pages/AgentPage'
import ProfilePage from './pages/ProfilePage'
import Layout from './components/Layout'
import OnboardingTour from './components/OnboardingTour'
import AuthCallback from './pages/AuthCallback'

export default function App() {
  const { user, setUser, setSession } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <SplashScreen />

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/" />} />
          <Route path="/bracket/:type" element={user ? <BracketPage /> : <Navigate to="/" />} />
          <Route path="/agent" element={user ? <AgentPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
        </Route>
      </Routes>
      {user && <OnboardingTour />}
    </>
  )
}

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-genius-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <BracketGeniusLogo size={80} animated />
        <div className="text-genius-gold font-mono text-sm tracking-widest animate-pulse">
          LOADING INTELLIGENCE...
        </div>
      </div>
    </div>
  )
}

function BracketGeniusLogo({ size = 40, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'animate-float' : ''}>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0B429"/>
          <stop offset="50%" stopColor="#FF6B2B"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
      {/* Brain outline */}
      <circle cx="40" cy="40" r="36" stroke="url(#logoGrad)" strokeWidth="2" fill="none" opacity="0.3"/>
      {/* Bracket left */}
      <path d="M20 20 L14 20 L14 60 L20 60" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Bracket right */}
      <path d="M60 20 L66 20 L66 60 L60 60" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Neural lines */}
      <line x1="25" y1="35" x2="55" y2="35" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6"/>
      <line x1="25" y1="45" x2="55" y2="45" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6"/>
      <line x1="40" y1="20" x2="40" y2="60" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6"/>
      {/* Nodes */}
      <circle cx="40" cy="35" r="3" fill="#F0B429"/>
      <circle cx="40" cy="45" r="3" fill="#FF6B2B"/>
      <circle cx="30" cy="40" r="2.5" fill="#8B5CF6"/>
      <circle cx="50" cy="40" r="2.5" fill="#00D4AA"/>
    </svg>
  )
}

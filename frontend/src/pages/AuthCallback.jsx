import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard')
      else navigate('/')
    })
  }, [])

  return (
    <div className="min-h-screen bg-genius-black flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-4xl text-genius-gold mb-4 tracking-wider animate-pulse">
          SIGNING YOU IN...
        </div>
        <div className="text-genius-white/40 font-mono text-sm">Loading your bracket intelligence</div>
      </div>
    </div>
  )
}

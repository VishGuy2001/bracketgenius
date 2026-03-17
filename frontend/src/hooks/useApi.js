import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from './useAuthStore'

const API = '/api'

// ── Bracket data ──────────────────────────────────────────────────────────────
export function useBracketData(type) {
  return useQuery({
    queryKey: ['bracket', type],
    queryFn: async () => {
      const res = await fetch(`${API}/bracket/${type}`)
      if (!res.ok) throw new Error('Failed to fetch bracket')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,   // 5 minutes
    retry: 2,
  })
}

// ── Injury report ─────────────────────────────────────────────────────────────
export function useInjuries(type) {
  return useQuery({
    queryKey: ['injuries', type],
    queryFn: async () => {
      const res = await fetch(`${API}/injuries/${type}`)
      if (!res.ok) return { injuries: [] }
      return res.json()
    },
    staleTime: 30 * 60 * 1000,  // 30 minutes
  })
}

// ── Matchup analysis ──────────────────────────────────────────────────────────
export function useMatchupAnalysis(matchup, type, reasoningMode, customWeights) {
  return useQuery({
    queryKey: ['analysis', matchup?.id, type, reasoningMode, JSON.stringify(customWeights)],
    queryFn: async () => {
      const res = await fetch(`${API}/analyze/matchup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchup, type, reasoningMode, customWeights }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      return res.json()
    },
    enabled: !!matchup && !!type,
    staleTime: 10 * 60 * 1000,  // 10 minutes — analysis is expensive
    retry: 1,
  })
}

// ── Team stats ────────────────────────────────────────────────────────────────
export function useTeamStats(type, teamId) {
  return useQuery({
    queryKey: ['team', type, teamId],
    queryFn: async () => {
      const res = await fetch(`${API}/team/${type}/${teamId}/stats`)
      if (!res.ok) throw new Error('Team stats failed')
      return res.json()
    },
    enabled: !!teamId && !!type,
    staleTime: 60 * 60 * 1000,  // 1 hour
  })
}

// ── Agent suggestions ─────────────────────────────────────────────────────────
export function useAgentSuggestions(type) {
  return useQuery({
    queryKey: ['suggestions', type],
    queryFn: async () => {
      const res = await fetch(`${API}/agent/suggestions/${type}`)
      if (!res.ok) return { suggestions: [] }
      return res.json()
    },
    staleTime: Infinity,
  })
}

// ── Chat mutation ─────────────────────────────────────────────────────────────
export function useAgentChat() {
  return useMutation({
    mutationFn: async ({ message, bracketType, history, context, userId }) => {
      const res = await fetch(`${API}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, bracketType, history, context, userId }),
      })
      if (!res.ok) throw new Error('Chat failed')
      return res.json()
    },
  })
}

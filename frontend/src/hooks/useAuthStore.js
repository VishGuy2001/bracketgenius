import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      hasSeenTour: false,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      markTourSeen: () => set({ hasSeenTour: true }),
    }),
    { name: 'bracketgenius-auth' }
  )
)

export const useBracketStore = create(
  persist(
    (set, get) => ({
      mensPicks: {},
      womensPicks: {},
      reasoningMode: 'ai',
      customWeights: {
        seedDiff:      25,  // How much seed gap matters
        winRate:       15,  // Season win % 
        recentForm:    20,  // Last 10 games
        coachRating:   15,  // Coach tournament experience
        injuryImpact:  10,  // Injury penalty
        offEfficiency: 10,  // Offensive efficiency rating
        defEfficiency:  5,  // Defensive efficiency rating
      },
      setPick: (type, matchupId, teamId) => {
        const key = type === 'mens' ? 'mensPicks' : 'womensPicks'
        set((state) => ({ [key]: { ...state[key], [matchupId]: teamId } }))
      },
      setReasoningMode: (mode) => set({ reasoningMode: mode }),
      setCustomWeights: (weights) => set({ customWeights: weights }),
      clearBracket: (type) => {
        const key = type === 'mens' ? 'mensPicks' : 'womensPicks'
        set({ [key]: {} })
      },
      resetWeights: () => set({
        customWeights: {
          seedDiff: 25, winRate: 15, recentForm: 20,
          coachRating: 15, injuryImpact: 10, offEfficiency: 10, defEfficiency: 5,
        }
      }),
    }),
    { name: 'bracketgenius-bracket' }
  )
)
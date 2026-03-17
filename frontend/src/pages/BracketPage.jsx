import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore, useBracketStore } from '../hooks/useAuthStore'
import { saveBracket } from '../lib/supabase'
import { Brain, Sliders, MessageSquare, Save, RefreshCw, Info, Trophy, RotateCcw } from 'lucide-react'
import ReasoningPanel from '../components/ReasoningPanel'

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const REASONING_MODES = [
  { id: 'ai',     label: 'Pure AI',    icon: <Brain className="w-4 h-4" /> },
  { id: 'custom', label: 'Custom',     icon: <Sliders className="w-4 h-4" /> },
  { id: 'chat',   label: 'Chat Agent', icon: <MessageSquare className="w-4 h-4" /> },
]

const ROUND_NAMES = ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Champion']

const ALL_WEIGHTS = [
  { key: 'seedDiff',      label: 'Seed Advantage',      color: '#F0B429', tip: 'Higher = chalk picks, lower seeds dominate' },
  { key: 'recentForm',    label: 'Recent Form',          color: '#00D4AA', tip: 'Hot teams rise — McNeese, Northern Iowa benefit' },
  { key: 'coachRating',   label: 'Coach Experience',     color: '#8B5CF6', tip: 'Tournament-tested coaches — Duke, Kentucky, SC rise' },
  { key: 'injuryImpact',  label: 'Injury Impact',        color: '#FF6B2B', tip: 'Penalizes injured teams — Kansas, Virginia, St Johns drop' },
  { key: 'offEfficiency', label: 'Offensive Efficiency', color: '#EC4899', tip: 'High-scoring teams — Gonzaga, Duke, Arizona rise' },
  { key: 'defEfficiency', label: 'Defensive Efficiency', color: '#06B6D4', tip: 'Lockdown defenses — Virginia, UConn, Houston rise' },
  { key: 'winRate',       label: 'Season Win Rate',      color: '#3D7FFF', tip: 'Overall record — consistent teams favored' },
]

// ─────────────────────────────────────────────
// TEAM DATA — used by weight engine
// ─────────────────────────────────────────────

// Injury penalty (0 = healthy, higher = more injured)
const INJURY = {
  // Mens
  "St John's": 25, 'Kansas': 18, 'Michigan St': 20, 'Virginia': 22,
  'Gonzaga': 15, 'Vanderbilt': 10, 'Michigan': 12, 'North Carolina': 8,
  'TCU': 10, 'Iowa': 6, 'Nebraska': 8, 'BYU': 5, 'Clemson': 5,
  // Womens
  'Maryland': 10, 'Ole Miss': 8, 'Washington': 12, 'Oregon': 6,
}

// Offensive efficiency (higher = better offense)
const OFF = {
  // Mens
  'Gonzaga': 97, 'Duke': 95, 'Arizona': 94, 'Iowa St': 93,
  'UConn': 92, 'Florida': 92, 'Houston': 91, 'Alabama': 91,
  'Michigan': 90, 'Illinois': 88, 'Kansas': 88, 'Michigan St': 87,
  'Arkansas': 87, 'Purdue': 86, 'Kentucky': 86, 'North Carolina': 86,
  'Tennessee': 85, 'Virginia': 84, 'Wisconsin': 83, 'Vanderbilt': 83,
  'Clemson': 82, 'Nebraska': 81, 'BYU': 80, 'McNeese': 81,
  'Northern Iowa': 79, 'SMU': 78, 'VCU': 79, 'UCLA': 88,
  // Womens
  'South Carolina': 94, 'UCLA': 92, 'UConn': 93, 'Texas': 91,
  'LSU': 90, 'Iowa': 89, 'Vanderbilt': 88, 'Ohio St': 87,
  'Duke': 87, 'North Carolina': 86, 'Notre Dame': 85, 'Maryland': 85,
  'Baylor': 84, 'Minnesota': 83, 'TCU': 83, 'Louisville': 84,
  'Michigan': 82, 'Kentucky': 82, 'Michigan St': 81, 'Alabama': 83,
}

// Defensive efficiency (lower = better defense, we invert it)
const DEF = {
  // Mens
  'UConn': 84, 'Virginia': 83, 'Houston': 85, 'Michigan St': 86,
  'Duke': 87, 'Florida': 88, 'Iowa St': 87, 'Arizona': 89,
  'Michigan': 90, 'Illinois': 88, 'Kansas': 91, 'Gonzaga': 90,
  'Alabama': 93, 'Purdue': 89, 'Kentucky': 89, 'Tennessee': 84,
  'Arkansas': 91, 'Wisconsin': 87, 'North Carolina': 90, 'Vanderbilt': 92,
  // Womens
  'South Carolina': 84, 'UConn': 83, 'UCLA': 86, 'Texas': 87,
  'LSU': 91, 'Iowa': 90, 'Ohio St': 88, 'Vanderbilt': 89,
  'Duke': 88, 'Notre Dame': 87, 'Louisville': 86, 'TCU': 87,
}

// Coach tournament experience score (higher = more experienced)
const COACH = {
  // Mens
  'Duke': 96, 'Kansas': 91, 'Michigan St': 93, 'Kentucky': 90,
  'UConn': 88, 'Gonzaga': 86, 'Virginia': 85, 'Florida': 83,
  'Houston': 81, 'Arizona': 80, 'Illinois': 76, 'Michigan': 79,
  'Iowa St': 77, 'Alabama': 73, 'Purdue': 78, 'Arkansas': 75,
  'Tennessee': 77, 'UCLA': 81, 'North Carolina': 83, 'Wisconsin': 75,
  'Vanderbilt': 71, 'BYU': 72, 'Clemson': 74, 'Nebraska': 72,
  "St John's": 70, 'McNeese': 64, 'Northern Iowa': 67, 'SMU': 69,
  // Womens
  'South Carolina': 95, 'UConn': 93, 'LSU': 87, 'UCLA': 82,
  'Texas': 80, 'Iowa': 83, 'Vanderbilt': 72, 'Ohio St': 76,
  'Duke': 80, 'Notre Dame': 84, 'North Carolina': 79, 'Louisville': 82,
  'Maryland': 78, 'Baylor': 79, 'TCU': 75, 'Michigan': 74,
}

// Recent form score (higher = hotter team)
const FORM = {
  // Mens
  'Florida': 92, 'Alabama': 90, 'McNeese': 89, 'Houston': 88,
  'Iowa St': 87, 'Tennessee': 87, 'Illinois': 84, 'UConn': 84,
  'VCU': 84, 'Murray St': 85, 'Northern Iowa': 83, 'Arizona': 83,
  'Duke': 82, 'Gonzaga': 81, 'UCLA': 80, 'SMU': 80,
  'Kentucky': 80, 'Michigan': 79, 'Wisconsin': 79, 'Michigan St': 78,
  'Purdue': 77, 'BYU': 77, 'Clemson': 78, 'Nebraska': 76,
  'Arkansas': 75, 'Kansas': 74, 'Virginia': 71, "St John's": 64,
  // Womens
  'South Carolina': 93, 'Murray St': 88, 'Iowa': 86, 'Iowa St': 86,
  'UCLA': 86, 'Texas': 87, 'LSU': 83, 'UConn': 84,
  'Ohio St': 80, 'Duke': 81, 'Louisville': 83, 'Notre Dame': 80,
  'North Carolina': 81, 'Vanderbilt': 78, 'Baylor': 79, 'Maryland': 77,
  'James Madison': 84, 'Michigan': 80, 'Kentucky': 79, 'TCU': 78,
}

// Season win rate score (higher = better record)
const WIN_RATE = {
  // Mens
  'Houston': 93, 'Duke': 91, 'Florida': 90, 'Iowa St': 89,
  'Arizona': 88, 'UConn': 88, 'Gonzaga': 87, 'Michigan': 86,
  'Illinois': 85, 'Alabama': 85, 'Tennessee': 84, 'Purdue': 84,
  'Kansas': 83, 'Kentucky': 82, 'Michigan St': 81, 'Arkansas': 80,
  'Virginia': 79, 'Wisconsin': 78, 'North Carolina': 77, 'UCLA': 82,
  "St John's": 73, 'McNeese': 76, 'Northern Iowa': 74, 'VCU': 75,
  // Womens
  'South Carolina': 96, 'UConn': 91, 'UCLA': 89, 'Texas': 88,
  'LSU': 86, 'Iowa': 85, 'Ohio St': 84, 'Vanderbilt': 83,
  'Duke': 82, 'Notre Dame': 82, 'North Carolina': 81, 'Louisville': 82,
  'Maryland': 79, 'Baylor': 80, 'TCU': 78, 'Michigan': 77,
}

// ─────────────────────────────────────────────
// BRACKET DATA
// ─────────────────────────────────────────────

const MENS_REGIONS = [
  {
    name: 'EAST',
    matchups: [
      { id: 'e1', teams: [{ id: 'e1t1', name: 'Duke',            seed: 1  }, { id: 'e1t2', name: 'Siena',           seed: 16 }] },
      { id: 'e2', teams: [{ id: 'e2t1', name: 'Ohio St',         seed: 8  }, { id: 'e2t2', name: 'TCU',             seed: 9  }] },
      { id: 'e3', teams: [{ id: 'e3t1', name: "St John's",       seed: 5  }, { id: 'e3t2', name: 'Northern Iowa',   seed: 12 }] },
      { id: 'e4', teams: [{ id: 'e4t1', name: 'Kansas',          seed: 4  }, { id: 'e4t2', name: 'Cal Baptist',     seed: 13 }] },
      { id: 'e5', teams: [{ id: 'e5t1', name: 'Louisville',      seed: 8  }, { id: 'e5t2', name: 'South Florida',   seed: 11 }] },
      { id: 'e6', teams: [{ id: 'e6t1', name: 'Michigan St',     seed: 3  }, { id: 'e6t2', name: 'North Dakota St', seed: 14 }] },
      { id: 'e7', teams: [{ id: 'e7t1', name: 'UCLA',            seed: 7  }, { id: 'e7t2', name: 'UCF',             seed: 10 }] },
      { id: 'e8', teams: [{ id: 'e8t1', name: 'UConn',           seed: 2  }, { id: 'e8t2', name: 'Furman',          seed: 15 }] },
    ]
  },
  {
    name: 'SOUTH',
    matchups: [
      { id: 's1', teams: [{ id: 's1t1', name: 'Florida',         seed: 1  }, { id: 's1t2', name: 'Lehigh',          seed: 16 }] },
      { id: 's2', teams: [{ id: 's2t1', name: 'Clemson',         seed: 8  }, { id: 's2t2', name: 'Iowa',            seed: 9  }] },
      { id: 's3', teams: [{ id: 's3t1', name: 'Vanderbilt',      seed: 5  }, { id: 's3t2', name: 'McNeese',         seed: 12 }] },
      { id: 's4', teams: [{ id: 's4t1', name: 'Nebraska',        seed: 4  }, { id: 's4t2', name: 'Troy',            seed: 13 }] },
      { id: 's5', teams: [{ id: 's5t1', name: 'North Carolina',  seed: 6  }, { id: 's5t2', name: 'VCU',             seed: 11 }] },
      { id: 's6', teams: [{ id: 's6t1', name: 'Illinois',        seed: 3  }, { id: 's6t2', name: 'Penn',            seed: 14 }] },
      { id: 's7', teams: [{ id: 's7t1', name: "Saint Mary's",    seed: 7  }, { id: 's7t2', name: 'Texas AM',        seed: 10 }] },
      { id: 's8', teams: [{ id: 's8t1', name: 'Houston',         seed: 2  }, { id: 's8t2', name: 'Idaho',           seed: 15 }] },
    ]
  },
  {
    name: 'WEST',
    matchups: [
      { id: 'w1', teams: [{ id: 'w1t1', name: 'Arizona',         seed: 1  }, { id: 'w1t2', name: 'Long Island',     seed: 16 }] },
      { id: 'w2', teams: [{ id: 'w2t1', name: 'Villanova',       seed: 8  }, { id: 'w2t2', name: 'Utah St',         seed: 9  }] },
      { id: 'w3', teams: [{ id: 'w3t1', name: 'Wisconsin',       seed: 5  }, { id: 'w3t2', name: 'High Point',      seed: 12 }] },
      { id: 'w4', teams: [{ id: 'w4t1', name: 'Arkansas',        seed: 4  }, { id: 'w4t2', name: 'Hawaii',          seed: 13 }] },
      { id: 'w5', teams: [{ id: 'w5t1', name: 'BYU',             seed: 6  }, { id: 'w5t2', name: 'NC State',        seed: 11 }] },
      { id: 'w6', teams: [{ id: 'w6t1', name: 'Gonzaga',         seed: 3  }, { id: 'w6t2', name: 'Kennesaw St',     seed: 14 }] },
      { id: 'w7', teams: [{ id: 'w7t1', name: 'Miami FL',        seed: 7  }, { id: 'w7t2', name: 'Missouri',        seed: 10 }] },
      { id: 'w8', teams: [{ id: 'w8t1', name: 'Purdue',          seed: 2  }, { id: 'w8t2', name: 'Queens',          seed: 15 }] },
    ]
  },
  {
    name: 'MIDWEST',
    matchups: [
      { id: 'm1', teams: [{ id: 'm1t1', name: 'Michigan',        seed: 1  }, { id: 'm1t2', name: 'Howard',          seed: 16 }] },
      { id: 'm2', teams: [{ id: 'm2t1', name: 'Georgia',         seed: 8  }, { id: 'm2t2', name: 'Saint Louis',     seed: 9  }] },
      { id: 'm3', teams: [{ id: 'm3t1', name: 'Texas Tech',      seed: 5  }, { id: 'm3t2', name: 'Akron',           seed: 12 }] },
      { id: 'm4', teams: [{ id: 'm4t1', name: 'Alabama',         seed: 4  }, { id: 'm4t2', name: 'Hofstra',         seed: 13 }] },
      { id: 'm5', teams: [{ id: 'm5t1', name: 'Tennessee',       seed: 6  }, { id: 'm5t2', name: 'SMU',             seed: 11 }] },
      { id: 'm6', teams: [{ id: 'm6t1', name: 'Virginia',        seed: 3  }, { id: 'm6t2', name: 'Wright St',       seed: 14 }] },
      { id: 'm7', teams: [{ id: 'm7t1', name: 'Kentucky',        seed: 7  }, { id: 'm7t2', name: 'Santa Clara',     seed: 10 }] },
      { id: 'm8', teams: [{ id: 'm8t1', name: 'Iowa St',         seed: 2  }, { id: 'm8t2', name: 'Tennessee St',    seed: 15 }] },
    ]
  },
]

const WOMENS_REGIONS = [
  {
    name: 'FORT WORTH 1',
    matchups: [
      { id: 'fw1', teams: [{ id: 'fw1t1', name: 'UConn',          seed: 1  }, { id: 'fw1t2', name: 'UTSA',            seed: 16 }] },
      { id: 'fw2', teams: [{ id: 'fw2t1', name: 'Iowa St',         seed: 8  }, { id: 'fw2t2', name: 'Syracuse',         seed: 9  }] },
      { id: 'fw3', teams: [{ id: 'fw3t1', name: 'Maryland',        seed: 5  }, { id: 'fw3t2', name: 'Murray St',        seed: 12 }] },
      { id: 'fw4', teams: [{ id: 'fw4t1', name: 'North Carolina',  seed: 4  }, { id: 'fw4t2', name: 'Western Illinois', seed: 13 }] },
      { id: 'fw5', teams: [{ id: 'fw5t1', name: 'Notre Dame',      seed: 6  }, { id: 'fw5t2', name: 'Fairfield',        seed: 11 }] },
      { id: 'fw6', teams: [{ id: 'fw6t1', name: 'Ohio St',         seed: 3  }, { id: 'fw6t2', name: 'Howard',           seed: 14 }] },
      { id: 'fw7', teams: [{ id: 'fw7t1', name: 'Illinois',        seed: 7  }, { id: 'fw7t2', name: 'Colorado',         seed: 10 }] },
      { id: 'fw8', teams: [{ id: 'fw8t1', name: 'Vanderbilt',      seed: 2  }, { id: 'fw8t2', name: 'High Point',       seed: 15 }] },
    ]
  },
  {
    name: 'SACRAMENTO 2',
    matchups: [
      { id: 'sc1', teams: [{ id: 'sc1t1', name: 'UCLA',            seed: 1  }, { id: 'sc1t2', name: 'Cal Baptist',      seed: 16 }] },
      { id: 'sc2', teams: [{ id: 'sc2t1', name: 'Oklahoma St',     seed: 8  }, { id: 'sc2t2', name: 'Princeton',        seed: 9  }] },
      { id: 'sc3', teams: [{ id: 'sc3t1', name: 'Ole Miss',        seed: 5  }, { id: 'sc3t2', name: 'Gonzaga',          seed: 12 }] },
      { id: 'sc4', teams: [{ id: 'sc4t1', name: 'Minnesota',       seed: 4  }, { id: 'sc4t2', name: 'Green Bay',        seed: 13 }] },
      { id: 'sc5', teams: [{ id: 'sc5t1', name: 'Baylor',          seed: 6  }, { id: 'sc5t2', name: 'Tennessee',        seed: 11 }] },
      { id: 'sc6', teams: [{ id: 'sc6t1', name: 'Duke',            seed: 3  }, { id: 'sc6t2', name: 'Charleston',       seed: 14 }] },
      { id: 'sc7', teams: [{ id: 'sc7t1', name: 'Texas Tech',      seed: 7  }, { id: 'sc7t2', name: 'Villanova',        seed: 10 }] },
      { id: 'sc8', teams: [{ id: 'sc8t1', name: 'LSU',             seed: 2  }, { id: 'sc8t2', name: 'Jacksonville',     seed: 15 }] },
    ]
  },
  {
    name: 'SACRAMENTO 4',
    matchups: [
      { id: 'sa1', teams: [{ id: 'sa1t1', name: 'South Carolina',  seed: 1  }, { id: 'sa1t2', name: 'Savannah St',      seed: 16 }] },
      { id: 'sa2', teams: [{ id: 'sa2t1', name: 'Clemson',         seed: 8  }, { id: 'sa2t2', name: 'USC',              seed: 9  }] },
      { id: 'sa3', teams: [{ id: 'sa3t1', name: 'Michigan St',     seed: 5  }, { id: 'sa3t2', name: 'Colorado St',      seed: 12 }] },
      { id: 'sa4', teams: [{ id: 'sa4t1', name: 'Oklahoma',        seed: 4  }, { id: 'sa4t2', name: 'Idaho',            seed: 13 }] },
      { id: 'sa5', teams: [{ id: 'sa5t1', name: 'Washington',      seed: 6  }, { id: 'sa5t2', name: 'South Dakota St',  seed: 11 }] },
      { id: 'sa6', teams: [{ id: 'sa6t1', name: 'TCU',             seed: 3  }, { id: 'sa6t2', name: 'UC San Diego',     seed: 14 }] },
      { id: 'sa7', teams: [{ id: 'sa7t1', name: 'Georgia',         seed: 7  }, { id: 'sa7t2', name: 'FDU',              seed: 15 }] },
      { id: 'sa8', teams: [{ id: 'sa8t1', name: 'Iowa',            seed: 2  }, { id: 'sa8t2', name: 'Holy Cross',       seed: 15 }] },
    ]
  },
  {
    name: 'FORT WORTH 3',
    matchups: [
      { id: 'ft1', teams: [{ id: 'ft1t1', name: 'Texas',           seed: 1  }, { id: 'ft1t2', name: 'Longwood',         seed: 16 }] },
      { id: 'ft2', teams: [{ id: 'ft2t1', name: 'Oregon',          seed: 8  }, { id: 'ft2t2', name: 'Virginia Tech',    seed: 9  }] },
      { id: 'ft3', teams: [{ id: 'ft3t1', name: 'Kentucky',        seed: 5  }, { id: 'ft3t2', name: 'James Madison',    seed: 12 }] },
      { id: 'ft4', teams: [{ id: 'ft4t1', name: 'West Virginia',   seed: 4  }, { id: 'ft4t2', name: 'Miami Ohio',       seed: 13 }] },
      { id: 'ft5', teams: [{ id: 'ft5t1', name: 'Alabama',         seed: 6  }, { id: 'ft5t2', name: 'Rhode Island',     seed: 11 }] },
      { id: 'ft6', teams: [{ id: 'ft6t1', name: 'Louisville',      seed: 3  }, { id: 'ft6t2', name: 'Vermont',          seed: 14 }] },
      { id: 'ft7', teams: [{ id: 'ft7t1', name: 'NC State',        seed: 7  }, { id: 'ft7t2', name: 'Tennessee',        seed: 10 }] },
      { id: 'ft8', teams: [{ id: 'ft8t1', name: 'Michigan',        seed: 2  }, { id: 'ft8t2', name: 'Holy Cross',       seed: 15 }] },
    ]
  },
]

// ─────────────────────────────────────────────
// WEIGHT ENGINE
// ─────────────────────────────────────────────

/**
 * Compute a composite score for a team given weights.
 * Each factor is normalized 0-100 then weighted.
 * Injury is a penalty subtracted from total.
 */
function teamScore(team, weights) {
  const n = team.name
  const s = team.seed || 8

  // Fallback values based on seed for unknown teams
  const falloff = (base, penalty) => Math.max(20, base - s * penalty)

  const scores = {
    seedDiff:      (17 - s) / 16 * 100,                         // 1-seed = 100, 16-seed = ~6
    recentForm:    FORM[n]     ?? falloff(88, 4),
    coachRating:   COACH[n]    ?? falloff(85, 4),
    offEfficiency: OFF[n]      ?? falloff(87, 3),
    defEfficiency: 100 - (DEF[n] ?? Math.min(96, 80 + s * 1.5)), // Invert — lower DEF = better
    winRate:       WIN_RATE[n] ?? falloff(87, 3),
  }
  const injPenalty = INJURY[n] ?? 0

  if (!weights) {
    // Pure AI mode — seed-only
    return scores.seedDiff * 100
  }

  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 100
  const w = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / total])
  )

  return (
    w.seedDiff      * scores.seedDiff      +
    w.recentForm    * scores.recentForm    +
    w.coachRating   * scores.coachRating   +
    w.offEfficiency * scores.offEfficiency +
    w.defEfficiency * scores.defEfficiency +
    w.winRate       * scores.winRate       -
    w.injuryImpact  * injPenalty           // Subtract injury penalty
  )
}

/**
 * Given two teams and optional weights, return win probability for team1 (0-95).
 */
function winProb(t1, t2, weights) {
  const s1 = teamScore(t1, weights)
  const s2 = teamScore(t2, weights)
  const total = s1 + s2
  if (total === 0) return 50
  // Clamp 5-95 so we never show 0% or 100%
  return Math.max(5, Math.min(95, Math.round((s1 / total) * 100)))
}

/**
 * Build all 6 bracket rounds from regions using given weights.
 * Pure AI mode passes null for weights (seed-only scoring).
 */
function buildRounds(regions, weights = null) {
  // Start with raw R64 matchups, compute win probs
  const r64 = regions.flatMap(r => r.matchups).map(m => {
    const p = winProb(m.teams[0], m.teams[1], weights)
    return {
      ...m,
      teams: [
        { ...m.teams[0], winProb: p },
        { ...m.teams[1], winProb: 100 - p },
      ]
    }
  })

  function advanceRound(matchups, prefix) {
    // Pick winner of each matchup
    const winners = matchups.map(m =>
      teamScore(m.teams[0], weights) >= teamScore(m.teams[1], weights)
        ? m.teams[0] : m.teams[1]
    )
    // Pair winners into next round matchups
    const next = []
    for (let i = 0; i + 1 < winners.length; i += 2) {
      const t1 = winners[i]
      const t2 = winners[i + 1]
      const p  = winProb(t1, t2, weights)
      next.push({
        id: `${prefix}_${i}`,
        status: 'pre',
        teams: [
          { ...t1, id: `${prefix}_${i}_t1`, winProb: p },
          { ...t2, id: `${prefix}_${i}_t2`, winProb: 100 - p },
        ]
      })
    }
    return next
  }

  const r32 = advanceRound(r64,  'r32')
  const s16 = advanceRound(r32,  's16')
  const e8  = advanceRound(s16,  'e8')
  const ff  = advanceRound(e8,   'ff')

  // Determine champion from Final Four winners
  const ffWinners = ff.map(m =>
    teamScore(m.teams[0], weights) >= teamScore(m.teams[1], weights)
      ? m.teams[0] : m.teams[1]
  )
  const champion = ffWinners.length >= 2
    ? (teamScore(ffWinners[0], weights) >= teamScore(ffWinners[1], weights) ? ffWinners[0] : ffWinners[1])
    : (ffWinners[0] ?? null)

  return { r64, r32, s16, e8, ff, champion }
}

// ─────────────────────────────────────────────
// BRACKET PAGE
// ─────────────────────────────────────────────

export default function BracketPage() {
  const { type }     = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuthStore()
  const {
    mensPicks, womensPicks, reasoningMode, customWeights,
    setReasoningMode, setPick, clearBracket, resetWeights,
  } = useBracketStore()

  const picks   = type === 'mens' ? mensPicks : womensPicks
  const regions = type === 'mens' ? MENS_REGIONS : WOMENS_REGIONS
  const isMens  = type === 'mens'

  const [selectedMatchup, setSelectedMatchup] = useState(null)
  const [showReasoning,   setShowReasoning]   = useState(false)
  const [activeRound,     setActiveRound]     = useState(0)
  const [builtRounds,     setBuiltRounds]     = useState(null)
  const [isRunning,       setIsRunning]       = useState(false)

  // Auto-build when switching to Pure AI mode
  useEffect(() => {
    if (reasoningMode === 'ai') {
      const result = buildRounds(regions, null)
      setBuiltRounds(result)
      autoPickAll(result)
    }
  }, [reasoningMode, type])

  function autoPickAll(result) {
    const all = [...result.r64, ...result.r32, ...result.s16, ...result.e8, ...result.ff]
    all.forEach(m => {
      const winner = m.teams[0].winProb >= 50 ? m.teams[0] : m.teams[1]
      setPick(type, m.id, winner.id)
    })
  }

  function handleCustomRun() {
    setIsRunning(true)
    setTimeout(() => {
      const result = buildRounds(regions, customWeights)
      setBuiltRounds(result)
      autoPickAll(result)
      setActiveRound(0)
      setIsRunning(false)
    }, 900)
  }

  const rounds = builtRounds || buildRounds(regions, reasoningMode === 'ai' ? null : customWeights)

  const roundData = [
    { matchups: rounds.r64 },
    { matchups: rounds.r32 },
    { matchups: rounds.s16 },
    { matchups: rounds.e8  },
    { matchups: rounds.ff  },
  ]

  const saveMutation = useMutation({
    mutationFn: () => saveBracket(
      user.id, type, picks,
      `My ${isMens ? "Men's" : "Women's"} Bracket 2026`
    ),
    onSuccess: () => alert('Bracket saved! ✅'),
  })

  function handleReset() {
    clearBracket(type)
    setSelectedMatchup(null)
    setShowReasoning(false)
    setBuiltRounds(null)
    setActiveRound(0)
  }

  return (
    <div className="max-w-full px-4 py-6">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 max-w-7xl mx-auto">
        <div>
          <button onClick={() => navigate('/dashboard')}
            className="text-genius-white/40 hover:text-genius-white text-sm transition-colors mb-1 block">
            ← Dashboard
          </button>
          <h1 className="font-display text-4xl tracking-wide"
            style={{ color: isMens ? '#F0B429' : '#EC4899' }}>
            {isMens ? "MEN'S" : "WOMEN'S"} NCAA TOURNAMENT 2026
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Mode selector */}
          <div className="flex gap-1 p-1 rounded-xl bg-genius-card border border-genius-border">
            {REASONING_MODES.map(m => (
              <button key={m.id}
                onClick={() => {
                  if (m.id === 'chat') { navigate('/agent'); return }
                  setReasoningMode(m.id)
                  setBuiltRounds(null)
                  setActiveRound(0)
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                  reasoningMode === m.id
                    ? 'bg-genius-gold text-genius-black font-semibold'
                    : 'text-genius-white/50 hover:text-genius-white'
                }`}
              >{m.icon}{m.label}</button>
            ))}
          </div>

          <button onClick={() => setShowReasoning(v => !v)}
            className="btn-secondary text-sm flex items-center gap-2">
            <Info className="w-4 h-4" /> Reasoning
          </button>

          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
            className="btn-primary text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Bracket'}
          </button>
        </div>
      </div>

      {/* ── Custom weights panel ── */}
      <AnimatePresence>
        {reasoningMode === 'custom' && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-w-7xl mx-auto mb-6 overflow-hidden">
            <CustomWeightsPanel
              onRun={handleCustomRun}
              onReset={resetWeights}
              isRunning={isRunning}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reasoning panel ── */}
      <AnimatePresence>
        {showReasoning && selectedMatchup && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto mb-6">
            <ReasoningPanel matchup={selectedMatchup} type={type} reasoningMode={reasoningMode} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Round tabs ── */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2 overflow-x-auto pb-2">
        {ROUND_NAMES.map((name, i) => (
          <button key={i} onClick={() => setActiveRound(i)}
            className={`px-4 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
              activeRound === i
                ? 'bg-genius-gold/20 text-genius-gold border border-genius-gold/40'
                : 'bg-genius-card text-genius-white/50 border border-genius-border hover:text-genius-white'
            }`}>{name}</button>
        ))}
        <button onClick={handleReset}
          className="ml-auto px-3 py-2 rounded-lg text-xs font-mono text-genius-orange/70 hover:text-genius-orange border border-genius-border flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* ── Champion view ── */}
      {activeRound === 5 && rounds.champion && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm mx-auto mt-10">
          <div className="glass-card border border-genius-gold/40 bg-genius-gold/10 rounded-2xl p-10 text-center">
            <Trophy className="w-16 h-16 text-genius-gold mx-auto mb-4" />
            <div className="text-genius-white/50 text-xs font-mono mb-3 tracking-widest">
              2026 PREDICTED CHAMPION
            </div>
            <div className="font-display text-6xl text-genius-gold tracking-wide mb-2">
              {rounds.champion.name?.toUpperCase()}
            </div>
            <div className="text-genius-white/40 text-sm font-mono">#{rounds.champion.seed} seed</div>
          </div>
        </motion.div>
      )}

      {/* ── Bracket rounds ── */}
      {activeRound < 5 && (
        <div className="max-w-7xl mx-auto">

          {activeRound === 0 ? (
            /* Round of 64 — grouped by region */
            <div className="space-y-8">
              {regions.map((region, ri) => {
                const matchups = roundData[0].matchups.slice(ri * 8, ri * 8 + 8)
                return (
                  <div key={ri}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono text-genius-gold/70 uppercase tracking-widest font-semibold">
                        {region.name} REGION
                      </span>
                      <div className="flex-1 h-px bg-genius-gold/20" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {matchups.map(matchup => (
                        <MatchupCard key={matchup.id} matchup={matchup} picks={picks}
                          isMens={isMens}
                          onPick={id => { setPick(type, matchup.id, id); setSelectedMatchup(matchup); setShowReasoning(true) }}
                          onSelect={() => { setSelectedMatchup(matchup); setShowReasoning(true) }}
                          isSelected={selectedMatchup?.id === matchup.id}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Later rounds — simple grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roundData[activeRound]?.matchups.map(matchup => (
                <MatchupCard key={matchup.id} matchup={matchup} picks={picks}
                  isMens={isMens}
                  onPick={id => { setPick(type, matchup.id, id); setSelectedMatchup(matchup); setShowReasoning(true) }}
                  onSelect={() => { setSelectedMatchup(matchup); setShowReasoning(true) }}
                  isSelected={selectedMatchup?.id === matchup.id}
                />
              ))}
            </div>
          )}

          {/* Round navigation */}
          <div className="flex justify-between mt-8">
            <button onClick={() => setActiveRound(r => Math.max(0, r - 1))}
              disabled={activeRound === 0}
              className="px-5 py-2 rounded-lg text-xs font-mono border border-genius-border text-genius-white/50 hover:text-genius-white disabled:opacity-20 transition-all">
              ← {activeRound > 0 ? ROUND_NAMES[activeRound - 1] : ''}
            </button>
            <span className="text-xs font-mono text-genius-white/30 self-center">
              {roundData[activeRound]?.matchups.length} matchups
            </span>
            <button onClick={() => setActiveRound(r => Math.min(5, r + 1))}
              className="px-5 py-2 rounded-lg text-xs font-mono border border-genius-gold/40 text-genius-gold hover:bg-genius-gold/10 transition-all">
              {ROUND_NAMES[activeRound + 1] || 'Champion'} →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// MATCHUP CARD
// ─────────────────────────────────────────────

function MatchupCard({ matchup, picks, isMens, onPick, onSelect, isSelected }) {
  const picked      = picks[matchup.id]
  const accentColor = isMens ? '#F0B429' : '#EC4899'

  return (
    <motion.div layout
      onClick={onSelect}
      className={`glass-card border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        isSelected ? 'border-genius-gold/60 shadow-gold' : 'border-genius-border hover:border-genius-gold/40'
      }`}
    >
      {matchup.teams?.map((team, i) => (
        <div key={team.id || i}>
          <div
            onClick={e => { e.stopPropagation(); onPick(team.id) }}
            className={`flex items-center gap-2 px-3 py-2.5 transition-all duration-200 ${
              picked === team.id ? 'bg-genius-gold/15' : 'hover:bg-genius-white/5'
            }`}
          >
            {/* Seed */}
            <span className={`text-xs font-mono w-5 text-center flex-shrink-0 ${
              team.seed <= 4 ? 'text-genius-gold' : 'text-genius-white/40'
            }`}>{team.seed}</span>

            {/* Name */}
            <span className={`text-xs font-heading flex-1 truncate ${
              picked === team.id ? 'text-genius-gold font-semibold' : 'text-genius-white/80'
            }`}>{team.name}</span>

            {/* Win probability */}
            <span className={`text-xs font-mono flex-shrink-0 tabular-nums ${
              (team.winProb ?? 50) >= 65 ? 'text-genius-teal' :
              (team.winProb ?? 50) >= 50 ? 'text-genius-gold' : 'text-genius-white/40'
            }`}>{team.winProb ?? 50}%</span>

            {/* Picked indicator */}
            {picked === team.id && (
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
            )}
          </div>
          {i === 0 && <div className="border-t border-genius-border/30" />}
        </div>
      ))}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// CUSTOM WEIGHTS PANEL
// ─────────────────────────────────────────────

function CustomWeightsPanel({ onRun, onReset, isRunning }) {
  const { customWeights, setCustomWeights } = useBracketStore()
  const total = Object.values(customWeights).reduce((a, b) => a + b, 0)

  function handleChange(key, newVal) {
    const otherKeys  = ALL_WEIGHTS.map(w => w.key).filter(k => k !== key)
    const remaining  = 100 - newVal
    const otherTotal = otherKeys.reduce((s, k) => s + (customWeights[k] ?? 0), 0)

    const next = { ...customWeights, [key]: newVal }

    if (otherTotal === 0) {
      const split = Math.floor(remaining / otherKeys.length)
      otherKeys.forEach(k => { next[k] = split })
    } else {
      otherKeys.forEach(k => {
        next[k] = Math.round(((customWeights[k] ?? 0) / otherTotal) * remaining)
      })
    }

    // Fix rounding drift
    const diff = 100 - Object.values(next).reduce((a, b) => a + b, 0)
    if (diff !== 0) next[otherKeys[0]] = Math.max(0, (next[otherKeys[0]] ?? 0) + diff)

    setCustomWeights(next)
  }

  const ready = total === 100 && !isRunning

  return (
    <div className="glass-card border border-genius-border p-5 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-semibold text-genius-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-genius-gold" /> Custom Bracket Weights
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={onReset}
            className="text-xs font-mono text-genius-white/40 hover:text-genius-white flex items-center gap-1 transition-all">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <span className={`text-xs font-mono px-2 py-1 rounded-full border ${
            total === 100
              ? 'text-genius-teal border-genius-teal/30 bg-genius-teal/10'
              : 'text-genius-orange border-genius-orange/30 bg-genius-orange/10'
          }`}>{total === 100 ? '✓ 100%' : `${total}% — adjust to 100`}</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5 mb-5">
        {ALL_WEIGHTS.map(w => {
          const val = customWeights[w.key] ?? 0
          return (
            <div key={w.key} title={w.tip}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-genius-white/50 truncate leading-tight">
                  {w.label}
                </label>
                <span className="text-xs font-mono font-bold ml-1 flex-shrink-0"
                  style={{ color: w.color }}>{val}%</span>
              </div>
              {/* Fill bar */}
              <div className="h-1.5 bg-genius-border rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${val}%`, background: w.color }} />
              </div>
              {/* Range input */}
              <input type="range" min="0" max="100" value={val}
                onChange={e => handleChange(w.key, Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: w.color }}
              />
            </div>
          )
        })}
      </div>

      {/* Stacked colour bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px mb-5">
        {ALL_WEIGHTS.map(w => (
          <div key={w.key} className="h-full transition-all duration-200"
            style={{ width: `${customWeights[w.key] ?? 0}%`, background: w.color }} />
        ))}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        {[
          { label: '🎯 Max Seed',   desc: 'Pure chalk — all favorites win'          },
          { label: '🔥 Max Form',   desc: 'McNeese & N Iowa rise as upset picks'    },
          { label: '🎓 Max Coach',  desc: 'Duke, Kentucky, South Carolina dominate' },
          { label: '🏥 Max Injury', desc: 'Kansas, Virginia, St Johns penalized'    },
        ].map((t, i) => (
          <div key={i} className="bg-genius-dark rounded-lg p-2 border border-genius-border/50">
            <div className="text-xs font-mono text-genius-gold mb-0.5">{t.label}</div>
            <div className="text-xs text-genius-white/40 leading-snug">{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Run button */}
      <button onClick={onRun} disabled={!ready}
        className={`w-full py-3 rounded-xl font-heading font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
          ready
            ? 'bg-genius-gold text-genius-black hover:bg-genius-gold-light cursor-pointer'
            : 'bg-genius-border text-genius-white/30 cursor-not-allowed'
        }`}>
        {isRunning ? (
          <>
            <div className="w-4 h-4 border-2 border-genius-black/30 border-t-genius-black rounded-full animate-spin" />
            Building your custom bracket...
          </>
        ) : total === 100
          ? '⚡ Run Custom Bracket Analysis'
          : `Adjust weights to 100% (currently ${total}%)`
        }
      </button>
    </div>
  )
}
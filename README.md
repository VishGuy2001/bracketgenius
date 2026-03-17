# 🧠 BracketGenius

> The most intelligent NCAA bracket tool ever built. AI-powered analysis for Men's & Women's March Madness.

**Live at:** `bracketgenius.vercel.app` (after deployment)

---

## ✨ Features

- 🏀 **Men's & Women's** NCAA Tournament brackets
- 🤖 **Three AI reasoning modes** — Pure AI, Custom Weights, Chat Agent
- 📊 **Win probability scores** for every matchup (seed history + live data)
- 🏥 **Real-time injury reports** from ESPN
- 🎓 **Coach performance metrics** — tournament win %, Final Fours, championships
- 💬 **Conversational AI agent** powered by Gemini 1.5 Flash (free)
- 👤 **Google OAuth** — bracket history saved to your account
- 🎯 **6-step onboarding tour** for new users
- ⚡ **Live data** from ESPN's public API (no key required)

---

## 🛠 Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React 18 + Vite + Tailwind + Framer Motion | Free |
| Backend | Python FastAPI | Free |
| Database + Auth | Supabase | Free (up to 500MB, 50k users) |
| AI/LLM | Google Gemini 1.5 Flash | Free (1M tokens/day) |
| Deployment | Vercel | Free |
| Data | ESPN Public API | Free |

**Total monthly cost: $0** (until you scale past free tiers)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/bracketgenius
cd bracketgenius

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && pip install -r requirements.txt && cd ..
```

### 2. Set Up Supabase (5 min)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to **SQL Editor** → paste contents of `deployment/supabase_schema.sql` → Run
3. Go to **Authentication** → Providers → Enable **Google**
   - Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)
   - Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` as an authorized redirect URI
4. Copy your **Project URL** and **anon public key** from Settings → API

### 3. Get Your Free Gemini API Key (2 min)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Free tier: **15 requests/minute, 1 million tokens/day** — plenty for this app

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
```

### 5. Run Locally

```bash
# Terminal 1 — Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [localhost:5173](http://localhost:5173) 🎉

---

## 📦 Deploy to Vercel (Free)

### One-click deploy:

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Add environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy → get your `.vercel.app` URL

### Custom domain:
- Buy `bracketgenius.app` (~$12/year at Namecheap/Cloudflare)
- Add in Vercel → Domains → Add Domain
- Done ✅

---

## 🏗 Project Structure

```
bracketgenius/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx    # Flashy animated hero
│       │   ├── DashboardPage.jsx  # Bracket selector
│       │   ├── BracketPage.jsx    # Full bracket builder
│       │   ├── AgentPage.jsx      # AI chat
│       │   ├── ProfilePage.jsx    # Bracket history
│       │   └── AuthCallback.jsx   # Google OAuth redirect
│       ├── components/
│       │   ├── Layout.jsx         # Sidebar nav
│       │   ├── OnboardingTour.jsx # First-time walkthrough
│       │   └── ReasoningPanel.jsx # AI analysis display
│       ├── hooks/
│       │   └── useAuthStore.js    # Zustand state (auth + bracket picks)
│       └── lib/
│           └── supabase.js        # All DB operations
│
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── api/
│   │   ├── bracket.py             # GET /api/bracket/{type}
│   │   ├── analyze.py             # POST /api/analyze/matchup
│   │   ├── agent.py               # POST /api/agent/chat
│   │   └── teams.py               # GET /api/teams/{type}
│   ├── services/
│   │   └── gemini_service.py      # Gemini AI calls
│   └── data/
│       └── espn_service.py        # ESPN data scraper + cache
│
└── deployment/
    ├── supabase_schema.sql        # Run in Supabase SQL editor
    └── build.sh                   # Vercel build script
```

---

## 🎯 AI Reasoning Modes

| Mode | How it works |
|------|-------------|
| **Pure AI** | Gemini 1.5 Flash analyzes seed history, coach records, injury reports, and win rates. Gives a clean recommendation with reasoning. |
| **Custom Weights** | You control 5 sliders: Seed Differential, Win Rate, Recent Form, Coach Experience, Injury Impact. AI re-weights its analysis to match your priorities. |
| **Chat Agent** | Conversational AI. Ask "who should I pick here and why?" and get a detailed, personalized explanation. Great for close matchups. |

---

## 📊 Data Sources

| Source | What we use | How |
|--------|------------|-----|
| **ESPN Public API** | Live bracket, scores, team records | No key required |
| **ESPN Core API** | Injury reports, player status | No key required |
| **Historical Records** | Seed matchup win rates (1985–2024) | Built-in dataset |
| **Coach Database** | Tournament appearances, Final Fours, championships | Built-in + ESPN |

---

## 🔑 API Endpoints

```
GET  /health                        — Health check
GET  /api/bracket/{type}            — Live bracket (type: mens|womens)
GET  /api/teams/{type}              — All tournament teams
GET  /api/injuries/{type}           — Current injury reports
POST /api/analyze/matchup           — AI matchup analysis
GET  /api/analyze/team/{type}/{name}— Team profile + coach stats
POST /api/agent/chat                — Conversational AI
GET  /api/agent/suggestions/{type}  — Suggested chat prompts
```

Full docs at `/docs` (Swagger) when running locally.

---

## 🆓 Free Tier Limits

| Service | Free Limit | BracketGenius Usage |
|---------|-----------|---------------------|
| Vercel | 100GB bandwidth/month | ~5-10GB expected |
| Supabase | 500MB DB, 50k users | Plenty |
| Gemini 1.5 Flash | 1M tokens/day, 15 RPM | ~500 analyses/day |
| ESPN API | Unlimited (public) | Unlimited |

---

## 📝 License

MIT — free to use, fork, and deploy.

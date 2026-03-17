"""
BracketGenius Backend — FastAPI
Endpoints:
  GET  /api/bracket/{type}          — Live bracket seedings + team data
  POST /api/analyze/matchup         — AI matchup analysis
  POST /api/agent/chat              — Conversational AI agent
  GET  /api/teams/{type}            — All teams with stats
  GET  /api/team/{team_id}/stats    — Deep team stats
  GET  /api/injuries/{type}         — Injury reports
  GET  /health                      — Health check
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")

from api.bracket import router as bracket_router
from api.analyze import router as analyze_router
from api.agent import router as agent_router
from api.teams import router as teams_router

app = FastAPI(
    title="BracketGenius API",
    description="AI-powered NCAA March Madness bracket intelligence",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://bracketgenius.vercel.app",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bracket_router, prefix="/api")
app.include_router(analyze_router, prefix="/api")
app.include_router(agent_router, prefix="/api")
app.include_router(teams_router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "BracketGenius API"}

@app.get("/")
async def root():
    return {"message": "BracketGenius API — visit /docs for endpoints"}

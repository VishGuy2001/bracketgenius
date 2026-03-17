from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from data.espn_service import get_injury_report, get_coach_stats
from services.gemini_service import analyze_matchup

router = APIRouter()


class MatchupAnalysisRequest(BaseModel):
    matchup: Dict[str, Any]
    type: str = "mens"           # 'mens' | 'womens'
    reasoningMode: str = "ai"    # 'ai' | 'custom' | 'chat'
    customWeights: Optional[Dict[str, int]] = None


@router.post("/analyze/matchup")
async def analyze(req: MatchupAnalysisRequest):
    """
    AI-powered matchup analysis.
    Returns win probabilities, factor breakdown, reasoning, injuries.
    """
    if req.type not in ("mens", "womens"):
        raise HTTPException(400, "type must be 'mens' or 'womens'")

    teams = req.matchup.get("teams", [])
    if len(teams) < 2:
        raise HTTPException(400, "matchup must include 2 teams")

    team1, team2 = teams[0], teams[1]

    # Fetch injury report + coach data in parallel
    import asyncio
    injuries, coach1, coach2 = await asyncio.gather(
        get_injury_report(req.type),
        get_coach_stats(team1.get("name", "")),
        get_coach_stats(team2.get("name", "")),
    )

    result = await analyze_matchup(
        team1=team1,
        team2=team2,
        reasoning_mode=req.reasoningMode,
        custom_weights=req.customWeights or {},
        injuries=injuries,
        bracket_type=req.type,
        coach1=coach1,
        coach2=coach2,
    )

    return result


@router.get("/analyze/team/{bracket_type}/{team_name}")
async def analyze_team(bracket_type: str, team_name: str):
    """Quick team profile with coach stats and injury flags."""
    if bracket_type not in ("mens", "womens"):
        raise HTTPException(400, "bracket_type must be 'mens' or 'womens'")

    injuries, coach = await __import__("asyncio").gather(
        get_injury_report(bracket_type),
        get_coach_stats(team_name),
    )

    team_injuries = [i for i in injuries if team_name.lower() in i.get("team", "").lower()]

    return {
        "team": team_name,
        "coach": coach,
        "injuries": team_injuries,
        "injuryCount": len(team_injuries),
        "hasHighImpactInjury": any(i["impact"] == "HIGH" for i in team_injuries),
    }

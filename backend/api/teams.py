from fastapi import APIRouter, HTTPException
from data.espn_service import get_team_stats, get_all_tournament_teams

router = APIRouter()


@router.get("/teams/{bracket_type}")
async def list_teams(bracket_type: str):
    if bracket_type not in ("mens", "womens"):
        raise HTTPException(400, "bracket_type must be 'mens' or 'womens'")
    teams = await get_all_tournament_teams(bracket_type)
    return {"teams": teams}


@router.get("/team/{bracket_type}/{team_id}/stats")
async def team_stats(bracket_type: str, team_id: str):
    if bracket_type not in ("mens", "womens"):
        raise HTTPException(400, "bracket_type must be 'mens' or 'womens'")
    stats = await get_team_stats(team_id, bracket_type)
    return stats

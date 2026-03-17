from fastapi import APIRouter, HTTPException
from data.espn_service import get_tournament_bracket, get_all_tournament_teams, get_injury_report

router = APIRouter()

@router.get("/bracket/{bracket_type}")
async def get_bracket(bracket_type: str):
    if bracket_type not in ("mens", "womens"):
        raise HTTPException(status_code=400, detail="bracket_type must be 'mens' or 'womens'")
    bracket = await get_tournament_bracket(bracket_type)
    return bracket


@router.get("/injuries/{bracket_type}")
async def get_injuries(bracket_type: str):
    if bracket_type not in ("mens", "womens"):
        raise HTTPException(400, "bracket_type must be 'mens' or 'womens'")
    injuries = await get_injury_report(bracket_type)
    return {"injuries": injuries, "count": len(injuries)}


@router.get("/teams/{bracket_type}")
async def get_teams(bracket_type: str):
    if bracket_type not in ("mens", "womens"):
        raise HTTPException(400, "bracket_type must be 'mens' or 'womens'")
    teams = await get_all_tournament_teams(bracket_type)
    return {"teams": teams, "count": len(teams)}


@router.post("/bracket/{bracket_type}/predict")
async def predict_bracket_endpoint(bracket_type: str):
    if bracket_type not in ("mens", "womens"):
        raise HTTPException(400, "bracket_type must be 'mens' or 'womens'")
    from services.gemini_service import predict_full_bracket as ai_predict
    result = await ai_predict(bracket_type)
    return result
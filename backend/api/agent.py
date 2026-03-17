from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.gemini_service import agent_chat

router = APIRouter()


class ChatMessage(BaseModel):
    role: str   # 'user' | 'assistant'
    content: str


class AgentChatRequest(BaseModel):
    message: str
    bracketType: str = "mens"
    userId: Optional[str] = None
    history: Optional[List[ChatMessage]] = []
    context: Optional[Dict[str, Any]] = None    # Current picks, weights, etc.


@router.post("/agent/chat")
async def chat(req: AgentChatRequest):
    """
    Conversational AI agent endpoint.
    Powered by Gemini 1.5 Flash (free tier).
    """
    if not req.message.strip():
        raise HTTPException(400, "message cannot be empty")

    if req.bracketType not in ("mens", "womens"):
        raise HTTPException(400, "bracketType must be 'mens' or 'womens'")

    history = [{"role": m.role, "content": m.content} for m in (req.history or [])]

    result = await agent_chat(
        message=req.message,
        history=history,
        bracket_type=req.bracketType,
        context=req.context,
    )

    return result


@router.get("/agent/suggestions/{bracket_type}")
async def get_suggestions(bracket_type: str):
    """Returns context-aware suggested questions for the current bracket state."""
    mens_suggestions = [
        "Who are the biggest first-round upset risks?",
        "Which #5 vs #12 matchup should I watch most carefully?",
        "Compare the top 4 coaching staffs in this tournament",
        "Which teams have the most injury concerns right now?",
        "Who's the safest pick to reach the Final Four?",
        "Build me a chalk bracket — just pick all the favorites",
        "Which Cinderella team has the best chance to make the Sweet 16?",
        "What's the historical win rate for #1 seeds winning it all?",
    ]
    womens_suggestions = [
        "Can anyone beat South Carolina this year?",
        "Who are the top upset threats in the Women's tournament?",
        "Compare Dawn Staley vs Kim Mulkey coaching records",
        "Which Women's teams have the best defensive efficiency?",
        "Is Iowa's Caitlin Clark era over — what's their tournament ceiling?",
        "Who should I pick as the Women's champion?",
        "Analyze LSU's chances of repeating",
        "Which coaches have the best March Madness records in Women's hoops?",
    ]

    suggestions = mens_suggestions if bracket_type == "mens" else womens_suggestions
    return {"suggestions": suggestions}

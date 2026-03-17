"""
BracketGenius AI Service - Gemini only
"""

import os
import json
import asyncio
import logging

import google.generativeai as genai

logger = logging.getLogger(__name__)

_gemini_key = os.getenv("GEMINI_API_KEY")
if _gemini_key:
    genai.configure(api_key=_gemini_key)

GEMINI_MODEL = "gemini-2.5-flash"

_gemini_config = genai.types.GenerationConfig(temperature=0.35, top_p=0.9, max_output_tokens=1200)
_safe = [
    {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH",       "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

MENS_R64 = [
    ["Duke","Siena"],["Ohio St","TCU"],["St Johns","Northern Iowa"],["Kansas","Cal Baptist"],
    ["Louisville","South Florida"],["Michigan St","North Dakota St"],["UCLA","UCF"],["UConn","Furman"],
    ["Florida","Lehigh"],["Clemson","Iowa"],["Vanderbilt","McNeese"],["Nebraska","Troy"],
    ["North Carolina","VCU"],["Illinois","Penn"],["Saint Marys","Texas AM"],["Houston","Idaho"],
    ["Arizona","Long Island"],["Villanova","Utah St"],["Wisconsin","High Point"],["Arkansas","Hawaii"],
    ["BYU","NC State"],["Gonzaga","Kennesaw St"],["Miami FL","Missouri"],["Purdue","Queens"],
    ["Michigan","Howard"],["Georgia","Saint Louis"],["Texas Tech","Akron"],["Alabama","Hofstra"],
    ["Tennessee","SMU"],["Virginia","Wright St"],["Kentucky","Santa Clara"],["Iowa St","Tennessee St"],
]

WOMENS_R64 = [
    ["UConn","UTSA"],["Iowa St","Syracuse"],["Maryland","Murray St"],["North Carolina","Western Illinois"],
    ["Notre Dame","Fairfield"],["Ohio St","Howard"],["Illinois","Colorado"],["Vanderbilt","High Point"],
    ["UCLA","Cal Baptist"],["Oklahoma St","Princeton"],["Ole Miss","Gonzaga"],["Minnesota","Green Bay"],
    ["Baylor","Tennessee"],["Duke","Charleston"],["Texas Tech","Villanova"],["LSU","Jacksonville"],
    ["South Carolina","Savannah St"],["Clemson","USC"],["Michigan St","Colorado St"],["Oklahoma","Idaho"],
    ["Washington","South Dakota St"],["TCU","UC San Diego"],["Georgia","FDU"],["Iowa","Holy Cross"],
    ["Texas","Longwood"],["Oregon","Virginia Tech"],["Kentucky","James Madison"],["West Virginia","Miami Ohio"],
    ["Alabama","Rhode Island"],["Louisville","Vermont"],["NC State","Tennessee"],["Michigan","Holy Cross"],
]

MENS_SEEDS = {
    "Duke":1,"Siena":16,"Ohio St":8,"TCU":9,"St Johns":5,"Northern Iowa":12,"Kansas":4,"Cal Baptist":13,
    "Louisville":8,"South Florida":11,"Michigan St":3,"North Dakota St":14,"UCLA":7,"UCF":10,"UConn":2,"Furman":15,
    "Florida":1,"Lehigh":16,"Clemson":8,"Iowa":9,"Vanderbilt":5,"McNeese":12,"Nebraska":4,"Troy":13,
    "North Carolina":6,"VCU":11,"Illinois":3,"Penn":14,"Saint Marys":7,"Texas AM":10,"Houston":2,"Idaho":15,
    "Arizona":1,"Long Island":16,"Villanova":8,"Utah St":9,"Wisconsin":5,"High Point":12,"Arkansas":4,"Hawaii":13,
    "BYU":6,"NC State":11,"Gonzaga":3,"Kennesaw St":14,"Miami FL":7,"Missouri":10,"Purdue":2,"Queens":15,
    "Michigan":1,"Howard":16,"Georgia":8,"Saint Louis":9,"Texas Tech":5,"Akron":12,"Alabama":4,"Hofstra":13,
    "Tennessee":6,"SMU":11,"Virginia":3,"Wright St":14,"Kentucky":7,"Santa Clara":10,"Iowa St":2,"Tennessee St":15,
}

WOMENS_SEEDS = {
    "UConn":1,"UTSA":16,"Iowa St":8,"Syracuse":9,"Maryland":5,"Murray St":12,"North Carolina":4,"Western Illinois":13,
    "Notre Dame":6,"Fairfield":11,"Ohio St":3,"Howard":14,"Illinois":7,"Colorado":10,"Vanderbilt":2,"High Point":15,
    "UCLA":1,"Cal Baptist":16,"Oklahoma St":8,"Princeton":9,"Ole Miss":5,"Gonzaga":12,"Minnesota":4,"Green Bay":13,
    "Baylor":6,"Tennessee":11,"Duke":3,"Charleston":14,"Texas Tech":7,"Villanova":10,"LSU":2,"Jacksonville":15,
    "South Carolina":1,"Savannah St":16,"Clemson":8,"USC":9,"Michigan St":5,"Colorado St":12,"Oklahoma":4,"Idaho":13,
    "Washington":6,"South Dakota St":11,"TCU":3,"UC San Diego":14,"Georgia":7,"FDU":15,"Iowa":2,"Holy Cross":15,
    "Texas":1,"Longwood":16,"Oregon":8,"Virginia Tech":9,"Kentucky":5,"James Madison":12,"West Virginia":4,"Miami Ohio":13,
    "Alabama":6,"Rhode Island":11,"Louisville":3,"Vermont":14,"NC State":7,"Tennessee":10,"Michigan":2,"Holy Cross":15,
}


def _seed_win_prob(seed1, seed2):
    table = {
        (1,16):0.993,(2,15):0.942,(3,14):0.849,(4,13):0.795,(5,12):0.644,
        (6,11):0.620,(7,10):0.601,(8,9):0.509,(1,8):0.815,(2,7):0.741,
        (3,6):0.693,(4,5):0.667,(1,4):0.712,(1,2):0.584,(1,3):0.647,
    }
    key = (min(seed1,seed2), max(seed1,seed2))
    if key in table:
        prob = table[key]
        return prob if seed1 <= seed2 else 1 - prob
    return min(0.97, max(0.03, 0.5 + (seed2-seed1) * 0.038))


def _seed_history(seed1, seed2):
    try:
        s1, s2 = int(seed1), int(seed2)
    except (ValueError, TypeError):
        return ""
    records = {
        (1,16):"1-seeds win 99% historically.",
        (2,15):"2-seeds win 94% historically.",
        (3,14):"3-seeds win 85% historically.",
        (4,13):"13-seeds upset 21% of the time.",
        (5,12):"Classic upset spot - 12s win 35%.",
        (6,11):"11-seeds win 38%.",
        (7,10):"Near coin flip - 10s win 40%.",
        (8,9): "True coin flip - 9s win 51%.",
    }
    return records.get((min(s1,s2), max(s1,s2)), "")


def _build_prompt(team1, team2, bracket_type, custom_weights, injury_ctx, coach1, coach2):
    tournament = "Men's" if bracket_type == "mens" else "Women's"
    seed1 = team1.get('seed', '?')
    seed2 = team2.get('seed', '?')
    name1 = team1.get('name', 'Team 1')
    name2 = team2.get('name', 'Team 2')
    history = _seed_history(seed1, seed2)

    weight_instructions = ""
    if custom_weights and any(v > 0 for v in custom_weights.values()):
        total = sum(custom_weights.values()) or 100
        seed_w   = custom_weights.get('seedDiff', 30) / total
        form_w   = custom_weights.get('recentForm', 20) / total
        coach_w  = custom_weights.get('coachRating', 15) / total
        injury_w = custom_weights.get('injuryImpact', 10) / total
        weight_instructions = f"\nWeights: seed={seed_w*100:.0f}% form={form_w*100:.0f}% coach={coach_w*100:.0f}% injury={injury_w*100:.0f}%"

    return f"""NCAA {tournament} 2026: #{seed1} {name1} vs #{seed2} {name2}. {history}{injury_ctx}{weight_instructions}

Respond with ONLY this JSON:
{{"team1WinProb":75,"team2WinProb":25,"confidence":"high","upsetAlert":false,"pick":"{name1}","oneLiner":"Short pick reason.","reasoning":"Two sentence analysis.","factors":[{{"label":"Seed advantage","icon":"🎯","value":75,"edge":"{name1}","color":"#F0B429"}},{{"label":"Season record","icon":"📊","value":60,"edge":"{name1}","color":"#3D7FFF"}},{{"label":"Coach experience","icon":"🎓","value":55,"edge":"Similar","color":"#8B5CF6"}},{{"label":"Injury impact","icon":"🏥","value":50,"edge":"None","color":"#FF6B2B"}}]}}"""


async def _gemini(prompt):
    if not _gemini_key:
        return None
    try:
        model    = genai.GenerativeModel(GEMINI_MODEL, generation_config=_gemini_config, safety_settings=_safe)
        response = await asyncio.to_thread(model.generate_content, prompt)
        text     = response.text.strip().replace("```json","").replace("```","").strip()
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1:
            text = text[start:end+1]
        result = json.loads(text)
        result["_source"] = "gemini"
        return result
    except Exception as e:
        logger.warning(f"Gemini failed: {e}")
        return None


async def analyze_matchup(team1, team2, reasoning_mode, custom_weights, injuries, bracket_type, coach1=None, coach2=None):
    t1_inj = [i for i in injuries if team1.get("name","").lower() in i.get("team","").lower()]
    t2_inj = [i for i in injuries if team2.get("name","").lower() in i.get("team","").lower()]
    injury_ctx = ""
    if t1_inj:
        injury_ctx += f" {team1['name']} injuries: " + ", ".join(f"{i['player']} ({i['status']})" for i in t1_inj[:2])
    if t2_inj:
        injury_ctx += f" {team2['name']} injuries: " + ", ".join(f"{i['player']} ({i['status']})" for i in t2_inj[:2])

    weights = custom_weights if reasoning_mode == "custom" else {}
    prompt  = _build_prompt(team1, team2, bracket_type, weights, injury_ctx, coach1, coach2)

    result = await _gemini(prompt)
    if not result:
        result = _fallback(team1, team2, custom_weights)
    else:
        result.update({"mode": "custom" if reasoning_mode == "custom" else "quick"})

    if t1_inj or t2_inj:
        result["injuries"] = [f"{i['player']} ({i['team']}) - {i['status']}" for i in (t1_inj + t2_inj)[:3]]

    result["team2WinProb"] = 100 - result.get("team1WinProb", 50)
    return result


def _fallback(team1, team2, custom_weights=None):
    seed1 = int(team1.get("seed", 8)) if str(team1.get("seed","")).isdigit() else 8
    seed2 = int(team2.get("seed", 9)) if str(team2.get("seed","")).isdigit() else 9
    base_prob = _seed_win_prob(seed1, seed2)

    if custom_weights and any(v > 0 for v in custom_weights.values()):
        total = sum(custom_weights.values()) or 100
        seed_weight = custom_weights.get('seedDiff', 30) / total
        prob = 0.5 + (base_prob - 0.5) * (seed_weight / 0.30)
        prob = max(0.03, min(0.97, prob))
    else:
        prob = base_prob

    prob   = int(prob * 100)
    winner = team1 if prob >= 50 else team2
    return {
        "team1WinProb": prob, "team2WinProb": 100 - prob,
        "confidence": "high" if abs(prob-50) > 25 else "medium",
        "upsetAlert": seed2 < seed1,
        "pick": winner.get("name", "Team 1"),
        "oneLiner": f"#{min(seed1,seed2)} seed wins {max(prob,100-prob)}% historically.",
        "reasoning": "Based on 30 years of NCAA seed matchup data.",
        "factors": [
            {"label":"Seed advantage",   "icon":"🎯","value":prob,"edge":team1.get("name"),"color":"#F0B429"},
            {"label":"Season record",    "icon":"📊","value":60,  "edge":"Historical avg", "color":"#3D7FFF"},
            {"label":"Coach experience", "icon":"🎓","value":55,  "edge":"Similar",        "color":"#8B5CF6"},
            {"label":"Injury impact",    "icon":"🏥","value":50,  "edge":"None reported",  "color":"#FF6B2B"},
        ],
        "injuries": [], "mode": "fallback",
    }


async def agent_chat(message, history, bracket_type, context=None):
    if not _gemini_key:
        return {"response": "Add GEMINI_API_KEY to enable the AI agent.", "teams": [], "sources": []}

    tournament = "Men's" if bracket_type == "mens" else "Women's"
    r64   = MENS_R64   if bracket_type == "mens" else WOMENS_R64
    seeds = MENS_SEEDS if bracket_type == "mens" else WOMENS_SEEDS

    def pick_winner(t1, t2):
        s1 = seeds.get(t1, 8)
        s2 = seeds.get(t2, 8)
        return t1 if _seed_win_prob(s1, s2) >= 0.5 else t2

    r32   = [pick_winner(t1, t2) for t1, t2 in r64]
    s16   = [pick_winner(r32[i], r32[i+1]) for i in range(0, len(r32)-1, 2)]
    e8    = [pick_winner(s16[i], s16[i+1]) for i in range(0, len(s16)-1, 2)]
    ff    = [pick_winner(e8[i],  e8[i+1])  for i in range(0, len(e8)-1,  2)]
    champ = pick_winner(ff[0], ff[1]) if len(ff) >= 2 else (ff[0] if ff else "Duke")

    if bracket_type == "mens":
        east  = "Duke, Ohio St, St Johns, Kansas, Louisville, Michigan St, UCLA, UConn"
        south = "Florida, Clemson, Vanderbilt, Nebraska, North Carolina, Illinois, Saint Marys, Houston"
        west  = "Arizona, Villanova, Wisconsin, Arkansas, BYU, Gonzaga, Miami FL, Purdue"
        mid   = "Michigan, Georgia, Texas Tech, Alabama, Tennessee, Virginia, Kentucky, Iowa St"
        regions = f"East: {east}\nSouth: {south}\nWest: {west}\nMidwest: {mid}"
    else:
        fw1 = "UConn, Iowa St, Maryland, North Carolina, Notre Dame, Ohio St, Illinois, Vanderbilt"
        sc2 = "UCLA, Oklahoma St, Ole Miss, Minnesota, Baylor, Duke, Texas Tech, LSU"
        sc4 = "South Carolina, Clemson, Michigan St, Oklahoma, Washington, TCU, Georgia, Iowa"
        fw3 = "Texas, Oregon, Kentucky, West Virginia, Alabama, Louisville, NC State, Michigan"
        regions = f"Fort Worth 1: {fw1}\nSacramento 2: {sc2}\nSacramento 4: {sc4}\nFort Worth 3: {fw3}"

    system_prompt = f"""You are BracketGenius AI — elite NCAA March Madness analyst for 2026.
Today is March 17, 2026. The {tournament} NCAA Tournament was just announced. This is REAL.

2026 {tournament.upper()} BRACKET TEAMS:
{regions}

PREDICTED RESULTS:
Sweet 16: {', '.join(s16)}
Elite 8: {', '.join(e8)}
Final Four: {', '.join(ff)}
Predicted Champion: {champ}

UPSET PICKS: 12-seeds win 35% — watch Northern Iowa vs St Johns, McNeese vs Vanderbilt. 11-seeds win 38% — watch VCU vs North Carolina, South Florida vs Louisville.

SEED WIN RATES: 1=99% 2=94% 3=85% 4=79% 5=64% 6=62% 7=60% 8/9=50% 11=38% 12=35%

STRICT RULES:
- Always name specific teams from the bracket
- Always complete your sentences — never cut off
- Max 120 words total
- Lead with the direct answer first
- Use **bold** for team names
- Give win percentages when asked"""

    chat_history = [
        {"role": "user" if m["role"] == "user" else "model", "parts": [m["content"]]}
        for m in history[-6:]
    ]

    try:
        model = genai.GenerativeModel(
            GEMINI_MODEL,
            system_instruction=system_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.6,
                max_output_tokens=500,
            ),
            safety_settings=_safe
        )
        chat     = model.start_chat(history=chat_history)
        response = await asyncio.to_thread(chat.send_message, message)
        return {
            "response": response.text,
            "teams":    _extract_teams(response.text),
            "sources":  ["2026 NCAA Bracket", "Historical Seed Data", "BracketGenius AI"]
        }
    except Exception as e:
        logger.error(f"Agent error: {e}")
        return {"response": "Having trouble right now — please try again.", "teams": [], "sources": []}


def _extract_teams(text):
    all_seeds = {**MENS_SEEDS, **WOMENS_SEEDS}
    known = [
        "Duke","UConn","Florida","Houston","Michigan","Iowa St","Arizona",
        "Gonzaga","Kansas","Alabama","South Carolina","UCLA","LSU","Texas",
        "Vanderbilt","Purdue","Michigan St","Kentucky","North Carolina","Illinois",
        "St Johns","Virginia","Arkansas","BYU","Tennessee","Texas Tech","Iowa",
        "Ohio St","Clemson","Wisconsin","Villanova","Nebraska","McNeese",
        "Northern Iowa","VCU","South Florida","Notre Dame","Louisville",
    ]
    return [
        {
            "name": t,
            "seed": str(all_seeds.get(t, "--")),
            "record": "--",
            "conference": "--",
            "winProb": None
        }
        for t in known if t.lower() in text.lower()
    ][:4]


async def predict_full_bracket(bracket_type: str) -> dict:
    """Predicts all rounds using seed-based logic."""
    r64   = MENS_R64   if bracket_type == "mens" else WOMENS_R64
    seeds = MENS_SEEDS if bracket_type == "mens" else WOMENS_SEEDS

    def pick_winner(t1, t2):
        s1 = seeds.get(t1, 8)
        s2 = seeds.get(t2, 8)
        return t1 if _seed_win_prob(s1, s2) >= 0.5 else t2

    r32   = [pick_winner(t1, t2) for t1, t2 in r64]
    s16   = [pick_winner(r32[i], r32[i+1]) for i in range(0, len(r32)-1, 2)]
    e8    = [pick_winner(s16[i], s16[i+1]) for i in range(0, len(s16)-1, 2)]
    ff    = [pick_winner(e8[i],  e8[i+1])  for i in range(0, len(e8)-1,  2)]
    champ = pick_winner(ff[0], ff[1]) if len(ff) >= 2 else (ff[0] if ff else "Duke")

    upsets = []
    for t1, t2 in r64:
        s1 = seeds.get(t1, 8)
        s2 = seeds.get(t2, 8)
        winner = pick_winner(t1, t2)
        loser  = t2 if winner == t1 else t1
        winner_seed = seeds.get(winner, 8)
        loser_seed  = seeds.get(loser, 8)
        if winner_seed > loser_seed:
            upsets.append({
                "round": "Round of 64",
                "winner": winner,
                "loser": loser,
                "confidence": int(_seed_win_prob(winner_seed, loser_seed) * 100)
            })

    if bracket_type == "mens":
        analysis   = "Duke enters as the clear favorite with elite guard play. Houston and Michigan are the strongest challengers."
        dark_horse = "St Johns"
        top_upset  = "Northern Iowa over St Johns - St Johns struggled late in the season"
    else:
        analysis   = "South Carolina is the overwhelming favorite led by Dawn Staley. UConn and UCLA are the strongest challengers."
        dark_horse = "Notre Dame"
        top_upset  = "Murray St over Maryland - Murray St has elite guard play and a hot streak"

    return {
        "champion":     champ,
        "finalFour":    ff,
        "eliteEight":   e8,
        "sweetSixteen": s16,
        "roundOf32":    r32,
        "upsets":       upsets[:5],
        "analysis":     analysis,
        "darkHorse":    dark_horse,
        "topUpsetPick": top_upset,
    }
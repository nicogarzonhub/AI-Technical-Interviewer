import json
import re


def get_eval_prompt(language: str) -> str:
    return f"""You are a senior engineering manager reviewing a completed technical interview transcript.

Based on the full conversation, generate a structured evaluation JSON with this exact format:
{{
  "overall_score": <number 0-100>,
  "summary": "<2-3 sentence overall impression>",
  "recommendation": "<Hire / Consider / Pass (translated to {language})>",
  "categories": {{
    "technical_concepts": {{
      "score": <0-100>,
      "feedback": "<specific feedback>"
    }},
    "problem_solving": {{
      "score": <0-100>,
      "feedback": "<specific feedback>"
    }},
    "communication": {{
      "score": <0-100>,
      "feedback": "<specific feedback>"
    }},
    "depth_of_knowledge": {{
      "score": <0-100>,
      "feedback": "<specific feedback>"
    }},
    "best_practices": {{
      "score": <0-100>,
      "feedback": "<specific feedback>"
    }}
  }},
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areas_to_improve": ["<area 1>", "<area 2>"],
  "standout_moment": "<the best or most memorable answer from the candidate>"
}}

IMPORTANT: The JSON keys MUST remain exactly as shown above in English. However, ALL string values (summary, recommendation, feedback, strengths, areas_to_improve, standout_moment) MUST be strictly translated and written in {language}.

Be honest and specific. Base every score and comment on actual answers given in the transcript.
Respond ONLY with the JSON object. No markdown, no explanation."""


async def evaluate_session(client, agent) -> dict:
    # Build full transcript
    transcript = ""
    for msg in agent.history:
        role_label = "Interviewer" if msg["role"] == "assistant" else "Candidate"
        transcript += f"{role_label}: {msg['content']}\n\n"

    context = f"""
Role: {agent.role}
Level: {agent.level}
Stack: {agent.stack}

TRANSCRIPT:
{transcript}
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": get_eval_prompt(agent.language)},
            {"role": "user", "content": context}
        ],
        temperature=0.3
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if present
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"```$", "", raw).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "overall_score": 0,
            "summary": "Error generating evaluation.",
            "recommendation": "Pass",
            "categories": {},
            "strengths": [],
            "areas_to_improve": [],
            "standout_moment": ""
        }

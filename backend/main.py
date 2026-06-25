from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import openai
import os
from dotenv import load_dotenv
from agent import InterviewAgent
from evaluator import evaluate_session

load_dotenv()

app = FastAPI(title="AI Tech Interviewer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# In-memory sessions
sessions: dict[str, InterviewAgent] = {}


class StartRequest(BaseModel):
    session_id: str
    role: str
    level: str
    stack: str
    language: str


class MessageRequest(BaseModel):
    session_id: str
    message: str


class SessionResponse(BaseModel):
    reply: str
    options: List[str]
    question_number: int
    total_questions: int
    finished: bool


@app.post("/start")
async def start_interview(req: StartRequest):
    agent = InterviewAgent(req.role, req.level, req.stack, req.language)
    sessions[req.session_id] = agent
    first_question, options = await agent.start(client)
    return {
        "reply": first_question,
        "options": options,
        "question_number": 1,
        "total_questions": agent.total_questions,
        "finished": False
    }


@app.post("/chat")
async def chat(req: MessageRequest):
    agent = sessions.get(req.session_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Session not found")

    reply, options, finished = await agent.respond(client, req.message)
    return {
        "reply": reply,
        "options": options,
        "question_number": agent.current_question,
        "total_questions": agent.total_questions,
        "finished": finished
    }


@app.get("/report/{session_id}")
async def get_report(session_id: str):
    agent = sessions.get(session_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Session not found")
    report = await evaluate_session(client, agent)
    return report


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    # Save temporarily
    tmp_path = f"/tmp/{file.filename}"
    with open(tmp_path, "wb") as f:
        f.write(audio_bytes)
    with open(tmp_path, "rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
        )
    return {"text": transcript.text}


@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    sessions.pop(session_id, None)
    return {"ok": True}

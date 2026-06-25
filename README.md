#  AI Tech Interviewer

A full-stack AI-powered technical interview simulator. Configure your role, level, and stack — the agent conducts a real adaptive interview and generates a detailed evaluation report with radar chart scoring.

**Live experience:** Setup → 6 adaptive questions → evaluation report with scores by category, strengths, areas to improve, and recommendation (Hire / Consider / Pass).

---

##  Features

- **Adaptive difficulty** — the agent increases or decreases question complexity based on your answers
- **Voice input** — record your answers using your microphone, transcribed via OpenAI Whisper
- **Radar chart evaluation** — visual breakdown across 5 dimensions: Technical Concepts, Problem Solving, Communication, Depth of Knowledge, Best Practices
- **Smart recommendation** — Hire / Consider / Pass based on overall performance
- **6 roles supported** — Frontend, Backend, Full-Stack, DevOps, Data Engineer, Mobile
- **3 experience levels** — Junior, Mid-level, Senior
- **8 tech stacks** — React, Python, Node.js, Next.js, Java, Go, PHP, Ruby

---

## 🗂️ Project Structure

```
ai-tech-interviewer/
├── backend/                  # FastAPI (Python)
│   ├── main.py               # API routes
│   ├── agent.py              # Interview agent with conversation memory
│   ├── evaluator.py          # Report generation
│   ├── prompts.py            # System prompts per role/level
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Setup.jsx     # Role/level/stack selector
│   │   │   ├── Interview.jsx # Live chat interface
│   │   │   ├── VoiceInput.jsx# Whisper voice recording
│   │   │   └── Report.jsx    # Evaluation report + radar chart
│   │   ├── services/api.js   # Backend communication
│   │   └── styles/global.css
│   ├── .env.example
│   └── package.json
└── .gitignore
```

---

##  Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key → [platform.openai.com](https://platform.openai.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/nicogarzonhub/ai-tech-interviewer.git
cd ai-tech-interviewer
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-...

# Start the server
uvicorn main:app --reload --port 8000
```

Backend running at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

---

### 3. Frontend setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000  (already set by default)

# Start the dev server
npm run dev
```

Frontend running at: `http://localhost:3000`

---

##  Architecture

```
User (text or voice)
       │
       ▼
  Frontend (React + Vite)
       │  REST API calls
       ▼
  Backend (FastAPI)
       │
       ├─ /start    → Creates session, generates first question
       ├─ /chat     → Sends answer, receives next question (adaptive)
       ├─ /report   → Evaluates full transcript, returns JSON report
       └─ /transcribe → Audio blob → Whisper → text
       │
       ▼
  OpenAI GPT-4o
  OpenAI Whisper (voice)
```

### Adaptive difficulty logic

After each answer, the backend builds a context-aware prompt that instructs the agent to raise or lower difficulty based on response quality. The agent maintains the full conversation history in memory across all turns within a session.

### Report generation

After the final answer, `evaluator.py` sends the complete transcript to GPT-4o with a strict JSON schema prompt. The model scores 5 categories (0–100), writes specific feedback per category, lists strengths and areas to improve, identifies a standout moment, and issues a final recommendation.

---

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/start` | Start a new interview session |
| POST | `/chat` | Send an answer, receive next question |
| GET | `/report/{session_id}` | Get the final evaluation report |
| POST | `/transcribe` | Transcribe audio to text via Whisper |
| DELETE | `/session/{session_id}` | Clean up a session |

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts |
| Backend | FastAPI, Python 3.10+ |
| AI | OpenAI GPT-4o, Whisper |
| Styling | Custom CSS with CSS variables |
| Voice | MediaRecorder API + Whisper STT |

---


Built by [Nicolas](https://github.com/nicogarzonhub) · Medellín, Colombia 🇨🇴

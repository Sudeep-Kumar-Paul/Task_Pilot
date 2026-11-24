# 🤖 TaskPilot — AI-Powered Browser Automation

An agentic browser-automation tool that uses Gemini Flash to drive a real browser, with live step-by-step streaming to a React dashboard. Built for a 24-hour hackathon demo.

## Architecture

```
┌──────────────────┐    WebSocket     ┌──────────────────────────┐
│  React Frontend  │◄────────────────►│   FastAPI Backend         │
│  (Tailwind CSS)  │   step/result    │                          │
│  Firebase Auth   │   streaming      │  Agent Loop:             │
└──────────────────┘                  │  Task → Gemini → Action  │
                                      │  → Playwright → Repeat   │
                                      └──────────┬───────────────┘
                                                  │
                                      ┌───────────▼───────────┐
                                      │  Chromium (Playwright) │
                                      │  Headed browser        │
                                      └───────────────────────┘
```

## Demo Tasks

| Task | Description | Inputs |
|------|-------------|--------|
| 🔍 **Price Comparison** | Search multiple sites, compare prices | Product name, budget |
| 📝 **Form Autofill** | Navigate to a form, fill fields, submit | URL, field values (JSON) |
| 📦 **Order Status** | Check order/tracking status | Tracking URL, order ID |

## Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **Google Gemini API key** (via `GEMINI_API_KEY` for Gemini Flash models)
- **Firebase project** with Authentication enabled (Email/Password + Google)

## Setup

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create a new project.
2. Enable **Authentication** → Sign-in method → Enable **Email/Password** and **Google**.
3. Go to **Project Settings** → **General** → scroll to **Your apps** → **Add web app** → copy the config.
4. Go to **Project Settings** → **Service accounts** → **Generate new private key** → save as `serviceAccountKey.json` in `backend/`.

### 2. Environment Variables

**Backend** — create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
```

**Frontend** — create `frontend/.env`:
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_WS_URL=ws://localhost:8000/ws/agent
```

### 3. Install & Run

**Backend:**
```bash
cd backend
pip install -r requirements.txt
playwright install chromium
uvicorn main:app --reload --port 8000
```

**Frontend** (in a second terminal):
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** → Sign in → Pick a task → Watch the agent work!

## How It Works

1. User signs in via Firebase (email/password or Google).
2. User selects a task and provides parameters.
3. Frontend opens a WebSocket to the backend, sending the Firebase ID token for authentication.
4. Backend verifies the token, launches a Playwright browser, and enters the **agent loop**:
   - Captures a screenshot + DOM of the current page.
   - Sends them to Gemini Flash with the task instructions.
   - Gemini returns a structured JSON action (click, type, navigate, scroll, extract, or done).
   - Backend executes the action via Playwright (with 3-attempt retry + fallback selectors).
   - Each step is streamed to the frontend in real time.
5. When Claude returns "done", the final result is displayed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS 3, Vite 5 |
| Auth | Firebase Authentication (Email/Password + Google) |
| Backend | Python, FastAPI, WebSocket |
| Browser | Playwright (async, headed Chromium) |
| AI | Google Gemini Flash (Google GenAI SDK) |

## Project Structure

```
TaskPilot/
├── backend/
│   ├── main.py          # FastAPI app, WebSocket endpoint
│   ├── agent.py         # Agent loop (Claude ↔ Playwright)
│   ├── browser.py       # Playwright lifecycle
│   ├── tasks.py         # Demo task prompt templates
│   ├── auth.py          # Firebase token verification
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app + WebSocket logic
│   │   ├── firebase.js       # Firebase config + auth helpers
│   │   └── components/
│   │       ├── Login.jsx      # Sign-in / sign-up screen
│   │       ├── TaskInput.jsx  # Task selection + params
│   │       ├── AgentPanel.jsx # Live step streaming
│   │       └── ResultsPanel.jsx # Final results display
│   ├── package.json
│   └── vite.config.js
└── README.md
```

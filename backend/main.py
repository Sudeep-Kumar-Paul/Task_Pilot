"""FastAPI application — HTTP + WebSocket entry point for TaskPilot."""

import asyncio
import json
import sys

# Ensure Windows uses ProactorEventLoop for subprocesses (required by Playwright)
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from dotenv import load_dotenv

load_dotenv()  # Must run before other local imports that read env vars

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from auth import verify_token
from browser import cleanup as browser_cleanup, get_browser
from agent import run_agent
from tasks import TASK_DEFINITIONS

app = FastAPI(title="TaskPilot API", version="0.1.0")

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Only one agent run at a time
_agent_lock = asyncio.Lock()


# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------


@app.on_event("startup")
async def startup() -> None:
    """Pre-launch the Playwright browser so the first task starts fast."""
    await get_browser()


@app.on_event("shutdown")
async def shutdown() -> None:
    """Clean up Playwright resources."""
    await browser_cleanup()


# ---------------------------------------------------------------------------
# REST endpoints
# ---------------------------------------------------------------------------


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/tasks")
async def list_tasks():
    """Return the catalogue of demo tasks the UI can display."""
    return list(TASK_DEFINITIONS.values())


# ---------------------------------------------------------------------------
# WebSocket — agent streaming
# ---------------------------------------------------------------------------


@app.websocket("/ws")
@app.websocket("/ws/agent")
async def ws_agent(websocket: WebSocket):
    """Authenticate, receive a task, and stream agent steps back."""
    await websocket.accept()

    # Optional initial auth check from query param
    token = websocket.query_params.get("token")
    user = None
    if token:
        try:
            user = verify_token(token)
        except Exception:
            pass

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
            except Exception:
                await websocket.send_json({"type": "error", "message": "Invalid JSON format"})
                continue

            msg_type = payload.get("type", "")

            # 1. Handle auth message from Lovable frontend
            if msg_type == "auth":
                auth_token = payload.get("token")
                try:
                    user = verify_token(auth_token)
                except Exception:
                    pass
                continue

            # 2. Handle stop message
            if msg_type == "stop":
                continue

            # 3. Handle task execution message
            task_desc = payload.get("task", "")
            task_type = payload.get("taskType", "")
            params = payload.get("params", {})
            profile = payload.get("profile", {})

            if profile:
                params["fields"] = profile
            params["customPrompt"] = task_desc

            # Auto-classify task type if not specified
            if not task_type or task_type not in TASK_DEFINITIONS:
                task_lower = task_desc.lower()
                if any(w in task_lower for w in ["price", "cheap", "cheapest", "cost", "compare", "amazon", "flipkart", "croma", "chroma", "walmart", "best buy"]):
                    task_type = "price_comparison"
                elif any(w in task_lower for w in ["form", "fill", "register", "submit", "profile", "contact"]):
                    task_type = "form_autofill"
                elif any(w in task_lower for w in ["order", "track", "status", "delivery", "shipping", "myntra"]):
                    task_type = "order_status"
                else:
                    task_type = "price_comparison"

            # Acquire lock — single concurrent run
            if _agent_lock.locked():
                await websocket.send_json({
                    "type": "error",
                    "message": "Another agent task is already running. Please wait.",
                })
                continue

            async with _agent_lock:
                await run_agent(task_desc, task_type, params, websocket)

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        try:
            await websocket.send_json({"type": "error", "message": f"Server error: {exc}"})
        except Exception:
            pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000)

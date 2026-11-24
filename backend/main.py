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


@app.websocket("/ws/agent")
async def ws_agent(websocket: WebSocket):
    """Authenticate, receive a task, and stream agent steps back."""
    # 1. Authenticate via query param
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return
    try:
        user = verify_token(token)
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return

    await websocket.accept()

    try:
        # 2. Receive the task payload
        raw = await websocket.receive_text()
        payload = json.loads(raw)

        task_type = payload.get("taskType", "")
        params = payload.get("params", {})
        task_desc = payload.get("task", task_type)

        if task_type not in TASK_DEFINITIONS:
            await websocket.send_json(
                {"type": "error", "message": f"Unknown task type: {task_type}"}
            )
            return

        # 3. Acquire lock — single concurrent run
        if _agent_lock.locked():
            await websocket.send_json(
                {
                    "type": "error",
                    "message": "Another agent task is already running. Please wait.",
                }
            )
            return

        async with _agent_lock:
            await websocket.send_json({"type": "status", "message": "Agent started"})
            await run_agent(task_desc, task_type, params, websocket)

    except WebSocketDisconnect:
        pass
    except json.JSONDecodeError:
        await websocket.send_json(
            {"type": "error", "message": "Invalid JSON payload"}
        )
    except Exception as exc:
        try:
            await websocket.send_json(
                {"type": "error", "message": f"Server error: {exc}"}
            )
        except Exception:
            pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000)

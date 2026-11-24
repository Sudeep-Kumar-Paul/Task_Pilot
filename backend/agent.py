"""Core agent loop — drives the browser via Google Gemini and streams progress over WebSocket."""

import asyncio
import base64
import json
import os
import re

from google import genai
from google.genai import types
from fastapi import WebSocket

from browser import create_page, take_screenshot, get_page_content
from tasks import get_system_prompt

MAX_STEPS = 15
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")


def _get_genai_client() -> genai.Client:
    """Return an initialized Google GenAI client."""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please add GEMINI_API_KEY to your backend/.env file."
        )
    return genai.Client(api_key=api_key)


async def _call_gemini(
    client: genai.Client,
    contents: list,
    system_prompt: str,
) -> str:
    """Call the Gemini API with automatic fallback for model aliases."""
    models_to_try = [
        DEFAULT_MODEL,
        "gemini-3.8-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]
    seen = set()
    models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        max_output_tokens=1024,
        response_mime_type="application/json",
    )

    last_error = None
    for model_name in models:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )
            return response.text or ""
        except Exception as exc:
            last_error = exc
            err_str = str(exc).lower()
            if "not found" in err_str or "unsupported" in err_str or "404" in err_str:
                continue
            raise exc

    if last_error:
        raise last_error
    raise RuntimeError("Failed to generate content with Gemini")


async def run_agent(
    task: str,
    task_type: str,
    params: dict,
    ws: WebSocket,
) -> None:
    """Execute the agentic browser-automation loop using Gemini Flash.

    Args:
        task: Human-readable task description.
        task_type: One of the registered task types (price_comparison, etc.).
        params: Task-specific parameters.
        ws: Active WebSocket to stream step updates.
    """
    page = await create_page()
    contents: list[types.Content] = []
    system_prompt = get_system_prompt(task_type, params)
    client = _get_genai_client()

    try:
        for step in range(1, MAX_STEPS + 1):
            # 1. Capture current browser state
            screenshot_b64 = await take_screenshot(page)
            dom = await get_page_content(page)
            screenshot_bytes = base64.b64decode(screenshot_b64)

            # 2. Prune old image payloads to conserve context and reduce latency
            for turn in contents[:-2]:
                if turn.parts:
                    turn.parts = [
                        p if not (hasattr(p, "inline_data") and p.inline_data)
                        else types.Part.from_text(text="[Prior screenshot]")
                        for p in turn.parts
                    ]

            # 3. Build current turn user content with image + DOM
            img_part = types.Part.from_bytes(data=screenshot_bytes, mime_type="image/png")
            text_part = types.Part.from_text(
                text=(
                    f"Step {step}/{MAX_STEPS}.\n"
                    f"Current URL: {page.url}\n"
                    f"Page DOM (simplified):\n{dom}"
                )
            )
            contents.append(types.Content(role="user", parts=[img_part, text_part]))

            # 4. Ask Gemini for the next action
            assistant_text = await _call_gemini(client, contents, system_prompt)
            contents.append(
                types.Content(
                    role="model",
                    parts=[types.Part.from_text(text=assistant_text)],
                )
            )

            # 5. Parse JSON action
            action_data = _parse_action(assistant_text)
            action = action_data.get("action", "done")
            reasoning = action_data.get("reasoning", "")

            # 6. Stream step update to frontend
            await ws.send_json(
                {
                    "type": "step",
                    "step": step,
                    "action": action,
                    "reasoning": reasoning,
                    "screenshot": screenshot_b64,
                }
            )

            # 7. If done, send result and exit
            if action == "done":
                await ws.send_json(
                    {
                        "type": "result",
                        "data": action_data.get("data", {}),
                    }
                )
                return

            # 8. Execute the action with retry logic
            await _execute_action(page, action_data)

        # Exhausted all steps without "done"
        final_screenshot = await take_screenshot(page)
        await ws.send_json(
            {
                "type": "result",
                "data": {
                    "type": "timeout",
                    "message": "Reached maximum steps without completing the task.",
                    "screenshot": final_screenshot,
                },
            }
        )
    except Exception as exc:
        await ws.send_json(
            {
                "type": "error",
                "message": f"Agent error: {exc}",
            }
        )
    finally:
        await page.close()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _parse_action(text: str) -> dict:
    """Extract the first JSON object from the model's reply."""
    text = text.strip()

    # Try parsing direct JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try finding markdown JSON block
    match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try finding any JSON object pattern
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    return {"action": "done", "reasoning": "Could not parse agent response.", "data": {}}


async def _execute_action(page, action_data: dict) -> None:
    """Execute a single browser action with retry logic.

    Retry strategy (up to 3 attempts):
        1. Original selector.
        2. Broader selector (less specific CSS).
        3. JavaScript-based interaction.
    """
    action = action_data.get("action")
    selector = action_data.get("selector", "")
    value = action_data.get("value", "")

    for attempt in range(1, 4):
        try:
            if action == "navigate":
                url = value if value.startswith("http") else f"https://{value}"
                await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                return

            if action == "scroll":
                delta = -300 if value == "up" else 300
                await page.mouse.wheel(0, delta)
                await asyncio.sleep(0.5)
                return

            if action == "extract":
                return

            current_selector = _broaden_selector(selector, attempt)

            if action == "click":
                if attempt == 3:
                    await page.evaluate(
                        f"document.querySelector('{_js_escape(current_selector)}')?.click()"
                    )
                else:
                    await page.click(current_selector, timeout=5000)
                await page.wait_for_load_state("domcontentloaded", timeout=5000)
                return

            if action == "type":
                if attempt == 3:
                    await page.evaluate(
                        f"""(() => {{
                            const el = document.querySelector('{_js_escape(current_selector)}');
                            if (el) {{ el.value = '{_js_escape(value)}'; el.dispatchEvent(new Event('input', {{bubbles:true}})); }}
                        }})()"""
                    )
                else:
                    await page.fill(current_selector, value, timeout=5000)
                return

        except Exception:
            if attempt < 3:
                await asyncio.sleep(1)
            else:
                raise


def _broaden_selector(selector: str, attempt: int) -> str:
    """Return progressively broader selectors on retry."""
    if attempt == 1 or not selector:
        return selector
    broad = re.sub(r":nth-child\(\d+\)", "", selector)
    broad = re.sub(r":(hover|focus|active|visited)", "", broad)
    return broad if broad.strip() else selector


def _js_escape(s: str) -> str:
    """Escape a string for safe embedding in a JS single-quoted string."""
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")

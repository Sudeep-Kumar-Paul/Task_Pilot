"""Playwright browser management for TaskPilot."""

import base64
import re

from playwright.async_api import async_playwright, Browser, Page

_playwright = None
_browser: Browser | None = None


async def get_browser() -> Browser:
    """Return the singleton Chromium browser, launching it if needed."""
    global _playwright, _browser
    if _browser is None or not _browser.is_connected():
        _playwright = await async_playwright().start()
        _browser = await _playwright.chromium.launch(headless=False)
    return _browser


async def create_page() -> Page:
    """Create and return a new browser page."""
    browser = await get_browser()
    page = await browser.new_page(viewport={"width": 1280, "height": 800})
    return page


async def cleanup() -> None:
    """Close the browser and stop Playwright."""
    global _playwright, _browser
    if _browser is not None:
        await _browser.close()
        _browser = None
    if _playwright is not None:
        await _playwright.stop()
        _playwright = None


async def take_screenshot(page: Page) -> str:
    """Capture a full-page screenshot and return it as a base64-encoded PNG string."""
    png_bytes = await page.screenshot(type="png")
    return base64.b64encode(png_bytes).decode("utf-8")


async def get_page_content(page: Page) -> str:
    """Return a simplified DOM of the current page.

    Strips <script> and <style> elements and truncates to 8 000 chars.
    """
    html = await page.content()

    # Remove script and style blocks
    html = re.sub(r"<script[\s\S]*?</script>", "", html, flags=re.IGNORECASE)
    html = re.sub(r"<style[\s\S]*?</style>", "", html, flags=re.IGNORECASE)

    # Collapse whitespace
    html = re.sub(r"\s+", " ", html).strip()

    # Truncate
    if len(html) > 8000:
        html = html[:8000] + "... [truncated]"

    return html

"""Demo task prompt templates for TaskPilot."""

TASK_DEFINITIONS = {
    "price_comparison": {
        "id": "price_comparison",
        "name": "Price Comparison",
        "description": "Search multiple sites for a product and compare prices.",
        "icon": "🔍",
        "params": [
            {"name": "product_name", "label": "Product Name", "type": "text"},
            {"name": "budget", "label": "Max Budget ($)", "type": "number"},
        ],
    },
    "form_autofill": {
        "id": "form_autofill",
        "name": "Form Autofill",
        "description": "Navigate to a web form, fill in the fields, and submit.",
        "icon": "📝",
        "params": [
            {"name": "target_url", "label": "Form URL", "type": "text"},
            {"name": "fields", "label": "Fields (JSON)", "type": "textarea"},
        ],
    },
    "order_status": {
        "id": "order_status",
        "name": "Order Status",
        "description": "Check order/shipment status from a tracking page.",
        "icon": "📦",
        "params": [
            {"name": "tracking_url", "label": "Tracking URL", "type": "text"},
            {"name": "order_id", "label": "Order / Tracking ID", "type": "text"},
        ],
    },
}


def get_system_prompt(task_type: str, params: dict) -> str:
    """Return the system prompt for the given task type and parameters."""
    if task_type == "price_comparison":
        return _price_comparison_prompt(params)
    elif task_type == "form_autofill":
        return _form_autofill_prompt(params)
    elif task_type == "order_status":
        return _order_status_prompt(params)
    else:
        raise ValueError(f"Unknown task type: {task_type}")


# ---------------------------------------------------------------------------
# Prompt builders
# ---------------------------------------------------------------------------

def _price_comparison_prompt(params: dict) -> str:
    product = params.get("product_name", "unknown product")
    budget = params.get("budget", "any")
    return f"""You are an AI browser-automation agent performing a price comparison.

GOAL: Find the best prices for "{product}" with a maximum budget of ${budget}.

INSTRUCTIONS:
1. Search for the product on at least 2 major shopping sites (e.g. Amazon, Best Buy, Walmart).
2. For each site, find the product listing, note the price, availability, and any relevant details.
3. Compare the results.

When you are finished, respond with action "done" and include a "data" field with:
{{
  "type": "price_comparison",
  "product": "{product}",
  "budget": {budget},
  "results": [
    {{"site": "...", "price": ..., "name": "...", "url": "...", "in_stock": true/false}}
  ],
  "recommendation": "..."
}}

ACTIONS you can take (respond with exactly one JSON object per step):
- {{"action": "navigate", "value": "<url>", "reasoning": "..."}}
- {{"action": "click", "selector": "<css>", "reasoning": "..."}}
- {{"action": "type", "selector": "<css>", "value": "<text>", "reasoning": "..."}}
- {{"action": "scroll", "value": "down"|"up", "reasoning": "..."}}
- {{"action": "extract", "selector": "<css>", "reasoning": "..."}}
- {{"action": "done", "data": {{...}}, "reasoning": "..."}}
"""


def _form_autofill_prompt(params: dict) -> str:
    target_url = params.get("target_url", "")
    fields = params.get("fields", {})
    return f"""You are an AI browser-automation agent performing form autofill.

GOAL: Navigate to {target_url}, fill in the form fields, and submit.

FIELDS TO FILL:
{_format_fields(fields)}

INSTRUCTIONS:
1. Navigate to the target URL.
2. Identify the form fields and fill each one with the provided value.
3. Submit the form.
4. Confirm submission succeeded.

When finished, respond with action "done" and include a "data" field with:
{{
  "type": "form_autofill",
  "url": "{target_url}",
  "fields_filled": [...],
  "submitted": true/false,
  "confirmation": "..."
}}

ACTIONS (respond with exactly one JSON object per step):
- {{"action": "navigate", "value": "<url>", "reasoning": "..."}}
- {{"action": "click", "selector": "<css>", "reasoning": "..."}}
- {{"action": "type", "selector": "<css>", "value": "<text>", "reasoning": "..."}}
- {{"action": "scroll", "value": "down"|"up", "reasoning": "..."}}
- {{"action": "extract", "selector": "<css>", "reasoning": "..."}}
- {{"action": "done", "data": {{...}}, "reasoning": "..."}}
"""


def _order_status_prompt(params: dict) -> str:
    tracking_url = params.get("tracking_url", "")
    order_id = params.get("order_id", "")
    return f"""You are an AI browser-automation agent checking order status.

GOAL: Navigate to {tracking_url} and find the status for order/tracking ID "{order_id}".

INSTRUCTIONS:
1. Navigate to the tracking URL.
2. Enter the order/tracking ID if there is an input field.
3. Extract the current status, estimated delivery, and any relevant details.

When finished, respond with action "done" and include a "data" field with:
{{
  "type": "order_status",
  "order_id": "{order_id}",
  "status": "...",
  "estimated_delivery": "...",
  "details": "..."
}}

ACTIONS (respond with exactly one JSON object per step):
- {{"action": "navigate", "value": "<url>", "reasoning": "..."}}
- {{"action": "click", "selector": "<css>", "reasoning": "..."}}
- {{"action": "type", "selector": "<css>", "value": "<text>", "reasoning": "..."}}
- {{"action": "scroll", "value": "down"|"up", "reasoning": "..."}}
- {{"action": "extract", "selector": "<css>", "reasoning": "..."}}
- {{"action": "done", "data": {{...}}, "reasoning": "..."}}
"""


def _format_fields(fields) -> str:
    """Format a fields dict or JSON string into readable lines."""
    if isinstance(fields, str):
        import json
        try:
            fields = json.loads(fields)
        except json.JSONDecodeError:
            return fields
    if isinstance(fields, dict):
        return "\n".join(f"- {k}: {v}" for k, v in fields.items())
    return str(fields)

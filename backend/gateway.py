import asyncio
import os
import re
from http import HTTPStatus

import httpx

from config import (
    FALLBACK_STATUSES,
    GATEWAY_DEADLINE,
    GATEWAY_URL,
    OUTPUT_LIMIT,
    PROMPT_LIMIT,
    ROUTE_ENV,
)


class GatewayError(Exception):
    pass


def route_settings(alias: str) -> tuple[str, str]:
    if alias not in ROUTE_ENV:
        raise GatewayError("Unknown route. Choose fast or quality.")
    model = os.getenv(ROUTE_ENV[alias], "")
    key = os.getenv("AI_GATEWAY_API_KEY", "")
    if not key or not re.fullmatch(r"[\w.-]+/[\w.:-]+", model):
        raise GatewayError("Configure a Gateway key and eligible model for this route.")
    return model, key


def request_body(prompt: str, model: str) -> dict:
    if not prompt.strip() or len(prompt) > PROMPT_LIMIT:
        raise GatewayError(f"Prompt must contain 1–{PROMPT_LIMIT} characters.")
    return {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": OUTPUT_LIMIT,
        "stream": False,
    }


def response_text(response: httpx.Response) -> dict:
    status = response.status_code
    if status == HTTPStatus.UNAUTHORIZED:
        raise GatewayError("Gateway credentials were rejected.")
    if status in {HTTPStatus.PAYMENT_REQUIRED, HTTPStatus.FORBIDDEN, HTTPStatus.TOO_MANY_REQUESTS}:
        raise GatewayError("Gateway credits, model access, or rate limit unavailable.")
    if status != HTTPStatus.OK:
        raise GatewayError("Gateway request failed; no automatic retry.")
    try:
        data = response.json()
        text = data["choices"][0]["message"]["content"]
        if not isinstance(text, str) or not isinstance(data["model"], str):
            raise ValueError("Invalid response")
        return {
            "text": text,
            "model": data["model"],
            "usage": data.get("usage", {}),
            "request_id": response.headers.get("x-request-id", data.get("id", "")),
        }
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        raise GatewayError("Gateway returned an invalid response.") from exc


async def send_prompt(client: httpx.AsyncClient, prompt: str, alias: str) -> httpx.Response:
    model, key = route_settings(alias)
    return await client.post(
        GATEWAY_URL,
        headers={"Authorization": f"Bearer {key}"},
        json=request_body(prompt, model),
    )


async def route_prompt(prompt: str, alias: str, fallback: str | None = None, transport=None):
    # The approved readability exception keeps deadline and fallback behavior together.
    if fallback:
        route_settings(fallback)
    try:
        async with asyncio.timeout(GATEWAY_DEADLINE):
            async with httpx.AsyncClient(timeout=GATEWAY_DEADLINE, transport=transport) as client:
                response = await send_prompt(client, prompt, alias)
                if response.status_code in FALLBACK_STATUSES and fallback and fallback != alias:
                    response = await send_prompt(client, prompt, fallback)
                return response_text(response)
    except (TimeoutError, httpx.TimeoutException) as exc:
        raise GatewayError("Gateway timed out; not retried because billing is uncertain.") from exc
    except httpx.RequestError as exc:
        raise GatewayError("Gateway connection failed; request was not retried.") from exc

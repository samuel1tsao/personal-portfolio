import asyncio

import httpx
import pytest

from gateway import GatewayError, route_prompt


@pytest.fixture(autouse=True)
def gateway_environment(monkeypatch):
    monkeypatch.setenv("AI_GATEWAY_API_KEY", "test-secret")
    monkeypatch.setenv("AI_MODEL_FAST", "test/fast")
    monkeypatch.setenv("AI_MODEL_QUALITY", "test/quality")


def success():
    return {"model": "test/fast", "choices": [{"message": {"content": "Hello"}}]}


def test_success_limits_and_credentials():
    def respond(request):
        import json

        assert request.headers["authorization"] == "Bearer test-secret"
        assert json.loads(request.content)["max_tokens"] == 256
        return httpx.Response(200, json=success())

    result = asyncio.run(route_prompt("Hello", "fast", transport=httpx.MockTransport(respond)))
    assert result["text"] == "Hello"
    assert "test-secret" not in str(result)


@pytest.mark.parametrize("prompt,alias", [("", "fast"), ("x" * 2001, "fast"), ("x", "other")])
def test_validation(prompt, alias):
    with pytest.raises(GatewayError):
        asyncio.run(route_prompt(prompt, alias))


@pytest.mark.parametrize("status", [401, 402, 403, 429, 500])
def test_safe_failure(status):
    transport = httpx.MockTransport(lambda _: httpx.Response(status, text="private upstream data"))
    with pytest.raises(GatewayError) as error:
        asyncio.run(route_prompt("Hello", "fast", transport=transport))
    assert "private" not in str(error.value)


def test_bounded_fallback():
    requests = []

    def respond(request):
        requests.append(request)
        return httpx.Response(503) if len(requests) == 1 else httpx.Response(200, json=success())

    asyncio.run(route_prompt("Hi", "fast", "quality", httpx.MockTransport(respond)))
    assert len(requests) == 2


def test_timeout_never_retries():
    requests = []

    def respond(request):
        requests.append(request)
        raise httpx.ReadTimeout("private", request=request)

    with pytest.raises(GatewayError, match="not retried"):
        asyncio.run(route_prompt("Hi", "fast", "quality", httpx.MockTransport(respond)))
    assert len(requests) == 1


def test_missing_configuration(monkeypatch):
    monkeypatch.delenv("AI_GATEWAY_API_KEY")
    with pytest.raises(GatewayError, match="Configure"):
        asyncio.run(route_prompt("Hi", "fast"))


def test_malformed_response():
    transport = httpx.MockTransport(lambda _: httpx.Response(200, json={"choices": []}))
    with pytest.raises(GatewayError, match="invalid response"):
        asyncio.run(route_prompt("Hi", "fast", transport=transport))

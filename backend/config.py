from pathlib import Path

CONTENT_PATH = Path(__file__).parent / "content" / "portfolio.json"
SCHEMA_VERSION = "2"
API_PREFIX = "/api/v1"
MAX_CONTENT_BYTES = 200_000
MAX_TEXT = 8_000
SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
JSON_HEADERS = {"Cache-Control": "public, max-age=0, must-revalidate"}
GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions"
PROMPT_LIMIT = 2_000
OUTPUT_LIMIT = 256
GATEWAY_DEADLINE = 20
FALLBACK_STATUSES = {502, 503}
ROUTE_ENV = {"fast": "AI_MODEL_FAST", "quality": "AI_MODEL_QUALITY"}

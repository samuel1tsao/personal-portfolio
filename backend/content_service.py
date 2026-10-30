import hashlib
import json
from pathlib import Path

from config import CONTENT_PATH, MAX_CONTENT_BYTES
from models import Portfolio


def read_portfolio(path: Path = CONTENT_PATH) -> dict:
    raw = path.read_bytes()
    if len(raw) > MAX_CONTENT_BYTES:
        raise ValueError("Content exceeds size limit")
    portfolio = Portfolio.model_validate_json(raw)
    return published_content(portfolio)


def published_content(portfolio: Portfolio) -> dict:
    result = portfolio.model_dump(mode="json")
    canonical = json.dumps(result, sort_keys=True, separators=(",", ":")).encode()
    result["content_revision"] = hashlib.sha256(canonical).hexdigest()
    return result

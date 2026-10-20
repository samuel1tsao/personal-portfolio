import json
import logging

LOGGER = logging.getLogger("portfolio")


def log(level: str, message: str, fields: dict | None = None) -> None:
    getattr(LOGGER, level)(json.dumps({"event": message, **(fields or {})}))

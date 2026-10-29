from http import HTTPStatus
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.exceptions import HTTPException

from config import API_PREFIX, JSON_HEADERS
from content_service import read_portfolio
from logger import log

app = FastAPI(title="Samuel Tsao portfolio", docs_url=None, redoc_url=None, openapi_url=None)


def error_response(status: int, code: str, message: str) -> JSONResponse:
    request_id = str(uuid4())
    log(
        "error" if status >= HTTPStatus.INTERNAL_SERVER_ERROR else "info",
        "api_error",
        {"code": code, "id": request_id},
    )
    payload = {"error": {"code": code, "message": message}, "request_id": request_id}
    return JSONResponse(payload, status_code=status, headers={"Cache-Control": "no-store"})


@app.exception_handler(RequestValidationError)
async def invalid_request(request: Request, exc: RequestValidationError):
    return error_response(
        HTTPStatus.UNPROCESSABLE_ENTITY, "invalid_request", "The request is invalid."
    )


@app.exception_handler(HTTPException)
async def missing_route(request: Request, exc: HTTPException):
    return error_response(exc.status_code, "not_found", "This resource is unavailable.")


@app.exception_handler(OSError)
@app.exception_handler(ValueError)
async def unavailable_content(request: Request, exc: Exception):
    if isinstance(exc, ValidationError):
        issues = [
            {"location": list(error["loc"]), "type": error["type"]}
            for error in exc.errors(include_input=False, include_context=False, include_url=False)
        ]
        log("error", "content_validation_failed", {"issues": issues})
    else:
        log(
            "error",
            "content_read_failed",
            {"exception": type(exc).__name__, "errno": getattr(exc, "errno", None)},
        )
    return error_response(
        HTTPStatus.SERVICE_UNAVAILABLE, "content_unavailable", "Content is temporarily unavailable."
    )


@app.get(f"{API_PREFIX}/portfolio")
def get_portfolio():
    return JSONResponse(read_portfolio(), headers=JSON_HEADERS)


@app.get(f"{API_PREFIX}/stories/{{slug}}")
@app.get(f"{API_PREFIX}/entries/{{slug}}")
def get_entry(slug: str):
    entries = read_portfolio()["entries"]
    entry = next((item for item in entries if item["slug"] == slug), None)
    return (
        JSONResponse(entry, headers=JSON_HEADERS)
        if entry
        else error_response(HTTPStatus.NOT_FOUND, "entry_not_found", "This entry is unavailable.")
    )

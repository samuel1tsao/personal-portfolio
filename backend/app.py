from http import HTTPStatus
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
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
    return error_response(
        HTTPStatus.SERVICE_UNAVAILABLE, "content_unavailable", "Content is temporarily unavailable."
    )


@app.get(f"{API_PREFIX}/portfolio")
def get_portfolio():
    return JSONResponse(read_portfolio(), headers=JSON_HEADERS)


@app.get(f"{API_PREFIX}/stories/{{slug}}")
def get_story(slug: str):
    stories = read_portfolio()["stories"]
    story = next((item for item in stories if item["slug"] == slug), None)
    return (
        JSONResponse(story, headers=JSON_HEADERS)
        if story
        else error_response(HTTPStatus.NOT_FOUND, "story_not_found", "This story is unavailable.")
    )

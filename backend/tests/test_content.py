import copy
import json
from concurrent.futures import ThreadPoolExecutor
from time import perf_counter

import pytest
from fastapi.testclient import TestClient

import app as api
from config import CONTENT_PATH, MAX_CONTENT_BYTES
from content_service import read_portfolio
from models import Portfolio

client = TestClient(api.app)


@pytest.fixture
def source():
    return json.loads(CONTENT_PATH.read_text(encoding="utf-8"))


def test_public_content_and_entry():
    response = client.get("/api/v1/portfolio")
    assert response.status_code == 200
    content = response.json()
    assert len(content["content_revision"]) == 64
    assert content["schema_version"] == "2"
    slug = content["entries"][0]["slug"]
    assert client.get(f"/api/v1/entries/{slug}").json() == content["entries"][0]


def test_published_overview_entries_have_curated_impact_highlights(source):
    portfolio = Portfolio.model_validate(source)
    for entry in portfolio.entries:
        if entry.published and entry.slug != "personal":
            assert 1 <= len(entry.highlights) <= 3
    project = next(entry for entry in portfolio.entries if entry.slug == "personal-portfolio")
    assert "agentic chat" in project.highlights[0]
    assert "printable" not in str(project.model_dump()).lower()


def test_highlight_limit_and_backwards_compatibility(source):
    entry = source["entries"][0]
    entry.pop("highlights")
    assert Portfolio.model_validate(source).entries[0].highlights == ()
    entry["highlights"] = ["Outcome"] * 4
    with pytest.raises(ValueError):
        Portfolio.model_validate(source)


def test_experience_entries_have_structured_projects(source):
    portfolio = Portfolio.model_validate(source)
    experiences = [entry for entry in portfolio.entries if entry.kind == "experience"]
    assert experiences
    for entry in experiences:
        assert not entry.sections
        assert entry.work_projects or entry.related_projects
        assert all(
            project.title and project.problem and project.solution and project.impact
            for project in entry.work_projects
        )
        assert all(
            reference.url.scheme == "https"
            for project in entry.work_projects
            for reference in project.references
        )


def test_personal_experience_attaches_each_personal_project(source):
    portfolio = Portfolio.model_validate(source)
    personal = next(entry for entry in portfolio.entries if entry.slug == "personal")
    project_slugs = {entry.slug for entry in portfolio.entries if entry.kind == "project"}
    assert personal.kind == "experience"
    assert personal.organization == "Personal"
    assert set(personal.related_projects) == project_slugs
    assert "lucra-backend-exercise" not in project_slugs


def test_project_details_are_grouped_under_problem_solution_and_impact(source):
    portfolio = Portfolio.model_validate(source)
    projects = [entry for entry in portfolio.entries if entry.kind == "project"]
    assert projects
    for entry in projects:
        assert {section.group for section in entry.sections} == {"problem", "solution", "impact"}


@pytest.mark.parametrize("path", ["/api/v1/entries/missing", "/api/v2/portfolio", "/docs"])
def test_missing_paths(path):
    response = client.get(path)
    assert response.status_code == 404
    assert response.json()["error"]["code"]
    assert response.json()["request_id"]


@pytest.mark.parametrize("case", ["empty", "duplicate", "slug", "url", "date", "extra", "long"])
def test_invalid_content(source, case):
    if case == "empty":
        source["entries"] = []
    elif case == "duplicate":
        source["entries"].append(copy.deepcopy(source["entries"][0]))
    elif case == "slug":
        source["entries"][0]["slug"] = "../private"
    elif case == "url":
        source["profile"]["links"][0]["url"] = "javascript:alert(1)"
    elif case == "date":
        experience = next(entry for entry in source["entries"] if entry["kind"] == "experience")
        experience["end"] = "2000-01-01"
    elif case == "extra":
        source["profile"]["private_notes"] = "secret"
    else:
        source["profile"]["name"] = "x" * 8001
    with pytest.raises(ValueError):
        Portfolio.model_validate(source)


def test_drafts_removed_and_revision_changes(source, tmp_path):
    before = read_portfolio()
    source["entries"][0]["published"] = False
    path = tmp_path / "portfolio.json"
    path.write_text(json.dumps(source))
    after = read_portfolio(path)
    assert len(after["entries"]) == len(before["entries"]) - 1
    assert after["content_revision"] != before["content_revision"]


def test_oversized_content(tmp_path):
    path = tmp_path / "large.json"
    path.write_text(" " * (MAX_CONTENT_BYTES + 1))
    with pytest.raises(ValueError):
        read_portfolio(path)


def test_dependency_failure_and_recovery(monkeypatch):
    original = api.read_portfolio
    monkeypatch.setattr(api, "read_portfolio", lambda: (_ for _ in ()).throw(OSError("private")))
    response = client.get("/api/v1/portfolio")
    assert response.status_code == 503
    assert "private" not in response.text
    monkeypatch.setattr(api, "read_portfolio", original)
    assert client.get("/api/v1/portfolio").status_code == 200


def test_twenty_concurrent_reads_are_isolated():
    start = perf_counter()
    with ThreadPoolExecutor(max_workers=20) as pool:
        results = list(pool.map(lambda _: read_portfolio(), range(20)))
    assert perf_counter() - start < 5
    assert all(item == results[0] for item in results)
    results[0]["profile"]["name"] = "mutated"
    assert read_portfolio()["profile"]["name"] == "Samuel Tsao"


def test_draft_entry_is_not_accessible(source, tmp_path, monkeypatch):
    asset_engine = next(
        entry for entry in source["entries"] if entry["slug"] == "asset-recommendation-engine"
    )
    asset_engine["published"] = False
    path = tmp_path / "draft.json"
    path.write_text(json.dumps(source))
    monkeypatch.setattr(api, "read_portfolio", lambda: read_portfolio(path))
    assert client.get("/api/v1/entries/asset-recommendation-engine").status_code == 404


def test_no_public_inference_or_writes():
    assert client.post("/api/v1/portfolio", json={}).status_code == 405
    assert client.post("/api/v1/chat", json={}).status_code == 404


def test_response_and_source_are_independent(source):
    original = read_portfolio()
    assert original["entries"] == sorted(original["entries"], key=lambda item: item["order"])
    assert original == read_portfolio()


def test_entries_keep_compatible_defaults(source):
    for entry in source["entries"]:
        for field in ("decisions", "diagram_caption", "diagram_description"):
            entry.pop(field, None)
    portfolio = Portfolio.model_validate(source)
    assert portfolio.entries[0].decisions == ()
    assert portfolio.entries[0].diagram_caption == "Conceptual flow"

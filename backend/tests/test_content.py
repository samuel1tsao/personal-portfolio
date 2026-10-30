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
    assert content["schema_version"] == "3"
    assert len(content["work_experience"]) > 0
    assert len(content["personal_experience"]) > 0
    slug = content["work_experience"][0]["experience_id"]
    assert client.get(f"/api/v1/entries/{slug}").json() == content["work_experience"][0]
    proj_slug = content["work_experience"][0]["projects"][0]["project_id"]
    assert client.get(f"/api/v1/entries/{proj_slug}").json() == content["work_experience"][0]["projects"][0]


def test_published_overview_entries_have_curated_impact_highlights(source):
    portfolio = Portfolio.model_validate(source)
    for exp in (*portfolio.work_experience, *portfolio.personal_experience):
        for proj in exp.projects:
            assert 1 <= len(proj.impacts) <= 10
            for impact in proj.impacts:
                assert impact.one_line_summary
                assert impact.full_description
    
    # Check personal-portfolio project has agentic chat
    all_projects = [p for exp in (*portfolio.work_experience, *portfolio.personal_experience) for p in exp.projects]
    portfolio_proj = next(p for p in all_projects if p.project_id == "personal-portfolio")
    assert "agentic chat" in portfolio_proj.impacts[0].one_line_summary.lower()


def test_experience_entries_have_structured_projects(source):
    portfolio = Portfolio.model_validate(source)
    assert portfolio.work_experience
    for exp in portfolio.work_experience:
        assert exp.projects
        assert all(
            proj.title and proj.problem_statement and proj.solution and proj.impacts
            for proj in exp.projects
        )
        assert all(
            link.url.scheme == "https"
            for proj in exp.projects
            for link in proj.links
        )


def test_technology_and_skills_separation(source):
    portfolio = Portfolio.model_validate(source)
    assert len(portfolio.ml_technologies) > 0
    assert len(portfolio.software_technologies) > 0
    assert len(portfolio.ml_skills) > 0
    assert len(portfolio.software_skills) > 0


@pytest.mark.parametrize("path", ["/api/v1/entries/missing", "/api/v2/portfolio", "/docs"])
def test_missing_paths(path):
    response = client.get(path)
    assert response.status_code == 404
    assert response.json()["error"]["code"]
    assert response.json()["request_id"]


@pytest.mark.parametrize("case", ["empty_work", "duplicate_exp", "slug", "url", "long"])
def test_invalid_content(source, case):
    if case == "empty_work":
        source["work_experience"] = []
    elif case == "duplicate_exp":
        source["work_experience"].append(copy.deepcopy(source["work_experience"][0]))
    elif case == "slug":
        source["work_experience"][0]["experience_id"] = "../private"
    elif case == "url":
        source["contact"]["github_url"] = "javascript:alert(1)"
    else:
        source["name"] = "x" * 8001
    with pytest.raises(ValueError):
        Portfolio.model_validate(source)


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
    results[0]["name"] = "mutated"
    assert read_portfolio()["name"] == "Samuel Tsao"


def test_no_public_inference_or_writes():
    assert client.post("/api/v1/portfolio", json={}).status_code == 405
    assert client.post("/api/v1/chat", json={}).status_code == 404


def test_response_and_source_are_independent(source):
    original = read_portfolio()
    assert original["work_experience"] == sorted(original["work_experience"], key=lambda item: item["order"])
    assert original == read_portfolio()

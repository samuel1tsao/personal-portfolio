import re
from datetime import date
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, StringConstraints, model_validator

from config import MAX_TEXT, SCHEMA_VERSION, SLUG_PATTERN

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MAX_TEXT)]
Slug = Annotated[str, StringConstraints(pattern=SLUG_PATTERN, max_length=100)]


class ContentModel(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class Link(ContentModel):
    label: Text
    url: HttpUrl

    @model_validator(mode="after")
    def require_https(self):
        if self.url.scheme != "https":
            raise ValueError("Public links must use HTTPS")
        return self


class Section(ContentModel):
    title: Text
    body: Text
    group: Literal["problem", "solution", "impact"]


class Decision(ContentModel):
    title: Text
    choice: Text
    rationale: Text
    tradeoff: Text


class ExperienceProject(ContentModel):
    title: Text
    problem: Text
    solution: Text
    impact: Text
    technologies: tuple[Text, ...] = Field(default=(), max_length=12)
    references: tuple[Link, ...] = Field(default=(), max_length=12)


class PortfolioEntry(ContentModel):
    slug: Slug
    kind: Literal["project", "experience"]
    title: Text
    organization: Text | None = None
    position: Text | None = None
    start: date | None = None
    end: date | None = None
    summary: Text
    role: Text
    period: Text
    contribution: Text
    status: Text | None = None
    accomplishments: tuple[Text, ...] = ()
    highlights: tuple[Text, ...] = Field(default=(), max_length=3)
    additional_accomplishments: tuple[Text, ...] = ()
    work_projects: tuple[ExperienceProject, ...] = Field(default=(), max_length=8)
    related_projects: tuple[Slug, ...] = ()
    technologies: tuple[Text, ...] = ()
    skills: tuple[Text, ...] = Field(min_length=1, max_length=12)
    sections: tuple[Section, ...] = Field(default=(), max_length=12)
    evidence: Text
    links: tuple[Link, ...] = ()
    diagram: tuple[Text, ...] = Field(default=(), max_length=6)
    diagram_caption: Text = "Conceptual flow"
    diagram_description: Text = "A simplified view of the project workflow."
    decisions: tuple[Decision, ...] = Field(default=(), max_length=8)
    published: bool
    order: int = Field(ge=0)

    @model_validator(mode="after")
    def valid_entry_identity(self):
        if self.kind == "experience" and (
            not self.organization
            or not self.position
            or (not self.start and self.slug != "personal")
        ):
            raise ValueError("Experience entries require organization, position, and a start date")
        if self.kind == "experience" and not (self.work_projects or self.related_projects):
            raise ValueError(
                "Experience entries require structured work projects or related projects"
            )
        if self.kind == "project" and not self.sections:
            raise ValueError("Project entries require detailed sections")
        if self.kind == "project" and (
            self.work_projects or self.additional_accomplishments or self.related_projects
        ):
            raise ValueError("Portfolio projects cannot contain experience-only fields")
        if self.end and self.start and self.end < self.start:
            raise ValueError("Entry ends before it starts")
        return self


class Profile(ContentModel):
    name: Text
    headline: Text
    intro: Text
    location: Text
    email: Text
    about: Text
    education: tuple[Text, ...]
    skills: tuple[Text, ...]
    links: tuple[Link, ...]
    interests: tuple[Text, ...] = ()

    @model_validator(mode="after")
    def safe_email(self):
        if not re.fullmatch(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}", self.email):
            raise ValueError("Invalid contact email")
        return self


class Portfolio(ContentModel):
    schema_version: Literal[SCHEMA_VERSION]
    updated: date
    profile: Profile
    entries: tuple[PortfolioEntry, ...] = Field(min_length=1, max_length=40)

    @model_validator(mode="after")
    def unique_entries(self):
        for key in ("slug", "order"):
            values = [getattr(entry, key) for entry in self.entries]
            if len(values) != len(set(values)):
                raise ValueError(f"Duplicate portfolio entry {key}")
        project_slugs = {entry.slug for entry in self.entries if entry.kind == "project"}
        for entry in self.entries:
            if entry.related_projects and entry.slug != "personal":
                raise ValueError("Only the Personal experience can link personal projects")
            if any(slug not in project_slugs for slug in entry.related_projects):
                raise ValueError("Related projects must reference published portfolio projects")
        return self

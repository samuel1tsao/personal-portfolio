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


class Role(ContentModel):
    company: Text
    title: Text
    start: date
    end: date | None = None
    summary: Text
    accomplishments: tuple[Text, ...] = ()
    technologies: tuple[Text, ...] = ()

    @model_validator(mode="after")
    def chronological_dates(self):
        if self.end and self.end < self.start:
            raise ValueError("Role ends before it starts")
        return self


class Section(ContentModel):
    title: Text
    body: Text


class Decision(ContentModel):
    title: Text
    choice: Text
    rationale: Text
    tradeoff: Text


class Story(ContentModel):
    slug: Slug
    kind: Literal["project", "experience"]
    title: Text
    summary: Text
    role: Text
    period: Text
    contribution: Text
    skills: tuple[Text, ...] = Field(min_length=1, max_length=12)
    sections: tuple[Section, ...] = Field(min_length=1, max_length=12)
    evidence: Text
    links: tuple[Link, ...] = ()
    diagram: tuple[Text, ...] = Field(default=(), max_length=6)
    diagram_caption: Text = "Conceptual flow"
    diagram_description: Text = "A simplified view of the project workflow."
    decisions: tuple[Decision, ...] = Field(default=(), max_length=8)
    published: bool
    order: int = Field(ge=0)


class ResumeProject(ContentModel):
    name: Text
    story_slug: Slug | None = None
    status: Text
    summary: Text
    accomplishments: tuple[Text, ...] = Field(min_length=1)
    technologies: tuple[Text, ...] = ()
    links: tuple[Link, ...] = ()


class Profile(ContentModel):
    name: Text
    headline: Text
    intro: Text
    location: Text
    email: Text
    about: Text
    assistant_context: Text
    education: tuple[Text, ...]
    skills: tuple[Text, ...]
    links: tuple[Link, ...]
    roles: tuple[Role, ...]
    projects: tuple[ResumeProject, ...] = ()

    @model_validator(mode="after")
    def safe_email(self):
        if not re.fullmatch(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}", self.email):
            raise ValueError("Invalid contact email")
        return self


class Portfolio(ContentModel):
    schema_version: Literal[SCHEMA_VERSION]
    updated: date
    profile: Profile
    stories: tuple[Story, ...] = Field(min_length=1, max_length=30)

    @model_validator(mode="after")
    def unique_stories(self):
        for key in ("slug", "order"):
            values = [getattr(story, key) for story in self.stories]
            if len(values) != len(set(values)):
                raise ValueError(f"Duplicate story {key}")
        project_slugs = {story.slug for story in self.stories if story.kind == "project"}
        for project in self.profile.projects:
            if project.story_slug and project.story_slug not in project_slugs:
                raise ValueError("Resume project must reference a project story")
        return self

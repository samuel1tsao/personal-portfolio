from datetime import date
from enum import StrEnum
import re
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, StringConstraints, model_validator

from config import MAX_TEXT, SCHEMA_VERSION, SLUG_PATTERN

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MAX_TEXT)]
Slug = Annotated[str, StringConstraints(pattern=SLUG_PATTERN, max_length=100)]


class ContentModel(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class MachineLearningTechnology(StrEnum):
    AI_GATEWAY = "AI Gateway"
    AI_SDK = "AI SDK"
    AGENTIC_WORKFLOWS = "Agentic workflows"
    AUTOMATIC_SPEECH_RECOGNITION = "Automatic speech recognition"
    CUDA = "CUDA"
    CHANNEL_ATTENTION = "Channel attention"
    CODING_AGENTS = "Coding agents"
    COMFY_UI = "ComfyUI"
    COMPUTER_VISION = "Computer vision"
    COCO = "COCO"
    DETR = "DETR"
    E5_EMBEDDINGS = "E5 embeddings"
    EDSR = "EDSR"
    ENCODER_DECODER_MODELS = "Encoder-decoder models"
    FLUX_1 = "FLUX.1"
    GPT = "GPT"
    IMAGE_SUPER_RESOLUTION = "Image super-resolution"
    JUPYTER = "Jupyter"
    KITTI = "KITTI"
    KNOWLEDGE_DISTILLATION = "Knowledge distillation"
    LLM_EVALUATION = "LLM evaluation"
    MLOPS = "MLOps"
    MACHINE_LEARNING_INFRASTRUCTURE = "Machine-learning infrastructure"
    NLI = "NLI"
    NEURAL_NETWORKS = "Neural networks"
    OLLAMA = "Ollama"
    ON_DEVICE_PERSONALIZATION = "On-device personalization"
    PARAMETER_EFFICIENT_FINE_TUNING = "Parameter-efficient fine-tuning"
    PYTORCH = "PyTorch"
    QDRANT = "Qdrant"
    RLHF = "RLHF"
    RT_DETR = "RT-DETR"
    RECOMMENDATION_SYSTEMS = "Recommendation systems"
    REINFORCEMENT_LEARNING = "Reinforcement learning"
    SOBEL_EDGE_AWARE_LOSS = "Sobel edge-aware loss"
    TRANSFORMERS = "Transformers"
    U_NET = "U-Net"
    WORD_EMBEDDINGS = "Word embeddings"
    YOLO = "YOLO"
    YOLO11 = "YOLO11"
    SCIKIT_LEARN = "scikit-learn"


class SoftwareTechnology(StrEnum):
    AB_TESTING = "A/B testing"
    ACH = "ACH"
    API_INTEGRATIONS = "API integrations"
    AWS = "AWS"
    AWS_ECS = "AWS ECS"
    AWS_LAMBDA = "AWS Lambda"
    ADVERTISING_INFRASTRUCTURE = "Advertising infrastructure"
    ALGOLIA = "Algolia"
    ANGULAR = "Angular"
    ANGULAR_JS = "AngularJS"
    AURORA = "Aurora"
    BULL_JS = "BullJS"
    CI_CD = "CI/CD"
    CSS = "CSS"
    CACHING = "Caching"
    CASSANDRA = "Cassandra"
    CLOUDFLARE = "Cloudflare"
    DATA_SECURITY = "Data security"
    DATADOG = "Datadog"
    DISTRIBUTED_SYSTEMS = "Distributed systems"
    DOCKER = "Docker"
    ESLINT = "ESLint"
    ETL_PIPELINES = "ETL pipelines"
    ELASTICSEARCH = "Elasticsearch"
    ENTERPRISE_MIDDLEWARE = "Enterprise middleware"
    ENTERPRISE_TECHNOLOGY_EVALUATION = "Enterprise technology evaluation"
    EVENT_BRIDGE = "EventBridge"
    FASTAPI = "FastAPI"
    FINANCIAL_LEDGERS = "Financial ledgers"
    FLASK = "Flask"
    GCP = "GCP"
    GEOSPATIAL_APIS = "Geospatial APIs"
    GITHUB_ACTIONS = "GitHub Actions"
    GO = "Go"
    GOOGLE_APPS_SCRIPT = "Google Apps Script"
    GOOGLE_SHEETS = "Google Sheets"
    GRAPHQL = "GraphQL"
    HTML = "HTML"
    HIGH_CONCURRENCY_LOAD_TESTING = "High-concurrency load testing"
    INFRASTRUCTURE_LIBRARIES = "Infrastructure libraries"
    IOT = "IoT"
    JAVA = "Java"
    JAVASCRIPT = "JavaScript"
    JENKINS = "Jenkins"
    KAFKA = "Kafka"
    KINESIS_FIREHOSE = "Kinesis Firehose"
    KOTLIN = "Kotlin"
    KUBERNETES = "Kubernetes"
    LOCALIZATION = "Localization"
    MICROSERVICES = "Microservices"
    MYSQL_AURORA = "MySQL Aurora"
    NEXT_JS = "Next.js"
    NOSQL = "NoSQL"
    NODE_JS = "Node.js"
    PAGERDUTY = "PagerDuty"
    PERL = "Perl"
    PLAID = "Plaid"
    PLAYWRIGHT = "Playwright"
    POSTGRESQL = "PostgreSQL"
    PRETTIER = "Prettier"
    PROJECT_MANAGEMENT = "Project management"
    PUPPET = "Puppet"
    PYDANTIC = "Pydantic"
    PYTHON = "Python"
    REST_APIS = "REST APIs"
    RATE_LIMITING = "Rate limiting"
    REACT = "React"
    REDIS = "Redis"
    RELATIONAL_DATABASES = "Relational databases"
    S3 = "S3"
    SQL = "SQL"
    SQS = "SQS"
    SCRYFALL_API = "Scryfall API"
    SECURITY_PROTOCOLS = "Security protocols"
    SPRING_BOOT = "Spring Boot"
    TEMPORAL = "Temporal"
    TERRAFORM = "Terraform"
    TYPESCRIPT = "TypeScript"
    UX_COLLABORATION = "UX collaboration"
    VPC_NETWORKING = "VPC networking"
    VERCEL = "Vercel"
    VITEST = "Vitest"
    ZOD = "Zod"
    ESBUILD = "esbuild"
    PYTEST = "pytest"


class MachineLearningSkill(StrEnum):
    AGENTIC_WORKFLOWS = "Agentic workflows"
    CODING_AGENTS = "Coding agents"
    LLM_EVALUATION = "LLM evaluation"
    RLHF = "RLHF"
    RAG_CLAIM_VALIDATION = "RAG & claim validation"
    COMPUTER_VISION = "Computer vision"
    OBJECT_DETECTION = "Object detection"
    IMAGE_SUPER_RESOLUTION = "Image super-resolution"
    AUTOMATIC_SPEECH_RECOGNITION = "Automatic speech recognition"
    SPEECH_BIAS_EVALUATION = "Speech bias evaluation"
    RECOMMENDATION_SYSTEMS = "Recommendation systems"
    REINFORCEMENT_LEARNING = "Reinforcement learning"
    TRANSFORMER_ARCHITECTURES = "Transformer architectures"
    PARAMETER_EFFICIENT_FINE_TUNING = "Parameter-efficient fine-tuning"
    KNOWLEDGE_DISTILLATION = "Knowledge distillation"
    NEURAL_NETWORKS = "Neural networks"
    VECTOR_SEARCH = "Vector search & retrieval"
    ON_DEVICE_PERSONALIZATION = "On-device personalization"
    MLOPS = "MLOps"


class SoftwareSkill(StrEnum):
    DISTRIBUTED_SYSTEMS = "Distributed systems"
    MICROSERVICES = "Microservices"
    HIGH_CONCURRENCY = "High-concurrency engineering"
    EVENT_DRIVEN_ARCHITECTURE = "Event-driven architecture"
    ETL_PIPELINES = "ETL pipelines"
    DATABASE_MIGRATION = "Database migration"
    RELATIONAL_MODELING = "Relational data modeling"
    NOSQL_MODELING = "NoSQL data modeling"
    CACHE_DESIGN = "Cache design"
    FINANCIAL_LEDGERS = "Financial ledgers & transactions"
    SEARCH_INFRASTRUCTURE = "Search infrastructure"
    GEOSPATIAL_DISCOVERY = "Geospatial discovery"
    CLOUD_INFRASTRUCTURE = "Cloud infrastructure"
    CONTAINER_ORCHESTRATION = "Container orchestration"
    INFRASTRUCTURE_AS_CODE = "Infrastructure as Code"
    CICD_AUTOMATION = "CI/CD & automation"
    OBSERVABILITY = "Observability & incident response"
    API_DESIGN = "API design & integration"
    FULL_STACK_DEVELOPMENT = "Full-stack web development"
    EXPERIMENTATION_AB_TESTING = "A/B testing & experimentation"
    DATA_SECURITY = "Data security & compliance"
    LOCALIZATION = "Localization"
    FINANCIAL_SIMULATION = "Financial simulation & analytics"
    AUTOMATED_VERIFICATION = "Automated test verification"
    ENGINEERING_LEADERSHIP = "Engineering leadership & project management"


# Overarching domain types
Skill = MachineLearningSkill | SoftwareSkill
Technology = MachineLearningTechnology | SoftwareTechnology


class Link(ContentModel):
    label: Text
    url: HttpUrl

    @model_validator(mode="after")
    def require_https(self):
        if self.url.scheme != "https":
            raise ValueError("Public links must use HTTPS")
        return self


class Impact(ContentModel):
    id: Slug
    one_line_summary: Text = Field(max_length=500)
    full_description: Text = Field(max_length=4000)


class Project(ContentModel):
    project_id: Slug
    experience_id: Slug
    title: Text
    problem_statement: Text
    solution: Text
    impacts: tuple[Impact, ...] = Field(min_length=1, max_length=10)
    ml_technologies: tuple[MachineLearningTechnology, ...] = Field(default=(), max_length=20)
    software_technologies: tuple[SoftwareTechnology, ...] = Field(default=(), max_length=25)
    ml_skills: tuple[MachineLearningSkill, ...] = Field(default=(), max_length=20)
    software_skills: tuple[SoftwareSkill, ...] = Field(default=(), max_length=25)
    links: tuple[Link, ...] = Field(default=(), max_length=10)
    featured: bool = False
    order: int = Field(ge=0, default=0)

    @property
    def all_skills(self) -> tuple[Skill, ...]:
        return (*self.ml_skills, *self.software_skills)

    @property
    def all_technologies(self) -> tuple[Technology, ...]:
        return (*self.ml_technologies, *self.software_technologies)


class ExperienceType(StrEnum):
    PROFESSIONAL = "professional"
    PERSONAL_SOFTWARE = "personal_software"
    PERSONAL_MACHINE_LEARNING = "personal_machine_learning"


class Experience(ContentModel):
    experience_id: Slug
    type: ExperienceType
    organization: Text
    title: Text
    from_date: Text | None = None
    to_date: Text | None = None
    summary: Text
    ml_technologies: tuple[MachineLearningTechnology, ...] = Field(default=(), max_length=40)
    software_technologies: tuple[SoftwareTechnology, ...] = Field(default=(), max_length=50)
    ml_skills: tuple[MachineLearningSkill, ...] = Field(default=(), max_length=25)
    software_skills: tuple[SoftwareSkill, ...] = Field(default=(), max_length=30)
    projects: tuple[Project, ...] = Field(default=(), max_length=15)
    order: int = Field(ge=0, default=0)

    @property
    def all_skills(self) -> tuple[Skill, ...]:
        skills = [*self.ml_skills, *self.software_skills]
        for p in self.projects:
            skills.extend(p.all_skills)
        return tuple(dict.fromkeys(skills))

    @property
    def all_technologies(self) -> tuple[Technology, ...]:
        techs = [*self.ml_technologies, *self.software_technologies]
        for p in self.projects:
            techs.extend(p.all_technologies)
        return tuple(dict.fromkeys(techs))


class ContactInfo(ContentModel):
    email: Text
    github_url: HttpUrl
    linkedin_url: HttpUrl

    @model_validator(mode="after")
    def validate_contact(self):
        if not re.fullmatch(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}", self.email):
            raise ValueError("Invalid contact email")
        if self.github_url.scheme != "https" or self.linkedin_url.scheme != "https":
            raise ValueError("Public links must use HTTPS")
        return self


class Portfolio(ContentModel):
    schema_version: Literal[SCHEMA_VERSION]
    updated: date
    name: Text
    headline_summary: Text
    engineering_philosophy: Text
    location: Text
    education: tuple[Text, ...] = ()
    interests: tuple[Text, ...] = ()
    contact: ContactInfo
    ml_skills: tuple[MachineLearningSkill, ...] = Field(default=(), max_length=30)
    software_skills: tuple[SoftwareSkill, ...] = Field(default=(), max_length=35)
    ml_technologies: tuple[MachineLearningTechnology, ...] = Field(default=(), max_length=50)
    software_technologies: tuple[SoftwareTechnology, ...] = Field(default=(), max_length=100)
    work_experience: tuple[Experience, ...] = Field(min_length=1, max_length=20)
    personal_experience: tuple[Experience, ...] = Field(min_length=1, max_length=10)

    @property
    def all_skills(self) -> tuple[Skill, ...]:
        return (*self.ml_skills, *self.software_skills)

    @property
    def all_technologies(self) -> tuple[Technology, ...]:
        return (*self.ml_technologies, *self.software_technologies)

    @model_validator(mode="after")
    def validate_integrity(self):
        all_exps = (*self.work_experience, *self.personal_experience)
        exp_ids = [e.experience_id for e in all_exps]
        if len(exp_ids) != len(set(exp_ids)):
            raise ValueError("Duplicate experience IDs")
        
        all_proj_ids = [p.project_id for e in all_exps for p in e.projects]
        if len(all_proj_ids) != len(set(all_proj_ids)):
            raise ValueError("Duplicate project IDs")

        for exp in all_exps:
            for p in exp.projects:
                if p.experience_id != exp.experience_id:
                    raise ValueError(f"Project {p.project_id} has mismatched experience_id {p.experience_id}")
        return self

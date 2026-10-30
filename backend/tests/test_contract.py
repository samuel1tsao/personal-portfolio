import re
from pathlib import Path
import pytest
from models import (
    MachineLearningTechnology,
    SoftwareTechnology,
    MachineLearningSkill,
    SoftwareSkill,
    ExperienceType,
    Portfolio,
    Experience,
    Project,
    Impact,
)

SCHEMA_TS_PATH = Path(__file__).parent.parent.parent / "frontend" / "src" / "lib" / "schema.ts"


def extract_ts_enum(schema_content: str, enum_name: str) -> list[str]:
    pattern = rf"export const {enum_name}\s*=\s*z\.enum\(\[\s*([\s\S]*?)\s*\]\);"
    match = re.search(pattern, schema_content)
    if not match:
        raise ValueError(f"Enum {enum_name} not found in schema.ts")
    raw_items = match.group(1).split(",")
    return [
        item.strip().strip('"').strip("'")
        for item in raw_items
        if item.strip()
    ]


@pytest.fixture(scope="module")
def schema_ts_content() -> str:
    assert SCHEMA_TS_PATH.exists(), f"schema.ts not found at {SCHEMA_TS_PATH}"
    return SCHEMA_TS_PATH.read_text(encoding="utf-8")


def test_technology_enum_parity(schema_ts_content: str):
    py_ml = sorted([e.value for e in MachineLearningTechnology])
    ts_ml = sorted(extract_ts_enum(schema_ts_content, "MachineLearningTechnologyEnum"))
    assert py_ml == ts_ml, f"ML Technologies mismatch: diff Py-TS = {set(py_ml) ^ set(ts_ml)}"

    py_sw = sorted([e.value for e in SoftwareTechnology])
    ts_sw = sorted(extract_ts_enum(schema_ts_content, "SoftwareTechnologyEnum"))
    assert py_sw == ts_sw, f"Software Technologies mismatch: diff Py-TS = {set(py_sw) ^ set(ts_sw)}"


def test_skill_enum_parity(schema_ts_content: str):
    py_ml_skills = sorted([e.value for e in MachineLearningSkill])
    ts_ml_skills = sorted(extract_ts_enum(schema_ts_content, "MachineLearningSkillEnum"))
    assert py_ml_skills == ts_ml_skills, f"ML Skills mismatch: diff = {set(py_ml_skills) ^ set(ts_ml_skills)}"

    py_sw_skills = sorted([e.value for e in SoftwareSkill])
    ts_sw_skills = sorted(extract_ts_enum(schema_ts_content, "SoftwareSkillEnum"))
    assert py_sw_skills == ts_sw_skills, f"Software Skills mismatch: diff = {set(py_sw_skills) ^ set(ts_sw_skills)}"


def test_experience_type_parity(schema_ts_content: str):
    py_exp_types = sorted([e.value for e in ExperienceType])
    ts_exp_types = sorted(extract_ts_enum(schema_ts_content, "experienceTypeSchema"))
    assert py_exp_types == ts_exp_types, f"Experience Types mismatch: diff = {set(py_exp_types) ^ set(ts_exp_types)}"


def test_model_fields_exist_in_typescript(schema_ts_content: str):
    # Verify field names on Project
    for field_name in Project.model_fields.keys():
        assert f"{field_name}:" in schema_ts_content, f"Field '{field_name}' from Project missing in schema.ts"

    # Verify field names on Experience
    for field_name in Experience.model_fields.keys():
        assert f"{field_name}:" in schema_ts_content, f"Field '{field_name}' from Experience missing in schema.ts"

    # Verify field names on Impact
    for field_name in Impact.model_fields.keys():
        assert f"{field_name}:" in schema_ts_content, f"Field '{field_name}' from Impact missing in schema.ts"

    # Verify field names on Portfolio
    for field_name in Portfolio.model_fields.keys():
        assert f"{field_name}:" in schema_ts_content, f"Field '{field_name}' from Portfolio missing in schema.ts"

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  MachineLearningTechnologyEnum,
  SoftwareTechnologyEnum,
  MachineLearningSkillEnum,
  SoftwareSkillEnum,
  experienceTypeSchema,
  portfolioSchema,
} from "../../src/lib/schema";

const modelsPyPath = new URL("../../../backend/models.py", import.meta.url);
const modelsPy = readFileSync(modelsPyPath, "utf8");

function extractPythonStrEnum(enumName: string): string[] {
  const pattern = new RegExp(`class ${enumName}\\(StrEnum\\):([\\s\\S]*?)(?:\\n\\nclass|\\n\\n#|$)`);
  const match = modelsPy.match(pattern);
  if (!match) throw new Error(`Enum ${enumName} not found in models.py`);
  const lines = match[1].split("\n");
  const values: string[] = [];
  for (const line of lines) {
    const valueMatch = line.match(/^\s*[A-Z0-9_]+\s*=\s*["']([^"']+)["']/);
    if (valueMatch) values.push(valueMatch[1]);
  }
  return values;
}

describe("backend/frontend contract parity", () => {
  it("enforces identical Machine Learning Technology enums", () => {
    const py = extractPythonStrEnum("MachineLearningTechnology").sort();
    const ts = [...MachineLearningTechnologyEnum.options].sort();
    expect(ts).toEqual(py);
  });

  it("enforces identical Software Technology enums", () => {
    const py = extractPythonStrEnum("SoftwareTechnology").sort();
    const ts = [...SoftwareTechnologyEnum.options].sort();
    expect(ts).toEqual(py);
  });

  it("enforces identical Machine Learning Skill enums", () => {
    const py = extractPythonStrEnum("MachineLearningSkill").sort();
    const ts = [...MachineLearningSkillEnum.options].sort();
    expect(ts).toEqual(py);
  });

  it("enforces identical Software Skill enums", () => {
    const py = extractPythonStrEnum("SoftwareSkill").sort();
    const ts = [...SoftwareSkillEnum.options].sort();
    expect(ts).toEqual(py);
  });

  it("enforces identical ExperienceType enums", () => {
    const py = extractPythonStrEnum("ExperienceType").sort();
    const ts = [...experienceTypeSchema.options].sort();
    expect(ts).toEqual(py);
  });

  it("enforces portfolio schema version alignment", () => {
    const configPyPath = new URL("../../../backend/config.py", import.meta.url);
    const configPy = readFileSync(configPyPath, "utf8");
    const versionMatch = configPy.match(/SCHEMA_VERSION\s*=\s*["']([^"']+)["']/);
    expect(versionMatch).not.toBeNull();
    const pyVersion = versionMatch![1];
    expect(portfolioSchema.shape.schema_version.value).toBe(pyVersion);
  });
});

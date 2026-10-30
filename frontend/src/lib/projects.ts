import type {
  Portfolio,
  Experience,
  Project,
  MachineLearningTechnology,
  SoftwareTechnology,
  MachineLearningSkill,
  SoftwareSkill,
  Skill,
} from "./schema";

export function allExperiences(portfolio: Portfolio): Experience[] {
  return [...portfolio.work_experience, ...portfolio.personal_experience];
}

export function allProjects(portfolio: Portfolio): Project[] {
  return allExperiences(portfolio).flatMap((exp) => exp.projects);
}

export function professionalRoles(portfolio: Portfolio): Experience[] {
  return portfolio.work_experience;
}

export function splitProjects(portfolio: Portfolio): {
  machineLearning: Project[];
  softwareEngineering: Project[];
} {
  const all = allProjects(portfolio);
  const mlExp = portfolio.personal_experience.find((e) => e.type === "personal_machine_learning");
  const mlProjectIds = new Set(mlExp ? mlExp.projects.map((p) => p.project_id) : []);

  const isMl = (p: Project) => mlProjectIds.has(p.project_id) || p.ml_technologies.length > 0;

  const machineLearning = all.filter(isMl);
  const softwareEngineering = all.filter((p) => !isMl(p));

  const portfolioIdx = machineLearning.findIndex((p) => p.project_id === "personal-portfolio");
  if (portfolioIdx > 0) {
    const [personalPortfolio] = machineLearning.splice(portfolioIdx, 1);
    machineLearning.unshift(personalPortfolio);
  }

  return { machineLearning, softwareEngineering };
}

export function entryTechnologies(item: Project | Experience): {
  ml: MachineLearningTechnology[];
  software: SoftwareTechnology[];
  all: string[];
} {
  const ml = [...item.ml_technologies];
  const sw = [...item.software_technologies];
  if ("projects" in item) {
    for (const p of item.projects) {
      ml.push(...p.ml_technologies);
      sw.push(...p.software_technologies);
    }
  }
  const uniqueMl = [...new Set(ml)];
  const uniqueSw = [...new Set(sw)];
  return {
    ml: uniqueMl,
    software: uniqueSw,
    all: [...uniqueMl, ...uniqueSw],
  };
}

export function entrySkills(item: Project | Experience): {
  ml: MachineLearningSkill[];
  software: SoftwareSkill[];
  all: Skill[];
} {
  const ml = [...item.ml_skills];
  const sw = [...item.software_skills];
  if ("projects" in item) {
    for (const p of item.projects) {
      ml.push(...p.ml_skills);
      sw.push(...p.software_skills);
    }
  }
  const uniqueMl = [...new Set(ml)];
  const uniqueSw = [...new Set(sw)];
  return {
    ml: uniqueMl,
    software: uniqueSw,
    all: [...uniqueMl, ...uniqueSw],
  };
}

export function allPortfolioSkills(portfolio: Portfolio): {
  ml: MachineLearningSkill[];
  software: SoftwareSkill[];
  all: Skill[];
} {
  const ml = [...portfolio.ml_skills];
  const sw = [...portfolio.software_skills];
  for (const exp of allExperiences(portfolio)) {
    const itemSkills = entrySkills(exp);
    ml.push(...itemSkills.ml);
    sw.push(...itemSkills.software);
  }
  const uniqueMl = [...new Set(ml)];
  const uniqueSw = [...new Set(sw)];
  return {
    ml: uniqueMl,
    software: uniqueSw,
    all: [...uniqueMl, ...uniqueSw],
  };
}

export function findProject(portfolio: Portfolio, id: string): Project | undefined {
  return allProjects(portfolio).find((p) => p.project_id === id);
}

export function findExperience(portfolio: Portfolio, id: string): Experience | undefined {
  return allExperiences(portfolio).find((e) => e.experience_id === id);
}

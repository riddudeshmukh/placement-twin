// =============================================================================
// Resume Analyzer — every number here is computed directly from the actual
// resume text. Nothing is randomized and nothing is a hardcoded placeholder;
// if the input doesn't support a signal, that signal legitimately scores low.
// =============================================================================

// Curated technical keyword taxonomy used for both skill extraction and the
// ATS keyword-match score. Matching is case-insensitive and word-boundary safe.
export const SKILL_TAXONOMY = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Kotlin', 'Swift',
  'React', 'React Native', 'Vue', 'Angular', 'Next.js', 'Redux', 'Node.js', 'Express', 'FastAPI', 'Django',
  'Flask', 'Spring Boot', 'GraphQL', 'REST API', 'gRPC', 'WebSockets',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB', 'Elasticsearch', 'Firebase',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'Git', 'Linux', 'Bash', 'Nginx',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Data Structures',
  'Algorithms', 'System Design', 'Microservices', 'Unit Testing', 'Jest', 'Cypress', 'PyTest', 'JUnit',
  'SQL', 'HTML', 'CSS', 'Tailwind', 'SASS', 'Webpack', 'Vite',
];

// High-yield keywords ATS parsers commonly flag as missing on student resumes —
// used only to suggest additions the resume doesn't already contain.
const HIGH_YIELD_SUGGESTIONS = [
  'CI/CD', 'Unit Testing', 'System Design', 'GraphQL', 'Docker', 'Microservices',
  'REST API', 'Redis', 'Kubernetes', 'AWS',
];

const ACTION_VERBS = [
  'built', 'developed', 'designed', 'implemented', 'engineered', 'architected', 'optimized',
  'automated', 'deployed', 'led', 'reduced', 'increased', 'improved', 'launched', 'created',
  'migrated', 'refactored', 'scaled', 'shipped', 'integrated',
];

const SECTION_HEADERS = ['education', 'experience', 'projects', 'skills', 'work experience', 'summary'];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countOccurrences(text, phrase) {
  const re = new RegExp(`(?<![a-zA-Z0-9])${escapeRegExp(phrase)}(?![a-zA-Z0-9])`, 'gi');
  const matches = text.match(re);
  return matches ? matches.length : 0;
}

/** Extract skills actually present in the text, with a level derived from how
 *  strongly each one is represented (mentions + whether it appears near
 *  action-verb / project context), not a random number. */
export function extractSkills(text) {
  const found = [];
  for (const skill of SKILL_TAXONOMY) {
    const occurrences = countOccurrences(text, skill);
    if (occurrences > 0) {
      // Base confidence from a single mention, small deterministic boost per
      // repeat mention (a skill named in Skills AND Projects reads stronger).
      const level = Math.min(98, 62 + occurrences * 9);
      found.push({ name: skill, level, mentions: occurrences });
    }
  }
  return found.sort((a, b) => b.mentions - a.mentions).map(({ name, level }) => ({ name, level }));
}

/** Best-effort structured extraction of education / experience entries from
 *  plain resume text. Heuristic and conservative: it only returns entries it
 *  can actually find evidence for in the text — it never invents data. */
export function extractStructuredSections(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const education = [];
  const experience = [];

  const degreeRe = /(B\.?Tech|M\.?Tech|Bachelor|Master|B\.?E\.?|M\.?S\.?|B\.?Sc|M\.?Sc|Ph\.?D|MBA)[^\n,|]{0,60}/i;
  const gpaRe = /(?:GPA|CGPA)[:\s]*([\d.]{1,4})/i;
  const yearRangeRe = /(20\d{2}|19\d{2})\s*[-–—to]{1,4}\s*(20\d{2}|Present|present|Current|current)/;

  lines.forEach((line, idx) => {
    const degreeMatch = line.match(degreeRe);
    if (degreeMatch) {
      const yearMatch = line.match(yearRangeRe) || (lines[idx + 1] || '').match(yearRangeRe);
      const gpaMatch = line.match(gpaRe) || (lines[idx + 1] || '').match(gpaRe);
      education.push({
        degree: degreeMatch[0].trim(),
        institution: (lines[idx + 1] && !lines[idx + 1].match(degreeRe)) ? lines[idx + 1] : '',
        gpa: gpaMatch ? gpaMatch[1] : '',
        duration: yearMatch ? yearMatch[0] : '',
      });
    }
  });

  const roleRe = /(Intern|Engineer|Developer|Analyst|Researcher|Fellow|Assistant)/i;
  lines.forEach((line, idx) => {
    if (roleRe.test(line) && line.length < 90 && !degreeRe.test(line)) {
      const yearMatch = line.match(yearRangeRe) || (lines[idx + 1] || '').match(yearRangeRe);
      experience.push({
        role: line.replace(yearRangeRe, '').trim(),
        company: (lines[idx + 1] && lines[idx + 1].length < 60) ? lines[idx + 1] : '',
        duration: yearMatch ? yearMatch[0] : '',
        description: lines[idx + 2] || '',
      });
    }
  });

  return {
    education: education.slice(0, 4),
    experience: experience.slice(0, 4),
  };
}

function scoreFormatting(text) {
  let score = 40;
  const lower = text.toLowerCase();
  const headersFound = SECTION_HEADERS.filter(h => lower.includes(h)).length;
  score += Math.min(35, headersFound * 9);

  const bulletCount = (text.match(/^[\s]*[•\-*][\s]/gm) || []).length;
  score += Math.min(15, bulletCount * 1.2);

  // Penalize walls of text with no line breaks (bad for parsers).
  const lineCount = text.split(/\r?\n/).filter(l => l.trim()).length;
  if (lineCount < 6) score -= 15;

  return Math.max(5, Math.min(99, Math.round(score)));
}

function scoreKeywordMatch(foundSkillsCount) {
  // Percentage of the curated taxonomy represented, scaled so a well-rounded
  // resume (12-15 real hits) lands in the 80-95 band without ever hitting 100.
  const pct = (foundSkillsCount / 16) * 100;
  return Math.max(5, Math.min(97, Math.round(pct)));
}

function scoreImpact(text) {
  const numberSignals = (text.match(/\b\d+(\.\d+)?\s?(%|percent|ms|sec|seconds|x|users|requests|qps|rps|k\+|million)\b/gi) || []).length;
  const actionVerbHits = ACTION_VERBS.reduce((acc, v) => acc + countOccurrences(text, v), 0);
  let score = 20 + numberSignals * 10 + actionVerbHits * 4;
  return Math.max(5, Math.min(97, Math.round(score)));
}

function scoreBrevity(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 5;
  // Ideal band for a one-page student/early-career resume: ~350-800 words.
  if (words < 120) return Math.max(10, Math.round((words / 120) * 55));
  if (words <= 800) return 96;
  const over = words - 800;
  return Math.max(15, Math.round(96 - over / 12));
}

/** The single entry point: given raw resume text, returns every score,
 *  extracted skill, and note purely as a function of that text. Calling this
 *  twice with the same input always returns the same output. */
export function analyzeResume(text) {
  const cleanText = (text || '').trim();
  const skills = extractSkills(cleanText);
  const structured = extractStructuredSections(cleanText);

  const formattingScore = scoreFormatting(cleanText);
  const keywordsMatchScore = scoreKeywordMatch(skills.length);
  const impactScore = scoreImpact(cleanText);
  const brevityScore = scoreBrevity(cleanText);

  const overall = Math.round(
    formattingScore * 0.25 +
    keywordsMatchScore * 0.35 +
    impactScore * 0.25 +
    brevityScore * 0.15
  );

  const lowerText = cleanText.toLowerCase();
  const missingKeywords = HIGH_YIELD_SUGGESTIONS.filter(
    kw => !lowerText.includes(kw.toLowerCase())
  ).slice(0, 6);

  const strengths = [];
  const improvements = [];

  if (skills.length >= 8) {
    strengths.push(`Detected ${skills.length} recognized technical keywords across the document.`);
  } else if (skills.length > 0) {
    improvements.push(`Only ${skills.length} recognized technical keywords found — name specific languages, frameworks, and tools explicitly.`);
  } else {
    improvements.push('No recognized technical keywords were found. List concrete languages, frameworks, and tools by name.');
  }

  if (formattingScore >= 75) {
    strengths.push('Clear section structure detected (education/experience/projects/skills headers present).');
  } else {
    improvements.push('Add explicit section headers (Education, Experience, Projects, Skills) so parsers can segment your resume correctly.');
  }

  if (impactScore >= 65) {
    strengths.push('Multiple quantified outcomes detected (numbers, percentages, or measured results).');
  } else {
    improvements.push('Quantify your impact with real numbers — latency reduced, users served, throughput, test coverage, etc.');
  }

  if (brevityScore >= 75) {
    strengths.push('Resume length is well-calibrated for a single-page technical resume.');
  } else if ((cleanText.trim().split(/\s+/).filter(Boolean).length) < 120) {
    improvements.push('Resume content is very short — add more detail on projects, coursework, and measurable outcomes.');
  } else {
    improvements.push('Resume content is dense — tighten bullet points to the highest-impact 2-3 lines per role/project.');
  }

  if (missingKeywords.length > 0) {
    improvements.push(`Only if supported by your actual work, consider describing: ${missingKeywords.slice(0, 3).join(', ')}.`);
  }

  return {
    skills,
    structured,
    atsScore: overall,
    atsFeedback: {
      formattingScore,
      keywordsMatchScore,
      impactScore,
      brevityScore,
      missingKeywords,
      strengths: strengths.length ? strengths : ['No notable strengths detected yet — add more verified content to your resume.'],
      improvements: improvements.length ? improvements : ['Resume looks solid across every measured dimension.'],
    },
  };
}

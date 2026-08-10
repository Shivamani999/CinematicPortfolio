/**
 * parseResume(text) -> structured resume data.
 *
 * Heuristic, dependency-free parser. Resumes are wildly inconsistent, so this
 * aims for "good defaults you can edit" rather than perfection. Every field has
 * a sensible fallback and the generated siteConfig.js stays fully hand-editable.
 */

const SECTION_HEADERS = {
  summary: [
    "summary",
    "professional summary",
    "profile",
    "objective",
    "about",
    "about me",
  ],
  skills: [
    "skills",
    "technical skills",
    "technical proficiencies",
    "technologies",
    "tech stack",
    "core competencies",
    "competencies",
    "expertise",
    "tools and technologies",
    "tools & technologies",
    "skills & tools",
  ],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "employment history",
    "work history",
    "career history",
  ],
  projects: [
    "projects",
    "personal projects",
    "selected projects",
    "notable projects",
    "side projects",
    "academic projects",
  ],
  education: ["education", "academic background", "academics"],
};

// Tech keywords used as a fallback when there's no clear "Skills" section,
// and to tag projects with relevant technologies.
const TECH_KEYWORDS = [
  "JavaScript", "TypeScript", "Python", "Java", "Kotlin", "Go", "Golang",
  "Rust", "C++", "C#", "Ruby", "PHP", "Swift", "Scala", "Elixir",
  "React", "Next.js", "Vue", "Angular", "Svelte", "Node.js", "Express",
  "Django", "Flask", "FastAPI", "Spring", "Spring Boot", "Grails", "Rails",
  ".NET", "GraphQL", "REST", "Redux", "Tailwind", "Three.js", "GSAP", "D3",
  "HTML", "CSS", "SASS", "WebGL",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB", "Cassandra",
  "Elasticsearch", "Kafka", "RabbitMQ",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Jenkins",
  "GitHub Actions", "CI/CD", "Git", "Linux", "Nginx",
  "TensorFlow", "PyTorch", "Pandas", "NumPy", "Spark", "Hadoop",
  "Figma", "Jira", "Agile", "Scrum",
];

const ROLE_KEYWORDS = [
  "engineer", "developer", "designer", "architect", "scientist", "analyst",
  "manager", "consultant", "programmer", "administrator", "specialist",
  "lead", "full stack", "full-stack", "frontend", "front-end", "backend",
  "back-end", "devops", "data", "machine learning", "ml", "ai", "software",
  "web", "mobile", "cloud", "product", "ux", "ui",
];

const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
const stripBullet = (s) => s.replace(/^[\s•·◦▪‣*\-–—|>]+/, "").trim();

function headerKeyFor(line) {
  const norm = line
    .toLowerCase()
    .replace(/[^a-z& ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!norm || norm.length > 34) return null;
  for (const [key, names] of Object.entries(SECTION_HEADERS)) {
    if (names.includes(norm)) return key;
  }
  return null;
}

function splitSections(lines) {
  const marks = [];
  lines.forEach((line, i) => {
    const key = headerKeyFor(line);
    if (key) marks.push({ key, i });
  });
  const sections = {};
  marks.forEach((m, idx) => {
    const end = idx + 1 < marks.length ? marks[idx + 1].i : lines.length;
    // keep the first occurrence of each section
    if (!sections[m.key]) {
      sections[m.key] = lines.slice(m.i + 1, end).filter((l) => clean(l));
    }
  });
  return sections;
}

function extractContacts(text) {
  const email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || "";
  const phone =
    (text.match(/(\+?\d[\d\s().-]{7,}\d)/) || [])[0]?.trim() || "";

  const links = [];
  const seen = new Set();
  const add = (label, href) => {
    const k = label.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    links.push({ label, href });
  };

  const find = (re) => (text.match(re) || [])[0];
  const gh = find(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i);
  if (gh) add("GitHub", normalizeUrl(gh));
  const li = find(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/[A-Za-z0-9_%-]+/i);
  if (li) add("LinkedIn", normalizeUrl(li));
  const tw = find(/(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9_]+/i);
  if (tw) add("X", normalizeUrl(tw));
  const dr = find(/(?:https?:\/\/)?(?:www\.)?dribbble\.com\/[A-Za-z0-9_-]+/i);
  if (dr) add("Dribbble", normalizeUrl(dr));
  const be = find(/(?:https?:\/\/)?(?:www\.)?behance\.net\/[A-Za-z0-9_-]+/i);
  if (be) add("Behance", normalizeUrl(be));
  const me = find(/(?:https?:\/\/)?(?:www\.)?medium\.com\/@?[A-Za-z0-9_.-]+/i);
  if (me) add("Medium", normalizeUrl(me));

  return { email, phone, links };
}

function normalizeUrl(u) {
  let url = u.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url.replace(/^www\./i, "");
  return url;
}

function looksLikeName(line) {
  const l = clean(line);
  if (!l || l.length > 40) return false;
  if (/[@\d]/.test(l)) return false;
  if (/https?:|www\.|\.com|\.io|\.net/i.test(l)) return false;
  if (headerKeyFor(l)) return false;
  const words = l.split(" ").filter(Boolean);
  if (words.length < 1 || words.length > 4) return false;
  // each word starts uppercase OR the whole thing is uppercase
  const titleish = words.every((w) => /^[A-Z][a-zA-Z.'-]*$/.test(w));
  const allCaps = /^[A-Z][A-Z .'-]+$/.test(l) && l.replace(/[^A-Z]/g, "").length >= 2;
  return titleish || allCaps;
}

function toTitleCase(s) {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function extractName(lines) {
  const head = lines.slice(0, 8).map(clean).filter(Boolean);
  for (const line of head) {
    if (looksLikeName(line)) {
      return /^[A-Z .'-]+$/.test(line) ? toTitleCase(line) : line;
    }
  }
  return head[0] ? clean(head[0]) : "Your Name";
}

function extractTitle(lines, name) {
  const head = lines.slice(0, 10).map(clean).filter(Boolean);
  for (const line of head) {
    if (line === name) continue;
    if (/[@]/.test(line)) continue;
    if (headerKeyFor(line)) continue;
    const low = line.toLowerCase();
    if (ROLE_KEYWORDS.some((k) => low.includes(k)) && line.length <= 60) {
      return line.replace(/\s*[|•]\s*/g, " · ");
    }
  }
  return "Software Engineer";
}

function tokenizeSkills(block) {
  const text = block.join("\n");
  const raw = text
    .split(/[\n,;|•·◦▪‣]+/)
    .map((t) => stripBullet(t))
    .map((t) => t.replace(/^(proficient in|experience with|familiar with)\s*/i, ""))
    .map(clean)
    .filter(Boolean);

  const out = [];
  const seen = new Set();
  for (let t of raw) {
    // drop colon-prefixed category labels like "Languages:" or "Cloud & DevOps:"
    t = t.replace(/^[A-Za-z0-9 &/+.-]+:\s*/, "");
    if (!t) continue;
    if (t.length > 28) continue; // likely a sentence, not a skill
    if (t.split(" ").length > 4) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function skillsFromKeywords(text) {
  const found = [];
  const seen = new Set();
  for (const kw of TECH_KEYWORDS) {
    const re = new RegExp(
      `(?:^|[^A-Za-z0-9])${kw.replace(/[.+]/g, "\\$&")}(?:$|[^A-Za-z0-9])`,
      "i"
    );
    if (re.test(text) && !seen.has(kw.toLowerCase())) {
      seen.add(kw.toLowerCase());
      found.push(kw);
    }
  }
  return found;
}

function extractSummary(sections) {
  const block = sections.summary;
  if (!block || !block.length) return "";
  const text = block.map(stripBullet).join(" ");
  return clean(text);
}

function allYears(text) {
  const years = (text.match(/\b(19|20)\d{2}\b/g) || []).map(Number);
  return years.filter((y) => y >= 1970 && y <= new Date().getFullYear() + 1);
}

function groupEntries(block) {
  // Group a section into entries. An entry header is a non-bullet line;
  // following bullet lines (and short non-bullet continuations) are its body.
  const entries = [];
  let current = null;
  for (const rawLine of block) {
    const line = clean(rawLine);
    if (!line) continue;
    const isBullet = /^[\s•·◦▪‣*\-–—>]/.test(rawLine);
    if (!isBullet && (!current || current.body.length > 0)) {
      current = { header: line, body: [] };
      entries.push(current);
    } else if (current) {
      current.body.push(stripBullet(line));
    } else {
      current = { header: line, body: [] };
      entries.push(current);
    }
  }
  return entries;
}

function tagsFor(text, skills) {
  // Match against the résumé's own skills first, then the broader tech list,
  // so a project's stack is recognised even if it isn't a listed skill.
  const pool = [];
  const seen = new Set();
  for (const s of [...skills, ...TECH_KEYWORDS]) {
    const k = s.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      pool.push(s);
    }
  }
  const tags = [];
  for (const s of pool) {
    const re = new RegExp(
      `(?:^|[^A-Za-z0-9])${s.replace(/[.+]/g, "\\$&")}(?:$|[^A-Za-z0-9])`,
      "i"
    );
    if (re.test(text)) tags.push(s);
    if (tags.length >= 3) break;
  }
  return tags;
}

function extractProjects(sections, skills) {
  const block = sections.projects;
  if (!block || !block.length) return [];
  const entries = groupEntries(block).slice(0, 6);
  return entries.map((e) => {
    const joined = [e.header, ...e.body].join(" ");
    const year = (allYears(joined)[0] || "").toString();
    const title = e.header.split(/[—–\-|:(]/)[0].trim() || e.header;
    const description = clean(e.body.join(" ") || e.header);
    return {
      title: title.slice(0, 48),
      description: description.slice(0, 220),
      year,
      tags: tagsFor(joined, skills),
    };
  });
}

function extractExperience(sections, skills) {
  const block = sections.experience;
  if (!block || !block.length) return [];
  const entries = groupEntries(block).slice(0, 6);
  return entries.map((e) => {
    const joined = [e.header, ...e.body].join(" ");
    const year = (allYears(joined)[0] || "").toString();
    const parts = e.header.split(/[—–\-|,]/).map((p) => p.trim());
    return {
      title: (parts[0] || e.header).slice(0, 48),
      org: (parts[1] || "").slice(0, 48),
      year,
      description: clean(e.body.join(" ") || e.header).slice(0, 220),
      tags: tagsFor(joined, skills),
    };
  });
}

export function parseResume(rawText) {
  const text = (rawText || "").replace(/\r/g, "");
  const lines = text.split("\n");

  const sections = splitSections(lines);
  const { email, phone, links } = extractContacts(text);

  const name = extractName(lines);
  const title = extractTitle(lines, name);

  let skills = sections.skills ? tokenizeSkills(sections.skills) : [];
  if (skills.length < 4) {
    // augment / fall back to keyword scan
    const kw = skillsFromKeywords(text);
    const merged = [...skills];
    const seen = new Set(skills.map((s) => s.toLowerCase()));
    for (const k of kw) {
      if (!seen.has(k.toLowerCase())) {
        seen.add(k.toLowerCase());
        merged.push(k);
      }
    }
    skills = merged;
  }

  const summary = extractSummary(sections);
  const projects = extractProjects(sections, skills);
  const experience = extractExperience(sections, skills);

  // Years of experience: from earliest year in the experience section,
  // else earliest year anywhere.
  const expText = (sections.experience || []).join(" ");
  const years = allYears(expText).length ? allYears(expText) : allYears(text);
  const earliest = years.length ? Math.min(...years) : null;
  const yearsExperience = earliest
    ? Math.max(1, Math.min(45, new Date().getFullYear() - earliest))
    : null;

  const nameWords = name.split(" ").filter(Boolean);
  const firstName = nameWords[0] || name;
  const lastName = nameWords.slice(1).join(" ") || "";
  const initials =
    (nameWords[0]?.[0] || "") + (nameWords[nameWords.length - 1]?.[0] || "");

  return {
    name,
    firstName,
    lastName,
    initials: initials.toUpperCase() || "ME",
    title,
    email,
    phone,
    links,
    summary,
    skills,
    projects,
    experience,
    yearsExperience,
  };
}

export default parseResume;

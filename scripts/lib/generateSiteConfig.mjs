/**
 * Map parsed resume data -> the siteConfig object the components consume,
 * then render it as an editable ESM module string.
 */

const ACCENTS = ["#ff8a3d", "#5b8cff", "#ffd9a0", "#9be7c4"];

const DEFAULT_SKILLS = ["JavaScript", "React", "Node.js", "Python", "AWS"];

function firstSentences(text, n = 1) {
  if (!text) return "";
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.slice(0, n).join(" ").trim();
}
function restSentences(text, skip = 1) {
  if (!text) return "";
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.slice(skip).join(" ").trim();
}

export function buildConfig(resume) {
  const skills = resume.skills && resume.skills.length ? resume.skills : DEFAULT_SKILLS;
  const stack = skills.slice(0, 5);
  const capabilities = skills.slice(0, 8);

  // Work projects: prefer parsed projects, else experience, else nothing fancy.
  let projectSource = [];
  if (resume.projects && resume.projects.length) {
    projectSource = resume.projects.map((p) => ({
      title: p.title,
      category: "Project",
      year: p.year || "",
      description: p.description,
      tags: p.tags && p.tags.length ? p.tags : stack.slice(0, 3),
    }));
  } else if (resume.experience && resume.experience.length) {
    projectSource = resume.experience.map((e) => ({
      title: e.title,
      category: e.org || "Experience",
      year: e.year || "",
      description: e.description,
      tags: e.tags && e.tags.length ? e.tags : stack.slice(0, 3),
    }));
  }
  const projects = projectSource.slice(0, 4).map((p, i) => ({
    ...p,
    accent: ACCENTS[i % ACCENTS.length],
  }));

  // About copy.
  const statement =
    firstSentences(resume.summary, 2) ||
    `I'm ${resume.firstName}, a ${resume.title.toLowerCase()} focused on building thoughtful, reliable, and well-crafted software.`;
  const para2 = restSentences(resume.summary, 2);
  const paragraphs = [
    para2 ||
      `I care about the details that make products feel considered — clean architecture, smooth experiences, and code that's a pleasure to maintain.`,
  ];

  // Stats.
  const stats = [];
  if (resume.yearsExperience) {
    stats.push({
      value: `${resume.yearsExperience}+`,
      label: "Years of experience",
    });
  }
  const projCount = (resume.projects?.length || 0) + (resume.experience?.length || 0);
  if (projCount) {
    stats.push({ value: `${projCount}+`, label: "Projects & roles" });
  }
  if (skills.length) {
    stats.push({ value: `${skills.length}`, label: "Tools & technologies" });
  }

  // Contact socials.
  const socials = (resume.links && resume.links.length
    ? resume.links
    : [
        { label: "GitHub", href: "https://github.com" },
        { label: "LinkedIn", href: "https://linkedin.com" },
      ]
  ).slice(0, 5);
  const githubLink =
    (resume.links || []).find((l) => l.label === "GitHub")?.href ||
    "https://github.com";

  return {
    brand: resume.initials,
    nav: [
      { label: "Work", href: "#work" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
    badge: "Open to work",
    firstName: resume.firstName,
    lastName: resume.lastName,
    heroName: resume.name,
    role: resume.title,
    stack,
    actions: {
      projects: { label: "View Projects", href: "#work" },
      github: { label: "GitHub", href: githubLink },
    },
    video: { src: "/hero.mp4", poster: "" },
    particles: {
      colors: ["#ff8a3d", "#ffb066", "#ffffff", "#ffd9a0"],
      count: 90,
    },
    about: {
      kicker: "About",
      statement,
      paragraphs,
      stats: stats.length
        ? stats
        : [{ value: `${skills.length}`, label: "Tools & technologies" }],
    },
    capabilities: capabilities.length ? capabilities : DEFAULT_SKILLS,
    work: {
      kicker: "Selected Work",
      heading: "Things I've built",
      projects: projects.length ? projects : fallbackProjects(stack),
    },
    contact: {
      kicker: "Contact",
      heading: "Let's build something together.",
      copy: "Open to new roles and collaboration. Reach out and let's talk.",
      email: resume.email || "you@example.com",
      socials,
    },
  };
}

function fallbackProjects(stack) {
  return [
    {
      title: "Featured Project",
      category: "Project",
      year: "",
      description:
        "Add your standout projects in lib/siteConfig.js — title, a short description, and the tech behind each one.",
      tags: stack.slice(0, 3),
      accent: ACCENTS[0],
    },
  ];
}

/** Render the config object as an editable ESM module. */
export function renderSiteConfigModule(config) {
  const body = JSON.stringify(config, null, 2);
  return `// ──────────────────────────────────────────────────────────────
// AUTO-GENERATED from your resume by \`npm run setup\` / the /setup page.
// Everything here is plain data — edit any value by hand and save.
// ──────────────────────────────────────────────────────────────
export const siteConfig = ${body};

export default siteConfig;
`;
}

export function generateSiteConfigSource(resume) {
  return renderSiteConfigModule(buildConfig(resume));
}

export default generateSiteConfigSource;

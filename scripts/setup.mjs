#!/usr/bin/env node
/**
 * One-shot portfolio setup.
 *
 *   1. Drop a video + a resume into /intake
 *   2. Run:  npm run setup
 *
 * It extracts your resume, generates lib/siteConfig.js, and copies the video
 * to public/hero.mp4. Re-run any time you change either file.
 *
 * Flags:
 *   --video <path>    explicit video file (otherwise auto-found in /intake)
 *   --resume <path>   explicit resume file (otherwise auto-found in /intake)
 *   --dry             parse and print, but don't write anything
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractTextFromFile,
  RESUME_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from "./lib/extractText.mjs";
import { parseResume } from "./lib/parseResume.mjs";
import {
  buildConfig,
  renderSiteConfigModule,
} from "./lib/generateSiteConfig.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INTAKE = path.join(ROOT, "intake");

const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};
const log = (...a) => console.log(...a);
const ok = (m) => log(`${c.green}✓${c.reset} ${m}`);
const warn = (m) => log(`${c.yellow}!${c.reset} ${m}`);

function getFlag(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

async function findInIntake(exts) {
  let files = [];
  try {
    files = await fs.readdir(INTAKE);
  } catch {
    return null;
  }
  const match = files
    .filter((f) => exts.includes(path.extname(f).toLowerCase()))
    .sort();
  return match.length ? path.join(INTAKE, match[0]) : null;
}

async function main() {
  log(`\n${c.bold}${c.cyan}Cinematic Portfolio — setup${c.reset}\n`);

  const dry = Boolean(getFlag("dry"));

  const resumePath =
    (typeof getFlag("resume") === "string" && getFlag("resume")) ||
    (await findInIntake(RESUME_EXTENSIONS));
  const videoPath =
    (typeof getFlag("video") === "string" && getFlag("video")) ||
    (await findInIntake(VIDEO_EXTENSIONS));

  if (!resumePath) {
    warn(
      `No resume found. Put a ${RESUME_EXTENSIONS.join(
        " / "
      )} file in /intake (or pass --resume <path>).`
    );
    process.exitCode = 1;
    return;
  }
  log(`${c.dim}Resume:${c.reset} ${path.relative(ROOT, resumePath)}`);
  if (videoPath) log(`${c.dim}Video: ${c.reset} ${path.relative(ROOT, videoPath)}`);
  else warn("No video found in /intake — keeping the existing public/hero.mp4.");
  log("");

  // 1. Extract + parse
  const text = await extractTextFromFile(resumePath);
  if (!text || text.trim().length < 20) {
    warn("Could not read meaningful text from the resume (is it a scan/image?).");
  }
  const resume = parseResume(text);
  const config = buildConfig(resume);

  // Summary of what we found
  log(`${c.bold}Parsed:${c.reset}`);
  log(`  Name      ${resume.name}`);
  log(`  Role      ${resume.title}`);
  log(`  Email     ${resume.email || c.dim + "(none found)" + c.reset}`);
  log(
    `  Links     ${
      resume.links.length
        ? resume.links.map((l) => l.label).join(", ")
        : c.dim + "(none found)" + c.reset
    }`
  );
  log(
    `  Skills    ${
      resume.skills.length
        ? resume.skills.slice(0, 10).join(", ") +
          (resume.skills.length > 10 ? " …" : "")
        : c.dim + "(none found)" + c.reset
    }`
  );
  log(
    `  Projects  ${config.work.projects.length}   ` +
      `Experience ${resume.experience.length}`
  );
  log("");

  if (dry) {
    ok("Dry run — nothing written. Re-run without --dry to apply.");
    return;
  }

  // 2. Write siteConfig.js
  const source = renderSiteConfigModule(config);
  const configPath = path.join(ROOT, "lib", "siteConfig.js");
  await fs.writeFile(configPath, source, "utf8");
  ok(`Wrote ${path.relative(ROOT, configPath)}`);

  // 3. Copy the video
  if (videoPath) {
    const dest = path.join(ROOT, "public", "hero.mp4");
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(videoPath, dest);
    ok(`Copied video → ${path.relative(ROOT, dest)}`);
  }

  log(
    `\n${c.green}${c.bold}Done.${c.reset} Run ${c.cyan}npm run dev${c.reset} and open http://localhost:3000`
  );
  log(`${c.dim}Tweak anything in lib/siteConfig.js — it's plain, editable data.${c.reset}\n`);
}

main().catch((err) => {
  console.error(`\n${c.red}Setup failed:${c.reset} ${err.message}\n`);
  process.exitCode = 1;
});

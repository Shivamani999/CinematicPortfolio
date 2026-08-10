import fs from "node:fs/promises";
import path from "node:path";
import { extractTextFromBuffer } from "@/scripts/lib/extractText.mjs";
import { parseResume } from "@/scripts/lib/parseResume.mjs";
import {
  buildConfig,
  renderSiteConfigModule,
} from "@/scripts/lib/generateSiteConfig.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIDEO_EXTS = [".mp4", ".mov", ".webm", ".m4v"];

export async function POST(request) {
  // Writing into the project only makes sense while developing locally.
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      {
        ok: false,
        error:
          "Setup is disabled in production. Run it locally with `npm run dev`, or use `npm run setup`.",
      },
      { status: 403 }
    );
  }

  try {
    const form = await request.formData();
    const resume = form.get("resume");
    const video = form.get("video");

    if (!resume || typeof resume === "string") {
      return Response.json(
        { ok: false, error: "Please attach a resume (PDF, DOCX, TXT, or MD)." },
        { status: 400 }
      );
    }

    // 1. Resume -> text -> structured data -> config
    const resumeBuf = Buffer.from(await resume.arrayBuffer());
    const text = await extractTextFromBuffer(resumeBuf, resume.name);
    const parsed = parseResume(text);
    const config = buildConfig(parsed);

    // 2. Persist siteConfig.js
    const root = process.cwd();
    const configPath = path.join(root, "lib", "siteConfig.js");
    await fs.writeFile(configPath, renderSiteConfigModule(config), "utf8");

    // 3. Persist the video (if provided)
    let wroteVideo = false;
    if (video && typeof video !== "string" && video.size > 0) {
      const ext = path.extname(video.name).toLowerCase();
      if (!VIDEO_EXTS.includes(ext)) {
        return Response.json(
          { ok: false, error: `Unsupported video type "${ext}". Use MP4, MOV, WEBM, or M4V.` },
          { status: 400 }
        );
      }
      const buf = Buffer.from(await video.arrayBuffer());
      const dest = path.join(root, "public", "hero.mp4");
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, buf);
      wroteVideo = true;
    }

    return Response.json({
      ok: true,
      wroteVideo,
      summary: {
        name: parsed.name,
        role: parsed.title,
        email: parsed.email,
        links: parsed.links.map((l) => l.label),
        skills: parsed.skills,
        projects: config.work.projects.map((p) => p.title),
        stats: config.about.stats,
      },
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err?.message || "Failed to process the upload." },
      { status: 500 }
    );
  }
}

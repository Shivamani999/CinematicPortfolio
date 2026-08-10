import fs from "node:fs/promises";
import path from "node:path";

/**
 * Extract raw text from a resume buffer (PDF / DOCX / TXT / MD).
 * Pure server-side: relies on pdf-parse and mammoth, imported lazily so the
 * rest of the toolchain doesn't pull them in unless a resume is processed.
 */
export async function extractTextFromBuffer(buffer, filename) {
  const ext = path.extname(filename || "").toLowerCase();

  if (ext === ".pdf") {
    // Import the inner module directly — pdf-parse's index runs a debug
    // harness on import that breaks in some environments.
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    const pdf = mod.default || mod;
    const data = await pdf(buffer);
    return data.text || "";
  }

  if (ext === ".docx") {
    const mod = await import("mammoth");
    const mammoth = mod.default || mod;
    const res = await mammoth.extractRawText({ buffer });
    return res.value || "";
  }

  if (ext === ".txt" || ext === ".md" || ext === ".markdown") {
    return buffer.toString("utf8");
  }

  if (ext === ".doc") {
    throw new Error(
      "Legacy .doc files aren't supported — please export as .docx or PDF."
    );
  }

  throw new Error(
    `Unsupported resume format "${ext || "unknown"}". Use PDF, DOCX, TXT, or MD.`
  );
}

export async function extractTextFromFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return extractTextFromBuffer(buffer, filePath);
}

export const RESUME_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".markdown"];
export const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];

"use client";

import { useRef, useState } from "react";
import styles from "./setup.module.css";

export default function SetupPage() {
  const [videoName, setVideoName] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | working | done | error
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState(null);
  const formRef = useRef(null);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("working");
    setMessage("");
    setSummary(null);

    const data = new FormData(formRef.current);
    if (!data.get("resume") || !data.get("resume").name) {
      setStatus("error");
      setMessage("Please choose a resume file.");
      return;
    }

    try {
      const res = await fetch("/api/setup", { method: "POST", body: data });
      const json = await res.json();
      if (!json.ok) {
        setStatus("error");
        setMessage(json.error || "Something went wrong.");
        return;
      }
      setSummary(json.summary);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMessage(err?.message || "Upload failed.");
    }
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.kicker}>Portfolio Setup</p>
        <h1 className={styles.title}>Upload a video and your resume</h1>
        <p className={styles.sub}>
          Drop in a short talking-head video and your resume. We&apos;ll read
          the resume, generate your content, and wire everything up — then your
          portfolio is ready at the home page.
        </p>

        <form ref={formRef} onSubmit={onSubmit} className={styles.form}>
          <label className={styles.drop}>
            <input
              type="file"
              name="video"
              accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v"
              className={styles.input}
              onChange={(e) => setVideoName(e.target.files?.[0]?.name || "")}
            />
            <span className={styles.dropIcon}>🎬</span>
            <span className={styles.dropLabel}>
              {videoName || "Choose hero video"}
            </span>
            <span className={styles.dropHint}>MP4 · MOV · WEBM</span>
          </label>

          <label className={styles.drop}>
            <input
              type="file"
              name="resume"
              accept=".pdf,.docx,.txt,.md,.markdown,application/pdf"
              className={styles.input}
              onChange={(e) => setResumeName(e.target.files?.[0]?.name || "")}
            />
            <span className={styles.dropIcon}>📄</span>
            <span className={styles.dropLabel}>
              {resumeName || "Choose resume"}
            </span>
            <span className={styles.dropHint}>PDF · DOCX · TXT · MD</span>
          </label>

          <button
            type="submit"
            className={styles.submit}
            disabled={status === "working"}
          >
            {status === "working" ? "Generating…" : "Generate my portfolio"}
          </button>
        </form>

        {status === "error" ? (
          <p className={`${styles.note} ${styles.noteError}`}>{message}</p>
        ) : null}

        {status === "done" && summary ? (
          <div className={styles.result}>
            <p className={styles.resultTitle}>
              ✓ Done — here&apos;s what we pulled in:
            </p>
            <dl className={styles.summary}>
              <div>
                <dt>Name</dt>
                <dd>{summary.name}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{summary.role}</dd>
              </div>
              {summary.email ? (
                <div>
                  <dt>Email</dt>
                  <dd>{summary.email}</dd>
                </div>
              ) : null}
              {summary.links?.length ? (
                <div>
                  <dt>Links</dt>
                  <dd>{summary.links.join(", ")}</dd>
                </div>
              ) : null}
              {summary.skills?.length ? (
                <div>
                  <dt>Skills</dt>
                  <dd>{summary.skills.slice(0, 12).join(", ")}</dd>
                </div>
              ) : null}
              {summary.projects?.length ? (
                <div>
                  <dt>Projects</dt>
                  <dd>{summary.projects.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
            <a className={styles.cta} href="/">
              View your portfolio →
            </a>
            <p className={styles.tip}>
              Want to tweak anything? Everything lives in{" "}
              <code>lib/siteConfig.js</code>.
            </p>
          </div>
        ) : null}

        <p className={styles.footer}>
          Prefer the terminal? Drop both files in <code>/intake</code> and run{" "}
          <code>npm run setup</code>.
        </p>
      </div>
    </main>
  );
}

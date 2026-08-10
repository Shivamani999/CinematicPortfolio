"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import siteConfig from "@/lib/siteConfig";
import styles from "./VideoIntro.module.css";

export default function VideoIntro() {
  const { badge, firstName, heroName, role, stack, actions, video } =
    siteConfig;
  const displayName = heroName || firstName;

  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const ambientRef = useRef(null);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [ready, setReady] = useState(false);

  // ── Mute / unmute ───────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next) {
      // unmuting counts as engagement — hide the hint
      setShowHint(false);
      v.play().catch(() => {});
    }
  }, []);

  // ── Play / pause ────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    const a = ambientRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      a && a.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      a && a.pause();
      setPlaying(false);
    }
  }, []);

  // ── Smooth scroll to next section ───────────────────────────────
  const scrollNext = useCallback(() => {
    const hero = rootRef.current;
    const next = hero?.nextElementSibling;
    if (next) {
      next.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  }, []);

  // ── Smooth scroll to a given anchor (for the "View Projects" button) ──
  const scrollTo = useCallback((e, href) => {
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ── Autoplay kickoff ────────────────────────────────────────────
  // Both videos just loop independently. We deliberately do NOT seek the
  // ambient layer to match the main video every frame — repeatedly setting
  // currentTime forces the decoder to re-seek and stutters playback. Since
  // the ambient copy is heavily blurred, any drift is invisible.
  useEffect(() => {
    const v = videoRef.current;
    const a = ambientRef.current;
    if (!v) return;
    v.play().catch(() => {});
    a && a.play().catch(() => {});
  }, []);

  // ── Pause decoding when the hero is scrolled out of view ────────
  // Two simultaneous video decodes + a blur are wasted work once the user
  // scrolls past the hero. Pause them when offscreen, resume when back.
  useEffect(() => {
    const root = rootRef.current;
    const v = videoRef.current;
    const a = ambientRef.current;
    if (!root || !v) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        if (visible) {
          if (playing) v.play().catch(() => {});
          a && playing && a.play().catch(() => {});
        } else {
          v.pause();
          a && a.pause();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [playing]);

  // ── Auto-hide the sound hint after a few seconds ────────────────
  useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => setShowHint(false), 6500);
    return () => clearTimeout(t);
  }, [showHint]);

  // ── GSAP cinematic entrance ─────────────────────────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Reveal the stage (video + overlays) with a slow fade
      gsap.to(`.${styles.stage}`, {
        opacity: 1,
        duration: 1.6,
        ease: "power2.out",
        onStart: () => setReady(true),
      });

      if (prefersReduced) {
        gsap.set(
          [
            `.${styles.badge}`,
            `.${styles.line}`,
            `.${styles.role}`,
            `.${styles.chip}`,
            `.${styles.actions}`,
            `.${styles.controls}`,
            `.${styles.scroll}`,
          ],
          { opacity: 1, y: 0, clearProps: "transform" }
        );
        return;
      }

      const tl = gsap.timeline({ delay: 0.5 });
      tl.from(`.${styles.badge}`, {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      })
        .from(
          `.${styles.line}`,
          {
            yPercent: 120,
            opacity: 0,
            duration: 1.3,
            ease: "expo.out",
          },
          "-=0.6"
        )
        .from(
          `.${styles.role}`,
          { y: 20, opacity: 0, duration: 1, ease: "power3.out" },
          "-=0.85"
        )
        .from(
          `.${styles.chip}`,
          {
            y: 16,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
          },
          "-=0.7"
        )
        .from(
          `.${styles.actions}`,
          { y: 16, opacity: 0, duration: 0.9, ease: "power3.out" },
          "-=0.55"
        )
        .from(
          `.${styles.controls}`,
          { y: 16, opacity: 0, duration: 0.9, ease: "power3.out" },
          "-=0.7"
        )
        .from(
          `.${styles.scroll}`,
          { opacity: 0, duration: 1, ease: "power2.out" },
          "-=0.5"
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className={styles.hero}>
      <div className={styles.sticky}>
        <div className={styles.stage}>
          {/* Main full-bleed video — sharp, fills the whole hero */}
          <video
            ref={videoRef}
            className={`${styles.video} ${ready ? styles.videoShown : ""}`}
            src={video.src}
            poster={video.poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setReady(true)}
          />

          {/* Gradient overlays for readability + mood */}
          <div className={styles.grain} aria-hidden="true" />
          <div className={styles.vignette} aria-hidden="true" />
          <div className={styles.gradient} aria-hidden="true" />

          {/* ── Landing content ── */}
          <div className={styles.content}>
            {badge ? (
              <span className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {badge}
              </span>
            ) : null}

            <h1 className={styles.name}>
              <span className={styles.lineWrap}>
                <span className={styles.line}>{displayName}</span>
              </span>
            </h1>

            <p className={styles.role}>{role}</p>

            {stack?.length ? (
              <ul className={styles.stack} aria-label="Tech stack">
                {stack.map((item) => (
                  <li className={styles.chip} key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className={styles.actions}>
              <a
                className={styles.btnPrimary}
                href={actions.projects.href}
                onClick={(e) => scrollTo(e, actions.projects.href)}
              >
                {actions.projects.label}
              </a>
              <a
                className={styles.btnGhost}
                href={actions.github.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {actions.github.label}
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path
                    d="M7 17L17 7M9 7h8v8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Glass controls ── */}
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.glassBtn}
              onClick={togglePlay}
              aria-label={playing ? "Pause video" : "Play video"}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              type="button"
              className={styles.glassBtn}
              onClick={toggleMute}
              aria-label={muted ? "Unmute video" : "Mute video"}
            >
              {muted ? <MutedIcon /> : <SoundIcon />}
            </button>

            {/* Tap-for-sound badge */}
            <button
              type="button"
              className={`${styles.soundHint} ${
                showHint && muted ? styles.soundHintShow : ""
              }`}
              onClick={toggleMute}
              aria-hidden={!(showHint && muted)}
              tabIndex={showHint && muted ? 0 : -1}
            >
              <span className={styles.soundPulse} />
              Tap for sound
            </button>
          </div>

          {/* ── Scroll indicator ── */}
          <button
            type="button"
            className={styles.scroll}
            onClick={scrollNext}
            aria-label="Scroll to next section"
          >
            <span className={styles.scrollLabel}>Scroll</span>
            <span className={styles.scrollLine}>
              <span className={styles.scrollPulse} />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Inline icons (no extra deps) ── */
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
    </svg>
  );
}
function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M4 9v6h4l5 5V4L8 9H4z"
        fill="currentColor"
      />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
      <path
        d="M16 9l5 5M21 9l-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

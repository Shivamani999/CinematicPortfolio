# Cinematic Portfolio — Video Hero

A premium, immersive portfolio hero built around a talking-head video, with a
Three.js bokeh-particle layer and GSAP cinematic motion. Dark, warm, and
Apple-level polished.

## Stack

- **Next.js 14** (App Router)
- **React 18**
- **Three.js** — floating warm/white bokeh particles, additive blending, mouse parallax
- **GSAP** — cinematic entrance animations
- **CSS Modules** — scoped, theme-token based styling
- Fully responsive + reduced-motion friendly

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To build for production:

```bash
npm run build
npm start
```

## ⚡ Generate the whole site from a video + resume

You don't have to fill anything in by hand. Provide a hero video and a resume,
and the entire portfolio (hero, about, skills, work, contact) is generated.

The resume parser reads **PDF, DOCX, TXT, and Markdown**, and pulls out your
name, role, email, social links, skills, projects, and experience — then writes
`lib/siteConfig.js` and copies your video to `public/hero.mp4`.

### Option A — Terminal (no server needed)

1. Put your files in the **`/intake`** folder:
   - a video — `.mp4` / `.mov` / `.webm`
   - a resume — `.pdf` / `.docx` / `.txt` / `.md`
2. Run:

   ```bash
   npm run setup
   ```

   Add `--dry` to preview what it parsed without writing anything. You can also
   point at files explicitly: `npm run setup -- --resume ./me.pdf --video ./reel.mp4`.

3. `npm run dev` and you're done.

### Option B — In the browser

1. `npm run dev`
2. Open **http://localhost:3000/setup**
3. Choose your video + resume, hit **Generate my portfolio**, then click through
   to your finished site.

> The upload page writes into your project, so it only runs in local dev
> (`npm run dev`). It's intentionally disabled in production builds.

Either way, everything lands in `lib/siteConfig.js` as plain, editable data —
fix any value the parser guessed wrong and save.

## Customize

Almost everything is in **`lib/siteConfig.js`**:

| Field | What it controls |
| --- | --- |
| `badge` | Small status pill (e.g. "Open to work") — set `""` to hide |
| `firstName` / `lastName` / `heroName` | Name; `heroName` is the big hero title |
| `role` | Role line under the name (warm uppercase) |
| `stack` | Tech chips in the hero |
| `actions` | "View Projects" + "GitHub" buttons |
| `video.src` | Hero video path (default `/hero.mp4` in `public/`) |
| `video.poster` | Optional poster frame |
| `particles.colors` | Particle palette (warm orange + white by default) |
| `particles.count` | Particle density |

Swap the video by replacing **`public/hero.mp4`** (or point `video.src` elsewhere).

## Structure

```
app/
  layout.js            Root layout + metadata
  page.js              Assembles the full page (nav + sections)
  globals.css          Theme tokens (colors, easing)
components/
  Nav/                 Fixed glass nav that solidifies on scroll
  VideoIntro/          Sticky video hero (controls, overlays, GSAP, scroll cue)
  CinematicLayer/      Three.js particle overlay (self-disposing)
  common/
    Reveal.jsx         Scroll-into-view animation wrapper (IntersectionObserver)
  sections/
    About.jsx          Statement, paragraphs, animated stats
    Capabilities.jsx   Infinite marquee of disciplines
    Work.jsx           Project cards with accent glow on hover
    Contact.jsx        Email CTA, socials, footer
  setup/               In-browser /setup upload page (dev only)
  api/setup/route.js   Parses upload, writes siteConfig + video (dev only)
lib/
  siteConfig.js        ← edit ALL your content here (or generate it)
scripts/
  setup.mjs            `npm run setup` — generate from /intake files
  lib/
    extractText.mjs    PDF / DOCX / TXT → text
    parseResume.mjs    text → structured data (name, skills, projects…)
    generateSiteConfig.mjs   data → siteConfig.js
intake/                Drop your video + resume here for `npm run setup`
public/
  hero.mp4             Your talking-head video
```

## Page sections

A complete single-page portfolio: **Nav → Hero → About → Capabilities marquee → Work → Contact/Footer**. Every section reveals on scroll and reads from `lib/siteConfig.js`, so you can rewrite the entire site without touching a component.

## Features

- Fullscreen **sticky**, full-bleed sharp video hero
- Left-weighted cinematic gradient + vignette + faint film grain for readability
- Autoplay, loop, inline, with **glassmorphism play/pause + mute/unmute** controls
- Animated **"Tap for sound"** badge that auto-hides after a few seconds
- Three.js **bokeh particles**: warm/white glow, additive blending, sine-wave float, mouse parallax
- GSAP entrance: masked name reveal, staggered content, slow fade-in
- **Scroll indicator** with animated pulse line — click to smooth-scroll to the next section

## Performance notes

- Renderer DPR is capped (≤ 1.75); particle field pauses when the tab is hidden.
- All Three.js geometry, materials, textures, and the renderer are disposed on unmount.
- Animation runs on a single `requestAnimationFrame` loop; `prefers-reduced-motion` is respected throughout.
```

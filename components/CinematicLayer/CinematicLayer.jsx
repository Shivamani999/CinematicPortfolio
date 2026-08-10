"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import siteConfig from "@/lib/siteConfig";

/**
 * CinematicLayer
 * A transparent, GPU-friendly Three.js overlay of warm bokeh particles.
 * - Additive blending + soft radial sprite => dreamy glow
 * - Slow sine-wave float per particle
 * - Mouse parallax on the camera
 * - Caps DPR, pauses when tab hidden, disposes everything on unmount
 */
export default function CinematicLayer({
  count = siteConfig.particles.count,
  colors = siteConfig.particles.colors,
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    // ── Renderer (transparent, DPR-capped for performance) ──────────
    // WebGL may be unavailable (hardware acceleration off, GPU blocklisted,
    // headless, etc.). Fail gracefully: skip particles, keep the site working.
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      });
    } catch (err) {
      if (typeof console !== "undefined") {
        console.warn("CinematicLayer: WebGL unavailable, skipping particles.", err);
      }
      return; // nothing to clean up yet
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // If the GPU context is lost at runtime, stop the loop instead of throwing.
    const canvas = renderer.domElement;
    const onContextLost = (e) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener("webglcontextlost", onContextLost, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 28;

    // ── Soft radial sprite (drawn once on a canvas) ─────────────────
    const makeGlowTexture = () => {
      const s = 128;
      const cv = document.createElement("canvas");
      cv.width = cv.height = s;
      const ctx = cv.getContext("2d");
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0.0, "rgba(255,255,255,1)");
      g.addColorStop(0.2, "rgba(255,255,255,0.85)");
      g.addColorStop(0.5, "rgba(255,255,255,0.25)");
      g.addColorStop(1.0, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };
    const sprite = makeGlowTexture();

    // ── Geometry: positions, colors, per-particle phase/size ────────
    const palette = colors.map((c) => new THREE.Color(c));
    const positions = new Float32Array(count * 3);
    const colorArr = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    // store float state for sine motion (base position + phase + speed + amp)
    const base = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    const amp = new Float32Array(count);

    const spread = { x: 46, y: 30, z: 26 };
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread.x;
      const y = (Math.random() - 0.5) * spread.y;
      const z = (Math.random() - 0.5) * spread.z;
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = palette[(Math.random() * palette.length) | 0];
      // bias a few toward pure white highlights
      const white = Math.random() > 0.82;
      const c = white ? new THREE.Color("#ffffff") : col;
      colorArr[i * 3] = c.r;
      colorArr[i * 3 + 1] = c.g;
      colorArr[i * 3 + 2] = c.b;

      // depth-based size: nearer (z high) => bigger bokeh
      const depth = (z + spread.z / 2) / spread.z; // 0..1
      sizes[i] = 6 + depth * 22 + Math.random() * 6;

      phase[i] = Math.random() * Math.PI * 2;
      speed[i] = 0.08 + Math.random() * 0.22;
      amp[i] = 0.6 + Math.random() * 1.8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colorArr, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // ── Shader material: size attenuation + soft sprite + additive ──
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: sprite },
        uOpacity: { value: 0.0 }, // fades in (target lowered)
      },
      vertexShader: /* glsl */ `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTexture;
        uniform float uOpacity;
        varying vec3 vColor;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor, tex.a * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Mouse parallax (smoothed) ───────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onPointer = (e) => {
      const t = e.touches ? e.touches[0] : e;
      mouse.x = (t.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (t.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // ── Resize ──────────────────────────────────────────────────────
    const onResize = () => {
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ──────────────────────────────────────────────
    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;
    const posAttr = geometry.attributes.position;

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);

      const t = clock.getElapsedTime();

      // fade in the whole field
      // lower the visual intensity: reduce max opacity and slow fade
      if (material.uniforms.uOpacity.value < 0.35) {
        material.uniforms.uOpacity.value = Math.min(
          0.35,
          material.uniforms.uOpacity.value + 0.006
        );
      }

      // slow sine float (skip per-particle math if reduced motion)
      if (!prefersReduced) {
        const arr = posAttr.array;
        for (let i = 0; i < count; i++) {
          const ix = i * 3;
          const ph = phase[i] + t * speed[i];
          arr[ix] = base[ix] + Math.sin(ph) * amp[i];
          arr[ix + 1] = base[ix + 1] + Math.cos(ph * 0.8) * amp[i] * 0.7;
          arr[ix + 2] = base[ix + 2] + Math.sin(ph * 0.5) * amp[i] * 0.5;
        }
        posAttr.needsUpdate = true;
        points.rotation.y = Math.sin(t * 0.05) * 0.08;
      }

      // smoothed parallax
      target.x += (mouse.x - target.x) * 0.04;
      target.y += (mouse.y - target.y) * 0.04;
      camera.position.x = target.x * 3.2;
      camera.position.y = -target.y * 2.2;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    tick();

    // pause when tab hidden (saves battery + GPU)
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        clock.getDelta();
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // pause when the hero is scrolled out of view (don't render behind content)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === "visible") {
          if (!running) {
            running = true;
            clock.getDelta();
            tick();
          }
        } else {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.02 }
    );
    io.observe(mount);

    // ── Cleanup / dispose ───────────────────────────────────────────
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      material.dispose();
      sprite.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [count, colors]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import siteConfig from "@/lib/siteConfig";
import styles from "./Nav.module.css";

export default function Nav() {
  const { brand, nav } = siteConfig;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navSolid : ""}`}>
      <a href="#top" className={styles.brand} onClick={toTop} aria-label="Back to top">
        <span className={styles.brandMark}>{brand}</span>
      </a>

      <nav className={styles.links} aria-label="Primary">
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={styles.link}
            onClick={(e) => handleClick(e, item.href)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

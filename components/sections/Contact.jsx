import siteConfig from "@/lib/siteConfig";
import Reveal from "@/components/common/Reveal";
import styles from "./Contact.module.css";

export default function Contact() {
  const { kicker, heading, copy, email, socials } = siteConfig.contact;
  const year = new Date().getFullYear();

  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>
        <Reveal as="p" className={styles.kicker}>
          {kicker}
        </Reveal>

        <Reveal as="h2" className={styles.heading} delay={0.05}>
          {heading}
        </Reveal>

        <Reveal as="p" className={styles.copy} delay={0.1}>
          {copy}
        </Reveal>

        <Reveal delay={0.15}>
          <a className={styles.email} href={`mailto:${email}`}>
            <span>{email}</span>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </Reveal>

        <footer className={styles.footer}>
          <span className={styles.copyright}>
            © {year} {siteConfig.firstName} {siteConfig.lastName}. Crafted with care.
          </span>
          <nav className={styles.socials} aria-label="Social links">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className={styles.social}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </footer>
      </div>
    </section>
  );
}

import siteConfig from "@/lib/siteConfig";
import Reveal from "@/components/common/Reveal";
import styles from "./Work.module.css";

export default function Work() {
  const { kicker, heading, projects } = siteConfig.work;

  return (
    <section className={styles.section} id="work">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Reveal as="p" className={styles.kicker}>
            {kicker}
          </Reveal>
          <Reveal as="h2" className={styles.heading} delay={0.05}>
            {heading}
          </Reveal>
        </div>

        <div className={styles.grid}>
          {projects.map((p, i) => (
            <Reveal
              as="article"
              className={styles.card}
              key={p.title}
              delay={(i % 2) * 0.08}
              style={{ "--accent": p.accent }}
            >
              <div className={styles.cardTop}>
                <span className={styles.cardCat}>{p.category}</span>
                <span className={styles.cardYear}>{p.year}</span>
              </div>

              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardCopy}>{p.description}</p>

              <div className={styles.tags}>
                {p.tags.map((t) => (
                  <span className={styles.tag} key={t}>
                    {t}
                  </span>
                ))}
              </div>

              <span className={styles.glow} aria-hidden="true" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

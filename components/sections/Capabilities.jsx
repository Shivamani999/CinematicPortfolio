import siteConfig from "@/lib/siteConfig";
import styles from "./Capabilities.module.css";

export default function Capabilities() {
  const items = siteConfig.capabilities;
  // Duplicate for a seamless marquee loop.
  const track = [...items, ...items];

  return (
    <section className={styles.section} aria-label="Capabilities">
      <div className={styles.marquee}>
        <div className={styles.track}>
          {track.map((item, i) => (
            <span className={styles.item} key={i}>
              {item}
              <span className={styles.dot} aria-hidden="true">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

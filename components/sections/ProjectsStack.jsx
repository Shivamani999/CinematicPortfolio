"use client";

import { useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ProjectsStack.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DEFAULT_PROJECTS = [
  {
    title: "About · Profile",
    role: "Profile",
    description:
      "Senior Automation Engineer focused on scalable test frameworks, CI/CD integration, and reliable quality delivery for modern product teams.",
    tags: ["Quality Strategy"],
    image: "/Users/shivasuriyakonam/Downloads/CinematicPortfolio/public/chatgpt-profile.png",
  },
  {
    title: "About · Skills",
    role: "Core skills",
    description:
      "Experienced across Python, Selenium, Playwright, Appium, REST Assured, Jenkins, BrowserStack, and AI-assisted testing workflows.",
    tags: ["Python", "Playwright", "Appium", "Generative AI"],
    sections: [
      {
        heading: "Languages",
        items: ["Java", "Python", "Javascript"],
      },
      {
        heading: "AI & Next-Gen Testing",
        items: [
          "Generative AI tools (Copilot, Claude Code, AiDE)",
          "AI-Driven Test Automation",
          "Automated Script Generation",
          "Prompt Engineering for QA",
        ],
      },
      {
        heading: "Automation & Testing",
        items: ["Selenium WebDriver", "Appium (Android/iOS)", "Playwright", "RESTAssured"],
      },
      {
        heading: "Frameworks & Tools",
        items: ["Page Object Model", "Data-Driven", "Hybrid frameworks", "BDD/Cucumber", "RAFT (BOA proprietary)"],
      },
      {
        heading: "DevOps/Version Control",
        items: ["CI/CD (Jenkins)", "Git", "Bitbucket", "Maven"],
      },
      {
        heading: "Databases & Protocols",
        items: ["MySQL"],
      },
      {
        heading: "Methodologies",
        items: ["Agile/Scrum", "SDLC", "STLC", "DLC (Defect Lifecycle)"],
      },
      {
        heading: "Tools",
        items: ["Jira", "ALM", "Eclipse", "VS Code", "Pycharm", "Android Studio", "XCode"],
      },
    ],
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "About · Projects",
    role: "Selected projects",
    description:
      "Built enterprise automation systems, cross-platform mobile test suites, and AI-assisted QA solutions that reduced regression effort and accelerated delivery.",
    tags: ["Enterprise Framework", "Mobile Automation", "AI QA"],
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function ProjectsStack({ projects = DEFAULT_PROJECTS, id, eyebrow = "Featured work", heading = "Selected projects" }) {
  const wrapperRef = useRef(null);
  const headerRef = useRef(null);
  const cardRefs = useRef([]);
  const [stackHeight, setStackHeight] = useState(0);
  const CARD_GAP = 36;
  cardRefs.current = [];

  const addCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const cards = cardRefs.current;
    const totalCards = projects.length;

    if (!wrapper || cards.length === 0) return;

    const maxCardHeight = Math.max(...cards.map((card) => card.offsetHeight));
    // enforce equal heights for all cards so the stacked animation is visually consistent
    cards.forEach((card) => {
      card.style.height = `${maxCardHeight}px`;
    });
    const stackHeightValue = maxCardHeight + CARD_GAP * (totalCards - 1);
    wrapper.style.height = `${stackHeightValue}px`;
    setStackHeight(stackHeightValue);

    const ctx = gsap.context(() => {
      gsap.set(cards[0], { yPercent: 0, scale: 1 });
      for (let i = 1; i < totalCards; i++) {
        gsap.set(cards[i], { yPercent: 100, scale: 1 });
      }

      const tl = gsap.timeline({ defaults: { ease: "none", duration: 1 } });

      for (let i = 1; i < totalCards; i++) {
        const prevTargetScale = 1 - (totalCards - 1 - (i - 1)) * 0.03;
        const position = i - 1;
        tl.to(cards[i], { yPercent: 0 }, position).to(cards[i - 1], { scale: prevTargetScale }, position);
      }

      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: () => `+=${stackHeightValue}`,
        pin: true,
        scrub: 1,
        animation: tl,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      });
    }, wrapper);

    return () => ctx.revert();
  }, [projects]);

  return (
    <section id={id} className={styles.section} aria-label="Selected work">
      <div ref={headerRef} className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h3 className={styles.heading}>{heading}</h3>
      </div>

      <div ref={wrapperRef} className={styles.stack} style={{ height: stackHeight ? `${stackHeight}px` : "auto" }}>
        {projects.map((project, index) => {
          const simplifiedTitle = project.title && project.title.includes("·") ? project.title.split("·").pop().trim() : project.title;
          return (
          <article
            key={project.title + index}
            ref={addCardRef}
            style={{ top: `${index * CARD_GAP}px`, zIndex: index }}
            className={styles.card}
          >
            <div className={styles.cardContent}>
              <div className={styles.cardTop}>
                <div>
                  <p className={styles.role}>{project.role}</p>
                  <h4 className={styles.title}>{simplifiedTitle}</h4>
                </div>
                <span className={styles.counter}>
                  {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                </span>
              </div>
            
              <div>
                <p className={styles.description}>{project.description}</p>
                {index === 0 && (
                  <div className={styles.profileSummary}>
                    <h4 className={styles.profileSummaryHeading}>Profile Summary</h4>
                    <p>
                      Senior Automation Engineer with <strong>4+ years of experience</strong> specializing in Python-based test
                      automation, Quality Engineering, and AI-driven testing strategies. Proven expertise in leveraging <strong>Generative AI</strong>
                      to accelerate test script development, optimize automation frameworks, improve code quality, and enhance testing
                      efficiency. Adept at building scalable automation frameworks from scratch using <strong>Appium, RestAssured, Selenium, and Playwright</strong>,
                      with strong experience in API, UI, mobile, cross-browser, and cross-device testing.
                    </p>
                    <p>
                      Experienced in <strong>CI/CD integration with Jenkins, BrowserStack, test framework architecture, automation strategy,
                      and quality engineering practices</strong>, delivering reliable and maintainable automation solutions. Strong interest in applying AI
                      to modernize software testing and reduce repetitive engineering effort.
                    </p>
                    <p>
                      Beyond engineering, I am also an <strong>Instagram Content Creator</strong>, creating technology-focused and professional content
                      around <strong>Python, AI, automation, software testing, and engineering</strong>, while building a personal brand and engaging with
                      the developer community.
                    </p>
                  </div>
                )}
                {project.sections?.length > 0 && (
                  <div className={styles.skillSections}>
                    {project.sections.map((section) => (
                      <div key={section.heading} className={styles.skillGroup}>
                        <h4 className={styles.skillGroupHeading}>{section.heading}</h4>
                        <div className={styles.skillList}>
                          {section.items.map((item) => (
                            <span key={item} className={styles.skillItem}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {index === 0 && project.image && (
                  <div className={styles.cardMedia}>
                    <img
                      src={project.image}
                      alt={`${project.title} preview`}
                      className={styles.cardImage}
                    />
                  </div>
                )}
                <div className={styles.tags}>
                  {project.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}

import siteConfig from "@/lib/siteConfig";
import ProjectsStack from "./ProjectsStack";
import styles from "./About.module.css";

export default function About() {
  const aboutCards = [
    {
      title: "About · Profile",
      role: "Profile",
      description: `${siteConfig.firstName} ${siteConfig.lastName} is a ${siteConfig.role.toLowerCase()} focused on building resilient automation frameworks, integrating CI/CD, and improving test quality with modern tooling and AI-assisted workflows.`,
      tags: [],
    },
    {
      title: "About · Skills",
      role: "Core skills",
      description: "Specializes in Python, Selenium, Playwright, Appium, REST Assured, Jenkins, BrowserStack, and Generative AI workflows for faster, more reliable test development.",
      tags: siteConfig.stack.slice(0, 6),
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
      ],
    },
    {
      title: "About · Projects",
      role: "Selected projects",
      description: "Includes enterprise automation framework design, cross-platform mobile automation, and AI-assisted QA initiatives that reduced regression effort and accelerated delivery cycles.",
      tags: ["Enterprise Framework", "Mobile Automation", "AI QA"],
    },
  ];

  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <ProjectsStack
          id="about-projects"
          eyebrow=""
          heading="About"
          projects={aboutCards}
        />
      </div>
    </section>
  );
}

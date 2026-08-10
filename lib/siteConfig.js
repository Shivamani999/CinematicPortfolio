// ──────────────────────────────────────────────────────────────
// Edit everything about the site here. No need to touch the components.
// ──────────────────────────────────────────────────────────────
export const siteConfig = {
  // Brand / monogram shown in the nav
  brand: "KS",

  // Nav anchor links
  nav: [
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],

  // ── Hero ──────────────────────────────────────────────────────
  // Small status badge (top of the hero) — set to "" to hide it.
  badge: "Open to work",

  firstName: "Konam",
  lastName: "Shivamani",

  // Big name shown in the hero (defaults to firstName if empty)
  heroName: "Konam Shivamani",

  role: "Senior Automation Engineer · Test Automation & AI-driven QA",

  // Tech chips under the role
  stack: [
    "Java",
    "Python",
    "JavaScript",
    "Selenium",
    "Appium",
    "Playwright",
    "Jenkins",
    "BrowserStack",
    "REST Assured",
  ],

  // Hero action buttons
  actions: {
    projects: { label: "View Projects", href: "#work" },
    github: { label: "GitHub", href: "https://github.com/Shivamani999" },
  },

  video: {
    src: "/hero.mp4",
    poster: "",
  },

  particles: {
    colors: ["#ff8a3d", "#ffb066", "#ffffff", "#ffd9a0"],
    count: 90,
  },

  // ── About ─────────────────────────────────────────────────────
  about: {
    kicker: "About",
    // Large statement; words wrapped in *asterisks* render as warm accent.
    statement:
      "Senior Automation Engineer specializing in Python-based test automation and AI-driven testing strategies. I architect scalable automation frameworks and integrate CI/CD to deliver reliable, fast feedback loops.",
    paragraphs: [
      "I design and maintain end-to-end automation frameworks for web and mobile using Python, Selenium, Appium, Playwright, and REST Assured. I focus on reliability, maintainability, and reducing manual regression effort.",
      "I leverage Generative AI and Copilot to accelerate script generation, debugging, and framework optimization, improving productivity and reducing turnaround time for test development.",
    ],
    stats: [
      { value: "4+", label: "Years in Automation" },
      { value: "40%", label: "Productivity gain (AI-assisted)" },
      { value: "20+", label: "Device/browser combos tested" },
    ],
  },

  // ── Capabilities (marquee) ────────────────────────────────────
  capabilities: [
    "Test Automation",
    "AI-Driven Testing",
    "Appium (Android/iOS)",
    "Selenium WebDriver",
    "Playwright",
    "REST API Testing",
    "CI/CD (Jenkins)",
    "Cross-browser / Cross-device",
  ],

  // ── Work ──────────────────────────────────────────────────────
  work: {
    kicker: "Selected Work",
    heading: "Things I've made with care",
    projects: [
      {
        title: "Enterprise Automation Framework",
        category: "Automation Framework",
        year: "2025",
        description:
          "Architected and maintained a scalable automation framework for web and mobile, using Python, Selenium, Playwright, and Appium; integrated with Jenkins for CI-driven test runs.",
        tags: ["Python", "Selenium", "Playwright", "Appium", "Jenkins"],
        accent: "#ff8a3d",
      },
      {
        title: "Cross-Platform Mobile Automation",
        category: "Mobile Automation",
        year: "2025",
        description:
          "Built cross-platform mobile automation on Appium for Android and iOS, executed across BrowserStack real devices, and automated complex gestures and native interactions.",
        tags: ["Appium", "BrowserStack", "Android", "iOS"],
        accent: "#5b8cff",
      },
      {
        title: "AI-Assisted Test Generator",
        category: "AI Tooling",
        year: "2025",
        description:
          "Integrated Generative AI and Copilot into the QA workflow to accelerate test script generation, debugging, and framework optimization, reducing development turnaround time.",
        tags: ["Generative AI", "Copilot", "AiDE", "Prompt Engineering"],
        accent: "#ffd9a0",
      },
      {
        title: "Retirement Banking Test Suite",
        category: "Enterprise QA",
        year: "2024",
        description:
          "Engineered an end-to-end automated test suite (BDD/Gherkin + RAFT) for retirement banking workflows, significantly reducing regression execution time and flaky failures.",
        tags: ["BDD", "REST Assured", "Gherkin", "Java"],
        accent: "#9be7c4",
      },
    ],
  },

  // ── Contact ───────────────────────────────────────────────────
  contact: {
    kicker: "Contact",
    heading: "Let's build reliable test automation.",
    copy: "Available for full-time and contract roles. I focus on scalable, maintainable automation and AI-assisted testing.",
    email: "shivasuriyakonam@gmail.com",
    phone: "+91 9640362009",
    socials: [
      { label: "GitHub", href: "https://github.com/Shivamani999" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/smk99/" },
      { label: "YouTube", href: "https://www.youtube.com/@Shivasuriya_vlogs" },
      { label: "Instagram", href: "https://www.instagram.com/automationwithclarity" },
    ],
  },
};

export default siteConfig;

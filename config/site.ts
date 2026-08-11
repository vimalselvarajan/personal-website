export type InternalNavItem = {
  label: string;
  href: `/${string}` | "/";
  external: false;
};

export type ExternalNavItem = {
  label: string;
  href: `https://${string}`;
  external: true;
};

export type NavItem = InternalNavItem | ExternalNavItem;

const portfolioUrl = "https://vimalselvarajan.github.io/Personal-Website";

export const siteConfig = {
  name: "Vimal Selvarajan",
  initials: "VS",
  role: "Computer Science Student & Undergraduate Researcher",
  headline: "Computer architecture, secure systems, and computational genomics.",
  introduction:
    "A UC Riverside researcher working across microarchitecture simulation, secure processing-in-memory systems, computational genomics, and hardware-control software.",
  bio: "I am a computer science student and undergraduate researcher at the University of California, Riverside. My work spans microarchitecture simulation, secure processing-in-memory systems, computational genomics, embedded hardware, and test automation.",
  university: "University of California, Riverside",
  degree: "B.S. Computer Science with Business Applications",
  links: {
    github: "https://github.com/vimalselvarajan",
    linkedin: "https://www.linkedin.com/in/vimal-selvarajan/",
    email: "mailto:vimalselvarajan@gmail.com",
    resume: "/resume",
    site: `${portfolioUrl}/`,
  },
  metadata: {
    title: "Vimal Selvarajan — Research & Engineering Portfolio",
    description:
      "Vimal Selvarajan's work in computer architecture, secure systems, computational genomics, embedded hardware, and software engineering at UC Riverside.",
    baseUrl: portfolioUrl,
  },
  featured: {
    projectSlug: "12v-to-3v3-buck-converter",
    researchSlug: "optimal-read-selection",
  },
  nav: [
    { label: "Home", href: "/", external: false },
    { label: "Projects", href: "/projects", external: false },
    { label: "Research", href: "/research", external: false },
    { label: "About", href: "/about", external: false },
    { label: "Résumé", href: "/resume", external: false },
  ] satisfies NavItem[],
} as const;

export function absoluteUrl(path = "") {
  return `${siteConfig.metadata.baseUrl}${path}`;
}

export type SiteConfig = typeof siteConfig;

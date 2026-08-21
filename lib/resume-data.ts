import type { Route } from "next";

export type EducationEntry = {
  degree: string;
  school: string;
  dates: string;
  planned?: boolean;
};

export type ExperienceId = "brisk-lab" | "sadredini-lab" | "lonardi-lab" | "hastest" | "highlander-racing";

export type ResumeDomain =
  | "Computer architecture"
  | "Secure systems"
  | "Computational genomics"
  | "Hardware automation"
  | "Embedded systems & firmware";

export type RelatedWorkLink = {
  label: string;
  href: Route<`/research/${string}`>;
};

export type ExperienceRole = {
  role: string;
  dates: string;
  highlights: readonly string[];
};

type ExperienceBase = {
  id: ExperienceId;
  shortLabel: string;
  organization: string;
  organizationHref?: string;
  location: string;
  dates: string;
  kind: "research" | "industry";
  domains: readonly ResumeDomain[];
  technologies: readonly string[];
  relatedWork?: RelatedWorkLink;
};

type SingleRoleExperience = ExperienceBase & {
  role: string;
  highlights: readonly string[];
  roles?: never;
};

type MultiRoleExperience = ExperienceBase & {
  roles: readonly ExperienceRole[];
  role?: never;
  highlights?: never;
};

export type ExperienceEntry = SingleRoleExperience | MultiRoleExperience;

export type SkillGroup = {
  category: string;
  items: readonly string[];
  evidence: readonly ExperienceId[];
};

export const resumeData = {
  contact: {
    phone: "+1 (510) 598-5492",
    phoneHref: "tel:+15105985492",
    email: "vimalselvarajan@gmail.com",
    emailHref: "mailto:vimalselvarajan@gmail.com",
  },
  education: [
    {
      degree: "B.S. in Computer Science with Business Applications",
      school: "University of California, Riverside",
      dates: "September 2022 – June 2027",
    },
    {
      degree: "M.S. in Electrical Engineering",
      school: "University of California, Riverside",
      dates: "September 2027 – June 2029",
      planned: true,
    },
  ] satisfies EducationEntry[],
  experience: [
    {
      id: "brisk-lab",
      shortLabel: "Brisk Lab",
      organization: "Brisk Lab, University of California, Riverside",
      role: "Undergraduate Student Researcher — Computer Architecture",
      location: "Riverside, CA",
      dates: "June 2026 – Present",
      kind: "research",
      domains: ["Computer architecture"],
      technologies: ["C/C++", "Intel XED", "Intel Simics", "MacSim", "Python"],
      relatedWork: {
        label: "Explore adaptive cache warming",
        href: "/research/adaptive-cache-warming",
      },
      highlights: [
        "Researched and documented an Intel Simics and MacSim integration pipeline using C/C++, Intel XED, and Python for multicore instruction tracing, binary trace generation, and sampled warm-up and detail execution.",
        "Formulated an Adaptive Cache Warming strategy for MacSim using LLC cold-set tracking and optimistic and pessimistic IPC bounds to reduce simulation warm-up overhead.",
        "Developed reproducible workflows for cycle-level microarchitecture experiments, including trace compatibility checks, simulator configuration, CPI and IPC analysis, and validation of checkpoints and sampled results.",
      ],
    },
    {
      id: "sadredini-lab",
      shortLabel: "Sadredini Lab",
      organization: "Sadredini Lab, University of California, Riverside",
      role: "Undergraduate Student Researcher — Computer Architecture",
      location: "Riverside, CA",
      dates: "April 2026 – Present",
      kind: "research",
      domains: ["Computer architecture", "Secure systems"],
      technologies: ["Processing-in-Memory", "Multi-Party Computation", "UPMEM"],
      relatedWork: {
        label: "Explore secure processing-in-memory",
        href: "/research/secure-processing-in-memory",
      },
      highlights: [
        "Conducted research on secure processing-in-memory systems, studying MPC techniques such as arithmetic secret sharing and garbled circuits for secure computation on untrusted hardware.",
        "Analyzed security and performance trade-offs in PIM architectures, including off-chip data exposure, integrity risks, and CPU bottlenecks in secure-computing protocols.",
        "Developed early research ideas for improving secure PIM, exploring workload partitioning and precomputation strategies for UPMEM-style accelerators.",
      ],
    },
    {
      id: "lonardi-lab",
      shortLabel: "Lonardi Lab",
      organization: "Lonardi Lab, University of California, Riverside",
      role: "Undergraduate Student Researcher — Computational Biology and Bioinformatics",
      location: "Riverside, CA",
      dates: "June 2025 – Present",
      kind: "research",
      domains: ["Computational genomics"],
      technologies: ["Python", "Jellyfish", "Minimap2", "BWA", "Samtools", "Hifiasm"],
      relatedWork: {
        label: "Explore MTP Lite research",
        href: "/research/optimal-read-selection",
      },
      highlights: [
        "Conduct research on computational genomics under the supervision of Dr. Stefano Lonardi, focusing on genome assembly optimization and k-mer-based read selection methods.",
        "Optimized AWinK into MTP Lite, decreasing genome assembly fragmentation by 91% without loss in accuracy (99.9% genome fraction and 99.9% sequence identity).",
        "Use Jellyfish, Minimap2, BWA, Samtools, Pysam, Hifiasm, and Seqkit for read analysis, alignment, and assembly evaluation.",
      ],
    },
    {
      id: "hastest",
      shortLabel: "Hastest",
      organization: "Hastest Solutions, Inc.",
      role: "Software Engineer Intern",
      location: "San Jose, CA",
      dates: "June 2024 – August 2024",
      kind: "industry",
      domains: ["Hardware automation"],
      technologies: ["Python", "FTDI", "SPI", "Keysight DAQ970A", "PyVISA"],
      highlights: [
        "Developed an automated 1,000-hour HTOL validation platform for RF amplifier modules, collecting performance and reliability data across 48 units.",
        "Built Python hardware-control software integrating FTDI/SPI DACs, Keysight DAQ970A instrumentation, and programmable power supplies to automate sequencing, gate-bias regulation, drain-current monitoring, and CSV logging.",
        "Partnered with customers and hardware engineers to translate test requirements into DAC and current-sense PCBA fixtures, then brought up and operated the end-to-end test station.",
      ],
    },
    {
      id: "highlander-racing",
      shortLabel: "Highlander Racing",
      organization: "Highlander Racing",
      organizationHref: "https://www.linkedin.com/company/27106311/",
      location: "Riverside, CA",
      dates: "August 2023 – June 2024",
      kind: "industry",
      domains: ["Embedded systems & firmware"],
      technologies: ["C", "STM32F405", "STM32CubeIDE", "Altium Designer", "CAN bus", "JTAG"],
      roles: [
        {
          role: "Associate Firmware Engineer",
          dates: "January 2024 – June 2024",
          highlights: [
            "Designed a PCB interface linking an STM32F-series development board to an AMOLED display for the second-generation driver dashboard.",
            "Designed and optimized multi-layer driver-dashboard PCB layouts in Altium Designer, prioritizing component placement and high-speed signal integrity.",
            "Produced detailed schematics and manufacturing documentation to align the engineering and production teams.",
            "Integrated CAN bus communication for real-time vehicle data transmission and fault detection.",
            "Developed and debugged STM32F405RGT ADC firmware using STM32CubeIDE and JTAG, improving signal accuracy and system reliability.",
          ],
        },
        {
          role: "Firmware Intern",
          dates: "August 2023 – December 2023",
          highlights: [
            "Built foundational skills in STM32CubeIDE, low-level C programming, Altium Designer, and PCB design principles.",
          ],
        },
      ],
    },
  ] satisfies ExperienceEntry[],
  skills: [
    {
      category: "Languages",
      items: ["Python", "C/C++", "TypeScript", "Java", "SQL", "Bash", "Verilog", "Assembly"],
      evidence: ["brisk-lab", "lonardi-lab", "hastest", "highlander-racing"],
    },
    {
      category: "Web & databases",
      items: ["React Native", "Next.js", "Node.js", "Web APIs", "Microsoft SQL Server", "Database indexing"],
      evidence: [],
    },
    {
      category: "Systems & hardware",
      items: ["SPI", "I2C", "USB", "TCP/IP", "GPIB", "FTDI", "Linux/Unix", "Altium Designer", "STM32", "CAN bus", "PCB design", "SolidWorks"],
      evidence: ["hastest", "highlander-racing"],
    },
    {
      category: "Computer architecture",
      items: ["Intel XED", "gem5", "Intel Simics", "Cache and multicore architecture", "Microarchitecture simulation", "In-memory processing", "Multi-party computation"],
      evidence: ["brisk-lab", "sadredini-lab"],
    },
    {
      category: "Bioinformatics",
      items: ["Biopython", "NGS processing", "Genome assembly", "BWA", "Jellyfish", "Samtools", "Hifiasm", "Seqkit"],
      evidence: ["lonardi-lab"],
    },
    {
      category: "Developer tools",
      items: ["Git", "CMake", "Make", "GCC", "GDB", "STM32CubeIDE", "PlatformIO", "pytest"],
      evidence: ["brisk-lab", "lonardi-lab", "hastest", "highlander-racing"],
    },
  ] satisfies SkillGroup[],
  presentation: {
    title: "Genome Assembly Optimization Using k-mer-Based Read Selection",
    href: "https://lnkd.in/p/gm5TMYcZ",
    date: "April 2026",
    event: "CRA UR2PhD Undergraduate Mentoring Workshop & Research Showcase",
    location: "New Orleans, LA",
    role: "Selected Presenter",
  },
} as const;

export const researchExperience = resumeData.experience.filter((experience) => experience.kind === "research");

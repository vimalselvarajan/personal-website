export type EducationEntry = {
  degree: string;
  school: string;
  dates: string;
  planned?: boolean;
};

export type ExperienceEntry = {
  organization: string;
  role: string;
  location: string;
  dates: string;
  highlights: readonly string[];
};

export type ResumeProject = ExperienceEntry & {
  title: string;
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
      organization: "Brisk Lab, University of California, Riverside",
      role: "Undergraduate Student Researcher — Computer Architecture",
      location: "Riverside, CA",
      dates: "June 2026 – Present",
      highlights: [
        "Researched and documented an Intel Simics and MacSim integration pipeline using C/C++, Intel XED, and Python for multicore instruction tracing, binary trace generation, and sampled warm-up and detail execution.",
        "Formulated an Adaptive Cache Warming strategy for MacSim using LLC cold-set tracking and optimistic and pessimistic IPC bounds to reduce simulation warm-up overhead.",
        "Developed reproducible workflows for cycle-level microarchitecture experiments, including trace compatibility checks, simulator configuration, CPI and IPC analysis, and validation of checkpoints and sampled results.",
      ],
    },
    {
      organization: "Sadredini Lab, University of California, Riverside",
      role: "Undergraduate Student Researcher — Computer Architecture",
      location: "Riverside, CA",
      dates: "April 2026 – Present",
      highlights: [
        "Conducted research on secure processing-in-memory systems, studying MPC techniques such as arithmetic secret sharing and garbled circuits for secure computation on untrusted hardware.",
        "Analyzed security and performance trade-offs in PIM architectures, including off-chip data exposure, integrity risks, and CPU bottlenecks in secure-computing protocols.",
        "Developed early research ideas for improving secure PIM, exploring workload partitioning and precomputation strategies for UPMEM-style accelerators.",
      ],
    },
    {
      organization: "Lonardi Lab, University of California, Riverside",
      role: "Undergraduate Student Researcher — Computational Biology and Bioinformatics",
      location: "Riverside, CA",
      dates: "June 2025 – Present",
      highlights: [
        "Conduct research on computational genomics under the supervision of Dr. Stefano Lonardi, focusing on genome assembly optimization and k-mer-based read selection methods.",
        "Optimized AWinK into MTP Lite, decreasing genome assembly fragmentation by 91% without loss in accuracy (99.9% genome fraction and 99.9% sequence identity).",
        "Use Jellyfish, Minimap2, BWA, Samtools, Pysam, Hifiasm, and Seqkit for read analysis, alignment, and assembly evaluation.",
      ],
    },
    {
      organization: "Hastest Solutions, Inc.",
      role: "Software Engineer Intern",
      location: "San Jose, CA",
      dates: "June 2024 – August 2024",
      highlights: [
        "Developed an automated 1,000-hour HTOL validation platform for RF amplifier modules, collecting performance and reliability data across 48 units.",
        "Built Python hardware-control software integrating FTDI/SPI DACs, Keysight DAQ970A instrumentation, and programmable power supplies to automate sequencing, gate-bias regulation, drain-current monitoring, and CSV logging.",
        "Partnered with customers and hardware engineers to translate test requirements into DAC and current-sense PCBA fixtures, then brought up and operated the end-to-end test station.",
      ],
    },
  ] satisfies ExperienceEntry[],
  projects: [
    {
      title: "MTP Lite: Proprietary Long-Read Genome Assembly Pipeline",
      organization: "Lonardi Lab, University of California, Riverside",
      role: "Undergraduate Student Researcher — Computational Biology and Bioinformatics",
      location: "Riverside, CA",
      dates: "June 2025 – Present",
      highlights: [
        "Designed and developed an internal bioinformatics tool for selecting informative long reads for targeted genome assembly.",
        "Implemented scalable read selection, overlap analysis, and assembly-preparation workflows using Python, NumPy, Bash, and Linux tools.",
        "Substantially reduced sequencing input while maintaining high-quality target-region assembly in internal benchmarks. Technical details, benchmark data, and source code are confidential to Lonardi Lab.",
      ],
    },
    {
      title: "Hastest DAC, DAQ, and Power Supply Control Suite",
      organization: "Hastest Solutions, Inc.",
      role: "Software Engineer Intern",
      location: "San Jose, CA",
      dates: "June 2024 – August 2024",
      highlights: [
        "Designed a five-layer FTDI MPSSE stack enabling register-level bit-field access for a 16-channel DAC/ADC.",
        "Built a full-duplex SPI driver over FTDI MPSSE with configurable chip select, three- and four-wire modes, and dual-port support.",
        "Developed a VISA driver library and test orchestration for DAQ and Keysight power supplies, including binary-search voltage control.",
      ],
    },
  ] satisfies ResumeProject[],
  skills: [
    { category: "Languages", items: ["Python", "C/C++", "TypeScript", "Java", "SQL", "Bash", "Verilog", "Assembly"] },
    { category: "Web & databases", items: ["React Native", "Next.js", "Node.js", "Web APIs", "Microsoft SQL Server", "Database indexing"] },
    { category: "Systems & hardware", items: ["SPI", "I2C", "USB", "TCP/IP", "GPIB", "FTDI", "Linux/Unix", "Altium", "SolidWorks"] },
    { category: "Computer architecture", items: ["Intel XED", "gem5", "Intel Simics", "Cache and multicore architecture", "Microarchitecture simulation", "In-memory processing", "Multi-party computation"] },
    { category: "Bioinformatics", items: ["Biopython", "NGS processing", "Genome assembly", "BWA", "Jellyfish", "Samtools", "Hifiasm", "Seqkit"] },
    { category: "Developer tools", items: ["Git", "CMake", "Make", "GCC", "GDB", "STM32CubeIDE", "PlatformIO", "pytest"] },
  ],
  presentation: {
    title: "Genome Assembly Optimization Using k-mer-Based Read Selection",
    date: "April 2026",
    event: "CRA UR2PhD Undergraduate Mentoring Workshop & Research Showcase",
    location: "New Orleans, LA",
    role: "Selected Presenter",
  },
} as const;

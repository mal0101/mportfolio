export interface Experience {
  role: string
  company: string
  period: string
  location: string
  /** Sort key only (YYYY-MM), derived from `period`. */
  start: string
  /** Shown as the entry's kind label in its chapter. */
  type: "internship" | "freelance"
  highlights: string[]
}

export interface Project {
  title: string
  tags: string[]
  description: string
  badge?: string
  paper?: string
  link?: string
}

export interface Hackathon {
  placement: string
  name: string
  project: string
  detail: string
  organizers: string
  /** Sort key only (YYYY-MM). */
  start: string
}

export interface Education {
  degree: string
  school: string
  period: string
  /** Sort key only (YYYY-MM). */
  start: string
  details: string[]
}

export interface SkillCategory {
  category: string
  skills: string[]
}

export interface Leadership {
  role: string
  organization: string
  period: string
  /** Sort key only (YYYY-MM). */
  start: string
  description?: string
}

export interface Venture {
  name: string
  legalName: string
  url: string
  role: string
  cofounder: string
  period: string
  tagline: string
  summary: string
  principles: { title: string; text: string }[]
  logos?: {
    name: string
    src: string
    alt: string
    href: string
    group: "backed" | "member"
    width: number // intrinsic px
    height: number // intrinsic px
    display: number // CSS height in px
  }[]
  source: string
  retrieved: string
}

export interface Paragraph {
  text: string
  strong?: string
}

// ── Axon Security ────────────────────────────────────────────────────────────
// All company copy below is verbatim from https://axonsecurity.tech (retrieved 2026-10-22).
export const venture: Venture = {
  name: "Axon Security", // [U]
  legalName: "Axon Security, Inc.", // [AX]
  url: "https://axonsecurity.tech",
  role: "Co-founder & co-CEO", // [U] confirmed by Malak 2026-10-22 (LinkedIn title: "Co-Founder")
  cofounder: "Hany El Atlassi", // [U]
  period: "Aug 2026 – Present", // [LI] "Aug 2026 - Present"
  tagline: "Agent security for the AI stack you already run.",
  summary:
    "Axon discovers every agent in your stack — who it acts for, what it can reach, where it runs — and judges the paths that matter.",
  principles: [
    { title: "Read-only", text: "Axon reads. It never writes. Nothing in your stack changes so that we can see it." },
    {
      title: "Metadata only",
      text: "Never a prompt, an argument, a secret, a path or an email. Content-shaped fields are rejected by construction.",
    },
    {
      title: "Inbound only",
      text: "Signed detection content comes in, verified offline. Nothing travels the other way.",
    },
  ],
  // Partner strip: labels, alts and links verbatim from https://axonsecurity.tech (retrieved 2026-10-29).
  // Artwork: E2B https://e2b.dev/brand, Hack-Nation https://hack-nation.ai/branding, Anthropic press kit (ivory wordmark);
  // AWS has no official SVG, so the PNG stays.
  // CONFIRM(malak): partner logos on personal site
  logos: [
    {
      name: "HackNation",
      src: "/partners/hacknation.svg",
      alt: "HackNation Venture Lab",
      href: "https://ventures.hack-nation.ai/",
      group: "backed",
      width: 481,
      height: 139,
      display: 32,
    },
    {
      name: "AWS",
      src: "/partners/aws-startups.png",
      alt: "AWS for Startups",
      href: "https://aws.amazon.com/startups/",
      group: "backed",
      width: 806,
      height: 218,
      display: 28,
    },
    {
      name: "E2B",
      src: "/partners/e2b.svg",
      alt: "E2B for Startups",
      href: "https://e2b.dev/startups/",
      group: "backed",
      width: 134,
      height: 60,
      display: 36, // viewBox has ~50% vertical padding; the glyph renders ~18px
    },
    {
      name: "Anthropic",
      src: "/partners/anthropic.svg",
      alt: "Anthropic Cyber Verification Program",
      href: "https://support.claude.com/en/articles/14604842-real-time-cyber-safeguards-on-claude-opus-and-sonnet",
      group: "member",
      width: 590,
      height: 68,
      display: 14,
    },
  ],

  source: "https://axonsecurity.tech",
  retrieved: "2026-10-22",
}

// Newest first by start date.
export const experiences: Experience[] = [
  {
    role: "AI Product System & PLM Intern", // [V]; CONFIRM(malak): LinkedIn writes "AI Product, System & PLM Intern"
    company: "Capgemini Engineering", // [V]
    period: "Jul – Aug 2026", // [LI] "Jul 2026 - Aug 2026" + [U] ended end of August 2026
    location: "Casablanca", // [V]
    start: "2026-07",
    type: "internship",
    // [U] 2026-10-29, Malak's own wording
    highlights: [
      "Built a Li-ion EV battery SOH estimation pipeline benchmarking 3 classical ML models against 3 DL architectures (LSTM, CNN, Transformer) across 4 cell chemistries",
      "Engineered ICA/DVA physics-informed feature extraction over 2,000+ charge-discharge cycles; targeting ONNX export for BMS deployment",
    ],
  },
  {
    role: "Software Engineering Intern",
    company: "NowEdge",
    period: "Jun – Sep 2025",
    location: "Casablanca",
    start: "2025-06",
    type: "internship",
    highlights: [
      "Built a production multi-tenant RAG chatbot using FAISS vector search, sentence-transformer embeddings, and JWT-based client isolation",
      "Engineered a typosquatting detection model via multi-heuristic domain classification, achieving 80% precision",
      "Architected an LTI 1.3-compliant platform with OAuth2/OpenID Connect",
    ],
  },
  {
    role: "AI Trainer",
    company: "Outlier AI, Alignerr, Prolific",
    // CONFIRM(malak): LinkedIn lists only Alignerr (Jan 2026 – Present) and Prolific (Feb 2026 – Present); repo value kept
    period: "Nov 2024 – Present",
    location: "Remote",
    start: "2024-11",
    type: "freelance", // [LI] "Freelance"
    highlights: [
      "Authored 100+ prompt-response pairs and adversarial test cases for RLHF fine-tuning pipelines across Python, SQL, C, and Java",
    ],
  },
  {
    role: "Engineering Intern", // [LI]
    company: "FIRST4COM", // [LI]
    period: "Jul – Sep 2024", // [LI] "Jul 2024 - Sep 2024"
    location: "On-site", // [LI]
    start: "2024-07",
    type: "internship",
    highlights: [],
  },
]

export const projects: Project[] = [
  {
    title: "SXR — Model Security X-Ray",
    tags: ["Python", "UMAP", "HDBSCAN", "PyTorch"],
    description:
      "5-layer defensive ML security pipeline detecting adversarial threats in serialised model files (.pth, .safetensors, .h5) — covering LSB steganographic payload injection, Pickle RCE exploits, and backdoor attacks.",
    // [U] 2026-10-29; venue verified on iet-smartcities-symposium.com: "The 10th IET International Smart Cities Symposium", 1–3 Dec 2026, University of Bahrain. CONFIRM(malak): SXR ↔ paper link inferred from topic
    badge: "Paper accepted — 10th IET Smart Cities Symposium",
    paper:
      "Spectral Weight Topology Analysis for Execution-Free Integrity Verification of Serialized Machine Learning Models",
  },
  {
    title: "HRL Trading System",
    tags: ["PPO", "SAC", "Stable-Baselines3", "Python"],
    description:
      "3-level Hierarchical Deep RL trading system over SPY, AAPL, and BTC-USD — PPO trend classifier (L1), PPO action agent (L2), SAC position-sizing agent (L3).",
  },
  {
    title: "Aegis — AI Policy Decision-Support",
    tags: ["FastAPI", "ChromaDB", "React", "Vercel"],
    description:
      "AI-powered decision support platform for policymakers. RAG chatbot, case study library of 8 international AI policies, and Impact Simulator predicting social/economic/governance effects.",
    badge: "1st place — AgorAI Hackathon",
    link: "https://aegis-puce.vercel.app",
  },
  {
    title: "JarvisLfla7",
    tags: ["NLP", "Federated Learning", "VLM", "Voice"],
    description:
      "Voice-first AI assistant designed as a personal agronomist for Moroccan farmers. Built during HackAI across NLP, Federated Learning, and VLM challenges.",
    badge: "2nd place — HackAI",
    link: "https://jarvislfla7.vercel.app",
  },
  {
    title: "MediCore", // [LI] spelling (her post and the GitHub repo); was "Medicore" [V]. CONFIRM(malak)
    tags: ["Mistral OCR", "Voice Pipeline", "Python"],
    description:
      "AI clinical safety assistant built on Mistral OCR and a real-time voice pipeline for healthcare professionals.",
    badge: "Top 10 globally — Mistral AI Worldwide Hackathon",
    link: "https://github.com/mar1shell/MediCore",
  },
]

export const hackathons: Hackathon[] = [
  {
    placement: "1st Place",
    name: "AgorAI",
    project: "Aegis — AI Policy Decision-Support Platform",
    detail: "Presented at international AI conference alongside Yann LeCun and Eric Xing",
    organizers: "EMINES / École Polytechnique / EMSI-Honoris",
    // CONFIRM(malak): hackathon month not stated anywhere; sorted by the winners' exhibit (23–25 Mar 2026, [LI])
    start: "2026-03",
  },
  {
    placement: "2nd Place",
    name: "HackAI",
    project: "JarvisLfla7 — Voice-first AI Agronomist",
    detail: "Voice-first AI assistant for Moroccan farmers",
    organizers: "1337AI", // [LI] "HackAI 4.0 (1337AI)"; was "" [V]
    start: "2026-05", // [LI] event poster "14 - 17 MAY", #HACKAI2026
  },
  {
    placement: "Top 10 Globally",
    name: "Mistral AI Worldwide Hackathon",
    project: "MediCore — AI Clinical Safety Assistant", // [V] with [LI] spelling
    detail: "AI clinical safety assistant with Mistral OCR and voice pipeline",
    organizers: "",
    start: "2026-03", // CONFIRM(malak): month (LinkedIn post dated ~March 2026)
  },
]

// Two entries from LinkedIn's education section; school name per Malak's instruction [U].
export const education: Education[] = [
  {
    degree: "Engineer's Degree in AI & Software Engineering", // [V]
    school: "Arts & Métiers Casablanca", // [U]
    // CONFIRM(malak): LinkedIn dates "Sep 2024 – Jun 2027" replace the repo's "Oct 2022 – Present" (which counted the prep years)
    period: "Sep 2024 – Jun 2027",
    start: "2024-09",
    details: [
      "Coursework: Machine Learning, Deep Learning, Reinforcement Learning, NLP, Advanced Algorithms, Databases",
      'Paper accepted at the 10th IET International Smart Cities Symposium (Dec 2026): "Spectral Weight Topology Analysis for Execution-Free Integrity Verification of Serialized Machine Learning Models"',
    ],
  },
  {
    degree: "Preparatory Classes in Engineering", // [D] from [LI] "Preparatory Classes, ENGINEERING"
    school: "Arts & Métiers Casablanca", // [U]
    period: "Sep 2022 – Jun 2024", // [LI]
    start: "2022-09",
    details: [],
  },
]

export const skillCategories: SkillCategory[] = [
  {
    category: "ML & AI",
    skills: [
      "PyTorch",
      "TensorFlow",
      "Stable-Baselines3",
      "Gymnasium",
      "FAISS",
      "Sentence Transformers",
      "ChromaDB",
      "XGBoost",
      "NLP",
      "RL",
      "Deep Learning",
    ],
  },
  {
    category: "Backend & Infra",
    skills: ["Python", "SQL", "C", "Java", "Flask", "Django", "FastAPI", "Docker", "JWT", "OAuth2"],
  },
  {
    category: "Research",
    skills: ["UMAP", "HDBSCAN", "Adversarial ML", "RAG pipelines", "RLHF"],
  },
  {
    category: "Languages",
    skills: ["English (fluent)", "French (fluent)", "Arabic (native)", "Tamazight (native)"],
  },
]

// Newest first by start date.
export const leadership: Leadership[] = [
  {
    role: "Member",
    organization: "Rewriting The Code (RTC)",
    period: "May 2026 – Present",
    start: "2026-05",
    description: "Member of the RTC community, a network supporting women in technology",
  },
  {
    role: "VP & Sponsoring Manager",
    organization: "Student Council ADE",
    period: "Feb 2026 – Present",
    start: "2026-02",
    description: "Co-led council operations, secured corporate sponsors, raised funding for student events",
  },
  {
    role: "Youth Ambassador", // [LI]
    organization: "WOMEN IN TECH® Global", // [LI] "WOMEN IN TECH ® Global" (space before ® removed). CONFIRM(malak)
    period: "Dec 2025 – Present", // [LI]
    start: "2025-12",
  },
  {
    role: "Mentee",
    organization: "McKinsey Forward Program",
    period: "Sep – Dec 2025",
    start: "2025-09",
    description: "Executive education and strategic consulting training",
  },
  {
    role: "Mentee",
    organization: "Dell STEM Aspire Program",
    period: "Jul 2025 – Feb 2026",
    start: "2025-07",
    description:
      "Mentored by industry professionals via Dell STEM Aspire, gaining leadership experience and practical career insight in tech",
  },
  {
    role: "President",
    organization: "Rotaract Arts & Métiers Casablanca", // [U] school name in the club's name. CONFIRM(malak)
    period: "Sep 2023 – Jun 2025",
    start: "2023-09",
    description:
      "Led 30+ member team, organised social integration programmes for children with Down syndrome and autism",
  },
  {
    role: "Member", // [LI]
    organization: "Rotaract Arts & Métiers Casablanca", // [LI] + [U]. CONFIRM(malak)
    period: "Sep 2022 – Sep 2023", // [LI]
    start: "2022-09",
  },
]

export const personalInfo = {
  name: "Malak Mekyassi",
  firstName: "Malak",
  lastName: "Mekyassi",
  email: "mmekyassi@gmail.com",
  github: "https://github.com/mal0101",
  linkedin: "https://linkedin.com/in/malak-mekyassi",
  location: "Casablanca, Morocco",
  timeZone: "Africa/Casablanca",
  tagline: "Co-founder & co-CEO, Axon Security", // [U]
  description: "AI & Software Engineering — building production ML systems, from research to deployment",
}

// Preface copy. Paragraphs 2 and 3 are verbatim from the old components/about.tsx (school renamed per [U]).
export const about: Paragraph[] = [
  {
    // CONFIRM(malak): wording only (co-founder/co-CEO and Hany El Atlassi as co-founder are user-stated)
    text: "I co-founded Axon Security with Hany El Atlassi and serve as its co-CEO. Axon discovers every agent in a company's AI stack and judges the paths that matter.",
  },
  {
    text: "AI & Software Engineering student at Arts & Métiers Casablanca specializing in ML security, reinforcement learning, and AI infrastructure. I build things end-to-end — RAG pipelines, defensive ML tooling, hierarchical RL systems.",
    strong: "Arts & Métiers Casablanca",
  },
  {
    text: "2x hackathon winner, including a 1st place recognised at an international AI conference alongside Yann LeCun and Eric Xing.",
    strong: "1st place recognised at an international AI conference",
  },
]

export const techItems = [
  "PYTORCH",
  "TENSORFLOW",
  "PYTHON",
  "FAISS",
  "STABLE-BASELINES3",
  "FASTAPI",
  "CHROMADB",
  "RAG",
  "RLHF",
  "CUDA",
  "DOCKER",
  "SQL",
]

export const concepts = [
  "REINFORCEMENT LEARNING",
  "ADVERSARIAL SECURITY",
  "NEURAL NETWORKS",
  "ML INFRASTRUCTURE",
  "DEEP LEARNING",
  "NLP",
  "ATTENTION",
  "EMBEDDINGS",
  "OPTIMIZATION",
  "SCALABILITY",
  "EFFICIENCY",
  "RESEARCH",
]

export interface Experience {
  role: string
  company: string
  period: string
  location: string
  highlights: string[]
}

export interface Project {
  title: string
  tags: string[]
  description: string
  badge?: string
  link?: string
  image: string
}

export interface Hackathon {
  placement: string
  name: string
  project: string
  detail: string
  organizers: string
}

export interface Education {
  degree: string
  school: string
  period: string
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
  description: string
}

export const experiences: Experience[] = [
  {
    role: "Software Engineering Intern",
    company: "NowEdge",
    period: "Jun – Sep 2025",
    location: "Casablanca",
    highlights: [
      "Built a production multi-tenant RAG chatbot using FAISS vector search, sentence-transformer embeddings, and JWT-based client isolation",
      "Engineered a typosquatting detection model via multi-heuristic domain classification, achieving 80% precision",
      "Architected an LTI 1.3-compliant platform with OAuth2/OpenID Connect",
    ],
  },
  {
    role: "AI Trainer",
    company: "Outlier AI, Alignerr, Prolific",
    period: "Nov 2024 – Present",
    location: "Remote",
    highlights: [
      "Authored 100+ prompt-response pairs and adversarial test cases for RLHF fine-tuning pipelines across Python, SQL, C, and Java",
    ],
  },
]

export const projects: Project[] = [
  {
    title: "SXR — Model Security X-Ray",
    tags: ["Python", "UMAP", "HDBSCAN", "PyTorch"],
    description:
      "5-layer defensive ML security pipeline detecting adversarial threats in serialised model files (.pth, .safetensors, .h5) — covering LSB steganographic payload injection, Pickle RCE exploits, and backdoor attacks.",
    badge: "Research paper in preparation",
    link: "https://github.com/mal0101/SXR",
    image: "/abstract-neural-network-visualization-dark-theme.jpg",
  },
  {
    title: "HRL Trading System",
    tags: ["PPO", "SAC", "Stable-Baselines3", "Python"],
    description:
      "3-level Hierarchical Deep RL trading system over SPY, AAPL, and BTC-USD — PPO trend classifier (L1), PPO action agent (L2), SAC position-sizing agent (L3).",
    link: "https://github.com/mal0101/HRL-Trading-System",
    image: "/futuristic-data-dashboard-dark-minimal.jpg",
  },
  {
    title: "Aegis — AI Policy Decision-Support",
    tags: ["FastAPI", "ChromaDB", "React", "Vercel"],
    description:
      "AI-powered decision support platform for policymakers. RAG chatbot, case study library of 8 international AI policies, and Impact Simulator predicting social/economic/governance effects.",
    badge: "1st place — AgorAI Hackathon",
    link: "https://aegis-puce.vercel.app",
    image: "/abstract-memory-storage-visualization.jpg",
  },
  {
    title: "JarvisLfla7",
    tags: ["NLP", "Federated Learning", "VLM", "Voice"],
    description:
      "Voice-first AI assistant designed as a personal agronomist for Moroccan farmers. Built during HackAI across NLP, Federated Learning, and VLM challenges.",
    badge: "2nd place — HackAI",
    link: "https://jarvislfla7.vercel.app",
    image: "/sound-wave-visualization-dark-theme.jpg",
  },
  {
    title: "Medicore",
    tags: ["Mistral OCR", "Voice Pipeline", "Python"],
    description:
      "AI clinical safety assistant built on Mistral OCR and a real-time voice pipeline for healthcare professionals.",
    badge: "Top 10 globally — Mistral AI Worldwide Hackathon",
    link: "https://github.com/mar1shell/MediCore",
    image: "/abstract-neural-network-visualization-dark-theme.jpg",
  },
  {
    title: "PlagAi",
    tags: ["Python", "NLTK", "scikit-learn"],
    description:
      "Plagiarism detection system using Jaccard similarity, TF-IDF cosine similarity, and n-gram analysis. Supports batch processing and configurable thresholds.",
    link: "https://github.com/mal0101/PlagAi",
    image: "/futuristic-data-dashboard-dark-minimal.jpg",
  },
]

export const hackathons: Hackathon[] = [
  {
    placement: "1st Place",
    name: "AgorAI",
    project: "Aegis — AI Policy Decision-Support Platform",
    detail: "Presented at international AI conference alongside Yann LeCun and Eric Xing",
    organizers: "EMINES / École Polytechnique / EMSI-Honoris",
  },
  {
    placement: "2nd Place",
    name: "HackAI",
    project: "JarvisLfla7 — Voice-first AI Agronomist",
    detail: "Voice-first AI assistant for Moroccan farmers",
    organizers: "",
  },
  {
    placement: "Top 10 Globally",
    name: "Mistral AI Worldwide Hackathon",
    project: "Medicore — AI Clinical Safety Assistant",
    detail: "AI clinical safety assistant with Mistral OCR and voice pipeline",
    organizers: "",
  },
]

export const education: Education[] = [
  {
    degree: "Engineer's Degree in AI & Software Engineering",
    school: "ENSAM Casablanca",
    period: "Oct 2022 – Present",
    details: [
      "Coursework: Machine Learning, Deep Learning, Reinforcement Learning, NLP, Advanced Algorithms, Databases",
      'Research paper in preparation: "Defensive ML Security: Adversarial Threat Detection and Backdoor Neutralisation in Serialised Model Files"',
    ],
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

export const leadership: Leadership[] = [
  {
    role: "President",
    organization: "Rotaract ENSAM Casablanca",
    period: "Sep 2023 – Jun 2025",
    description:
      "Led 30+ member team, organised social integration programmes for children with Down syndrome and autism",
  },
  {
    role: "VP & Sponsoring Manager",
    organization: "Student Council ADE",
    period: "Feb 2026 – Present",
    description: "Co-led council operations, secured corporate sponsors, raised funding for student events",
  },
  {
    role: "Participant",
    organization: "McKinsey Forward Program",
    period: "Sep – Dec 2025",
    description: "Executive education and strategic consulting training",
  },
  {
    role: "Participant",
    organization: "Dell STEM Aspire Program",
    period: "Jul 2025 – Feb 2026",
    description:
      "Mentored by industry professionals via Dell STEM Aspire, gaining leadership experience and practical career insight in tech",
  },
]

export const personalInfo = {
  name: "Malak Mekyassi",
  email: "mmekyassi@gmail.com",
  github: "https://github.com/mal0101",
  linkedin: "https://linkedin.com/in/malak-mekyassi",
  location: "Casablanca, Morocco",
  tagline: "ENGINEER & RESEARCHER",
  description: "AI & Software Engineering — building production ML systems, from research to deployment",
}

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

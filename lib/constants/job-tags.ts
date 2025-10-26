/**
 * Predefined job tags for categorization and filtering
 */

export const JOB_TAG_CATEGORIES = {
  PORTFOLIO: "Portfolio Companies",
  DOMAIN: "Domain & Specialty",
  STAGE: "Company Stage",
  FUNDING: "Funding & Exit",
  TEAM_SIZE: "Team Size",
} as const;

export const JOB_TAGS = {
  // Portfolio Companies
  PORTFOLIO: {
    WATERLOO_ALUMNI: "Waterloo Alumni",
    YC: "YC",
    YC_S24: "YC S24",
    YC_W24: "YC W24",
    YC_S23: "YC S23",
    RIPPLE_VENTURES: "Ripple Ventures",
    RIPPLE_FUND_I: "Ripple Fund I",
    RIPPLE_FUND_II: "Ripple Fund II",
    RIPPLE_FUND_III: "Ripple Fund III",
    SEQUOIA: "Sequoia",
    A16Z: "a16z",
    FOUNDERS_FUND: "Founders Fund",
    KHOSLA: "Khosla Ventures",
    ACCEL: "Accel",
    GREYLOCK: "Greylock",
    LIGHTSPEED: "Lightspeed",
    INDEX: "Index Ventures",
    GENERAL_CATALYST: "General Catalyst",
    FELICIS: "Felicis",
    NEA: "NEA",
  },

  // Domain & Specialty
  DOMAIN: {
    // AI/ML
    AI_ML: "AI/ML",
    LLM: "LLM",
    VOICE_AI: "Voice AI",
    COMPUTER_VISION: "Computer Vision",
    NLP: "NLP",
    REINFORCEMENT_LEARNING: "Reinforcement Learning",
    GENERATIVE_AI: "Generative AI",

    // Industry Verticals
    BIOTECH: "Biotech",
    HEALTHTECH: "HealthTech",
    FINTECH: "FinTech",
    EDTECH: "EdTech",
    PROPTECH: "PropTech",
    REAL_ESTATE: "Real Estate",
    CLIMATE_TECH: "Climate Tech",
    AGTECH: "AgTech",
    FOODTECH: "FoodTech",
    LOGISTICS: "Logistics",
    DEFENSE: "Defense",
    CONSTRUCTION: "Construction",
    RETAIL: "Retail",

    // Tech Areas
    DEVTOOLS: "DevTools",
    INFRASTRUCTURE: "Infrastructure",
    CYBERSECURITY: "Cybersecurity",
    BLOCKCHAIN: "Blockchain",
    WEB3: "Web3",
    ROBOTICS: "Robotics",
    IOT: "IoT",
    AR_VR: "AR/VR",
    QUANTUM: "Quantum Computing",

    // Business Functions
    SALES: "Sales",
    MARKETING: "Marketing",
    PRODUCT: "Product",
    DESIGN: "Design",
    OPERATIONS: "Operations",
    CUSTOMER_SUCCESS: "Customer Success",
    HR: "HR",
    FINANCE: "Finance",
    LEGAL: "Legal",

    // Business Models
    B2B: "B2B",
    B2C: "B2C",
    B2B2C: "B2B2C",
    ENTERPRISE: "Enterprise",
    SMB: "SMB",
    CONSUMER: "Consumer",
    MARKETPLACE: "Marketplace",
    SAAS: "SaaS",
    PLATFORM: "Platform",
  },

  // Company Stage
  STAGE: {
    PRE_SEED: "Pre-Seed",
    SEED: "Seed",
    SERIES_A: "Series A",
    SERIES_B: "Series B",
    SERIES_C_PLUS: "Series C+",
    GROWTH: "Growth Stage",
    PUBLIC: "Public Company",
  },

  // Funding & Exit
  FUNDING: {
    BOOTSTRAPPED: "Bootstrapped",
    UNDER_1M: "Under $1M",
    FUNDED_1M_5M: "$1M-$5M",
    FUNDED_5M_20M: "$5M-$20M",
    FUNDED_20M_PLUS: "$20M+",
    EXITED: "Exited",
    ACQUIRED: "Acquired",
  },

  // Team Size
  TEAM_SIZE: {
    SOLO_FOUNDER: "Solo Founder",
    SMALL_1_10: "1-10 employees",
    STARTUP_11_50: "11-50 employees",
    SCALEUP_51_200: "51-200 employees",
    MIDSIZE_201_1000: "201-1000 employees",
    LARGE_1000_PLUS: "1000+ employees",
  },
} as const;

// Flattened list of all tags for easy iteration
export const ALL_JOB_TAGS = [
  ...Object.values(JOB_TAGS.PORTFOLIO),
  ...Object.values(JOB_TAGS.DOMAIN),
  ...Object.values(JOB_TAGS.STAGE),
  ...Object.values(JOB_TAGS.FUNDING),
  ...Object.values(JOB_TAGS.TEAM_SIZE),
] as const;

// Grouped tags for UI display
export const GROUPED_JOB_TAGS = [
  {
    category: JOB_TAG_CATEGORIES.PORTFOLIO,
    tags: Object.values(JOB_TAGS.PORTFOLIO),
  },
  {
    category: JOB_TAG_CATEGORIES.DOMAIN,
    tags: Object.values(JOB_TAGS.DOMAIN),
  },
  {
    category: JOB_TAG_CATEGORIES.STAGE,
    tags: Object.values(JOB_TAGS.STAGE),
  },
  {
    category: JOB_TAG_CATEGORIES.FUNDING,
    tags: Object.values(JOB_TAGS.FUNDING),
  },
  {
    category: JOB_TAG_CATEGORIES.TEAM_SIZE,
    tags: Object.values(JOB_TAGS.TEAM_SIZE),
  },
] as const;

// Common AI/ML focused tags for quick access
export const AI_ML_TAGS = [
  JOB_TAGS.DOMAIN.AI_ML,
  JOB_TAGS.DOMAIN.LLM,
  JOB_TAGS.DOMAIN.VOICE_AI,
  JOB_TAGS.DOMAIN.COMPUTER_VISION,
  JOB_TAGS.DOMAIN.NLP,
  JOB_TAGS.DOMAIN.REINFORCEMENT_LEARNING,
  JOB_TAGS.DOMAIN.GENERATIVE_AI,
] as const;

// YC-specific tags
export const YC_TAGS = [
  JOB_TAGS.PORTFOLIO.YC,
  JOB_TAGS.PORTFOLIO.YC_S24,
  JOB_TAGS.PORTFOLIO.YC_W24,
  JOB_TAGS.PORTFOLIO.YC_S23,
] as const;

// Type exports for TypeScript
export type JobTag = typeof ALL_JOB_TAGS[number];
export type JobTagCategory = typeof JOB_TAG_CATEGORIES[keyof typeof JOB_TAG_CATEGORIES];

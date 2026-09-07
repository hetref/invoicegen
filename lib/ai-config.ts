export type AiProvider = "gemini" | "groq";

export interface AiModelOption {
  id: string;
  name: string;
  provider: AiProvider;
  category: string;
  description: string;
  badge?: string;
  supportsVision?: boolean;
}

export const AI_PROVIDERS = [
  {
    id: "gemini" as AiProvider,
    name: "Google Gemini",
    shortName: "Gemini",
    defaultModel: "gemini-2.5-flash",
    description: "Multimodal AI by Google with native support for PDF and image invoices.",
    docsUrl: "https://aistudio.google.com/app/apikey",
    keyPlaceholder: "AIzaSy...",
  },
  {
    id: "groq" as AiProvider,
    name: "Groq Cloud",
    shortName: "Groq",
    defaultModel: "llama-3.3-70b-versatile",
    description: "Ultra-fast LPU inference engine supporting Meta Llama, Qwen, and OpenAI OSS models.",
    docsUrl: "https://console.groq.com/keys",
    keyPlaceholder: "gsk_...",
  },
];

export const AI_MODELS: Record<AiProvider, AiModelOption[]> = {
  gemini: [
    {
      id: "gemini-2.5-flash",
      name: "gemini-2.5-flash",
      provider: "gemini",
      category: "Gemini 2.5 Series",
      description: "Fastest next-gen multimodal model with superior invoice data extraction",
      badge: "Recommended",
      supportsVision: true,
    },
    {
      id: "gemini-2.5-pro",
      name: "gemini-2.5-pro",
      provider: "gemini",
      category: "Gemini 2.5 Series",
      description: "Highest reasoning capability for complex, multi-page, handwritten invoices",
      badge: "Pro",
      supportsVision: true,
    },
    {
      id: "gemini-2.0-flash",
      name: "gemini-2.0-flash",
      provider: "gemini",
      category: "Gemini 2.0 Series",
      description: "Ultra-fast response time with high accuracy",
      badge: "Fast",
      supportsVision: true,
    },
    {
      id: "gemini-2.0-flash-lite",
      name: "gemini-2.0-flash-lite",
      provider: "gemini",
      category: "Gemini 2.0 Series",
      description: "Lightweight and efficient multimodal model",
      supportsVision: true,
    },
    {
      id: "gemini-1.5-flash",
      name: "gemini-1.5-flash",
      provider: "gemini",
      category: "Gemini 1.5 Series",
      description: "Stable and versatile standard flash model",
      supportsVision: true,
    },
    {
      id: "gemini-1.5-pro",
      name: "gemini-1.5-pro",
      provider: "gemini",
      category: "Gemini 1.5 Series",
      description: "High context window for long invoice documents",
      supportsVision: true,
    },
  ],
  groq: [
    {
      id: "llama-3.3-70b-versatile",
      name: "llama-3.3-70b-versatile",
      provider: "groq",
      category: "Meta Llama",
      description: "State-of-the-art 70B model with ultra-fast Groq LPU inference",
      badge: "Recommended",
      supportsVision: false,
    },
    {
      id: "llama-3.1-8b-instant",
      name: "llama-3.1-8b-instant",
      provider: "groq",
      category: "Meta Llama",
      description: "Ultra-low latency instant extraction with 128k context",
      badge: "Ultra Fast",
      supportsVision: false,
    },
    {
      id: "llama-3.2-11b-vision-preview",
      name: "llama-3.2-11b-vision-preview",
      provider: "groq",
      category: "Meta Llama (Vision)",
      description: "Multimodal vision model for direct image & scanned invoice extraction",
      badge: "Vision",
      supportsVision: true,
    },
    {
      id: "llama-3.2-90b-vision-preview",
      name: "llama-3.2-90b-vision-preview",
      provider: "groq",
      category: "Meta Llama (Vision)",
      description: "High accuracy 90B multimodal vision model for invoice images",
      badge: "Vision Pro",
      supportsVision: true,
    },
    {
      id: "openai/gpt-oss-120b",
      name: "openai/gpt-oss-120b",
      provider: "groq",
      category: "OpenAI",
      description: "120B parameter open-weights model hosted on Groq LPUs",
      badge: "New",
      supportsVision: false,
    },
    {
      id: "openai/gpt-oss-20b",
      name: "openai/gpt-oss-20b",
      provider: "groq",
      category: "OpenAI",
      description: "20B parameter high efficiency model",
      supportsVision: false,
    },
    {
      id: "qwen/qwen3.6-27b",
      name: "qwen/qwen3.6-27b",
      provider: "groq",
      category: "Alibaba Cloud",
      description: "High-accuracy multilingual reasoning model",
      supportsVision: false,
    },
    {
      id: "qwen/qwen3.8-27b",
      name: "qwen/qwen3.8-27b",
      provider: "groq",
      category: "Alibaba Cloud",
      description: "Latest Qwen 3.8 model with precision extraction",
      supportsVision: false,
    },
    {
      id: "groq/compound",
      name: "groq/compound",
      provider: "groq",
      category: "Groq",
      description: "Groq compound routing model",
      supportsVision: false,
    },
    {
      id: "groq/compound-mini",
      name: "groq/compound-mini",
      provider: "groq",
      category: "Groq",
      description: "Lightweight compound model for fast tasks",
      supportsVision: false,
    },
    {
      id: "deepseek-r1-distill-llama-70b",
      name: "deepseek-r1-distill-llama-70b",
      provider: "groq",
      category: "DeepSeek",
      description: "Deep reasoning model for complex calculations and tax line breakdowns",
      badge: "Reasoning",
      supportsVision: false,
    },
    {
      id: "mixtral-8x7b-32768",
      name: "mixtral-8x7b-32768",
      provider: "groq",
      category: "Mistral",
      description: "Mixture-of-experts model with 32k context window",
      supportsVision: false,
    },
  ],
};

export const DEFAULT_AI_PROVIDER: AiProvider = "gemini";
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

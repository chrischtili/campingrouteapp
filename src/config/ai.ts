export const DIRECT_AI_FEATURE_ENABLED = true;
export const TOKEN_MODE_PREVIEW_ENABLED = false;
export const DEFAULT_OPENAI_MODEL = "gpt-5.5";
export const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";

export const AI_MODELS = {
  openai: [
    { value: "gpt-5.5", label: "GPT-5.5 (Omni)" },
    { value: "gpt-5.4", label: "GPT-5.4 Pro" },
    { value: "gpt-5.4-mini", label: "GPT-5.4 Mini" },
    { value: "o1-pro", label: "OpenAI o1 Pro" },
  ],
  google: [
    { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (Vorschau)" },
    { value: "gemini-3-flash-preview", label: "Gemini 3 Flash (Vorschau, Live-Suche)" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Stabil)" },
    { value: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite (Vorschau)" },
  ],
};


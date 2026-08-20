import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Universal AI provider abstraction supporting:
 *  - "gemini"   via Google Generative AI SDK
 *  - "deepseek" via api.deepseek.com
 *  - "openai"   via api.openai.com
 *  - "claude"   via api.anthropic.com
 */

export interface AIProviderConfig {
  provider: 'gemini' | 'deepseek' | 'openai' | 'claude';
  model: string;
  apiKey: string;
}

const REQUEST_TIMEOUT_MS = 35000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`AI request timed out after ${Math.round(ms / 1000)}s`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export function getAIProvider(overrides?: { provider?: string; apiKey?: string }): AIProviderConfig {
  const rawProvider = (overrides?.provider || process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const overrideKey = (overrides?.apiKey || '').trim();

  const cfg = (provider: string, model: string, envKey: string): AIProviderConfig => ({
    provider: provider as AIProviderConfig['provider'],
    model: process.env[`${provider.toUpperCase()}_MODEL`] || model,
    apiKey: overrideKey || process.env[envKey] || ''
  });

  if (rawProvider === 'deepseek') {
    return cfg('deepseek', 'deepseek-v4-flash', 'DEEPSEEK_API_KEY');
  }
  if (rawProvider === 'openai') {
    return cfg('openai', 'gpt-4o-mini', 'OPENAI_API_KEY');
  }
  if (rawProvider === 'claude') {
    return cfg('claude', 'claude-3-5-haiku-20241022', 'CLAUDE_API_KEY');
  }
  return cfg('gemini', 'gemini-3.7-flash', 'GEMINI_API_KEY');
}

async function geminiChat(
  cfg: AIProviderConfig,
  systemInstruction: string,
  prompt: string,
  jsonMode: boolean
): Promise<string> {
  const genAI = new GoogleGenerativeAI(cfg.apiKey);
  const modelsToTry = [cfg.model, 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  const uniqueModels = [...new Set(modelsToTry.filter(Boolean))];

  let lastError: any = null;
  for (const modelName of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(jsonMode ? { generationConfig: { responseMimeType: "application/json" } } : {})
      });
      const request: any = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      };
      if (systemInstruction && systemInstruction.trim()) {
        request.systemInstruction = systemInstruction;
      }
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout with model ${modelName}`)), 12000)
      );
      const response: any = await Promise.race([
        model.generateContent(request),
        timeoutPromise
      ]);
      return response.response.text();
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini call with model "${modelName}" failed:`, err.message || err);
    }
  }
  throw lastError || new Error('All Gemini model calls failed');
}

async function deepseekChat(
  cfg: AIProviderConfig,
  systemInstruction: string,
  prompt: string,
  jsonMode: boolean
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cfg.apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: cfg.model || 'deepseek-v4-flash',
        messages: [
          ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {})
      })
    });
    if (!res.ok) {
      throw new Error(`DeepSeek API error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    return (data.choices && data.choices[0] && data.choices[0].message.content) || "";
  } finally {
    clearTimeout(timer);
  }
}

async function openaiChat(
  cfg: AIProviderConfig,
  systemInstruction: string,
  prompt: string,
  jsonMode: boolean
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cfg.apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: cfg.model || 'gpt-4o-mini',
        messages: [
          ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {})
      })
    });
    if (!res.ok) {
      throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    return (data.choices && data.choices[0] && data.choices[0].message.content) || "";
  } finally {
    clearTimeout(timer);
  }
}

async function claudeChat(
  cfg: AIProviderConfig,
  systemInstruction: string,
  prompt: string,
  jsonMode: boolean
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let effectiveSystem = systemInstruction || "";
    if (jsonMode) {
      effectiveSystem += "\n\nWICHTIG: Antworte AUSSCHLIESSLICH mit gültigem JSON ohne Markdown-Codeblöcke.";
    }
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.apiKey,
        "anthropic-version": "2023-06-01"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: cfg.model || 'claude-3-5-haiku-20241022',
        max_tokens: 4096,
        system: effectiveSystem || undefined,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });
    if (!res.ok) {
      throw new Error(`Anthropic Claude API error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    if (data.content && Array.isArray(data.content)) {
      const textBlock = data.content.find((c: any) => c.type === 'text');
      return textBlock ? textBlock.text : "";
    }
    return "";
  } finally {
    clearTimeout(timer);
  }
}

/** Ask the model for a structured JSON answer (intent parsing / curation). */
export async function chatJSON(
  cfg: AIProviderConfig,
  systemInstruction: string,
  prompt: string
): Promise<string> {
  if (!cfg.apiKey) {
    throw new Error(`Kein API-Key für Provider "${cfg.provider}" angegeben.`);
  }
  const runner = () => {
    switch (cfg.provider) {
      case 'deepseek': return deepseekChat(cfg, systemInstruction, prompt, true);
      case 'openai': return openaiChat(cfg, systemInstruction, prompt, true);
      case 'claude': return claudeChat(cfg, systemInstruction, prompt, true);
      default: return geminiChat(cfg, systemInstruction, prompt, true);
    }
  };
  return withTimeout(runner(), REQUEST_TIMEOUT_MS);
}

/** Ask the model for a free-text answer (editorial summary). */
export async function chatText(
  cfg: AIProviderConfig,
  systemInstruction: string,
  prompt: string
): Promise<string> {
  if (!cfg.apiKey) {
    throw new Error(`Kein API-Key für Provider "${cfg.provider}" angegeben.`);
  }
  const runner = () => {
    switch (cfg.provider) {
      case 'deepseek': return deepseekChat(cfg, systemInstruction, prompt, false);
      case 'openai': return openaiChat(cfg, systemInstruction, prompt, false);
      case 'claude': return claudeChat(cfg, systemInstruction, prompt, false);
      default: return geminiChat(cfg, systemInstruction, prompt, false);
    }
  };
  return withTimeout(runner(), REQUEST_TIMEOUT_MS);
}

/** Quick verification ping to test API key & model responsiveness */
export async function testAIConnection(cfg: AIProviderConfig): Promise<{ success: boolean; message: string }> {
  try {
    const testPrompt = 'Antworte bitte ausschließlich mit dem Wort: "OK"';
    const resp = await chatText(cfg, "Du bist ein Test-Bot.", testPrompt);
    if (resp && resp.length > 0) {
      return { success: true, message: `Verbindung zu ${cfg.provider.toUpperCase()} (${cfg.model}) erfolgreich hergestellt!` };
    }
    return { success: false, message: 'Keine Antwort vom Modell erhalten.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Verbindung fehlgeschlagen.' };
  }
}

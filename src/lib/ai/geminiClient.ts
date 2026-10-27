/**
 * Server-Side Gemini API Client
 *
 * Secure client for Google Gemini Generative AI API.
 * - Server-only: Never exposes GEMINI_API_KEY to browser, logs, or responses.
 * - Prioritizes active, low-latency models (gemini-3.5-flash-lite, gemini-3.5-flash, gemini-3.8-flash, gemini-flash-latest).
 * - Automatic failover across models for high availability and demand spikes.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
];

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key || !key.trim()) {
    throw new Error(
      "GEMINI_API_KEY is not configured in server environment. Please set GEMINI_API_KEY in the root .env file."
    );
  }
  return key.trim();
}

export function isGeminiConfigured(): boolean {
  try {
    const key = getGeminiApiKey();
    return Boolean(key && key.length > 10);
  } catch {
    return false;
  }
}

export interface GeminiGenerateOptions {
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
  systemInstruction?: string;
  timeoutMs?: number;
}

/**
 * Executes a Gemini prompt with automatic model fallback across active supported models.
 */
export async function callGemini(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<string> {
  const apiKey = getGeminiApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const timeoutMs = options.timeoutMs || 45000;

  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const modelConfig: any = {
        model: modelName,
        generationConfig: {
          temperature: options.temperature ?? 0.1,
          maxOutputTokens: options.maxOutputTokens,
          responseMimeType: options.jsonMode ? "application/json" : "text/plain",
        },
      };

      if (options.systemInstruction) {
        modelConfig.systemInstruction = options.systemInstruction;
      }

      const model = genAI.getGenerativeModel(modelConfig);

      // Wrap with timeout
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout calling Gemini model '${modelName}'`)), timeoutMs)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const response = await result.response;
      const text = response.text();

      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err: any) {
      lastError = err;
      const errorMsg = err?.message || String(err);

      // If model not found (404) or unavailable (503), try next model
      if (/404|not found|503|unavailable|high demand/i.test(errorMsg)) {
        console.warn(`[GEMINI CLIENT] Model '${modelName}' unavailable (${errorMsg.slice(0, 100)}). Falling back to next candidate...`);
        continue;
      }

      // If rate limited (429), pause briefly and retry next
      if (/429|resource exhausted|quota/i.test(errorMsg)) {
        console.warn(`[GEMINI CLIENT] Model '${modelName}' rate limited. Falling back to next candidate...`);
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      // Otherwise log and try next model
      console.warn(`[GEMINI CLIENT] Error with '${modelName}': ${errorMsg.slice(0, 120)}`);
    }
  }

  throw new Error(`All Gemini candidate models failed. Last error: ${lastError?.message || "Unknown error"}`);
}

/**
 * Calls Gemini and parses the response as structured JSON.
 */
export async function callGeminiJson<T = any>(
  prompt: string,
  options: Omit<GeminiGenerateOptions, "jsonMode"> = {}
): Promise<T> {
  const rawText = await callGemini(prompt, { ...options, jsonMode: true });

  // Clean possible markdown code fences
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseError: any) {
    // Attempt relaxed regex JSON extraction if surrounded by extra text
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error(`Failed to parse Gemini output as JSON: ${parseError.message}`);
  }
}

import { callGemini, isGeminiConfigured } from "../../geminiClient";
import { callGrokAI } from "../../grok";

export async function runAiAgent(systemPrompt: string, userPrompt: string, fallbackResult: any = null) {
  try {
    let rawOutput = "";

    // Primary: Google Gemini Generative AI
    if (isGeminiConfigured()) {
      try {
        rawOutput = await callGemini(userPrompt, {
          systemInstruction: systemPrompt,
          temperature: 0.2,
          jsonMode: true,
        });
      } catch (geminiError: any) {
        console.warn(`[AI AGENT] Gemini primary call failed (${geminiError.message}), attempting secondary...`);
      }
    }

    // Secondary fallback: Grok (if key available)
    if (!rawOutput) {
      try {
        rawOutput = await callGrokAI(userPrompt, systemPrompt);
      } catch (grokError: any) {
        // Only log if Gemini was also not available
      }
    }

    if (!rawOutput) {
      return fallbackResult;
    }

    const jsonMatch =
      rawOutput.match(/```(?:json)?\s*([\s\S]*?)```/i) ||
      rawOutput.match(/\{[\s\S]*\}/) ||
      rawOutput.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : rawOutput;

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`[AI AGENT ERROR]:`, error);
    return fallbackResult;
  }
}

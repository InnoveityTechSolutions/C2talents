/**
 * Production-Grade xAI Grok Provider Client
 * Connects securely to xAI API (https://api.x.ai/v1/chat/completions)
 * Uses GROK_API_KEY from .env only.
 */

export async function callGrokAI(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;

  if (!apiKey) {
    throw new Error("GROK_API_KEY is not configured in .env environment variables.");
  }

  // If the user provided a Groq API key instead of xAI Grok
  if (apiKey.startsWith("gsk_")) {
    console.log(`[GROQ AI ENGINE] Detected Groq API key. Routing to Groq LPU...`);
    const endpoint = "https://api.groq.com/openai/v1/chat/completions";

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: systemPrompt ? [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt }
            ] : [ { role: "user", content: prompt } ],
            response_format: { type: "json_object" }
          })
        });

        const data = await res.json();
        if (res.ok && data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }

        if (res.status === 429 && attempt < 3) {
          console.warn(`[GROQ AI] Rate limited (429). Retrying in ${attempt * 2}s...`);
          await new Promise(r => setTimeout(r, attempt * 2000));
          continue;
        }

        throw new Error(`Groq API Error: ${JSON.stringify(data.error)}`);
      } catch (err: any) {
        if (attempt === 3) {
          // Gemini Fallback
          const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
          if (geminiKey) {
            console.log(`[AI FALLBACK] Switching to Gemini AI...`);
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(`${systemPrompt ? systemPrompt + "\n\n" : ""}${prompt}`);
            return result.response.text();
          }
          throw err;
        }
      }
    }
  }

  const endpoint = "https://api.x.ai/v1/chat/completions";

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const candidateModels = ["grok-2-1212", "grok-2-vision-1212", "grok-3", "grok-beta", "grok-2"];
  let lastError = "";

  for (const modelName of candidateModels) {
    try {
      console.log(`[GROK AI ENGINE] Attempting completion using model '${modelName}'...`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          model: modelName,
          temperature: 0.1,
          stream: false,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content || "";
        if (content) {
          console.log(`[GROK AI ENGINE] ✅ Completion received successfully from '${modelName}' (${content.length} characters)`);
          return content;
        }
      } else {
        const errText = await res.text();
        lastError = `HTTP ${res.status}: ${errText}`;
        console.warn(`[GROK AI ENGINE] Model '${modelName}' returned error: ${lastError}`);
      }
    } catch (err: any) {
      lastError = err.message;
      console.warn(`[GROK AI ENGINE] Model '${modelName}' call failed: ${err.message}`);
    }
  }

  throw new Error(`xAI Grok API call failed: ${lastError}`);
}

import { callGrokAI } from "../../grok";

export async function runAiAgent(systemPrompt: string, userPrompt: string, fallbackResult: any = null) {
  try {
    const rawOutput = await callGrokAI(userPrompt, systemPrompt);
    // console.log(`[AI AGENT DEBUG] Raw Output:`, rawOutput.slice(0, 150));
    
    const jsonMatch = rawOutput.match(/```(?:json)?\s*([\s\S]*?)```/i) || rawOutput.match(/\{[\s\S]*\}/) || rawOutput.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawOutput;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`[AI AGENT ERROR]:`, error);
    return fallbackResult;
  }
}

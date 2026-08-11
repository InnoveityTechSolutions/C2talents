import { PipelineData } from "../collection/types";
import { searchFullWebsiteContent } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateSeo(data: PipelineData) {
  const sourceText = searchFullWebsiteContent(data);
  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Head of Search Engine Optimization for ${collegeName}. 
Generate an authoritative SEO Title (max 60 chars), compelling SEO Meta Description (max 160 chars), relevant Meta Keywords (comma separated), and a rich 2-3 paragraph SEO Article summarizing the institution based on the entire verified website content.

RULES:
1. Do NOT invent fake accreditations, degrees, or ranks. Extract ONLY from verified text.
2. Ensure keywords reflect real courses, location, and features found in source.

Return a valid JSON object: {"seoTitle": "...", "seoDescription": "...", "metaKeywords": "...", "seoArticle": "..."}`;

  const res = await runAiAgent(systemPrompt, `Entire website content:\n\n${sourceText.slice(0, 30000)}`, { seoTitle: null, seoDescription: null, metaKeywords: null, seoArticle: null });
  return res || { seoTitle: null, seoDescription: null, metaKeywords: null, seoArticle: null };
}


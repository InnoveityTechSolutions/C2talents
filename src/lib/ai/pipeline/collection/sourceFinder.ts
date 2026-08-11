import { CrawledPage, PipelineData } from "./types";

export function getSourceTextForCategory(visitedPages: CrawledPage[], category: string | string[], fallbackToHomepage = false): string {
  const categories = (Array.isArray(category) ? category : [category]).map(c => c.toUpperCase());
  
  const matchingPages = visitedPages.filter(p => categories.includes((p.category || "").toUpperCase()));
  
  if (matchingPages.length === 0 && fallbackToHomepage) {
    const homepage = visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE");
    if (homepage) return `[PAGE: ${homepage.title}]\n${homepage.text}`;
    return "";
  }
  
  return matchingPages.map(p => `[PAGE: ${p.title}]\n${p.text}`).join("\n\n");
}

export function getPagesForCategory(visitedPages: CrawledPage[], category: string | string[]): CrawledPage[] {
  const categories = (Array.isArray(category) ? category : [category]).map(c => c.toUpperCase());
  return visitedPages.filter(p => categories.includes((p.category || "").toUpperCase()));
}

export function getMultiSourceText(
  data: PipelineData,
  targetCategories: string[],
  keywords: string[] = [],
  maxChars = 40000
): string {
  const upperCategories = targetCategories.map(c => c.toUpperCase());
  const lowerKeywords = keywords.map(k => k.toLowerCase());

  const matchedPagesSet = new Set<CrawledPage>();

  // 1. Match by categories
  for (const page of data.visitedPages) {
    const pageCat = (page.category || "").toUpperCase();
    if (upperCategories.includes(pageCat)) {
      matchedPagesSet.add(page);
    }
  }

  // 2. Match by keywords in URL, title, or body
  if (lowerKeywords.length > 0) {
    for (const page of data.visitedPages) {
      const combined = `${page.url} ${page.title} ${page.text.slice(0, 1000)}`.toLowerCase();
      if (lowerKeywords.some(kw => combined.includes(kw))) {
        matchedPagesSet.add(page);
      }
    }
  }

  // 3. Fallback: If no pages matched, include Homepage and General pages matching keywords
  if (matchedPagesSet.size === 0) {
    for (const page of data.visitedPages) {
      if ((page.category || "").toUpperCase() === "HOMEPAGE" || (page.category || "").toUpperCase() === "GENERAL") {
        matchedPagesSet.add(page);
      }
    }
  }

  const pagesArray = Array.from(matchedPagesSet);

  let result = pagesArray
    .map(p => `--- PAGE: ${p.title} (${p.url}) [CATEGORY: ${p.category}] ---\n${p.text}`)
    .join("\n\n");

  // 4. Include matching PDF titles
  if (data.discoveredPdfs && data.discoveredPdfs.length > 0 && lowerKeywords.length > 0) {
    const pdfMatches = data.discoveredPdfs.filter(pdf => 
      lowerKeywords.some(kw => pdf.title.toLowerCase().includes(kw) || pdf.url.toLowerCase().includes(kw))
    );
    if (pdfMatches.length > 0) {
      result += "\n\n--- DISCOVERED OFFICIAL PDF DOCUMENTS ---\n";
      pdfMatches.forEach(pdf => {
        result += `- PDF Document: ${pdf.title} (URL: ${pdf.url})\n`;
      });
    }
  }

  // 5. Include OpenGraph and JSON-LD Metadata if available
  const homepage = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE");
  if (homepage?.openGraphMeta && Object.keys(homepage.openGraphMeta).length > 0) {
    result += "\n\n--- SITE METADATA (OpenGraph) ---\n";
    for (const [k, v] of Object.entries(homepage.openGraphMeta)) {
      result += `${k}: ${v}\n`;
    }
  }

  return result.slice(0, maxChars);
}

export function searchFullWebsiteContent(data: PipelineData, maxChars = 80000): string {
  let fullText = data.visitedPages
    .map(p => `--- PAGE: ${p.title} (${p.url}) [CATEGORY: ${p.category}] ---\n${p.text}`)
    .join("\n\n");

  if (data.discoveredPdfs && data.discoveredPdfs.length > 0) {
    fullText += "\n\n--- DISCOVERED OFFICIAL PDF DOCUMENTS ---\n";
    data.discoveredPdfs.forEach(pdf => {
      fullText += `- PDF Document: ${pdf.title} (URL: ${pdf.url})\n`;
    });
  }

  return fullText.slice(0, maxChars);
}



/**
 * Bulk Research Input Parser
 *
 * Reliably parses bulk college research inputs from various formats:
 * 1. Numbered lists with URLs on the next line:
 *    1. AMET Deemed-to-be University
 *    Official Website: https://www.ametuniv.ac.in/
 * 2. College name on one line, URL on next line:
 *    Loyola College Chennai
 *    https://www.loyolacollege.edu
 * 3. College name and URL on the same line (separated by comma, hyphen, pipe, parens):
 *    Loyola College Chennai, https://www.loyolacollege.edu
 *    Bharathi Women's College - https://bwc.edu.in
 *    PSG College (https://psgtech.edu)
 * 4. Standalone URLs or domain names:
 *    https://www.ametuniv.ac.in/
 * 5. Structured objects or arrays: [{ name, url }]
 */

export interface ParsedResearchCollege {
  name: string;
  url?: string;
}

// Extract any valid HTTP/HTTPS or www URL from a string
const URL_REGEX = /(?:https?:\/\/[^\s,;)"'>]+|www\.[a-z0-9\-]+(?:\.[a-z0-9\-]+)+(?:\/[^\s,;)"'>]*)?)/i;

// Detect lines that are solely website descriptors or URLs
const WEBSITE_LABEL_LINE_REGEX = /^\s*(?:official\s+)?(?:web(?:site)?|site|url|portal|link)?\s*[:=\-–—]?\s*(https?:\/\/\S+|www\.\S+)\s*$/i;

// Strip leading list numbering (e.g. "1. ", "2) ", "[3] ", "- ", "* ")
function stripListPrefix(text: string): string {
  return text.replace(/^\s*(?:\[?\d+\]?[\.\)\:\-]\s*|[-*•]\s*)/, "").trim();
}

// Clean and normalize a URL string
export function normalizeUrl(rawUrl: string): string {
  let cleaned = rawUrl.trim().replace(/^[<("'[]+|[>)"'\];,.]+$/g, "");
  if (/^www\./i.test(cleaned)) {
    cleaned = "https://" + cleaned;
  }
  return cleaned;
}

// Extract host domain from a URL or text
export function extractDomainFromUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  try {
    const normalized = normalizeUrl(rawUrl);
    const parsed = new URL(normalized.startsWith("http") ? normalized : `https://${normalized}`);
    return parsed.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    const match = rawUrl.match(/(?:https?:\/\/)?(?:www\.)?([a-z0-9\-]+(?:\.[a-z0-9\-]+)+)/i);
    return match ? match[1].toLowerCase() : null;
  }
}

// Derive a readable name from a domain (e.g. "ametuniv.ac.in" -> "Ametuniv")
function deriveNameFromDomain(domain: string): string {
  const parts = domain.split(".");
  const mainPart = parts[0] === "www" && parts.length > 1 ? parts[1] : parts[0];
  if (!mainPart) return "College Profile";
  return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
}

// Detect if a string is a raw URL or website label (and not a legitimate college name)
export function isUrlOrWebsiteLabel(text?: string | null): boolean {
  if (!text) return true;
  const s = text.trim();
  if (!s) return true;
  if (/^https?:\/\//i.test(s)) return true;
  if (/^www\./i.test(s)) return true;
  if (/^(?:official\s+)?(?:web(?:site)?|site|url|portal|link)\s*[:=\-–—]/i.test(s)) return true;
  if (/^[a-z0-9\-]+(?:\.[a-z0-9\-]+)+(?:\/.*)?$/i.test(s) && !/\s/.test(s)) return true;
  return false;
}

/**
 * Parses raw text, objects, or arrays into clean, structured college items.
 */
export function parseBulkResearchInput(rawInput: unknown): ParsedResearchCollege[] {
  if (!rawInput) return [];

  // If input is an array of objects or strings
  if (Array.isArray(rawInput)) {
    const parsedItems: ParsedResearchCollege[] = [];
    for (const entry of rawInput) {
      if (typeof entry === "string") {
        parsedItems.push(...parseBulkResearchInput(entry));
      } else if (entry && typeof entry === "object") {
        const rawName = String((entry as any).name || (entry as any).collegeName || "").trim();
        const rawUrl = (entry as any).url || (entry as any).website || (entry as any).officialWebsiteUrl;
        const cleanedName = stripListPrefix(rawName);
        const normalizedUrl = rawUrl ? normalizeUrl(String(rawUrl)) : undefined;

        if (cleanedName || normalizedUrl) {
          const finalName = !isUrlOrWebsiteLabel(cleanedName)
            ? cleanedName
            : normalizedUrl
            ? deriveNameFromDomain(extractDomainFromUrl(normalizedUrl) || "college")
            : "College Profile";

          parsedItems.push({
            name: finalName,
            url: normalizedUrl,
          });
        }
      }
    }
    return deduplicateParsedColleges(parsedItems);
  }

  // If input is a single object
  if (typeof rawInput === "object") {
    const obj = rawInput as any;
    if (obj.text) return parseBulkResearchInput(obj.text);
    if (obj.colleges) return parseBulkResearchInput(obj.colleges);
    if (obj.name || obj.url) {
      return parseBulkResearchInput([obj]);
    }
    return [];
  }

  const text = String(rawInput || "").trim();
  if (!text) return [];

  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results: ParsedResearchCollege[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const currentLine = rawLines[i];

    // Check if current line is a pure website / URL line
    const websiteLineMatch = currentLine.match(WEBSITE_LABEL_LINE_REGEX);
    const pureUrlMatch = currentLine.match(/^(?:https?:\/\/\S+|www\.\S+)$/i);

    if (websiteLineMatch || pureUrlMatch) {
      const extractedUrl = normalizeUrl(websiteLineMatch ? websiteLineMatch[1] : pureUrlMatch![0]);

      // If previous item exists and does NOT have a URL yet, associate this URL with it!
      const lastItem = results.length > 0 ? results[results.length - 1] : null;
      if (lastItem && !lastItem.url) {
        lastItem.url = extractedUrl;
      } else {
        // Standalone URL entry
        const domain = extractDomainFromUrl(extractedUrl);
        results.push({
          name: domain ? deriveNameFromDomain(domain) : "College Profile",
          url: extractedUrl,
        });
      }
      continue;
    }

    // Check if line contains BOTH a college name and a URL on the same line
    // e.g. "1. AMET University - https://www.ametuniv.ac.in/"
    // or "Loyola College, www.loyolacollege.edu"
    const inlineUrlMatch = currentLine.match(/(https?:\/\/[^\s,;)"'>]+|www\.[a-z0-9\-]+(?:\.[a-z0-9\-]+)+(?:\/[^\s,;)"'>]*)?)/i);

    if (inlineUrlMatch) {
      const extractedUrl = normalizeUrl(inlineUrlMatch[0]);

      // Strip the URL and common separators / labels from the college name
      let remainingName = currentLine
        .replace(inlineUrlMatch[0], "")
        .replace(/(?:official\s+)?(?:web(?:site)?|site|url|portal|link)\s*[:=\-–—]?/gi, "")
        .replace(/^[\s\-–—,;:|/()]+|[\s\-–—,;:|/()]+$/g, "")
        .trim();

      remainingName = stripListPrefix(remainingName);

      if (remainingName && !isUrlOrWebsiteLabel(remainingName)) {
        results.push({
          name: remainingName,
          url: extractedUrl,
        });
        continue;
      }
    }

    // Otherwise, line is a college name without an inline URL
    const cleanedName = stripListPrefix(currentLine);
    if (!cleanedName) continue;

    // Check if the next line is a website URL line, so we can pair them immediately
    const nextLine = i + 1 < rawLines.length ? rawLines[i + 1] : null;
    let nextUrl: string | undefined = undefined;

    if (nextLine) {
      const nextWebsiteMatch = nextLine.match(WEBSITE_LABEL_LINE_REGEX);
      const nextPureUrl = nextLine.match(/^(?:https?:\/\/\S+|www\.\S+)$/i);
      if (nextWebsiteMatch || nextPureUrl) {
        nextUrl = normalizeUrl(nextWebsiteMatch ? nextWebsiteMatch[1] : nextPureUrl![0]);
        i++; // advance past the next line because we consumed it as this item's URL
      }
    }

    results.push({
      name: cleanedName,
      url: nextUrl,
    });
  }

  return deduplicateParsedColleges(results);
}

/**
 * Deduplicates parsed items within the same batch by normalized name and URL.
 */
function deduplicateParsedColleges(items: ParsedResearchCollege[]): ParsedResearchCollege[] {
  const seenNames = new Set<string>();
  const seenUrls = new Set<string>();
  const unique: ParsedResearchCollege[] = [];

  for (const item of items) {
    const normName = item.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normUrl = item.url ? normalizeUrl(item.url).toLowerCase().replace(/\/$/, "") : null;

    if (normUrl && seenUrls.has(normUrl)) {
      continue;
    }
    if (normName && seenNames.has(normName) && !normUrl) {
      continue;
    }

    if (normName) seenNames.add(normName);
    if (normUrl) seenUrls.add(normUrl);
    unique.push(item);
  }

  return unique;
}

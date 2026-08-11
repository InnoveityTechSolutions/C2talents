import { ExtractedTable } from "./types";

export function cleanHtmlText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, "")
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/id=["'][^"']*(cookie|banner|popup|ad|advertisement)[^"']*["']/gi, "") 
    .replace(/class=["'][^"']*(cookie|banner|popup|ad|advertisement)[^"']*["']/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

export function extractHtmlTables(html: string, pageUrl?: string): ExtractedTable[] {
  const tables: ExtractedTable[] = [];
  const tableMatches = html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi);

  for (const tableMatch of tableMatches) {
    const tableHtml = tableMatch[1];
    const headers: string[] = [];
    const rows: string[][] = [];

    // Extract headers (th)
    const headerMatches = tableHtml.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi);
    for (const hMatch of headerMatches) {
      const headerText = hMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (headerText) headers.push(headerText);
    }

    // Extract rows (tr)
    const trMatches = tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const trMatch of trMatches) {
      const trHtml = trMatch[1];
      const rowCells: string[] = [];
      const tdMatches = trHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi);

      for (const tdMatch of tdMatches) {
        const cellText = tdMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        rowCells.push(cellText);
      }

      if (rowCells.length > 0) {
        rows.push(rowCells);
      }
    }

    if (rows.length > 0 || headers.length > 0) {
      tables.push({ headers, rows, sourceUrl: pageUrl });
    }
  }

  return tables;
}

export function extractHtmlLists(html: string): string[][] {
  const lists: string[][] = [];
  const listMatches = html.matchAll(/<(?:ul|ol)[^>]*>([\s\S]*?)<\/(?:ul|ol)>/gi);

  for (const lMatch of listMatches) {
    const listHtml = lMatch[1];
    const items: string[] = [];
    const liMatches = listHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);

    for (const liMatch of liMatches) {
      const itemText = liMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (itemText && itemText.length > 1) {
        items.push(itemText);
      }
    }

    if (items.length > 0) {
      lists.push(items);
    }
  }

  return lists;
}

export function extractJsonLd(html: string): any[] {
  const jsonLdData: any[] = [];
  const scriptMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  for (const match of scriptMatches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed)) {
        jsonLdData.push(...parsed);
      } else if (parsed && typeof parsed === "object") {
        jsonLdData.push(parsed);
      }
    } catch {
      // Ignore invalid JSON-LD blocks
    }
  }

  return jsonLdData;
}

export function extractOpenGraphMeta(html: string): Record<string, string> {
  const og: Record<string, string> = {};
  const metaMatches = html.matchAll(/<meta[^>]+property=["'](og:[^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi);

  for (const match of metaMatches) {
    const key = match[1].toLowerCase().replace("og:", "");
    og[key] = match[2].trim();
  }

  // Also match content before property
  const altMetaMatches = html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](og:[^"']+)["'][^>]*>/gi);
  for (const match of altMetaMatches) {
    const key = match[2].toLowerCase().replace("og:", "");
    if (!og[key]) og[key] = match[1].trim();
  }

  return og;
}

export function extractSchemaOrgMeta(html: string): Record<string, string> {
  const schema: Record<string, string> = {};
  const matches = html.matchAll(/<meta[^>]+itemprop=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi);

  for (const match of matches) {
    schema[match[1].toLowerCase()] = match[2].trim();
  }

  return schema;
}


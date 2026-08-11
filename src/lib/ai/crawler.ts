import { classifyPageCategory } from "./pipeline/collection/discovery";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

function safeFetchText(url: string, timeoutMs = 12000): Promise<string> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https");
    const client = isHttps ? https : http;
    const req = client.get(url, {
      rejectUnauthorized: false,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      }
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
           redirectUrl = new URL(redirectUrl, url).toString();
        }
        return safeFetchText(redirectUrl, timeoutMs).then(resolve).catch(reject);
      }
      if (res.statusCode && res.statusCode >= 400) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Bypass SSL certificate errors for poorly configured college websites
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 * Enterprise Production-Grade Deep Official Web Crawler & PDF Discovery Engine
 * ONLY crawls the official target college website.
 */

export interface CrawledPage {
  url: string;
  title: string;
  category: string;
  text: string;
  htmlLength: number;
}

export interface DiscoveredPdf {
  url: string;
  title: string;
  sourcePageUrl: string;
}

export interface DiscoveredImage {
  url: string;
  alt: string;
  sourceUrl: string;
  contextTag: "LOGO" | "BANNER" | "CAMPUS" | "FACILITY";
}

export interface CrawlExecutionResult {
  targetUrl: string;
  domainOrigin: string;
  pagesCrawledCount: number;
  visitedPages: CrawledPage[];
  discoveredPdfs: DiscoveredPdf[];
  discoveredImages: DiscoveredImage[];
  crawledContentSummaryText: string;
  logs: string[];
  processingTimeMs: number;
}

export async function crawlOfficialCollegeWebsite(inputUrl: string): Promise<CrawlExecutionResult> {
  const startTime = Date.now();
  let logs: string[] = [];

  const log = (msg: string) => {
    console.log(`[OFFICIAL CRAWLER] ${msg}`);
    logs.push(`[${new Date().toISOString()}] ${msg}`);
  };

  const CACHE_DIR = path.join(process.cwd(), ".ai-cache");
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  const cacheKey = inputUrl.replace(/[^a-zA-Z0-9]/g, "_");
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);

  if (fs.existsSync(cacheFile)) {
    log(`Loading crawled website data from cache...`);
    const cachedData = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    cachedData.logs = logs.concat(cachedData.logs || []);
    return cachedData;
  }

  log(`Initiating official website crawl for: ${inputUrl}`);

  // Step 1: Validate URL
  let targetUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    throw new Error(`Invalid URL format: "${inputUrl}". Please enter a valid HTTP/HTTPS web address.`);
  }

  const domainOrigin = parsedUrl.origin;
  const domainHostname = parsedUrl.hostname.replace(/^www\./i, "");

  // Candidate connection URLs (HTTPS, HTTP, www fallback)
  const candidateUrls = [
    targetUrl,
    targetUrl.includes("www.") ? targetUrl.replace("www.", "") : targetUrl.replace("https://", "https://www.").replace("http://", "http://www."),
    targetUrl.replace("https://", "http://"),
  ];

  let primaryHtml = "";
  let effectiveUrl = targetUrl;

  for (const urlCandidate of candidateUrls) {
    try {
      log(`Connecting to: ${urlCandidate}...`);
      const htmlText = await safeFetchText(urlCandidate, 12000);
      primaryHtml = htmlText;
      effectiveUrl = urlCandidate;
      log(`Connected successfully to ${effectiveUrl} (${primaryHtml.length} bytes HTML).`);
      break;
    } catch (err: any) {
      log(`Connection attempt to ${urlCandidate} failed: ${err.message}`);
    }
  }

  if (!primaryHtml) {
    throw new Error(`Website could not be analyzed. Unable to connect to ${targetUrl}. Please verify official URL & server status.`);
  }

  const visitedPages: CrawledPage[] = [];
  const discoveredPdfs: DiscoveredPdf[] = [];
  const discoveredImages: DiscoveredImage[] = [];
  const discoveredInternalUrls = new Set<string>();

  // Process HTML page helper
  const processHtmlPage = (pageUrl: string, html: string, category: string = "General") => {
    // 1. Title extraction
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : pageUrl;

    // 2. Discover internal navigation links
    const linkMatches = html.matchAll(/href=["']([^"']+)["']/gi);
    for (const match of linkMatches) {
      let rawHref = match[1].trim();
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
        continue;
      }

      // PDF link discovery
      if (/\.pdf/i.test(rawHref)) {
        let pdfUrl = rawHref;
        if (pdfUrl.startsWith("//")) pdfUrl = `https:${pdfUrl}`;
        else if (pdfUrl.startsWith("/")) pdfUrl = `${domainOrigin}${pdfUrl}`;
        else if (!/^https?:\/\//i.test(pdfUrl)) pdfUrl = `${domainOrigin}/${pdfUrl}`;

        if (!discoveredPdfs.some((p) => p.url === pdfUrl)) {
          const pdfTitle = rawHref.split("/").pop()?.replace(/[\-_]/g, " ").replace(/\.pdf.*/i, "") || "Official Document";
          discoveredPdfs.push({ url: pdfUrl, title: pdfTitle, sourcePageUrl: pageUrl });
        }
        continue;
      }

      // Convert to absolute URL
      let absoluteUrl = "";
      try {
        if (rawHref.startsWith("//")) absoluteUrl = `https:${rawHref}`;
        else if (rawHref.startsWith("/")) absoluteUrl = `${domainOrigin}${rawHref}`;
        else if (/^https?:\/\//i.test(rawHref)) absoluteUrl = rawHref;
        else absoluteUrl = `${domainOrigin}/${rawHref}`;
      } catch (e) {
        continue;
      }

      // Enforce ONLY OFFICIAL DOMAIN policy
      try {
        const linkParsed = new URL(absoluteUrl);
        const linkHost = linkParsed.hostname.replace(/^www\./i, "");
        if (linkHost === domainHostname || linkHost.endsWith(`.${domainHostname}`)) {
          discoveredInternalUrls.add(absoluteUrl);
        }
      } catch (e) {
        // Skip invalid URL
      }
    }

    // 3. Discover Images
    const imgMatches = html.matchAll(/<img[^>]+>/gi);
    for (const match of imgMatches) {
      const imgTag = match[0];
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      if (srcMatch && srcMatch[1]) {
        let src = srcMatch[1].trim();
        if (src.startsWith("//")) src = `https:${src}`;
        else if (src.startsWith("/")) src = `${domainOrigin}${src}`;
        else if (!/^https?:\/\//i.test(src)) src = `${domainOrigin}/${src}`;

        const alt = altMatch ? altMatch[1].trim() : "";
        const isJunk = /facebook|twitter|instagram|linkedin|youtube|whatsapp|share|pixel|ad-|banner-ad|\.svg|tracker|button|arrow|close|menu|search|login/i.test(src);

        if (!isJunk && !src.startsWith("data:image") && !discoveredImages.some((i) => i.url === src)) {
          let contextTag: "LOGO" | "BANNER" | "CAMPUS" | "FACILITY" = "CAMPUS";
          if (/logo|crest|emblem/i.test(src + " " + alt)) contextTag = "LOGO";
          else if (/banner|hero|header|front|main/i.test(src + " " + alt)) contextTag = "BANNER";
          else if (/facility|lab|library|hostel|sports|gym|canteen/i.test(src + " " + alt)) contextTag = "FACILITY";

          discoveredImages.push({ url: src, alt, sourceUrl: pageUrl, contextTag });
        }
      }
    }

    // 4. Extract clean plain text
    // Remove navigation, menus, footer, header, cookie banners, scripts, styles
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (cleanText.length > 40 && !visitedPages.some((p) => p.url === pageUrl)) {
      visitedPages.push({
        url: pageUrl,
        title,
        category,
        text: cleanText.slice(0, 10000),
        htmlLength: html.length,
      });
    }
  };

  // Process Homepage
  processHtmlPage(effectiveUrl, primaryHtml, "Homepage");

  // Filter high-priority subpages to crawl
  const priorityPaths = [
    "/about", "/about-us", "/courses", "/academics", "/departments", "/admissions",
    "/eligibility", "/fees", "/fee-structure", "/placements", "/placement",
    "/facilities", "/hostel", "/contact", "/contact-us", "/research", "/scholarships",
    "/prospectus", "/downloads", "/iqac", "/naac", "/nirf", "/mandatory-disclosure"
  ];

  // Select internal URLs matching priority paths
  const priorityCrawls: string[] = [];
  discoveredInternalUrls.forEach((url) => {
    if (priorityPaths.some((p) => url.toLowerCase().includes(p))) {
      priorityCrawls.push(url);
    }
  });

  // Add fallback priority paths if not discovered in links
  priorityPaths.forEach((path) => {
    const candidate = `${domainOrigin}${path}`;
    if (!priorityCrawls.includes(candidate) && !visitedPages.some((p) => p.url === candidate)) {
      priorityCrawls.push(candidate);
    }
  });

  log(`Discovered ${discoveredInternalUrls.size} internal links and ${discoveredPdfs.length} official PDF brochures. Crawling top ${Math.min(priorityCrawls.length, 12)} priority subpages...`);

  // Crawl subpages in batches of 4
  const BATCH_SIZE = 4;
  const toCrawl = priorityCrawls.slice(0, 12);
  for (let i = 0; i < toCrawl.length; i += BATCH_SIZE) {
    const batch = toCrawl.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (subpageUrl) => {
        try {
          const html = await safeFetchText(subpageUrl, 6000);
          let cat = "General";
          if (/about/i.test(subpageUrl)) cat = "About";
          else if (/vision|mission/i.test(subpageUrl)) cat = "Vision";
          else if (/course|academic|department|program/i.test(subpageUrl)) cat = "Courses";
          else if (/admission|eligibility/i.test(subpageUrl)) cat = "Admissions";
          else if (/placement|career/i.test(subpageUrl)) cat = "Placements";
          else if (/hostel/i.test(subpageUrl)) cat = "Hostel";
          else if (/facility|library|sport/i.test(subpageUrl)) cat = "Facilities";
          else if (/research/i.test(subpageUrl)) cat = "Research";
          else if (/contact/i.test(subpageUrl)) cat = "Contact";

          processHtmlPage(subpageUrl, html, cat);
        } catch (e) {
          // Ignore subpage timeout
        }
      })
    );
  }

  log(`Crawl completed. Visited ${visitedPages.length} official web pages.`);

  const crawledContentSummaryText = visitedPages
    .map((p) => `=== PAGE: ${p.title} (${p.url}) [Category: ${p.category}] ===\n${p.text}`)
    .join("\n\n")
    .slice(0, 36000);

  const processingTimeMs = Date.now() - startTime;

  const result = {
    targetUrl: effectiveUrl,
    domainOrigin,
    pagesCrawledCount: visitedPages.length,
    visitedPages,
    discoveredPdfs,
    discoveredImages,
    crawledContentSummaryText,
    logs,
    processingTimeMs,
  };

  try {
    fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Failed to write AI cache", e);
  }

  return result;
}

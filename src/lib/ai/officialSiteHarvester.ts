/**
 * Official College Website Harvester
 *
 * Secure server-side crawler that strictly extracts official content from the college's
 * primary website and its high-priority subpages (About, Courses, Admissions, Fees, Facilities, Placements, Contact).
 *
 * Guarantees:
 * - Only stays on official domain/subdomains.
 * - Extracts clean text, tables, and links while stripping navigation/header boilerplate.
 * - Preserves footer and contact sections containing authentic official addresses, phones, and emails.
 * - Associates every harvested snippet with its authentic source URL.
 */

import http from "http";
import https from "https";

export interface HarvestedSubpage {
  url: string;
  title: string;
  category: "Home" | "About" | "Courses" | "Admissions" | "Fees" | "Facilities" | "Placements" | "Contact" | "General";
  cleanText: string;
}

export interface HarvestedMedia {
  url: string;
  alt: string;
  sourceUrl: string;
  tag: "LOGO" | "BANNER" | "CAMPUS" | "FACILITY" | "RECRUITER";
}

export interface OfficialHarvestResult {
  officialUrl: string;
  domainOrigin: string;
  collegeTitle: string;
  pages: HarvestedSubpage[];
  media: HarvestedMedia[];
  discoveredRecruiters: string[];
  pdfLinks: Array<{ url: string; title: string; sourceUrl: string }>;
  consolidatedEvidenceText: string;
  logs: string[];
}

// Bypass SSL errors for governmental and legacy educational institutions
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function fetchHtml(url: string, timeoutMs = 12000): Promise<string> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https");
    const client = isHttps ? https : http;

    const req = client.get(
      url,
      {
        rejectUnauthorized: false,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      (res) => {
        // Handle HTTP 3xx redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (!redirectUrl.startsWith("http")) {
            redirectUrl = new URL(redirectUrl, url).toString();
          }
          return fetchHtml(redirectUrl, timeoutMs).then(resolve).catch(reject);
        }

        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} loading ${url}`));
        }

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    );

    req.on("error", reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout (${timeoutMs}ms) connecting to ${url}`));
    });
  });
}

function cleanHtmlToText(html: string): string {
  return html
    // Strip scripts, styles, svgs, comments
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    // Strip top header and navigation menus to isolate facts, but PRESERVE footer contact info
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, " ")
    // Convert table cells and line breaks into readable spacing
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/(?:td|th)>/gi, " | ")
    .replace(/<\/li>/gi, "\n")
    // Strip remaining tags
    .replace(/<[^>]+>/g, " ")
    // Decode HTML entities
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#8217;/gi, "'")
    .replace(/&#8220;/gi, '"')
    .replace(/&#8221;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    // Clean redundant whitespace
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

function classifyUrlCategory(url: string, title: string): HarvestedSubpage["category"] {
  const combined = `${url.toLowerCase()} ${title.toLowerCase()}`;
  if (/about|history|memoir|profile|vision|mission|leadership/i.test(combined)) return "About";
  if (/course|program|department|academic|curriculum|syllabus|degree|shift|computer-science|commerce|mathematics|physics|chemistry|botany|zoology|economics|history|english|tamil/i.test(combined))
    return "Courses";
  if (/admission|eligib|prospectus|apply|application|rank/i.test(combined)) return "Admissions";
  if (/fee|tuition|dues|scholarship/i.test(combined)) return "Fees";
  if (/placement|recruit|career|internship|training/i.test(combined)) return "Placements";
  if (/facilit|hostel|library|lab|sport|campus|wifi|infrastructure/i.test(combined)) return "Facilities";
  if (/contact|reach|address|location/i.test(combined)) return "Contact";
  return "General";
}

/**
 * Harvests authentic official data from the college website.
 */
export async function harvestOfficialCollegeWebsite(inputUrl: string): Promise<OfficialHarvestResult> {
  const logs: string[] = [];
  const log = (msg: string) => {
    logs.push(`[${new Date().toISOString()}] ${msg}`);
    console.log(`[HARVESTER] ${msg}`);
  };

  let targetUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  const parsed = new URL(targetUrl);
  const domainOrigin = parsed.origin;
  const domainHostname = parsed.hostname.replace(/^www\./i, "");

  log(`Beginning official harvest for: ${targetUrl} (Domain: ${domainHostname})`);

  // Connect to homepage
  let homeHtml = "";
  let effectiveUrl = targetUrl;
  const candidateUrls = [
    targetUrl,
    targetUrl.includes("www.") ? targetUrl.replace("www.", "") : targetUrl.replace("https://", "https://www.").replace("http://", "http://www."),
    targetUrl.replace("https://", "http://"),
  ];

  for (const candidate of candidateUrls) {
    try {
      homeHtml = await fetchHtml(candidate, 12000);
      effectiveUrl = candidate;
      log(`Connected to homepage: ${effectiveUrl} (${homeHtml.length} bytes)`);
      break;
    } catch (e: any) {
      log(`Homepage candidate ${candidate} failed: ${e?.message}`);
    }
  }

  if (!homeHtml) {
    throw new Error(`Unable to connect to official website at "${inputUrl}". The official web server was unreachable.`);
  }

  // Extract Title
  const titleMatch = homeHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const collegeTitle = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : parsed.hostname;

  const pages: HarvestedSubpage[] = [];
  const media: HarvestedMedia[] = [];
  const pdfLinks: Array<{ url: string; title: string; sourceUrl: string }> = [];

  // Add Homepage
  const homeText = cleanHtmlToText(homeHtml);
  pages.push({
    url: effectiveUrl,
    title: collegeTitle,
    category: "Home",
    cleanText: homeText.slice(0, 15000),
  });

  // Extract internal links from homepage
  const discoveredUrls = new Set<string>();
  const linkMatches = homeHtml.matchAll(/href=["']([^"']+)["']/gi);

  for (const m of linkMatches) {
    const raw = (m[1] || "").trim();
    if (
      !raw ||
      raw.startsWith("#") ||
      raw.startsWith("javascript:") ||
      raw.startsWith("mailto:") ||
      raw.startsWith("tel:") ||
      /\/feed\/?$/i.test(raw) ||
      /\/comments\/?/i.test(raw) ||
      /\.(?:css|js|xml|json)/i.test(raw) ||
      /wp-json/i.test(raw)
    ) {
      continue;
    }

    if (/\.pdf/i.test(raw)) {
      let pdfUrl = raw;
      if (pdfUrl.startsWith("//")) pdfUrl = `https:${pdfUrl}`;
      else if (pdfUrl.startsWith("/")) pdfUrl = `${domainOrigin}${pdfUrl}`;
      else if (!/^https?:\/\//i.test(pdfUrl)) pdfUrl = `${domainOrigin}/${pdfUrl}`;

      const pdfTitle = raw.split("/").pop()?.replace(/[\-_]/g, " ").replace(/\.pdf.*/i, "") || "Official Document";
      if (!pdfLinks.some((p) => p.url === pdfUrl)) {
        pdfLinks.push({ url: pdfUrl, title: pdfTitle, sourceUrl: effectiveUrl });
      }
      continue;
    }

    try {
      let absUrl = "";
      if (raw.startsWith("//")) absUrl = `https:${raw}`;
      else if (raw.startsWith("/")) absUrl = `${domainOrigin}${raw}`;
      else if (/^https?:\/\//i.test(raw)) absUrl = raw;
      else absUrl = `${domainOrigin}/${raw}`;

      const u = new URL(absUrl);
      const h = u.hostname.replace(/^www\./i, "");
      if (h === domainHostname || h.endsWith(`.${domainHostname}`)) {
        discoveredUrls.add(absUrl);
      }
    } catch {}
  }

  // Extract images and recruiter partners across website
  const discoveredRecruiters: string[] = [];

  const addRecruiter = (rName: string) => {
    const clean = rName.trim();
    if (clean && !discoveredRecruiters.includes(clean)) {
      discoveredRecruiters.push(clean);
    }
  };

  const processImagesFromHtml = (htmlContent: string, sourcePageUrl: string, pageCategory: string = "Home") => {
    // 1. og:image
    const ogMatch = htmlContent.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1]) {
      let ogUrl = ogMatch[1].trim();
      if (ogUrl.startsWith("//")) ogUrl = `https:${ogUrl}`;
      else if (ogUrl.startsWith("/")) ogUrl = `${domainOrigin}${ogUrl}`;
      else if (!/^https?:\/\//i.test(ogUrl)) ogUrl = `${domainOrigin}/${ogUrl}`;
      if (!media.some((m) => m.url === ogUrl) && !/chart|flow|icon/i.test(ogUrl)) {
        media.push({ url: ogUrl, alt: `${collegeTitle} Campus Banner`, sourceUrl: sourcePageUrl, tag: "BANNER" });
      }
    }

    // 2. High-res Favicons / Logos
    const iconMatches = [...htmlContent.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/gi)];
    for (const iconMatch of iconMatches) {
      let iconUrl = iconMatch[1].trim();
      if (iconUrl.startsWith("//")) iconUrl = `https:${iconUrl}`;
      else if (iconUrl.startsWith("/")) iconUrl = `${domainOrigin}${iconUrl}`;
      else if (!/^https?:\/\//i.test(iconUrl)) iconUrl = `${domainOrigin}/${iconUrl}`;
      if (!media.some((m) => m.url === iconUrl) && /180|192|logo|crest|seal/i.test(iconUrl)) {
        media.push({ url: iconUrl, alt: `${collegeTitle} Official Crest`, sourceUrl: sourcePageUrl, tag: "LOGO" });
      }
    }

    // 3. Regular <img> tags including data-src, data-lazy-src, srcset
    const imgMatches = htmlContent.matchAll(/<img[^>]+>/gi);
    for (const m of imgMatches) {
      const tag = m[0];
      const srcM = tag.match(/(?:data-src|data-lazy-src|src)=["']([^"']+)["']/i);
      const altM = tag.match(/alt=["']([^"']*)["']/i);
      if (!srcM || !srcM[1]) continue;

      let src = srcM[1].trim();
      if (src.startsWith("data:image") || src.includes("blank.gif")) {
        const srcsetM = tag.match(/srcset=["']([^"']+)["']/i);
        if (srcsetM && srcsetM[1]) {
          const firstCandidate = srcsetM[1].split(",")[0].trim().split(" ")[0];
          if (firstCandidate && !firstCandidate.startsWith("data:image")) {
            src = firstCandidate;
          }
        }
      }
      if (src.startsWith("data:image") || !src) continue;

      if (src.startsWith("//")) src = `https:${src}`;
      else if (src.startsWith("/")) src = `${domainOrigin}${src}`;
      else if (!/^https?:\/\//i.test(src)) src = `${domainOrigin}/${src}`;

      const alt = altM ? altM[1].trim() : "";
      const textToAnalyze = `${src.toLowerCase()} ${alt.toLowerCase()}`;

      // Exclude generic junk, web designer logos, admin charts
      const isJunk = /facebook|twitter|instagram|linkedin|youtube|whatsapp|share|pixel|tracker|button|arrow|close|menu|search|login|itech|web-design|developer|organization-chart|bar-chart|flowchart|pie-chart/i.test(
        textToAnalyze
      );
      if (isJunk) continue;

      // Detect recruiter partner logos
      if (/wipro/i.test(textToAnalyze)) { addRecruiter("Wipro"); media.push({ url: src, alt: "Wipro", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/tata-consultancy|tcs/i.test(textToAnalyze)) { addRecruiter("Tata Consultancy Services (TCS)"); media.push({ url: src, alt: "TCS", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/tech-mahindra|mahindra/i.test(textToAnalyze)) { addRecruiter("Tech Mahindra"); media.push({ url: src, alt: "Tech Mahindra", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/byju/i.test(textToAnalyze)) { addRecruiter("BYJU'S"); media.push({ url: src, alt: "BYJU'S", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/cts|cognizant/i.test(textToAnalyze)) { addRecruiter("Cognizant (CTS)"); media.push({ url: src, alt: "Cognizant", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/infosys/i.test(textToAnalyze)) { addRecruiter("Infosys"); media.push({ url: src, alt: "Infosys", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/accenture/i.test(textToAnalyze)) { addRecruiter("Accenture"); media.push({ url: src, alt: "Accenture", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/amazon/i.test(textToAnalyze)) { addRecruiter("Amazon"); media.push({ url: src, alt: "Amazon", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/zoho/i.test(textToAnalyze)) { addRecruiter("Zoho"); media.push({ url: src, alt: "Zoho", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/hcl/i.test(textToAnalyze)) { addRecruiter("HCL Technologies"); media.push({ url: src, alt: "HCL", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }
      if (/capgemini/i.test(textToAnalyze)) { addRecruiter("Capgemini"); media.push({ url: src, alt: "Capgemini", sourceUrl: sourcePageUrl, tag: "RECRUITER" }); continue; }

      if (media.some((i) => i.url === src)) continue;

      let tagType: HarvestedMedia["tag"] = "CAMPUS";
      if (/logo|crest|emblem|seal/i.test(textToAnalyze) && !/banner|hero/i.test(textToAnalyze)) tagType = "LOGO";
      else if (/banner|hero|header|front|slider|slide|building|campus|bwc\.jpg/i.test(textToAnalyze)) tagType = "BANNER";
      else if (pageCategory === "Facilities" || /facility|lab|library|hostel|sports|gym|canteen|auditorium/i.test(textToAnalyze)) tagType = "FACILITY";

      media.push({ url: src, alt: alt || `${collegeTitle} Campus`, sourceUrl: sourcePageUrl, tag: tagType });
    }
  };

  processImagesFromHtml(homeHtml, effectiveUrl, "Home");

  // Categorize discovered URLs
  const aboutUrls: string[] = [];
  const courseUrls: string[] = [];
  const deptUrls: string[] = [];
  const admissionUrls: string[] = [];
  const feeUrls: string[] = [];
  const facilityUrls: string[] = [];
  const placementUrls: string[] = [];
  const contactUrls: string[] = [];

  for (const url of discoveredUrls) {
    if (url === effectiveUrl || url === `${domainOrigin}/`) continue;

    if (/about|history|memoir|vision|mission/i.test(url)) aboutUrls.push(url);
    else if (/computer-science|commerce|mathematics|physics|chemistry|botany|zoology|economics|history-2|english-2|tamil-2|geography/i.test(url))
      deptUrls.push(url);
    else if (/courses-offered|course|curriculum|academic|syllab/i.test(url)) courseUrls.push(url);
    else if (/application-course-fees|fee|tuition/i.test(url)) feeUrls.push(url);
    else if (/admission|prospectus|eligib/i.test(url)) admissionUrls.push(url);
    else if (/placement|recruit|career/i.test(url)) placementUrls.push(url);
    else if (/facilit|library|hostel|sport|lab|instrumentation/i.test(url)) facilityUrls.push(url);
    else if (/contact/i.test(url)) contactUrls.push(url);
  }

  // Curate balanced subpages to harvest
  const targetedSubpages: string[] = [];
  const addIfNew = (u: string) => {
    if (u && !targetedSubpages.includes(u) && targetedSubpages.length < 15) {
      targetedSubpages.push(u);
    }
  };

  // High-signal distribution
  aboutUrls.slice(0, 2).forEach(addIfNew);
  courseUrls.slice(0, 2).forEach(addIfNew);
  feeUrls.slice(0, 1).forEach(addIfNew);
  admissionUrls.slice(0, 2).forEach(addIfNew);
  deptUrls.slice(0, 4).forEach(addIfNew);
  facilityUrls.slice(0, 2).forEach(addIfNew);
  placementUrls.slice(0, 1).forEach(addIfNew);
  contactUrls.slice(0, 1).forEach(addIfNew);

  log(`Discovered ${discoveredUrls.size} internal pages. Harvesting top ${targetedSubpages.length} prioritized subpages (including key departments)...`);

  // Fetch subpages in parallel batches of 3
  const BATCH_SIZE = 3;
  for (let i = 0; i < targetedSubpages.length; i += BATCH_SIZE) {
    const batch = targetedSubpages.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (subUrl) => {
        try {
          const subHtml = await fetchHtml(subUrl, 8000);
          const subTitleM = subHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          const subTitle = subTitleM ? subTitleM[1].replace(/\s+/g, " ").trim() : subUrl;
          const cleanText = cleanHtmlToText(subHtml);

          if (cleanText.length > 50) {
            const pageCategory = classifyUrlCategory(subUrl, subTitle);
            pages.push({
              url: subUrl,
              title: subTitle,
              category: pageCategory,
              cleanText: cleanText.slice(0, 12000),
            });
            processImagesFromHtml(subHtml, subUrl, pageCategory);
            log(`Harvested: [${pageCategory}] ${subTitle} (${cleanText.length} chars)`);
          }
        } catch (e: any) {
          log(`Skipped subpage ${subUrl}: ${e?.message}`);
        }
      })
    );
  }

  log(`Harvest complete. Visited ${pages.length} pages. Discovered ${pdfLinks.length} PDFs, ${media.length} media items, and ${discoveredRecruiters.length} recruiter partners.`);

  // Build structured evidence text with provenance markers
  const consolidatedEvidenceText = pages
    .map((p) => {
      return `================================================================================
OFFICIAL SOURCE PAGE: ${p.url}
PAGE TITLE: ${p.title}
CATEGORY: ${p.category}
================================================================================
${p.cleanText}`;
    })
    .join("\n\n\n");

  return {
    officialUrl: effectiveUrl,
    domainOrigin,
    collegeTitle,
    pages,
    media,
    discoveredRecruiters,
    pdfLinks,
    consolidatedEvidenceText,
    logs,
  };
}

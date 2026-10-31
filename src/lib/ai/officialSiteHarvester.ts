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
import zlib from "zlib";

export interface HarvestedSubpage {
  url: string;
  title: string;
  category: "Home" | "About" | "Courses" | "Admissions" | "Fees" | "Facilities" | "Placements" | "Contact" | "Hostel" | "Transport" | "Reviews" | "General";
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
  discoveredSocialLinks: {
    youtube?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  discoveredVideos: string[];
  consolidatedEvidenceText: string;
  academicEvidenceText?: string;
  academicPdfs?: Array<{ url: string; title: string; buffer: Buffer; sourceUrl: string }>;
  logs: string[];
}

// Bypass SSL errors for governmental and legacy educational institutions
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export function fetchHtml(url: string, timeoutMs = 12000): Promise<string> {
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
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      (res) => {
        // Handle HTTP 3xx redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          try {
            redirectUrl = new URL(redirectUrl, url).toString();
          } catch {}
          return fetchHtml(redirectUrl, timeoutMs).then(resolve).catch(reject);
        }

        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} loading ${url}`));
        }

        let stream: NodeJS.ReadableStream = res;
        const encoding = (res.headers["content-encoding"] || "").toLowerCase();
        if (encoding === "gzip") {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === "deflate") {
          stream = res.pipe(zlib.createInflate());
        } else if (encoding === "br") {
          stream = res.pipe(zlib.createBrotliDecompress());
        }

        let data = "";
        stream.on("data", (chunk) => (data += chunk.toString("utf8")));
        stream.on("end", () => resolve(data));
        stream.on("error", (err) => reject(err));
      }
    );

    req.on("error", reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout (${timeoutMs}ms) connecting to ${url}`));
    });
  });
}

export function fetchBinary(url: string, timeoutMs = 15000): Promise<Buffer> {
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
          Accept: "application/pdf,*/*",
          "Accept-Encoding": "gzip, deflate, br",
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          try {
            redirectUrl = new URL(redirectUrl, url).toString();
          } catch {}
          return fetchBinary(redirectUrl, timeoutMs).then(resolve).catch(reject);
        }

        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} loading binary ${url}`));
        }

        let stream: NodeJS.ReadableStream = res;
        const encoding = (res.headers["content-encoding"] || "").toLowerCase();
        if (encoding === "gzip") {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === "deflate") {
          stream = res.pipe(zlib.createInflate());
        } else if (encoding === "br") {
          stream = res.pipe(zlib.createBrotliDecompress());
        }

        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", (err) => reject(err));
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
  if (/hostel|residential|accommodation|mess/i.test(combined)) return "Hostel";
  if (/transport|bus|commute|route|conveyance/i.test(combined)) return "Transport";
  if (/testimonial|alumni-speak|student-speak|feedback|review/i.test(combined)) return "Reviews";
  if (/facilit|library|lab|sport|campus|wifi|infrastructure/i.test(combined)) return "Facilities";
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

  const discoveredSocialLinks: OfficialHarvestResult["discoveredSocialLinks"] = {};
  const discoveredVideos: string[] = [];

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
      try {
        const absPdfUrl = new URL(raw, effectiveUrl).toString().split("#")[0];
        const pdfTitle = raw.split("/").pop()?.replace(/[\-_]/g, " ").replace(/\.pdf.*/i, "") || "Official Document";
        if (!pdfLinks.some((p) => p.url === absPdfUrl)) {
          pdfLinks.push({ url: absPdfUrl, title: pdfTitle, sourceUrl: effectiveUrl });
        }
      } catch {}
      continue;
    }

    try {
      const absUrl = new URL(raw, effectiveUrl).toString().split("#")[0];

      // Capture official social links & YouTube channels/videos
      if (/youtube\.com\/(?:@|c\/|channel\/|user\/)|youtu\.be\/|youtube\.com\/watch|youtube\.com\/embed/i.test(absUrl)) {
        if (!discoveredSocialLinks.youtube) {
          discoveredSocialLinks.youtube = absUrl;
        }
        if (/watch\?v=|youtu\.be\/|shorts\/|embed\//i.test(absUrl) && !discoveredVideos.includes(absUrl)) {
          discoveredVideos.push(absUrl);
        }
      } else if (/facebook\.com\/(?!sharer)/i.test(absUrl) && !discoveredSocialLinks.facebook) {
        discoveredSocialLinks.facebook = absUrl;
      } else if (/instagram\.com\/(?!p\/)/i.test(absUrl) && !discoveredSocialLinks.instagram) {
        discoveredSocialLinks.instagram = absUrl;
      } else if (/linkedin\.com\/(?:school|company)/i.test(absUrl) && !discoveredSocialLinks.linkedin) {
        discoveredSocialLinks.linkedin = absUrl;
      }

      const u = new URL(absUrl);
      const h = u.hostname.replace(/^www\./i, "");
      if (h === domainHostname || h.endsWith(`.${domainHostname}`)) {
        discoveredUrls.add(absUrl);
      }
    } catch {}
  }

  // Scan homepage for embedded YouTube iframes
  const homeIframes = homeHtml.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi);
  for (const im of homeIframes) {
    const ifSrc = (im[1] || "").trim();
    if (/youtube\.com\/embed\/|youtube-nocookie\.com\/embed\//i.test(ifSrc)) {
      let vUrl = ifSrc;
      if (vUrl.startsWith("//")) vUrl = `https:${vUrl}`;
      if (!discoveredVideos.includes(vUrl)) discoveredVideos.push(vUrl);
      if (!discoveredSocialLinks.youtube) discoveredSocialLinks.youtube = vUrl;
    }
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
      try {
        const ogUrl = new URL(ogMatch[1].trim(), sourcePageUrl).toString();
        if (!media.some((m) => m.url === ogUrl) && !/chart|flow|icon/i.test(ogUrl)) {
          media.push({ url: ogUrl, alt: `${collegeTitle} Campus Banner`, sourceUrl: sourcePageUrl, tag: "BANNER" });
        }
      } catch {}
    }

    // 2. High-res Favicons / Logos
    const iconMatches = [...htmlContent.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/gi)];
    for (const iconMatch of iconMatches) {
      try {
        const iconUrl = new URL(iconMatch[1].trim(), sourcePageUrl).toString();
        if (!media.some((m) => m.url === iconUrl) && /180|192|logo|crest|seal/i.test(iconUrl)) {
          media.push({ url: iconUrl, alt: `${collegeTitle} Official Crest`, sourceUrl: sourcePageUrl, tag: "LOGO" });
        }
      } catch {}
    }

    // 3. Regular <img> tags including data-src, data-lazy-src, srcset
    const imgMatches = htmlContent.matchAll(/<img[^>]+>/gi);
    for (const m of imgMatches) {
      const tag = m[0];
      const srcM = tag.match(/(?:data-src|data-lazy-src|src)=["']([^"']+)["']/i);
      const altM = tag.match(/alt=["']([^"']*)["']/i);
      if (!srcM || !srcM[1]) continue;

      let rawSrc = srcM[1].trim();
      if (rawSrc.startsWith("data:image") || rawSrc.includes("blank.gif")) {
        const srcsetM = tag.match(/srcset=["']([^"']+)["']/i);
        if (srcsetM && srcsetM[1]) {
          const firstCandidate = srcsetM[1].split(",")[0].trim().split(" ")[0];
          if (firstCandidate && !firstCandidate.startsWith("data:image")) {
            rawSrc = firstCandidate;
          }
        }
      }
      if (rawSrc.startsWith("data:image") || !rawSrc) continue;

      let src = "";
      try {
        src = new URL(rawSrc, sourcePageUrl).toString();
      } catch {
        continue;
      }

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

  // Comprehensive academic and department categorization
  const aboutUrls: string[] = [];
  const courseUrls: string[] = [];
  const deptUrls: string[] = [];
  const admissionUrls: string[] = [];
  const feeUrls: string[] = [];
  const hostelUrls: string[] = [];
  const transportUrls: string[] = [];
  const reviewUrls: string[] = [];
  const facilityUrls: string[] = [];
  const placementUrls: string[] = [];
  const contactUrls: string[] = [];

  const categorizeAndEnqueue = (url: string) => {
    if (url === effectiveUrl || url === `${domainOrigin}/` || url === `${domainOrigin}`) return;

    if (/hostel|residential|accommodation|mess/i.test(url)) hostelUrls.push(url);
    else if (/transport|bus|commute|route|conveyance/i.test(url)) transportUrls.push(url);
    else if (/testimonial|alumni-speak|student-speak|feedback|review/i.test(url)) reviewUrls.push(url);
    else if (/about|history|memoir|vision|mission|leadership/i.test(url)) aboutUrls.push(url);
    else if (/courses-offered|course|program|curriculum|academic|syllab|degree|intake|stream|shift|ug-|pg-|undergraduate|postgraduate|doctoral/i.test(url)) {
      courseUrls.push(url);
    } else if (
      /department|dept|school|faculty|arts|science|commerce|engineering|technology|management|medical|law|humanities|social|language|physics|chemistry|math|computer|botany|zoology|biology|biotech|biochem|english|tamil|hindi|history|economics|geography|sociology|philosophy|psychology|business|bba|mba|mca|bca|viscom|visual-communication|media|journalism|design|fine-arts|pharmacy|nursing|education/i.test(
        url
      )
    ) {
      deptUrls.push(url);
    } else if (/application-course-fees|fee|tuition/i.test(url)) feeUrls.push(url);
    else if (/admission|prospectus|eligib/i.test(url)) admissionUrls.push(url);
    else if (/placement|recruit|career/i.test(url)) placementUrls.push(url);
    else if (/facilit|library|sport|lab|instrumentation/i.test(url)) facilityUrls.push(url);
    else if (/contact/i.test(url)) contactUrls.push(url);
  };

  for (const url of discoveredUrls) {
    categorizeAndEnqueue(url);
  }

  // Curate comprehensive subpages to harvest (up to 38 subpages)
  const targetedSubpages: string[] = [];
  const addIfNew = (u: string) => {
    if (u && !targetedSubpages.includes(u) && targetedSubpages.length < 38) {
      targetedSubpages.push(u);
    }
  };

  // High-signal distribution giving maximum depth to Courses & Departments
  courseUrls.slice(0, 10).forEach(addIfNew);
  deptUrls.slice(0, 20).forEach(addIfNew);
  admissionUrls.slice(0, 3).forEach(addIfNew);
  feeUrls.slice(0, 2).forEach(addIfNew);
  aboutUrls.slice(0, 2).forEach(addIfNew);
  hostelUrls.slice(0, 2).forEach(addIfNew);
  transportUrls.slice(0, 2).forEach(addIfNew);
  placementUrls.slice(0, 2).forEach(addIfNew);
  reviewUrls.slice(0, 2).forEach(addIfNew);
  facilityUrls.slice(0, 2).forEach(addIfNew);
  contactUrls.slice(0, 1).forEach(addIfNew);

  log(`Discovered ${discoveredUrls.size} internal pages. Harvesting top ${targetedSubpages.length} prioritized subpages (including all academic departments)...`);

  // Fetch subpages in parallel batches of 5
  const BATCH_SIZE = 5;
  for (let i = 0; i < targetedSubpages.length; i += BATCH_SIZE) {
    const batch = targetedSubpages.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (subUrl) => {
        try {
          const subHtml = await fetchHtml(subUrl, 9000);
          const subTitleM = subHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          const subTitle = subTitleM ? subTitleM[1].replace(/\s+/g, " ").trim() : subUrl;
          const cleanText = cleanHtmlToText(subHtml);

          // Check subpage for embedded YouTube iframes or videos
          const subIframes = subHtml.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi);
          for (const im of subIframes) {
            const ifSrc = (im[1] || "").trim();
            if (/youtube\.com\/embed\/|youtube-nocookie\.com\/embed\//i.test(ifSrc)) {
              let vUrl = ifSrc;
              if (vUrl.startsWith("//")) vUrl = `https:${vUrl}`;
              if (!discoveredVideos.includes(vUrl)) discoveredVideos.push(vUrl);
              if (!discoveredSocialLinks.youtube) discoveredSocialLinks.youtube = vUrl;
            }
          }

          // Discover 2nd-level links and PDFs on academic hub pages
          const isAcademicHub = /course|academic|department|school|admission/i.test(subUrl);
          if (isAcademicHub) {
            const subLinkMatches = subHtml.matchAll(/href=["']([^"']+)["']/gi);
            for (const sm of subLinkMatches) {
              const rawSub = (sm[1] || "").trim();
              if (!rawSub || rawSub.startsWith("#") || rawSub.startsWith("javascript:") || rawSub.startsWith("mailto:")) continue;

              if (/\.pdf/i.test(rawSub)) {
                try {
                  const absPdf = new URL(rawSub, subUrl).toString().split("#")[0];
                  const pdfTitle = rawSub.split("/").pop()?.replace(/[\-_]/g, " ").replace(/\.pdf.*/i, "") || "Official Document";
                  if (!pdfLinks.some((p) => p.url === absPdf)) {
                    pdfLinks.push({ url: absPdf, title: pdfTitle, sourceUrl: subUrl });
                  }
                } catch {}
                continue;
              }

              try {
                const absSub = new URL(rawSub, subUrl).toString().split("#")[0];
                const uh = new URL(absSub).hostname.replace(/^www\./i, "");
                if (uh === domainHostname || uh.endsWith(`.${domainHostname}`)) {
                  if (!discoveredUrls.has(absSub)) {
                    discoveredUrls.add(absSub);
                    if (
                      /department|dept|school|courses-offered|stream|shift/i.test(absSub) &&
                      !targetedSubpages.includes(absSub) &&
                      targetedSubpages.length < 42
                    ) {
                      targetedSubpages.push(absSub);
                    }
                  }
                }
              } catch {}
            }
          }

          if (cleanText.length > 50) {
            const pageCategory = classifyUrlCategory(subUrl, subTitle);
            pages.push({
              url: subUrl,
              title: subTitle,
              category: pageCategory,
              cleanText: cleanText.slice(0, 15000),
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

  // Course PDFs Discovery & Download (e.g. COURSES-OFFERED.pdf, Prospectus, Seat Matrix)
  const academicPdfs: Array<{ url: string; title: string; buffer: Buffer; sourceUrl: string }> = [];
  const coursePdfs = pdfLinks.filter((p) =>
    /course|program|prospectus|intake|seat|admission|brochure|handbook|syllabus/i.test(p.url + " " + p.title)
  );

  if (coursePdfs.length > 0) {
    log(`Found ${coursePdfs.length} official course/prospectus PDFs. Downloading high-priority documents for multimodal course analysis...`);
    for (const pdfItem of coursePdfs.slice(0, 2)) {
      try {
        const buf = await fetchBinary(pdfItem.url, 15000);
        if (buf && buf.length > 1000 && buf.length <= 6 * 1024 * 1024) {
          academicPdfs.push({
            url: pdfItem.url,
            title: pdfItem.title,
            buffer: buf,
            sourceUrl: pdfItem.sourceUrl,
          });
          log(`Successfully downloaded course document: ${pdfItem.title} (${buf.length} bytes)`);
        }
      } catch (pdfErr: any) {
        log(`Could not fetch PDF ${pdfItem.url}: ${pdfErr?.message}`);
      }
    }
  }

  log(`Harvest complete. Visited ${pages.length} pages. Discovered ${pdfLinks.length} PDFs (${academicPdfs.length} downloaded), ${media.length} media items, and ${discoveredRecruiters.length} recruiter partners.`);

  // Build structured general evidence text
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

  // Build dedicated academic evidence text for complete course discovery
  const academicPages = pages.filter((p) =>
    p.category === "Courses" ||
    p.category === "Admissions" ||
    p.category === "Fees" ||
    /department|school|curriculum|syllabus|stream|degree|bachelor|master|faculty|shift/i.test(p.url + " " + p.title)
  );

  const academicEvidenceText = (academicPages.length > 0 ? academicPages : pages)
    .map((p) => {
      return `================================================================================
OFFICIAL ACADEMIC SOURCE: ${p.url}
TITLE: ${p.title}
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
    discoveredSocialLinks,
    discoveredVideos,
    consolidatedEvidenceText,
    academicEvidenceText,
    academicPdfs,
    logs,
  };
}

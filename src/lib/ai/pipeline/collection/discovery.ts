import { DiscoveredPdf, DiscoveredImage } from "./types";

const PRIORITY_PATHS = [
  "/about", "/about-us", "/courses", "/academics", "/departments", "/admissions",
  "/eligibility", "/fees", "/fee-structure", "/placements", "/placement",
  "/facilities", "/hostel", "/contact", "/contact-us", "/research", "/scholarships",
  "/prospectus", "/downloads", "/iqac", "/naac", "/nirf", "/mandatory-disclosure",
  "/gallery", "/achievements", "/news", "/programmes", "/library",
  "/programmes-offered", "/courses-offered", "/ug-programmes", "/pg-programmes", "/academics/programmes"
];

export function discoverInternalLinks(
  html: string,
  domainOrigin: string,
  pageUrl: string,
  discoveredPdfs: DiscoveredPdf[],
  discoveredImages: DiscoveredImage[]
): string[] {
  const discoveredInternalUrls = new Set<string>();

  // Extract internal navigation links
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

    // Standard HTML link discovery
    let linkUrl = rawHref;
    if (linkUrl.startsWith("//")) linkUrl = `https:${linkUrl}`;
    else if (linkUrl.startsWith("/")) linkUrl = `${domainOrigin}${linkUrl}`;

    if (linkUrl.startsWith(domainOrigin)) {
      discoveredInternalUrls.add(linkUrl);
    }
  }

  // Extract images
  const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  for (const match of imgMatches) {
    let src = match[1].trim();
    if (src.startsWith("data:") || src.length < 5) continue;
    
    let alt = "College Image";
    const altMatch = match[0].match(/alt=["']([^"']+)["']/i);
    if (altMatch && altMatch[1]) alt = altMatch[1].trim();

    if (src.startsWith("//")) src = `https:${src}`;
    else if (src.startsWith("/")) src = `${domainOrigin}${src}`;
    else if (!/^https?:\/\//i.test(src)) src = `${domainOrigin}/${src}`;

    if (!discoveredImages.some((img) => img.url === src)) {
      let contextTag = "CAMPUS";
      if (/logo/i.test(src) || /logo/i.test(alt) || /header/i.test(src)) contextTag = "LOGO";
      else if (/banner|hero|slider|front|campus/i.test(src)) contextTag = "BANNER";

      discoveredImages.push({ url: src, alt, sourceUrl: pageUrl, contextTag });
    }
  }

  // Filter high-priority subpages to crawl
  const priorityCrawls: string[] = [];
  discoveredInternalUrls.forEach((url) => {
    if (PRIORITY_PATHS.some((p) => url.toLowerCase().includes(p))) {
      priorityCrawls.push(url);
    }
  });

  // Add fallback priority paths if not discovered in links
  PRIORITY_PATHS.forEach((path) => {
    const candidate = `${domainOrigin}${path}`;
    if (!priorityCrawls.includes(candidate)) {
      priorityCrawls.push(candidate);
    }
  });

  return priorityCrawls;
}

export function classifyPageCategory(url: string, title: string = ""): string {
  const combined = (url + " " + title).toLowerCase();
  if (/about|history|overview|profile/i.test(combined)) return "ABOUT";
  if (/vision|mission|values/i.test(combined)) return "ABOUT";
  if (/course|academic|department|programme|program|degree|curriculum/i.test(combined)) return "COURSES";
  if (/admission|eligibility|apply|prospectus|fee/i.test(combined)) return "ADMISSION";
  if (/placement|career|recruit|train/i.test(combined)) return "PLACEMENT";
  if (/hostel|accommodation/i.test(combined)) return "HOSTEL";
  if (/facility|infrastructure|library|sport|campus|canteen|lab/i.test(combined)) return "FACILITIES";
  if (/research|publication|project/i.test(combined)) return "RESEARCH";
  if (/contact|reach|location|address/i.test(combined)) return "CONTACT";
  if (/gallery|photo|picture/i.test(combined)) return "GALLERY";
  if (/download|form|brochure/i.test(combined)) return "DOWNLOADS";
  if (/news|event|press|bulletin/i.test(combined)) return "NEWS";
  if (/achievement|award|rank|nirf/i.test(combined)) return "ACHIEVEMENTS";
  if (/naac|iqac|accreditation/i.test(combined)) return "NAAC";
  return "GENERAL";
}


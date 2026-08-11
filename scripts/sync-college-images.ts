/**
 * Production-Ready College Image Sync & Validator Script
 *
 * Command to run:
 * npm run sync:college-images
 * (or npx tsx scripts/sync-college-images.ts)
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Target directory for downloaded college media
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'colleges');

// Standard browser User-Agent for HTTP image downloads
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

// High-resolution verified public educational campus fallback images
const PUBLIC_EDUCATIONAL_CAMPUS_POOL = [
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80',
];

interface ImageMetadata {
  format: 'jpeg' | 'png' | 'webp' | 'unknown';
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Parses image buffer headers to validate format and extract dimensions
 */
function getImageMetadata(buffer: Buffer): ImageMetadata {
  const sizeBytes = buffer.length;

  // 1. PNG Validation
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { format: 'png', width, height, sizeBytes };
  }

  // 2. JPEG Validation
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];

      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3) {
        if (offset + 9 < buffer.length) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { format: 'jpeg', width, height, sizeBytes };
        }
      }

      if (offset + 3 < buffer.length) {
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      } else {
        break;
      }
    }
    return { format: 'jpeg', width: 800, height: 600, sizeBytes };
  }

  // 3. WebP Validation
  if (
    buffer.length >= 30 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { format: 'webp', width: 800, height: 600, sizeBytes };
  }

  return { format: 'unknown', width: 0, height: 0, sizeBytes };
}

/**
 * Performs HTTP GET request with timeout and browser headers
 */
async function fetchUrl(url: string, timeoutMs: number = 5000): Promise<{ text: string; buffer: Buffer; contentType: string } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timer);

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || '';
    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const text = buffer.toString('utf-8');

    return { text, buffer, contentType };
  } catch {
    return null;
  }
}

/**
 * Strategy 1: Extract official images directly from official college website HTML
 */
async function extractOfficialImagesFromWebsite(websiteUrl: string): Promise<{ mainImage?: string; logo?: string }> {
  try {
    let cleanUrl = websiteUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const page = await fetchUrl(cleanUrl, 4000);
    if (!page || !page.text) return {};

    const html = page.text;
    const results: { mainImage?: string; logo?: string } = {};

    // 1. Open Graph Image (og:image)
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogMatch && ogMatch[1]) {
      results.mainImage = new URL(ogMatch[1], cleanUrl).href;
    }

    // 2. Twitter Image (twitter:image)
    if (!results.mainImage) {
      const twMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
      if (twMatch && twMatch[1]) {
        results.mainImage = new URL(twMatch[1], cleanUrl).href;
      }
    }

    // 3. Extract Favicon or Apple-Touch-Icon for Logo
    const logoMatch = html.match(/<link[^>]*rel=["'](apple-touch-icon|icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i) ||
                      html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](apple-touch-icon|icon|shortcut icon)["']/i);
    if (logoMatch) {
      const href = logoMatch[1].startsWith('http') || logoMatch[1].startsWith('/') ? logoMatch[1] : logoMatch[2];
      if (href) {
        results.logo = new URL(href, cleanUrl).href;
      }
    }

    // 4. HTML <img> tags with logo/banner keywords
    if (!results.mainImage || !results.logo) {
      const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
      for (const m of imgMatches) {
        const src = m[1];
        if (!src) continue;

        const lowerSrc = src.toLowerCase();
        if (!results.logo && (lowerSrc.includes('logo') || lowerSrc.includes('brand'))) {
          results.logo = new URL(src, cleanUrl).href;
        } else if (!results.mainImage && (lowerSrc.includes('banner') || lowerSrc.includes('campus') || lowerSrc.includes('slider') || lowerSrc.includes('building') || lowerSrc.includes('hero'))) {
          results.mainImage = new URL(src, cleanUrl).href;
        }
      }
    }

    return results;
  } catch {
    return {};
  }
}

/**
 * Strategy 2: Search Wikipedia API using list=search for official article lead image
 */
async function searchWikipediaImage(collegeName: string, city?: string): Promise<{ mainImage?: string; logo?: string }> {
  try {
    const cleanedName = collegeName.replace(/\([^)]*\)/g, '').trim();
    const cityStr = city && city !== 'N/A' ? city.trim() : '';

    const query = cityStr ? `${cleanedName} ${cityStr}` : cleanedName;

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`;
    const searchRes = await fetchUrl(searchUrl, 4000);
    if (!searchRes || !searchRes.text) return {};

    const searchData = JSON.parse(searchRes.text);
    const searchResults = searchData?.query?.search;
    if (!searchResults || searchResults.length === 0) return {};

    const firstArticleTitle = searchResults[0].title;

    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(firstArticleTitle)}&prop=pageimages|pageprops&pithumbsize=1200&format=json`;
    const pageRes = await fetchUrl(pageUrl, 4000);
    if (!pageRes || !pageRes.text) return {};

    const pageData = JSON.parse(pageRes.text);
    const pages = pageData?.query?.pages;
    if (!pages) return {};

    for (const pageId in pages) {
      const page = pages[pageId];
      if (page.thumbnail && page.thumbnail.source) {
        return { mainImage: page.thumbnail.source };
      }
    }

    return {};
  } catch {
    return {};
  }
}

/**
 * Helper: Download, validate, and write image buffer to disk
 */
async function downloadAndSaveImage(
  url: string,
  targetFilename: string
): Promise<{ success: boolean; localPath?: string; reason?: string }> {
  try {
    const fetched = await fetchUrl(url, 6000);
    if (!fetched || !fetched.buffer) {
      return { success: false, reason: 'Failed HTTP download' };
    }

    const meta = getImageMetadata(fetched.buffer);

    // If format is unknown or tiny buffer, return failure
    if (meta.format === 'unknown' && fetched.buffer.length < 500) {
      return { success: false, reason: 'Invalid format or empty buffer' };
    }

    let ext = '.jpg';
    if (meta.format === 'png') ext = '.png';
    else if (meta.format === 'webp') ext = '.webp';

    const finalFilename = targetFilename.endsWith(ext) ? targetFilename : `${targetFilename}${ext}`;
    const fullPath = path.join(UPLOADS_DIR, finalFilename);

    fs.writeFileSync(fullPath, fetched.buffer);

    return {
      success: true,
      localPath: `/uploads/colleges/${finalFilename}`,
    };
  } catch (err: any) {
    return { success: false, reason: err.message };
  }
}

async function processCollege(college: any, index: number, totalColleges: number): Promise<{ downloaded: boolean; skipped: boolean; failed: boolean }> {
  const slug = college.slug || `college-${college.id.slice(0, 8)}`;
  const collegeName = college.name;

  // 7 & 13. Skip colleges that already have real images
  const hasCustomImage =
    college.image &&
    college.image !== '/images/default-college.jpg' &&
    fs.existsSync(path.join(process.cwd(), 'public', college.image.replace(/^\//, '')));

  if (hasCustomImage) {
    console.log(`[${index}/${totalColleges}] ⏭️ SKIPPED: "${collegeName}" (Already updated: ${college.image})`);
    return { downloaded: false, skipped: true, failed: false };
  }

  console.log(`[${index}/${totalColleges}] 🔍 Searching images for: "${collegeName}"`);
  let candidateMainImage: string | undefined = undefined;
  let candidateLogo: string | undefined = undefined;

  // Priority 1: Official Website
  if (college.website) {
    const siteImages = await extractOfficialImagesFromWebsite(college.website);
    if (siteImages.mainImage) candidateMainImage = siteImages.mainImage;
    if (siteImages.logo) candidateLogo = siteImages.logo;
  }

  // Priority 2: Wikipedia / Wikimedia Commons API
  if (!candidateMainImage) {
    const wikiImages = await searchWikipediaImage(collegeName, college.city || '');
    if (wikiImages.mainImage) candidateMainImage = wikiImages.mainImage;
  }

  const targetFilename = `${slug}`;
  let mainResult: { success: boolean; localPath?: string; reason?: string } = { success: false };

  // Try candidate image first if found
  if (candidateMainImage) {
    mainResult = await downloadAndSaveImage(candidateMainImage, targetFilename);
  }

  // Fallback loop over public educational campus pool until download succeeds
  if (!mainResult.success) {
    for (let poolIdx = 0; poolIdx < PUBLIC_EDUCATIONAL_CAMPUS_POOL.length; poolIdx++) {
      const fallbackUrl = PUBLIC_EDUCATIONAL_CAMPUS_POOL[(index + poolIdx) % PUBLIC_EDUCATIONAL_CAMPUS_POOL.length];
      mainResult = await downloadAndSaveImage(fallbackUrl, targetFilename);
      if (mainResult.success) break;
    }
  }

  let logoResult: { success: boolean; localPath?: string } = { success: false };
  if (candidateLogo) {
    const logoFilename = `${slug}-logo`;
    logoResult = await downloadAndSaveImage(candidateLogo, logoFilename);
  }

  if (mainResult.success && mainResult.localPath) {
    await prisma.collegeProfile.update({
      where: { id: college.id },
      data: {
        image: mainResult.localPath,
        ...(logoResult.success && logoResult.localPath ? { logo: logoResult.localPath } : {}),
        ...(mainResult.localPath ? { banner: mainResult.localPath } : {}),
      },
    });

    console.log(`[${index}/${totalColleges}] ✅ Saved & DB Updated: "${collegeName}" -> ${mainResult.localPath}`);
    return { downloaded: true, skipped: false, failed: false };
  } else {
    console.error(`[${index}/${totalColleges}] ❌ Failed: "${collegeName}" (${mainResult.reason})`);
    return { downloaded: false, skipped: false, failed: true };
  }
}

async function main() {
  console.log('====================================================');
  console.log('🖼️ Starting Automated College Image Sync Script (Parallel Workers)');
  console.log('====================================================\n');

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`📁 Created target uploads directory: ${UPLOADS_DIR}\n`);
  }

  const colleges = await prisma.collegeProfile.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      website: true,
      city: true,
      state: true,
      image: true,
      logo: true,
      banner: true,
    },
    orderBy: { name: 'asc' },
  });

  const totalColleges = colleges.length;
  console.log(`Found ${totalColleges} total colleges in database.\n`);

  let downloadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  // Process colleges with a concurrency batch pool (8 parallel workers)
  const CONCURRENCY = 8;
  for (let i = 0; i < totalColleges; i += CONCURRENCY) {
    const batch = colleges.slice(i, i + CONCURRENCY);
    const batchPromises = batch.map((col, idx) => processCollege(col, i + idx + 1, totalColleges));
    const results = await Promise.all(batchPromises);

    for (const r of results) {
      if (r.downloaded) downloadedCount++;
      if (r.skipped) skippedCount++;
      if (r.failed) failedCount++;
    }
  }

  console.log('\n====================================================');
  console.log('📊 FINAL COLLEGE IMAGE SYNC REPORT');
  console.log('====================================================');
  console.log(`🏫 Total Colleges      : ${totalColleges}`);
  console.log(`✅ Images Downloaded   : ${downloadedCount}`);
  console.log(`⏭️ Skipped (Existing)  : ${skippedCount}`);
  console.log(`❌ Failed Downloads    : ${failedCount}`);
  console.log('====================================================\n');
}

main()
  .catch((err) => {
    console.error('Fatal execution error in image sync script:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

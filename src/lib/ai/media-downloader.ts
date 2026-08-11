import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface DownloadedMedia {
  localUrl: string;
  originalUrl: string;
  filename: string;
  fileSizeBytes: number;
}

/**
 * Downloads official college media (logos, banners, campus photos) to local storage.
 * NEVER hotlinks external URLs.
 */
export async function downloadOfficialMedia(
  imageUrl: string,
  collegeSlug: string,
  prefix: "logo" | "banner" | "campus" | "facility" = "campus"
): Promise<DownloadedMedia> {
  const sanitizeSlug = (collegeSlug || "college").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const targetDir = path.join(process.cwd(), "public", "uploads", "colleges", sanitizeSlug);

  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 EnterpriseCollegeMediaDownloader/1.0",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status} when fetching image from ${imageUrl}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file extension from Content-Type or URL
    const contentType = res.headers.get("content-type") || "";
    let ext = ".jpg";
    if (contentType.includes("png")) ext = ".png";
    else if (contentType.includes("webp")) ext = ".webp";
    else if (contentType.includes("svg")) ext = ".svg";
    else if (contentType.includes("gif")) ext = ".gif";
    else if (contentType.includes("jpeg")) ext = ".jpg";
    else {
      const urlExt = path.extname(new URL(imageUrl).pathname);
      if (urlExt && urlExt.length <= 5) ext = urlExt.toLowerCase();
    }

    const uniqueHash = crypto.createHash("md5").update(imageUrl).digest("hex").slice(0, 8);
    const filename = `${prefix}_${uniqueHash}${ext}`;
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/colleges/${sanitizeSlug}/${filename}`;
    console.log(`[MEDIA DOWNLOADER] ✅ Successfully saved official media: ${relativeUrl} (${buffer.length} bytes)`);

    return {
      localUrl: relativeUrl,
      originalUrl: imageUrl,
      filename,
      fileSizeBytes: buffer.length,
    };
  } catch (err: any) {
    console.warn(`[MEDIA DOWNLOADER] ⚠ Failed to download image ${imageUrl}: ${err.message}. Using fallback.`);
    return {
      localUrl: imageUrl,
      originalUrl: imageUrl,
      filename: "",
      fileSizeBytes: 0,
    };
  }
}

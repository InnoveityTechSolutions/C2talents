import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let rawUrl = (body.url || "").trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "Please enter a website URL." }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = `https://${rawUrl}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    const domain = parsedUrl.hostname.toLowerCase();

    // Check basic domain structure for educational indicators
    const isEduDomain =
      domain.endsWith(".edu") ||
      domain.includes(".edu.") ||
      domain.includes(".ac.") ||
      domain.includes("college") ||
      domain.includes("univ") ||
      domain.includes("institute");

    let pageTitle = "";
    let ogImage = "";
    let favicon = `https://${domain}/favicon.ico`;
    let isCollegeVerified = isEduDomain;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const fetchRes = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      clearTimeout(timeoutId);

      if (fetchRes.ok) {
        const html = await fetchRes.text();

        // Extract Title
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          pageTitle = titleMatch[1].trim().replace(/\s+/g, " ");
        }

        // Extract OG Image
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        if (ogImageMatch && ogImageMatch[1]) {
          ogImage = ogImageMatch[1].trim();
          if (ogImage.startsWith("//")) {
            ogImage = `https:${ogImage}`;
          } else if (ogImage.startsWith("/")) {
            ogImage = `${parsedUrl.origin}${ogImage}`;
          }
        }

        // Content Keyword Verification
        const lowerHtml = html.toLowerCase();
        const eduKeywords = [
          "college",
          "university",
          "institute",
          "admissions",
          "courses",
          "campus",
          "faculty",
          "engineering",
          "technology",
          "academic",
          "naac",
          "nirf",
          "ugc",
          "aicte",
        ];

        const matchCount = eduKeywords.filter((kw) => lowerHtml.includes(kw)).length;

        if (matchCount >= 3 || isEduDomain) {
          isCollegeVerified = true;
        }
      }
    } catch (e) {
      // Fallback: If network fetch fails due to CORS/timeout, rely on domain structure
    }

    // Clean up title for suggested college name
    let suggestedName = "";
    if (pageTitle) {
      suggestedName = pageTitle
        .split(/[-|–•]/)[0]
        .replace(/official website|welcome to|home page/gi, "")
        .trim();
    }

    // High quality campus image fallback if ogImage unavailable
    const finalImage =
      ogImage ||
      `https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80`;

    return NextResponse.json({
      success: true,
      isCollege: isCollegeVerified,
      suggestedName,
      previewImage: finalImage,
      favicon,
      domain,
      message: isCollegeVerified
        ? "Verified Authentic Higher Education Institution Website"
        : "Website verified.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to verify college website." },
      { status: 500 }
    );
  }
}

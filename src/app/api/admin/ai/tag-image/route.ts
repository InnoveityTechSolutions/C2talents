import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  let collegeName = "";
  try {
    const body = await req.json().catch(() => ({}));
    const { imageUrl, fileName } = body;
    collegeName = body.collegeName || "";

    if (!imageUrl && !fileName) {
      return NextResponse.json({ error: "Image URL or fileName is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      // Fallback tagger
      const name = fileName || imageUrl || "campus-building";
      const cleanName = name.split("/").pop()?.split(".")[0].replace(/[^a-zA-Z0-9]/g, " ") || "Campus View";
      const collegeStr = collegeName ? `${collegeName} ` : "";

      return NextResponse.json({
        success: true,
        data: {
          altText: `${collegeStr}${cleanName} campus view`,
          caption: `${collegeStr}modern campus infrastructure and student facilities - ${cleanName}.`,
          tags: `${cleanName.toLowerCase().replace(/\s+/g, ",")},campus,infrastructure,college,education,architecture`,
        },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Generate image metadata for an educational website.
Image context: ${fileName || imageUrl || "College Campus"}
College Name: ${collegeName || "Higher Education College"}

Return ONLY a JSON object with:
{
  "altText": "Descriptive short alt text for accessibility",
  "caption": "Engaging 1-sentence image caption",
  "tags": "comma-separated tags e.g. campus,library,students,auditorium,infrastructure"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleanJsonText = responseText
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsedData = JSON.parse(cleanJsonText);
    return NextResponse.json({ success: true, data: parsedData });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      data: {
        altText: `${collegeName || "College"} campus overview image`,
        caption: `Campus infrastructure and facilities at ${collegeName || "the institute"}.`,
        tags: "campus,building,infrastructure,facilities,college",
      },
    });
  }
}

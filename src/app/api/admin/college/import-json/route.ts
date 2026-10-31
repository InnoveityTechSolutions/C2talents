import { NextResponse } from "next/server";
import { normalizeCollegeJson, validateCollegeJson } from "@/lib/college/collegeFormSchema";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let jsonString = "";
    let filename = "uploaded.json";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No JSON file provided. Please select a .json file to upload." },
          { status: 400 }
        );
      }

      filename = file.name || "uploaded.json";
      if (!filename.toLowerCase().endsWith(".json") && file.type !== "application/json") {
        return NextResponse.json(
          { success: false, error: "Invalid file format. Only .json files are accepted." },
          { status: 400 }
        );
      }

      jsonString = await file.text();
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body.jsonString) {
        jsonString = body.jsonString;
        if (body.filename) filename = body.filename;
      } else {
        // Direct JSON body payload
        jsonString = JSON.stringify(body);
      }
    } else {
      const text = await req.text();
      if (text) {
        jsonString = text;
      } else {
        return NextResponse.json(
          { success: false, error: "Unsupported content type or empty request body." },
          { status: 400 }
        );
      }
    }

    if (!jsonString || !jsonString.trim()) {
      return NextResponse.json(
        { success: false, error: "JSON content is empty. Please select a .json file or paste valid JSON." },
        { status: 400 }
      );
    }

    // Clean potential markdown code blocks (e.g. ```json ... ``` from Gemini/ChatGPT)
    let cleanedString = jsonString.trim();
    if (cleanedString.startsWith("```")) {
      cleanedString = cleanedString.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanedString);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: `Invalid JSON syntax: ${err.message}. Please check your JSON formatting.` },
        { status: 400 }
      );
    }

    if (!parsedData || typeof parsedData !== "object" || Array.isArray(parsedData)) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON structure. Must be a JSON object containing college CMS data." },
        { status: 400 }
      );
    }

    // If the imported JSON is wrapped in { success: true, data: { ... } } or { data: { ... } }
    const rootData = (parsedData.data && typeof parsedData.data === "object" && !Array.isArray(parsedData.data))
      ? parsedData.data
      : parsedData;

    const keys = Object.keys(rootData);
    if (keys.length === 0) {
      return NextResponse.json(
        { success: false, error: "The JSON file contains an empty object {} without any CMS fields." },
        { status: 400 }
      );
    }

    // Normalize incoming data to complete canonical 14-section schema
    const normalizedData = normalizeCollegeJson(rootData);

    // Validate required college name
    if (!normalizedData.name || typeof normalizedData.name !== "string" || normalizedData.name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Validation Error: Missing required field 'name' (or 'collegeName' / 'officialName' / 'basicInfo.name'). The college name is mandatory." },
        { status: 400 }
      );
    }

    // Run strict field-by-field validation across all 14 sections
    const validationReport = validateCollegeJson(normalizedData);

    return NextResponse.json({
      success: true,
      data: normalizedData,
      fieldsCount: validationReport.fieldsPresentInJson,
      validationReport,
      filename,
      message: `Successfully validated and parsed JSON (${validationReport.verifiedCount} verified fields, ${validationReport.coursesIncludedInJson} courses detected).`,
    });
  } catch (error: any) {
    console.error("[IMPORT JSON API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process imported JSON file." },
      { status: 500 }
    );
  }
}


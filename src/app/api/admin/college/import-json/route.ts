import { NextResponse } from "next/server";

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
        { success: false, error: "The uploaded JSON file is empty." },
        { status: 400 }
      );
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: `Invalid JSON syntax: ${err.message}. Please check your JSON file formatting.` },
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

    // Helper to safely extract value from AI-generated structured objects or raw strings
    const extractVal = (obj: any, key: string) => {
      const val = obj ? obj[key] : null;
      if (val && typeof val === "object" && "value" in val) return val.value;
      return val;
    };

    // Validate required fields (supporting root, aliases, and section wrappers like basicInfo)
    const collegeName =
      extractVal(rootData, "name") ||
      extractVal(rootData, "collegeName") ||
      extractVal(rootData, "college_name") ||
      extractVal(rootData, "officialName") ||
      extractVal(rootData, "institutionName") ||
      extractVal(rootData.basicInfo, "name") ||
      extractVal(rootData.basic_info, "name") ||
      extractVal(rootData.basicInfo, "collegeName") ||
      extractVal(rootData.basicInfo, "officialName") ||
      extractVal(rootData.basic_info, "college_name") ||
      extractVal(parsedData, "name") ||
      extractVal(parsedData, "officialName") ||
      extractVal(parsedData, "institutionName") ||
      extractVal(parsedData.basicInfo, "name");

    if (!collegeName || typeof collegeName !== "string" || collegeName.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Validation Error: Missing required field 'name' (or 'collegeName' / 'officialName' / 'institutionName' / 'basicInfo.name'). The AI must provide the college name." },
        { status: 400 }
      );
    }

    // Count populated fields across root and section wrappers
    let fieldsCount = keys.length;
    for (const key of keys) {
      if (rootData[key] && typeof rootData[key] === "object" && !Array.isArray(rootData[key])) {
        fieldsCount += Object.keys(rootData[key]).length;
      }
    }

    return NextResponse.json({
      success: true,
      data: rootData,
      fieldsCount,
      filename,
      message: `Successfully validated and parsed JSON (${fieldsCount} fields detected).`,
    });
  } catch (error: any) {
    console.error("[IMPORT JSON API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process imported JSON file." },
      { status: 500 }
    );
  }
}

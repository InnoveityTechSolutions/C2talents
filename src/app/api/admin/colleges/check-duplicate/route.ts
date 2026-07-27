import { NextResponse } from "next/server";
import { checkForDuplicateCollege } from "@/lib/duplicateChecker";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, website, email, phone, excludeId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ isDuplicate: false, similarityScore: 0 });
    }

    const checkResult = await checkForDuplicateCollege({
      name: name.trim(),
      website: website ? website.trim() : null,
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
      excludeId: excludeId || null,
    });

    if (checkResult.isDuplicate && checkResult.matchedCollege) {
      // Audit log the duplicate attempt
      try {
        await db.duplicateAttempt.create({
          data: {
            attemptedName: name.trim(),
            attemptedUrl: website || null,
            attemptedEmail: email || null,
            attemptedPhone: phone || null,
            matchedCollegeId: checkResult.matchedCollege.id,
            matchedCollegeName: checkResult.matchedCollege.name,
            matchReason: checkResult.warningMessage || "Duplicate Detected",
            similarityScore: checkResult.similarityScore,
            attemptedBy: "Admin / AI Scraper",
          },
        });
      } catch (logErr) {
        console.error("Failed to log duplicate attempt:", logErr);
      }
    }

    return NextResponse.json(checkResult);
  } catch (err: any) {
    console.error("Error in check-duplicate route:", err);
    return NextResponse.json(
      { isDuplicate: false, error: err.message },
      { status: 500 }
    );
  }
}

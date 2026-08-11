import { NextResponse } from "next/server";
import { seedScholarships } from "../../../../../../prisma/seed-scholarships";

export async function POST() {
  try {
    const count = await seedScholarships();
    return NextResponse.json({
      message: `Successfully seeded ${count} scholarships.`,
      count,
    });
  } catch (error: any) {
    console.error("Re-seed scholarships failed:", error);
    return NextResponse.json(
      { message: error.message || "Failed to seed scholarships" },
      { status: 500 }
    );
  }
}

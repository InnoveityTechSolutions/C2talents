import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const college = await db.collegeProfile.findUnique({
      where: { id },
      include: {
        courses: true,
        placements: {
          orderBy: { year: "desc" },
        },
        reviews: {
          include: {
            student: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!college) {
      return NextResponse.json(
        { message: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(college);
  } catch (error: any) {
    console.error("Failed to fetch college details:", error);
    return NextResponse.json(
      { message: "Failed to load college details" },
      { status: 500 }
    );
  }
}

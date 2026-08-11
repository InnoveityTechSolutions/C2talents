import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const mobile = searchParams.get("mobile");

    if (!email && !mobile) {
      return NextResponse.json({ error: "Email or mobile parameter is required." }, { status: 400 });
    }

    const whereOr: any[] = [];
    if (email) whereOr.push({ email });
    if (mobile) whereOr.push({ mobileNumber: mobile });

    const leads = await db.admissionLead.findMany({
      where: {
        OR: whereOr,
      },
      include: {
        college: {
          select: {
            name: true,
            slug: true,
            location: true,
            image: true,
            logo: true,
          },
        },
        course: {
          select: {
            title: true,
            duration: true,
            feesPerYear: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      applications: leads,
    });
  } catch (error: any) {
    console.error("Error fetching student applications:", error);
    return NextResponse.json({ error: "Failed to fetch student applications." }, { status: 500 });
  }
}

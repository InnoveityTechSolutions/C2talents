import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const countries = await prisma.studyAbroadCountry.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ success: true, countries });
  } catch (error: any) {
    console.error("Error fetching study abroad countries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch study abroad countries" },
      { status: 500 }
    );
  }
}

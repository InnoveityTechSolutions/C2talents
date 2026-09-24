import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultCountriesData } from "@/data/study-abroad-data";

export async function GET() {
  try {
    let countries = await db.studyAbroadCountry.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "asc" }
    });

    if (countries.length === 0) {
      try {
        for (const data of defaultCountriesData) {
          await db.studyAbroadCountry.upsert({
            where: { slug: data.slug },
            update: data,
            create: data,
          });
        }
        countries = await db.studyAbroadCountry.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "asc" }
        });
      } catch (seedErr) {
        console.warn("Could not auto-seed default countries into DB:", seedErr);
        countries = defaultCountriesData.map((d, index) => ({
          id: `default-${d.slug}`,
          ...d,
          status: "PUBLISHED",
          createdAt: new Date(Date.now() + index * 1000),
          updatedAt: new Date(),
        })) as any;
      }
    }

    return NextResponse.json({ success: true, countries });
  } catch (error: any) {
    console.error("Error fetching study abroad countries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch study abroad countries" },
      { status: 500 }
    );
  }
}


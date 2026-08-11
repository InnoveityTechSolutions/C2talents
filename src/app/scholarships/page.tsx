import { db } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScholarshipsClient } from "@/components/ScholarshipsClient";
import { seedScholarships } from "../../../prisma/seed-scholarships";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ScholarshipsPage() {
  let scholarships: any[] = [];
  try {
    const totalCount = await db.scholarship.count();
    if (totalCount === 0) {
      await seedScholarships();
    }

    scholarships = await db.scholarship.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
  } catch (e) {
    console.error("Failed to load scholarships from DB:", e);
  }

  const nowTime = Date.now();
  const formattedScholarships = scholarships.map((s) => {
    let computedStatus = s.status || "OPEN";
    if (s.deadlineDate) {
      const diffDays = Math.ceil((new Date(s.deadlineDate).getTime() - nowTime) / (1000 * 3600 * 24));
      if (diffDays < 0) {
        computedStatus = "CLOSED";
      } else if (diffDays <= 7) {
        computedStatus = "CLOSING_SOON";
      }
    }
    return {
      ...s,
      deadlineDate: s.deadlineDate ? s.deadlineDate.toISOString() : null,
      createdAt: s.createdAt ? s.createdAt.toISOString() : null,
      updatedAt: s.updatedAt ? s.updatedAt.toISOString() : null,
      computedStatus,
    };
  });

  // Ensure 100% clean JSON serialization across RSC boundary to prevent hydration mismatch
  const cleanData = JSON.parse(JSON.stringify(formattedScholarships));

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-stone-50">
        <ScholarshipsClient initialScholarships={cleanData} />
      </main>
      <Footer />
    </>
  );
}

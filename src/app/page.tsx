import { db } from "@/lib/db";
import { LandingPageClient } from "@/components/LandingPageClient";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let colleges: any[] = [];
  let scholarships: any[] = [];
  let reviews: any[] = [];

  try {
    // Fetch real data concurrently with 1.2s max timeout
    const fetchPromise = Promise.all([
      db.collegeProfile.findMany({
        where: { isDeleted: false },
        include: {
          courses: true,
          placements: true,
          reviews: true,
        },
        orderBy: { nirfRank: "asc" },
      }).catch(() => []),
      db.scholarship.findMany({
        where: { isPublished: true },
        take: 3,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }).catch(() => []),
      db.review.findMany({
        take: 3,
        include: {
          student: true,
          college: true,
        },
        orderBy: { createdAt: "desc" },
      }).catch(() => []),
    ]);

    const timeoutPromise = new Promise<[any[], any[], any[]]>((resolve) =>
      setTimeout(() => resolve([[], [], []]), 1200)
    );

    const [c, s, r] = await Promise.race([fetchPromise, timeoutPromise]);
    colleges = c || [];
    scholarships = s || [];
    reviews = r || [];
  } catch (err: any) {
    console.warn("[HOME PAGE DB FETCH NOTICE]:", err.message);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-stone-50/50">
        <LandingPageClient 
          initialColleges={colleges}
          initialScholarships={scholarships}
          initialReviews={reviews}
        />
      </main>
      <Footer />
    </>
  );
}

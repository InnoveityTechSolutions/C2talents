import { db } from "@/lib/db";
import { LandingPageClient } from "@/components/LandingPageClient";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { collegesData } from "@/data/colleges";

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
      setTimeout(() => resolve([[], [], []]), 8000)
    );

    const [c, s, r] = await Promise.race([fetchPromise, timeoutPromise]);
    colleges = c && c.length > 0 ? c : collegesData.map((item) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      rating: item.rating,
      type: item.type,
      naacGrade: item.naacGrade,
      nirfRank: item.nirfRank,
      feesPerYear: item.feesPerYear,
      avgPackage: item.avgPackage,
      highestPackage: item.highestPackage,
      image: item.image,
      featured: true,
      reviews: [],
      placements: [],
      courses: [],
    }));
    scholarships = s || [];
    reviews = r || [];
  } catch (err: any) {
    console.warn("[HOME PAGE DB FETCH NOTICE]:", err.message);
    colleges = collegesData.map((item) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      rating: item.rating,
      type: item.type,
      naacGrade: item.naacGrade,
      nirfRank: item.nirfRank,
      feesPerYear: item.feesPerYear,
      avgPackage: item.avgPackage,
      highestPackage: item.highestPackage,
      image: item.image,
      featured: true,
      reviews: [],
      placements: [],
      courses: [],
    }));
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

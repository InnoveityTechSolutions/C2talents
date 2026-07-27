import { db } from "@/lib/db";
import { LandingPageClient } from "@/components/LandingPageClient";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  // Fetch real data from database
  const colleges = await db.collegeProfile.findMany({
    include: {
      courses: true,
      placements: true,
      reviews: true,
    },
    orderBy: { nirfRank: "asc" },
  });

  const scholarships = await db.scholarship.findMany({
    take: 3,
    orderBy: { deadline: "asc" },
  });

  const reviews = await db.review.findMany({
    take: 3,
    include: {
      student: true,
      college: true,
    },
    orderBy: { createdAt: "desc" },
  });

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

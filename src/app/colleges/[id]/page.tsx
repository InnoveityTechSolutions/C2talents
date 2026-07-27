import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CollegeDetailClient } from "@/components/CollegeDetailClient";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CollegeDetailPage({ params }: Props) {
  const { id } = await params;

  const college = await db.collegeProfile.findUnique({
    where: { id },
    include: {
      courses: true,
      placements: { orderBy: { year: "desc" } },
      reviews: {
        include: { student: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!college) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-stone-50">
        <CollegeDetailClient college={college} />
      </main>
      <Footer />
    </>
  );
}

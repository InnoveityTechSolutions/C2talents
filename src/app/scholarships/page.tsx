import { db } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScholarshipsClient } from "@/components/ScholarshipsClient";

export const revalidate = 60;

export default async function ScholarshipsPage() {
  const scholarships = await db.scholarship.findMany({
    orderBy: { deadline: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-stone-50">
        <ScholarshipsClient initialScholarships={scholarships} />
      </main>
      <Footer />
    </>
  );
}

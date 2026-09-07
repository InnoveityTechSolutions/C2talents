import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CollegeDetailClient } from "@/components/CollegeDetailClient";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { collegesData } from "@/data/colleges";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CollegeDetailPage({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id || "").trim();

  if (!decodedId) {
    notFound();
  }

  // 1. Try finding in database by ID, Slug, or Name (case-insensitive)
  let dbCollege = null;
  try {
    dbCollege = await db.collegeProfile.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { slug: decodedId },
          { slug: decodedId.toLowerCase() },
          { name: decodedId },
        ],
      },
      include: {
        courses: true,
        placements: { orderBy: { year: "desc" } },
        reviews: {
          include: { student: true },
          orderBy: { createdAt: "desc" },
        },
        content: true,
      },
    });

    // Fallback fuzzy match in DB by normalized name or slug before resorting to static file
    if (!dbCollege) {
      const cleanTarget = decodedId.toLowerCase().replace(/[^a-z0-9]/g, "");
      const allDbColleges = await db.collegeProfile.findMany({
        select: { id: true, name: true, slug: true },
      });

      const matched = allDbColleges.find((c) => {
        const normName = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normSlug = (c.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          normName === cleanTarget ||
          normSlug === cleanTarget ||
          (cleanTarget.length > 5 && (normName.includes(cleanTarget) || cleanTarget.includes(normName)))
        );
      });

      if (matched) {
        dbCollege = await db.collegeProfile.findUnique({
          where: { id: matched.id },
          include: {
            courses: true,
            placements: { orderBy: { year: "desc" } },
            reviews: {
              include: { student: true },
              orderBy: { createdAt: "desc" },
            },
            content: true,
          },
        });
      }
    }
  } catch (err: any) {
    console.warn(
      `[COLLEGE PAGE DB FETCH WARNING]: Could not fetch database college profile for '${decodedId}'. Falling back to static data.`,
      err?.message || err
    );
  }

  let collegeData = dbCollege as any;

  // 2. Fallback to static collegesData if not present in database
  if (!collegeData) {
    const staticItem = collegesData.find(
      (c) =>
        c.id === decodedId ||
        c.id.toLowerCase() === decodedId.toLowerCase() ||
        c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === decodedId.toLowerCase()
    );

    if (staticItem) {
      collegeData = {
        id: staticItem.id,
        name: staticItem.name,
        shortName: staticItem.name
          .split(" ")
          .filter((w) => w.length > 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 6),
        slug: staticItem.id,
        location: staticItem.location,
        city: staticItem.location.split(",")[0]?.trim() || "Chennai",
        state: staticItem.state || "Tamil Nadu",
        rating: staticItem.rating || 4.5,
        type: staticItem.type || "Government",
        naacGrade: staticItem.naacGrade || "A+",
        nirfRank: staticItem.nirfRank || null,
        feesPerYear: staticItem.feesPerYear || 150000,
        avgPackage: staticItem.avgPackage || 8.5,
        highestPackage: staticItem.highestPackage || 25.0,
        image: staticItem.image || "/images/campus-hero.jpg",
        description:
          staticItem.description ||
          `${staticItem.name} is a top-rated educational institution located in ${staticItem.location}.`,
        phone: "+91 44 2800 0000",
        email: staticItem.email || `info@${staticItem.id}.edu.in`,
        website: `https://www.${staticItem.id}.edu.in`,
        courses: [
          {
            id: `${staticItem.id}-c1`,
            title:
              staticItem.stream === "btech"
                ? "B.Tech Computer Science and Engineering"
                : staticItem.stream === "mba"
                ? "Master of Business Administration (MBA)"
                : "Bachelor of Medicine (MBBS)",
            duration:
              staticItem.stream === "mbbs"
                ? "5 Years"
                : staticItem.stream === "mba"
                ? "2 Years"
                : "4 Years",
            feesPerYear: staticItem.feesPerYear,
            eligibility: "50% aggregate in qualifying examination",
            seats: 120,
            entranceExam: staticItem.cutoff || "Merit Based",
          },
          {
            id: `${staticItem.id}-c2`,
            title:
              staticItem.stream === "btech"
                ? "B.Tech Electronics and Communication Engineering"
                : "BBA / Management Studies",
            duration: "3-4 Years",
            feesPerYear: Math.round(staticItem.feesPerYear * 0.9),
            eligibility: "50% in qualifying board examination",
            seats: 60,
            entranceExam: "Merit Based / Entrance Exam",
          },
        ],
        placements: [
          {
            id: `${staticItem.id}-p1`,
            year: 2025,
            averageCtc: staticItem.avgPackage,
            highestCtc: staticItem.highestPackage,
            topRecruiters: "TCS, Infosys, Wipro, Accenture, Amazon",
          },
          {
            id: `${staticItem.id}-p2`,
            year: 2024,
            averageCtc: Math.max(1, staticItem.avgPackage - 1.2),
            highestCtc: Math.max(2, staticItem.highestPackage - 3.0),
            topRecruiters: "TCS, Cognizant, Wipro, HCL",
          },
        ],
        reviews: [],
      };
    }
  }

  if (!collegeData) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-stone-50">
        <CollegeDetailClient college={collegeData} />
      </main>
      <Footer />
    </>
  );
}

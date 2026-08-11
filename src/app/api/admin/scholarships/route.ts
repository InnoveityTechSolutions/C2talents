import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedScholarships } from "../../../../../prisma/seed-scholarships";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Auto seed if empty
    const count = await db.scholarship.count();
    if (count === 0) {
      await seedScholarships();
    }

    const where: any = {};

    if (category && category !== "all") {
      where.category = { contains: category };
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { provider: { contains: q } },
        { eligibleCourses: { contains: q } },
        { scholarshipType: { contains: q } },
      ];
    }

    const scholarships = await db.scholarship.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(scholarships);
  } catch (error) {
    console.error("Admin API fetch scholarships failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch scholarships" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.provider || !body.amount || !body.applyLink) {
      return NextResponse.json(
        { message: "Scholarship Name, Provider, Amount, and Apply Link are required." },
        { status: 400 }
      );
    }

    const scholarship = await db.scholarship.create({
      data: {
        name: body.name,
        provider: body.provider,
        category: body.category || "Central Government",
        scholarshipType: body.scholarshipType || "Merit-Based",
        description: body.description || "",
        eligibilityCriteria: body.eligibilityCriteria || "",
        minPercentage: body.minPercentage ? parseFloat(body.minPercentage) : null,
        eligibleCourses: body.eligibleCourses || "All Courses",
        eligibleStates: body.eligibleStates || "All India",
        familyIncomeLimit: body.familyIncomeLimit ? parseFloat(body.familyIncomeLimit) : null,
        familyIncomeLimitText: body.familyIncomeLimitText || null,
        amount: body.amount,
        amountValue: body.amountValue ? parseFloat(body.amountValue) : null,
        deadline: body.deadline || "December 31, 2026",
        deadlineDate: body.deadlineDate ? new Date(body.deadlineDate) : new Date("2026-12-31T23:59:59Z"),
        officialWebsite: body.officialWebsite || body.applyLink,
        applyLink: body.applyLink,
        requiredDocuments: body.requiredDocuments || "Aadhar Card, Marksheets, Income Proof, Bank Passbook",
        selectionProcess: body.selectionProcess || "Merit & Financial scrutiny",
        renewalAvailable: body.renewalAvailable !== false,
        status: body.status || "OPEN",
        isPublished: body.isPublished !== false,
        isFeatured: Boolean(body.isFeatured),
        bannerUrl: body.bannerUrl || null,
        faqs: body.faqs || null,
      },
    });

    return NextResponse.json(scholarship, { status: 201 });
  } catch (error) {
    console.error("Admin API create scholarship failed:", error);
    return NextResponse.json(
      { message: "Failed to create scholarship" },
      { status: 500 }
    );
  }
}

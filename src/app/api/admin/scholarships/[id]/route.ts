import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scholarship = await db.scholarship.findUnique({
      where: { id },
    });

    if (!scholarship) {
      return NextResponse.json(
        { message: "Scholarship not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(scholarship);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch scholarship" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.provider !== undefined) updateData.provider = body.provider;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.scholarshipType !== undefined) updateData.scholarshipType = body.scholarshipType;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.eligibilityCriteria !== undefined) updateData.eligibilityCriteria = body.eligibilityCriteria;
    if (body.minPercentage !== undefined) {
      updateData.minPercentage =
        body.minPercentage !== null && body.minPercentage !== "" && !isNaN(Number(body.minPercentage))
          ? parseFloat(body.minPercentage)
          : null;
    }
    if (body.eligibleCourses !== undefined) updateData.eligibleCourses = body.eligibleCourses;
    if (body.eligibleStates !== undefined) updateData.eligibleStates = body.eligibleStates;
    if (body.familyIncomeLimit !== undefined) {
      updateData.familyIncomeLimit =
        body.familyIncomeLimit !== null && body.familyIncomeLimit !== "" && !isNaN(Number(body.familyIncomeLimit))
          ? parseFloat(body.familyIncomeLimit)
          : null;
    }
    if (body.familyIncomeLimitText !== undefined) updateData.familyIncomeLimitText = body.familyIncomeLimitText;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.amountValue !== undefined) {
      updateData.amountValue =
        body.amountValue !== null && body.amountValue !== "" && !isNaN(Number(body.amountValue))
          ? parseFloat(body.amountValue)
          : null;
    }
    if (body.deadline !== undefined) updateData.deadline = body.deadline;
    if (body.deadlineDate !== undefined) {
      updateData.deadlineDate =
        body.deadlineDate && !isNaN(new Date(body.deadlineDate).getTime())
          ? new Date(body.deadlineDate)
          : null;
    }
    if (body.officialWebsite !== undefined) updateData.officialWebsite = body.officialWebsite;
    if (body.applyLink !== undefined) updateData.applyLink = body.applyLink;
    if (body.requiredDocuments !== undefined) updateData.requiredDocuments = body.requiredDocuments;
    if (body.selectionProcess !== undefined) updateData.selectionProcess = body.selectionProcess;
    if (body.renewalAvailable !== undefined) updateData.renewalAvailable = Boolean(body.renewalAvailable);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished);
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (body.bannerUrl !== undefined) updateData.bannerUrl = body.bannerUrl;
    if (body.faqs !== undefined) updateData.faqs = body.faqs;

    const scholarship = await db.scholarship.update({
      where: { id },
      data: updateData,
    });

    try {
      revalidatePath("/scholarships");
      revalidatePath("/api/scholarships");
      revalidatePath("/manager/scholarships");
    } catch (e) {}

    return NextResponse.json(scholarship);
  } catch (error) {
    console.error("Admin API update scholarship failed:", error);
    return NextResponse.json(
      { message: "Failed to update scholarship" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.scholarship.delete({
      where: { id },
    });

    try {
      revalidatePath("/scholarships");
      revalidatePath("/api/scholarships");
      revalidatePath("/manager/scholarships");
    } catch (e) {}

    return NextResponse.json({ message: "Scholarship deleted successfully" });
  } catch (error) {
    console.error("Admin API delete scholarship failed:", error);
    return NextResponse.json(
      { message: "Failed to delete scholarship" },
      { status: 500 }
    );
  }
}


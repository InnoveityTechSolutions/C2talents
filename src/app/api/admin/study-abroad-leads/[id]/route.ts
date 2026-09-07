import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { status, adminNotes, assignedCounselor } = body;

    const existingLead = await prisma.studyAbroadLead.findUnique({
      where: { id }
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: "Study abroad lead not found" },
        { status: 404 }
      );
    }

    const updatedLead = await prisma.studyAbroadLead.update({
      where: { id },
      data: {
        status: status || existingLead.status,
        adminNotes: adminNotes !== undefined ? adminNotes : existingLead.adminNotes,
        assignedCounselor: assignedCounselor !== undefined ? assignedCounselor : existingLead.assignedCounselor,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead
    });
  } catch (error: any) {
    console.error("Error updating admin study abroad lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update study abroad lead" },
      { status: 500 }
    );
  }
}

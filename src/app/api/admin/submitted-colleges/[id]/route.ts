import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// PUT handler to allow Admin to edit/update submitted college data before publishing
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
    }

    const existingRequest = await db.collegeRegistrationRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Submitted college record not found." }, { status: 404 });
    }

    const updatedSubmittedDataStr = JSON.stringify(body);

    const updatedRequest = await db.collegeRegistrationRequest.update({
      where: { id },
      data: {
        submittedData: updatedSubmittedDataStr,
        collegeName: body.name || existingRequest.collegeName,
        location: body.location || body.city || existingRequest.location,
        email: body.email || existingRequest.email,
        mobile: body.mobile || existingRequest.mobile,
        website: body.website || existingRequest.website,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Submitted college profile updated successfully by Admin.",
      updatedRequest,
    });
  } catch (err: any) {
    console.error("[PUT /api/admin/submitted-colleges/[id] Error]:", err);
    return NextResponse.json(
      { error: "Failed to update submitted college profile: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}

// DELETE handler to allow Admin to remove a submitted college profile
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
    }

    const existingRequest = await db.collegeRegistrationRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Submitted college record not found." }, { status: 404 });
    }

    await db.collegeRegistrationRequest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Submitted college profile deleted successfully.",
    });
  } catch (err: any) {
    console.error("[DELETE /api/admin/submitted-colleges/[id] Error]:", err);
    return NextResponse.json(
      { error: "Failed to delete submitted college profile: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}

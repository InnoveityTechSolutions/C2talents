import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function findTargetCollege(idOrSlug: string) {
  if (!idOrSlug) return null;
  let college = await db.collegeProfile.findUnique({
    where: { id: idOrSlug },
  }).catch(() => null);

  if (!college) {
    college = await db.collegeProfile.findFirst({
      where: {
        OR: [
          { slug: idOrSlug },
          { slug: idOrSlug.toLowerCase() },
          { name: idOrSlug },
        ],
      },
    }).catch(() => null);
  }

  if (!college) {
    const cleanTarget = idOrSlug.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanTarget.length >= 3) {
      const all = await db.collegeProfile.findMany({ select: { id: true, name: true, slug: true } });
      const matched = all.find((c) => {
        const normName = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normSlug = (c.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          normName === cleanTarget ||
          normSlug === cleanTarget ||
          (cleanTarget.length > 5 && normName.includes(cleanTarget))
        );
      });
      if (matched) {
        college = await db.collegeProfile.findUnique({ where: { id: matched.id } });
      }
    }
  }

  return college;
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const target = await findTargetCollege(id);
    if (!target) {
      return NextResponse.json({ message: "College not found" }, { status: 404 });
    }

    const college = await db.collegeProfile.findUnique({
      where: { id: target.id },
      include: {
        courses: {
          where: { isDeleted: false },
          orderBy: { title: "asc" },
        },
        placements: {
          orderBy: { year: "desc" },
        },
        reviews: {
          include: {
            student: true,
          },
          orderBy: { createdAt: "desc" },
        },
        content: true,
      },
    });

    return NextResponse.json(college, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    });
  } catch (error: any) {
    console.error("Failed to fetch college details:", error);
    return NextResponse.json(
      { message: "Failed to load college details" },
      { status: 500 }
    );
  }
}

import { db } from "@/lib/db";
import { CollegeForm } from "@/components/admin/CollegeForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditCollegePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const college = await db.collegeProfile.findUnique({
    where: { id },
    include: {
      courses: true,
      galleryImages: true,
      content: true,
    },
  });

  if (!college) {
    notFound();
  }

  return <CollegeForm initialData={college} collegeId={id} />;
}

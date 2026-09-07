import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const db = new PrismaClient();

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

async function testWorkflow() {
  console.log("Testing Sri Sairam Siddha Medical College lookup...");
  let col = await findTargetCollege("sri-sairam-siddha-medical-college-chennai");
  console.log("Found in DB:", col ? `${col.name} (UUID: ${col.id})` : "Not found in DB yet (will auto-create on edit)");

  // If not found, let's create it as edit would do
  if (!col) {
    const newUser = await db.user.create({
      data: {
        email: `siddha_${Date.now()}@c2talents.com`,
        name: "Sri Sairam Siddha Admin",
        passwordHash: "hash123",
        role: "ADMIN"
      }
    });

    col = await db.collegeProfile.create({
      data: {
        userId: newUser.id,
        name: "Sri Sairam Siddha Medical College, Chennai",
        slug: "sri-sairam-siddha-medical-college-chennai",
        description: "Leading Siddha Medical Institution",
        location: "Chennai, Tamil Nadu",
        type: "Private",
        feesPerYear: 150000,
        avgPackage: 6.5,
        highestPackage: 15.0,
        image: "/images/campus-hero.jpg",
        status: "PUBLISHED",
        courses: {
          create: [
            { title: "Bachelor of Siddha Medicine and Surgery (BSMS)", duration: "5.5 Years", feesPerYear: 150000, eligibility: "10+2 with PCB & NEET" },
            { title: "MD Siddha", duration: "3 Years", feesPerYear: 200000, eligibility: "BSMS Degree" }
          ]
        }
      },
      include: { courses: true }
    });
    console.log("✨ Created Sri Sairam Siddha in DB with UUID:", col.id);
  }

  // Now test deleting a course (Simulate admin deleting MD Siddha)
  console.log("Simulating Admin removing 'MD Siddha' course...");
  const targetId = col.id;
  await db.$transaction([
    db.course.deleteMany({ where: { collegeId: targetId } }),
  ]);

  const updatedCol = await db.collegeProfile.update({
    where: { id: targetId },
    data: {
      courses: {
        create: [
          { title: "Bachelor of Siddha Medicine and Surgery (BSMS)", duration: "5.5 Years", feesPerYear: 150000, eligibility: "10+2 with PCB & NEET" }
        ]
      }
    },
    include: { courses: true }
  });

  console.log("✅ Courses in DB after removal:", updatedCol.courses.map(c => c.title));
}

testWorkflow();

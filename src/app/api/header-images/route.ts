import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULT_HEADER_IMAGES = [
  {
    title: "Anna University",
    description: "Premier public state university known for engineering and technological research.",
    altText: "Anna University Campus Banner",
    imageUrl: "/images/anna.jpg",
    displayOrder: 1,
    isActive: true,
  },
  {
    title: "Madras Christian College (MCC)",
    description: "A historic institution offering excellence in arts, science, and commerce.",
    altText: "Madras Christian College MCC Banner",
    imageUrl: "/images/mcc.png",
    displayOrder: 2,
    isActive: true,
  },
  {
    title: "SRM Institute of Science and Technology",
    description: "Top private institution with world-class infrastructure and global placements.",
    altText: "SRM Institute Campus Banner",
    imageUrl: "/images/srm.png",
    displayOrder: 3,
    isActive: true,
  },
  {
    title: "VIT Vellore",
    description: "Nationally recognized university driving innovation in engineering education.",
    altText: "VIT Vellore Campus Banner",
    imageUrl: "/images/vit.png",
    displayOrder: 4,
    isActive: true,
  },
  {
    title: "PSG College of Technology",
    description: "Industry-aligned education with a strong legacy of successful alumni.",
    altText: "PSG College of Technology Banner",
    imageUrl: "/images/psg.png",
    displayOrder: 5,
    isActive: true,
  },
  {
    title: "Loyola College",
    description: "Renowned for Jesuit-guided holistic education, arts, and scientific research.",
    altText: "Loyola College Chennai Banner",
    imageUrl: "/images/loyola-college.png",
    displayOrder: 6,
    isActive: true,
  },
  {
    title: "SSN College of Engineering",
    description: "State-of-the-art campus fostering merit-driven tech leaders.",
    altText: "SSN College of Engineering Banner",
    imageUrl: "/images/ssn.png",
    displayOrder: 7,
    isActive: true,
  },
  {
    title: "SASTRA University",
    description: "Leading research university offering integrated academic programs.",
    altText: "SASTRA University Banner",
    imageUrl: "/images/slider-1.jpg",
    displayOrder: 8,
    isActive: true,
  },
];

async function ensureDefaultImagesSeeded() {
  try {
    const count = await db.headerImage.count();
    if (count === 0) {
      await db.headerImage.createMany({
        data: DEFAULT_HEADER_IMAGES,
      });
    }
  } catch (err) {
    console.error("Error seeding default header images:", err);
  }
}

// Public API endpoint for Homepage Hero Banner
export async function GET() {
  try {
    const images = await Promise.race([
      db.headerImage.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
    ]);

    if (images && images.length > 0) {
      return NextResponse.json({
        success: true,
        images,
        count: images.length,
      });
    }
  } catch (err: any) {
    console.warn("[GET /api/header-images Notice]: DB query timeout/unreachable. Serving static fallback images.");
  }

  // Instant fallback to default header images (0ms latency!)
  return NextResponse.json({
    success: true,
    images: DEFAULT_HEADER_IMAGES,
    count: DEFAULT_HEADER_IMAGES.length,
    isFallback: true,
  });
}

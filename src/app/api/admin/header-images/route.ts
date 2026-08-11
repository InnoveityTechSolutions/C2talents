import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

// GET: Fetch all header images for Admin with optional filter & search
export async function GET(req: Request) {
  try {
    // Auto-seed default images if DB table is currently empty
    await ensureDefaultImagesSeeded();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // ALL, ACTIVE, INACTIVE
    const search = searchParams.get("search");

    const where: any = {};

    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "INACTIVE") {
      where.isActive = false;
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { altText: { contains: q } },
      ];
    }

    const images = await db.headerImage.findMany({
      where,
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    const activeCount = await db.headerImage.count({ where: { isActive: true } });
    const inactiveCount = await db.headerImage.count({ where: { isActive: false } });
    const totalCount = await db.headerImage.count();

    return NextResponse.json({
      success: true,
      images,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
      },
    });
  } catch (err: any) {
    console.error("[GET /api/admin/header-images Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch admin header images: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}

// POST: Upload and Create New Header Image
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const imageUrlInput = formData.get("imageUrl") as string | null;
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";
    const altText = (formData.get("altText") as string) || "";
    const displayOrderInput = formData.get("displayOrder") as string | null;
    const isActiveInput = formData.get("isActive") as string | null;

    if (!title.trim()) {
      return NextResponse.json({ error: "Image Title is required." }, { status: 400 });
    }

    let finalImageUrl = imageUrlInput ? imageUrlInput.trim() : "";

    // File Upload Handling
    if (file && file.size > 0) {
      // 1. Max File Size Validation (20MB = 20 * 1024 * 1024 bytes)
      const MAX_SIZE = 20 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds maximum 20MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB` },
          { status: 400 }
        );
      }

      // 2. Format Validation
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: "Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP." },
          { status: 400 }
        );
      }

      // 3. Save File to Disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = join(process.cwd(), "public", "uploads", "header-images");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const sanitizeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `${Date.now()}-${sanitizeFileName}`;
      const filePath = join(uploadDir, uniqueFileName);

      await writeFile(filePath, buffer);
      finalImageUrl = `/uploads/header-images/${uniqueFileName}`;
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: "Please upload an image file or provide a valid image URL." },
        { status: 400 }
      );
    }

    // Auto-calculate next display position if not explicitly set
    let displayOrder = 1;
    if (displayOrderInput !== null && displayOrderInput !== undefined && displayOrderInput !== "") {
      displayOrder = parseInt(displayOrderInput, 10) || 1;
    } else {
      const maxItem = await db.headerImage.findFirst({
        orderBy: { displayOrder: "desc" },
      });
      displayOrder = maxItem ? maxItem.displayOrder + 1 : 1;
    }

    const isActive = isActiveInput !== null ? isActiveInput === "true" || isActiveInput === "1" : true;

    const newHeaderImage = await db.headerImage.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        altText: altText.trim() || title.trim(),
        imageUrl: finalImageUrl,
        displayOrder,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      image: newHeaderImage,
      message: "Header image uploaded and saved successfully!",
    });
  } catch (err: any) {
    console.error("[POST /api/admin/header-images Error]:", err);
    return NextResponse.json(
      { error: "Failed to upload header image: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}

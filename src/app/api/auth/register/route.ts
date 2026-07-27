import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "edumatch_ai_premium_secret_key_2026";

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (role !== Role.STUDENT && role !== Role.COLLEGE) {
      return NextResponse.json(
        { message: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User & Profile in a transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: role as Role,
        },
      });

      if (role === Role.STUDENT) {
        // Create initial student profile
        const emailPrefix = email.split("@")[0];
        const studentName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            name: studentName,
            location: "",
            score12th: 75.0,
            stream12th: "Science",
            budgetLimit: 200000,
            hostelPreference: false,
            specializationPreference: "Computer Science",
            expectedPackage: 6.0,
          },
        });
      } else if (role === Role.COLLEGE) {
        // Create initial college profile
        const emailPrefix = email.split("@")[0];
        const collegeName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) + " University";
        await tx.collegeProfile.create({
          data: {
            userId: newUser.id,
            name: collegeName,
            description: "A premium institution dedicated to higher learning.",
            location: "Chennai, Tamil Nadu",
            type: "Private",
            feesPerYear: 100000,
            avgPackage: 5.5,
            highestPackage: 15.0,
            image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800",
          },
        });
      }

      return newUser;
    });

    // Fetch full profile info for response
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        student: true,
        college: true,
      },
    });

    if (!dbUser) {
      throw new Error("User creation verification failed");
    }

    const profileId = dbUser.role === Role.STUDENT ? dbUser.student?.id : dbUser.role === Role.COLLEGE ? dbUser.college?.id : null;
    const name = dbUser.role === Role.STUDENT ? dbUser.student?.name : dbUser.role === Role.COLLEGE ? dbUser.college?.name : "User";

    // Generate JWT
    const token = jwt.sign(
      {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        profileId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        name,
        profileId,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred during registration" },
      { status: 500 }
    );
  }
}

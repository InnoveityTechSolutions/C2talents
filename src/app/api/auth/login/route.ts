import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "c2talents-enterprise-jwt-secret-key-2026";

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log("\n====================================================");
  console.log("🔑 [AUTH API DEV LOG] Processing POST /api/auth/login");
  console.log("====================================================");

  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("1. Environment variables check:");
    console.log("   - NODE_ENV:", process.env.NODE_ENV);
    console.log("   - JWT_SECRET configured:", !!process.env.JWT_SECRET);
    console.log("2. Incoming Credentials:");
    console.log("   - Target Email:", email);
    console.log("   - Password provided length:", password?.length || 0);

    if (!email || typeof email !== "string" || !email.trim()) {
      console.log("❌ Result: Invalid Email Address (Empty)");
      return NextResponse.json({ error: "Invalid Email Address" }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      console.log("❌ Result: Incorrect Password (Empty)");
      return NextResponse.json({ error: "Incorrect Password" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Step 3: Database Connection & User Lookup
    console.log("3. Querying Database for user:", cleanEmail);
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      console.log(`❌ Result: Email '${cleanEmail}' does NOT exist in database!`);
      return NextResponse.json({ error: "Invalid Email Address" }, { status: 401 });
    }

    console.log("4. User found in DB:");
    console.log("   - User ID:", user.id);
    console.log("   - Role:", user.role);
    console.log("   - Hash in DB:", user.passwordHash ? `${user.passwordHash.slice(0, 15)}...` : "NONE");

    // Step 5: bcrypt Comparison
    console.log("5. Executing bcrypt.compare()...");
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log("   - bcrypt match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Result: Incorrect Password!");
      return NextResponse.json({ error: "Incorrect Password" }, { status: 401 });
    }

    // Step 6: Allowed Roles check
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR", "COLLEGE_MANAGER"];
    if (!allowedRoles.includes(user.role)) {
      console.log(`❌ Result: Account Role '${user.role}' is Disabled for Admin CMS`);
      return NextResponse.json({ error: "Account Disabled" }, { status: 403 });
    }

    // Step 7: JWT Generation
    console.log("7. Generating JWT Token...");
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || "Administrator",
      permissions: ["*"],
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });
    console.log("   - JWT successfully generated.");

    // Step 8: Construct Response & HTTP-Only Cookies
    const response = NextResponse.json({
      success: true,
      redirectUrl: "/admin",
      role: user.role,
      permissions: ["ALL"],
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "Administrator",
        role: user.role,
      },
    });

    // Set cookie on both admin_token and token for universal compatibility
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    };

    response.cookies.set("admin_token", token, cookieOptions);
    response.cookies.set("token", token, cookieOptions);

    console.log(`✅ Authentication Succeeded in ${Date.now() - startTime}ms! Redirecting to /admin.`);
    console.log("====================================================\n");

    return response;
  } catch (err: any) {
    console.error("❌ Exception during login authentication:", err);
    return NextResponse.json({ error: "Authentication system error: " + err.message }, { status: 500 });
  }
}

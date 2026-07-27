import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const colleges = await prisma.collegeProfile.findMany({
      select: { createdAt: true, status: true },
    });

    const users = await prisma.user.findMany({
      select: { createdAt: true },
    });

    // Group by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyStats: Record<string, { month: string; colleges: number; users: number }> = {};

    // Populate last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyStats[mKey] = { month: mKey, colleges: 0, users: 0 };
    }

    colleges.forEach((c) => {
      const d = new Date(c.createdAt);
      const mKey = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyStats[mKey]) {
        monthlyStats[mKey].colleges += 1;
      }
    });

    users.forEach((u) => {
      const d = new Date(u.createdAt);
      const mKey = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyStats[mKey]) {
        monthlyStats[mKey].users += 1;
      }
    });

    return NextResponse.json({
      success: true,
      data: Object.values(monthlyStats),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load chart trends." }, { status: 500 });
  }
}

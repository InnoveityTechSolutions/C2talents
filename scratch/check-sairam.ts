import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const db = new PrismaClient();

async function checkSairam() {
  const colleges = await db.collegeProfile.findMany({
    where: {
      name: { contains: "sairam" }
    },
    include: { courses: true }
  });
  console.log("Found Sairam colleges in Aiven DB:", JSON.stringify(colleges, null, 2));
}

checkSairam();

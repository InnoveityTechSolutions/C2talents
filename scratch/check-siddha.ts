import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const db = new PrismaClient();

async function checkSiddha() {
  const colleges = await db.collegeProfile.findMany({
    where: {
      name: { contains: "siddha" }
    },
    include: { courses: true }
  });
  console.log("Colleges matching 'siddha' in DB:", JSON.stringify(colleges, null, 2));
}

checkSiddha();

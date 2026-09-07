import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const db = new PrismaClient();

async function checkSathak() {
  const colleges = await db.collegeProfile.findMany({
    where: {
      name: { contains: "sathak" }
    },
    include: { courses: true, content: true }
  });
  console.log("Found Sathak colleges in DB:", JSON.stringify(colleges, null, 2));
}

checkSathak();

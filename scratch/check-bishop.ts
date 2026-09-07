import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function checkCollege() {
  const csi = await prisma.collegeProfile.findMany({
    where: {
      name: { contains: "bishop" }
    },
    include: { courses: true }
  });
  console.log("Colleges matching 'bishop' in Aiven Cloud DB:", JSON.stringify(csi, null, 2));
}

checkCollege();

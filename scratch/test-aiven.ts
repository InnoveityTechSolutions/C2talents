import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

async function testAivenConnection() {
  console.log("Testing connection to Aiven Cloud DB:");
  console.log("URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"));
  
  const prisma = new PrismaClient();

  try {
    const userCount = await prisma.user.count();
    console.log("✅ Aiven DB Connected Successfully! User count:", userCount);
  } catch (err: any) {
    console.error("❌ Aiven DB Connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAivenConnection();

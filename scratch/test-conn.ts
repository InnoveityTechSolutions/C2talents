import { PrismaClient } from "@prisma/client";

async function testConnection() {
  console.log("Testing connection to Local MySQL database...");
  const prisma = new PrismaClient({
    datasources: { db: { url: "mysql://root@127.0.0.1:3306/c2talents" } }
  });
  try {
    const count = await prisma.collegeProfile.count();
    console.log("Local MySQL connected successfully! College count:", count);
  } catch (err: any) {
    console.error("Local Connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

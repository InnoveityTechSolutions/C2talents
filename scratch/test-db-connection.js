const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database...");
    const count = await prisma.collegeProfile.count();
    console.log("SUCCESS: Database is ONLINE and CONNECTED!");
    console.log(`Total College Profiles in DB: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error("ERROR: Failed to connect to database:", err.message);
    process.exit(1);
  }
}

main();

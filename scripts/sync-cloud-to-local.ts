import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';

const CLOUD_URL = process.env.DATABASE_URL;

if (!CLOUD_URL) {
  console.error("❌ Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}
const LOCAL_URL = process.env.LOCAL_DATABASE_URL || "mysql://root@127.0.0.1:3306/c2talents";

async function syncCloudToLocal() {
  console.log("🔄 Connecting to Cloud and Local databases...");
  
  const cloudPrisma = new PrismaClient({
    datasources: { db: { url: CLOUD_URL } }
  });

  const localConn = await mysql.createConnection(LOCAL_URL);

  try {
    const colleges = await cloudPrisma.collegeProfile.findMany({
      include: { courses: true, galleryImages: true, reviews: true, placements: true }
    });

    console.log(`📦 Found ${colleges.length} colleges in Cloud DB. Syncing to Local MySQL...`);

    for (const col of colleges) {
      // Upsert into local database
      await localConn.query(
        `INSERT INTO collegeprofile (id, userId, name, shortName, slug, description, location, state, feesPerYear, avgPackage, highestPackage, image, status, rating, type, updatedAt, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
         name=VALUES(name), description=VALUES(description), feesPerYear=VALUES(feesPerYear), avgPackage=VALUES(avgPackage), highestPackage=VALUES(highestPackage), image=VALUES(image), status=VALUES(status);`,
        [col.id, col.userId, col.name, col.shortName, col.slug, col.description, col.location, col.state, col.feesPerYear, col.avgPackage, col.highestPackage, col.image, col.status, col.rating, col.type]
      );
    }

    console.log("✅ Successfully synced Cloud DB to Local MySQL!");
  } catch (error) {
    console.error("❌ Error syncing databases:", error);
  } finally {
    await cloudPrisma.$disconnect();
    await localConn.end();
  }
}

syncCloudToLocal();

import { PrismaClient } from "@prisma/client";
import { defaultCountriesData } from "../src/data/study-abroad-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding StudyAbroadCountry records...");

  for (const data of defaultCountriesData) {
    const existing = await prisma.studyAbroadCountry.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      await prisma.studyAbroadCountry.update({
        where: { slug: data.slug },
        data
      });
      console.log(`Updated ${data.name}`);
    } else {
      await prisma.studyAbroadCountry.create({
        data
      });
      console.log(`Created ${data.name}`);
    }
  }

  console.log("StudyAbroadCountry seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

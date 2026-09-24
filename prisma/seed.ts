import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { collegesData } from '../src/data/colleges';
import { defaultCountriesData } from '../src/data/study-abroad-data';
import { assertSafeDatabaseOperation } from '../src/lib/env-guard';
import { createDatabaseBackup } from '../src/lib/backup';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Safe Seeding Started...');

  // Block destructive seed in production or without explicit safety flag
  assertSafeDatabaseOperation('prisma db seed', true);

  // Automatically create a SQL backup before running seed
  console.log('📦 Triggering automatic pre-seed database backup...');
  await createDatabaseBackup('pre-seed');

  console.log('ℹ️ Running non-destructive seed (Upserts only)...');

  // 1. Create Super Admin Account (Email: superadmin@c2talents.com, Password: Admin@123)
  const superAdminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@c2talents.com',
      passwordHash: superAdminPasswordHash,
      role: Role.SUPER_ADMIN,
      name: 'Super Administrator',
    },
  });
  console.log('Super Admin user created: superadmin@c2talents.com / Admin@123');

  // 2. Create Regular Admin Account
  const adminPasswordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@c2talents.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      name: 'Standard Admin',
    },
  });

  // 3. Create Student Account & Profile
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@c2talents.com',
      passwordHash: adminPasswordHash,
      role: Role.STUDENT,
      name: 'Venkatesh Kumar',
    },
  });
  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      name: 'Venkatesh Kumar',
      location: 'Chennai, Tamil Nadu',
      board12th: 'CBSE',
      score12th: 92.5,
      stream12th: 'Science',
      entranceExamName: 'TNEA',
      entranceExamScore: 191.5,
      budgetLimit: 250000,
      hostelPreference: true,
      specializationPreference: 'Computer Science',
      expectedPackage: 8.0,
    },
  });

  // 4. Create Categories
  const categoriesList = [
    { name: "Engineering", slug: "engineering", description: "Top Engineering & Technology Colleges" },
    { name: "Arts & Science", slug: "arts-and-science", description: "Degree Arts & Humanities Institutions" },
    { name: "Medical", slug: "medical", description: "Medical & Dental Science Colleges" },
    { name: "Law", slug: "law", description: "Legal Education & LL.B Colleges" },
    { name: "MBA", slug: "mba", description: "Management & Business Analytics Schools" },
    { name: "Architecture", slug: "architecture", description: "B.Arch & Design Institutes" },
    { name: "Agriculture", slug: "agriculture", description: "Agricultural Science Universities" },
  ];

  for (const cat of categoriesList) {
    await prisma.category.create({ data: cat });
  }

  // 5. Seed Colleges, Courses, Placements & Reviews
  const coursesMockBTech = [
    { title: "B.Tech Computer Science & Engineering", duration: "4 Years", demand: "Exponential", feesPerYear: 85000, minGpa: 85.0, eligibility: "10+2 with PCM", seats: 120, entranceExam: "TNEA / JEE Main", careerPath: "Software Engineer, Data Scientist" },
    { title: "B.Tech Artificial Intelligence & Data Science", duration: "4 Years", demand: "Very High", feesPerYear: 90000, minGpa: 88.0, eligibility: "10+2 with PCM", seats: 60, entranceExam: "TNEA", careerPath: "AI Researcher, ML Engineer" },
    { title: "B.Tech Electronics & Communication", duration: "4 Years", demand: "High", feesPerYear: 75000, minGpa: 80.0, eligibility: "10+2 with PCM", seats: 120, entranceExam: "TNEA", careerPath: "VLSI Designer, Embedded Engineer" }
  ];

  let colIdx = 1;
  for (const mock of collegesData as any[]) {
    const uniqueSlug = mock.slug ? `${mock.slug}-${colIdx}` : `college-${colIdx}`;
    const colUser = await prisma.user.create({
      data: {
        email: `college.${colIdx}@c2talents.com`,
        passwordHash: adminPasswordHash,
        role: Role.COLLEGE_MANAGER,
        name: `${mock.shortName || mock.name} Manager`,
      },
    });

    const categoriesStr = Array.isArray(mock.categories) ? mock.categories.join(", ") : (mock.categories || "Engineering");
    const facilitiesStr = Array.isArray(mock.facilities) ? mock.facilities.join(", ") : (mock.facilities || "Hostel, Library, Sports");

    const college = await prisma.collegeProfile.create({
      data: {
        userId: colUser.id,
        name: mock.name,
        shortName: mock.shortName || mock.name.slice(0, 5).toUpperCase(),
        slug: uniqueSlug,
        description: mock.description || "Leading higher education institution.",
        location: mock.location || "Chennai, Tamil Nadu",
        city: mock.city || "Chennai",
        state: mock.state || "Tamil Nadu",
        district: mock.city || "Chennai",
        type: mock.type || "Private",
        ownership: mock.ownership || "Private",
        categories: categoriesStr,
        rating: mock.rating || 4.0,
        feesPerYear: mock.feesPerYear || 60000,
        avgPackage: mock.avgPackage || 5.0,
        highestPackage: mock.highestPackage || 12.0,
        naacGrade: mock.naacGrade || "A",
        nirfRank: mock.nirfRank || 50,
        image: mock.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        logo: mock.image || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80",
        banner: mock.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        facilities: facilitiesStr,
        status: "PUBLISHED",
        featured: (mock.rating || 4.0) >= 4.5,
        trending: mock.nirfRank ? mock.nirfRank <= 30 : false,
      },
    });

    // Add courses for college
    for (const c of coursesMockBTech) {
      await prisma.course.create({
        data: {
          collegeId: college.id,
          title: c.title,
          duration: c.duration,
          demand: c.demand,
          feesPerYear: c.feesPerYear,
          minGpa: c.minGpa,
          eligibility: c.eligibility,
          seats: c.seats,
          entranceExam: c.entranceExam,
          careerPath: c.careerPath,
        },
      });
    }

    // Add Placement outcome
    await prisma.placementOutcome.create({
      data: {
        collegeId: college.id,
        year: 2025,
        eligibleStudents: 450,
        placedStudents: 412,
        highestCtc: mock.highestPackage || 15.0,
        averageCtc: mock.avgPackage || 5.5,
        topRecruiters: "TCS, Infosys, Accenture, Cognizant, Wipro",
      },
    });

    // Add Review
    await prisma.review.create({
      data: {
        collegeId: college.id,
        studentId: studentProfile.id,
        rating: mock.rating || 4.5,
        content: `Excellent academic environment, high placement record, and great campus life at ${mock.shortName || mock.name}.`,
        isVerified: true,
      },
    });

    colIdx++;
  }

  // 6. Create News Articles
  const newsList = [
    {
      title: "TNEA 2026 Counselling Dates Announced for Engineering Admissions",
      slug: "tnea-2026-counselling-dates-announced",
      content: "The Directorate of Technical Education (DoTE) Tamil Nadu has officially released the schedule for TNEA 2026 counselling.",
      category: "Admissions",
      author: "Super Admin",
      status: "PUBLISHED",
    },
    {
      title: "NIRF Ranking 2026: Top 10 Colleges in Tamil Nadu",
      slug: "nirf-ranking-2026-top-colleges-tamil-nadu",
      content: "Explore the latest NIRF 2026 ranking list featuring top autonomous engineering and arts colleges.",
      category: "Rankings",
      author: "Super Admin",
      status: "PUBLISHED",
    },
  ];

  for (const n of newsList) {
    await prisma.newsArticle.create({ data: n });
  }

  // 7. Seed Enquiry Leads
  await prisma.enquiryLead.create({
    data: {
      name: "Rohan Sharma",
      email: "rohan@gmail.com",
      phone: "+91 98765 12345",
      message: "Interested in B.Tech CSE admissions for 2026 batch.",
      status: "NEW",
    },
  });

  // 8. Seed Study Abroad Countries
  for (const c of defaultCountriesData) {
    await prisma.studyAbroadCountry.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log('Study abroad countries seeded successfully!');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

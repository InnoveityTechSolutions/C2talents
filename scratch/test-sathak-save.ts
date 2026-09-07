import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const db = new PrismaClient();

async function testFullCollegeSave() {
  console.log("Testing Mohamed Sathak A.J. College of Engineering creation & field persistence...");
  
  // 1. Find or create a user for this college
  let user = await db.user.findFirst({ where: { email: { contains: "sathak_test" } } });
  if (!user) {
    user = await db.user.create({
      data: {
        email: `sathak_test_${Date.now()}@c2talents.com`,
        name: "Sathak Admin",
        passwordHash: "hash123",
        role: "ADMIN"
      }
    });
  }

  // 2. Create Mohamed Sathak A.J. College of Engineering with full Sections 1-13
  const college = await db.collegeProfile.create({
    data: {
      userId: user.id,
      name: "Mohamed Sathak A.J. College of Engineering",
      shortName: "MOHAM",
      slug: "mohamed-sathak-a-j-college-of-engineering-chennai",
      description: "Premier Engineering College in Chennai",
      location: "Medavakkam, Chennai, Tamil Nadu",
      address: "Medavakkam Road",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "600059",
      phone: "+91 44 2239 0675",
      mobile: "+91 98765 43210",
      email: "admissions@msajce.edu.in",
      website: "https://www.msajce.edu.in",
      type: "Private",
      ownership: "Private",
      category: "Engineering",
      facilities: "Hostel, Transport, Library, Sports, Gym, WiFi",
      naacGrade: "A",
      nirfRank: 183,
      feesPerYear: 120000,
      avgPackage: 6.5,
      highestPackage: 16.25,
      placementPercentage: 80,
      image: "/images/default-college.jpg",
      collegeVideo: "https://youtu.be/O9ZzyUKHGTQ?si=4d0FurOAyT4S8IxS",
      status: "PUBLISHED",
      courses: {
        create: [
          { title: "B.Tech Artificial Intelligence & Data Science", duration: "4 Years", feesPerYear: 90000, seats: 60, eligibility: "10+2 with PCM", entranceExam: "TNEA" },
          { title: "B.Tech Computer Science & Engineering", duration: "4 Years", feesPerYear: 85000, seats: 120, eligibility: "10+2 with PCM", entranceExam: "TNEA / JEE Main" }
        ]
      },
      content: {
        create: {
          overview: "Mohamed Sathak A.J. College of Engineering is established with a vision to provide technical education.",
          about: "Detailed about college description and campus life.",
          history: "Established under Mohamed Sathak Trust.",
          highlights: "NAAC A Grade, 183 NIRF rank.",
          whyChoose: "Top placements and state of the art labs.",
          campusLife: "Vibrant student clubs and annual fests.",
          placementOverview: "Corporate internships offered in final year.",
          topRecruiters: "TCS, Infosys, Accenture, Cognizant, Wipro",
          faq: "Common questions answered.",
          contentStatus: "PUBLISHED"
        }
      }
    },
    include: { courses: true, content: true }
  });

  console.log("✅ Successfully created college in Aiven Cloud DB!");
  console.log("DB ID:", college.id);
  console.log("Name:", college.name);
  console.log("Courses:", college.courses.map(c => c.title));
  console.log("Overview from Content Table:", college.content?.overview);
  console.log("YouTube Video:", college.collegeVideo);
}

testFullCollegeSave();

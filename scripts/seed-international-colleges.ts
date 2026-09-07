import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const internationalColleges = [
  // --- USA ---
  {
    name: "Massachusetts Institute of Technology (MIT)",
    shortName: "MIT",
    slug: "mit-usa",
    description: "Massachusetts Institute of Technology (MIT) is a world-renowned private research university in Cambridge, Massachusetts, pioneering advances in engineering, computer science, and physical sciences.",
    location: "Cambridge, Massachusetts, USA",
    city: "Cambridge",
    state: "Massachusetts",
    rating: 4.9,
    type: "Private Research University",
    ownership: "Private",
    category: "Engineering",
    feesPerYear: 4500000,
    avgPackage: 30.0,
    highestPackage: 110.0,
    nirfRank: 1,
    image: "/images/destinations/us_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.S. Computer Science & Artificial Intelligence", duration: "2 Years", feesPerYear: 4500000, demand: "Exponential" },
      { title: "B.S. Electrical Engineering & Computer Science", duration: "4 Years", feesPerYear: 4200000, demand: "Very High" },
      { title: "M.S. Data, Economics, and Development Policy", duration: "1.5 Years", feesPerYear: 3800000, demand: "High" },
      { title: "Master of Finance (MFin)", duration: "1.5 Years", feesPerYear: 4600000, demand: "High" }
    ]
  },
  {
    name: "Stanford University",
    shortName: "Stanford",
    slug: "stanford-usa",
    description: "Stanford University, located in the heart of Silicon Valley, is famous for its entrepreneurial spirit, top-ranked business and engineering schools, and world-class research labs.",
    location: "Stanford, California, USA",
    city: "Stanford",
    state: "California",
    rating: 4.9,
    type: "Private Research University",
    ownership: "Private",
    category: "Engineering",
    feesPerYear: 4400000,
    avgPackage: 32.0,
    highestPackage: 120.0,
    nirfRank: 2,
    image: "/images/destinations/us_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "MBA Business Administration", duration: "2 Years", feesPerYear: 4800000, demand: "Exponential" },
      { title: "M.S. Computer Science", duration: "2 Years", feesPerYear: 4400000, demand: "Very High" },
      { title: "M.S. Management Science and Engineering", duration: "2 Years", feesPerYear: 4200000, demand: "High" },
      { title: "M.S. Bioengineering", duration: "2 Years", feesPerYear: 4100000, demand: "High" }
    ]
  },
  {
    name: "Carnegie Mellon University",
    shortName: "CMU",
    slug: "cmu-usa",
    description: "Carnegie Mellon University (CMU) is a global leader in artificial intelligence, software engineering, robotics, and information systems management.",
    location: "Pittsburgh, Pennsylvania, USA",
    city: "Pittsburgh",
    state: "Pennsylvania",
    rating: 4.8,
    type: "Private Research Institution",
    ownership: "Private",
    category: "Engineering",
    feesPerYear: 4100000,
    avgPackage: 28.0,
    highestPackage: 95.0,
    nirfRank: 5,
    image: "/images/destinations/us_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.S. Software Engineering", duration: "2 Years", feesPerYear: 4100000, demand: "Exponential" },
      { title: "M.S. Information Technology (MSIT)", duration: "1.5 Years", feesPerYear: 3900000, demand: "Very High" },
      { title: "M.S. Computational Finance", duration: "1.5 Years", feesPerYear: 4300000, demand: "High" }
    ]
  },
  {
    name: "Harvard University",
    shortName: "Harvard",
    slug: "harvard-usa",
    description: "Harvard University is an Ivy League research university in Cambridge, Massachusetts, renowned for medicine, law, government, and business administration.",
    location: "Cambridge, Massachusetts, USA",
    city: "Cambridge",
    state: "Massachusetts",
    rating: 4.9,
    type: "Private Ivy League University",
    ownership: "Private",
    category: "Management",
    feesPerYear: 4700000,
    avgPackage: 35.0,
    highestPackage: 130.0,
    nirfRank: 3,
    image: "/images/destinations/us_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "Harvard MBA", duration: "2 Years", feesPerYear: 4900000, demand: "Exponential" },
      { title: "Master of Public Health (MPH)", duration: "2 Years", feesPerYear: 4200000, demand: "High" },
      { title: "M.S. Data Science", duration: "1.5 Years", feesPerYear: 4500000, demand: "Very High" }
    ]
  },
  {
    name: "University of California, Berkeley",
    shortName: "UC Berkeley",
    slug: "ucberkeley-usa",
    description: "UC Berkeley is the top public research university in the United States, famous for computer science, biotechnology, economics, and engineering excellence.",
    location: "Berkeley, California, USA",
    city: "Berkeley",
    state: "California",
    rating: 4.8,
    type: "Public Research University",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 3800000,
    avgPackage: 27.0,
    highestPackage: 90.0,
    nirfRank: 4,
    image: "/images/destinations/us_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.S. Electrical Engineering & Computer Sciences", duration: "2 Years", feesPerYear: 3800000, demand: "Exponential" },
      { title: "Master of Engineering (MEng)", duration: "1 Year", feesPerYear: 3900000, demand: "Very High" }
    ]
  },
  {
    name: "Northeastern University",
    shortName: "Northeastern",
    slug: "northeastern-usa",
    description: "Northeastern University in Boston is famous for its cooperative education (co-op) program, connecting students with paid professional internships across America.",
    location: "Boston, Massachusetts, USA",
    city: "Boston",
    state: "Massachusetts",
    rating: 4.6,
    type: "Private University",
    ownership: "Private",
    category: "Engineering",
    feesPerYear: 3200000,
    avgPackage: 21.0,
    highestPackage: 65.0,
    nirfRank: 15,
    image: "/images/destinations/us_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.S. Information Systems", duration: "2 Years", feesPerYear: 3200000, demand: "Exponential" },
      { title: "M.S. Data Analytics Engineering", duration: "2 Years", feesPerYear: 3300000, demand: "Very High" }
    ]
  },

  // --- UK ---
  {
    name: "University of Oxford",
    shortName: "Oxford",
    slug: "oxford-uk",
    description: "The University of Oxford is the oldest university in the English-speaking world, featuring world-leading academic faculties, collegiate tutorial teaching, and global leadership alumni networks.",
    location: "Oxford, Oxfordshire, UK",
    city: "Oxford",
    state: "Oxfordshire",
    rating: 4.9,
    type: "Public Collegiate University",
    ownership: "Public",
    category: "Arts & Science",
    feesPerYear: 3200000,
    avgPackage: 26.0,
    highestPackage: 85.0,
    nirfRank: 1,
    image: "/images/destinations/uk_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Sc Computer Science", duration: "1 Year", feesPerYear: 3200000, demand: "Exponential" },
      { title: "MBA Oxford Said Business School", duration: "1 Year", feesPerYear: 3800000, demand: "Very High" },
      { title: "M.Sc Financial Economics", duration: "1 Year", feesPerYear: 3400000, demand: "High" }
    ]
  },
  {
    name: "University of Cambridge",
    shortName: "Cambridge",
    slug: "cambridge-uk",
    description: "University of Cambridge is a world-renowned collegiate institution, leading advances in mathematics, natural sciences, medicine, and technology.",
    location: "Cambridge, Cambridgeshire, UK",
    city: "Cambridge",
    state: "Cambridgeshire",
    rating: 4.9,
    type: "Public Collegiate University",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 3300000,
    avgPackage: 27.0,
    highestPackage: 88.0,
    nirfRank: 2,
    image: "/images/destinations/uk_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Phil Advanced Computer Science", duration: "1 Year", feesPerYear: 3300000, demand: "Exponential" },
      { title: "Master of Finance (MFin)", duration: "1 Year", feesPerYear: 3600000, demand: "Very High" }
    ]
  },
  {
    name: "Imperial College London",
    shortName: "Imperial",
    slug: "imperial-uk",
    description: "Imperial College London is a world top-10 university focused exclusively on science, engineering, medicine, and business, situated in South Kensington, London.",
    location: "London, England, UK",
    city: "London",
    state: "England",
    rating: 4.8,
    type: "Public Research University",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 3000000,
    avgPackage: 24.0,
    highestPackage: 80.0,
    nirfRank: 3,
    image: "/images/destinations/uk_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Sc Business Analytics", duration: "1 Year", feesPerYear: 3000000, demand: "Exponential" },
      { title: "M.Sc Computing Science", duration: "1 Year", feesPerYear: 3100000, demand: "Very High" }
    ]
  },
  {
    name: "University College London (UCL)",
    shortName: "UCL",
    slug: "ucl-uk",
    description: "UCL is London's leading multidisciplinary university, acclaimed for AI research, architecture, neuroscience, and management science.",
    location: "London, England, UK",
    city: "London",
    state: "England",
    rating: 4.7,
    type: "Public Research University",
    ownership: "Public",
    category: "Arts & Science",
    feesPerYear: 2800000,
    avgPackage: 22.0,
    highestPackage: 72.0,
    nirfRank: 4,
    image: "/images/destinations/uk_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Sc Artificial Intelligence for Sustainable Development", duration: "1 Year", feesPerYear: 2800000, demand: "Exponential" },
      { title: "M.Sc Management", duration: "1 Year", feesPerYear: 2900000, demand: "High" }
    ]
  },
  {
    name: "University of Manchester",
    shortName: "Manchester",
    slug: "manchester-uk",
    description: "The University of Manchester is a prestigious Russell Group institution with 25 Nobel laureates, world-class business school, and strong industry links.",
    location: "Manchester, Greater Manchester, UK",
    city: "Manchester",
    state: "Greater Manchester",
    rating: 4.6,
    type: "Public Research University",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 2400000,
    avgPackage: 19.0,
    highestPackage: 60.0,
    nirfRank: 6,
    image: "/images/destinations/uk_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Sc Data Science", duration: "1 Year", feesPerYear: 2400000, demand: "Very High" },
      { title: "M.Sc International Business", duration: "1 Year", feesPerYear: 2500000, demand: "High" }
    ]
  },
  {
    name: "University of Edinburgh",
    shortName: "Edinburgh",
    slug: "edinburgh-uk",
    description: "The University of Edinburgh is Scotland's leading research university, famous for informatics, medicine, law, and renewable energy research.",
    location: "Edinburgh, Scotland, UK",
    city: "Edinburgh",
    state: "Scotland",
    rating: 4.7,
    type: "Public Research University",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 2500000,
    avgPackage: 20.0,
    highestPackage: 65.0,
    nirfRank: 5,
    image: "/images/destinations/uk_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Sc Computer Science", duration: "1 Year", feesPerYear: 2500000, demand: "Exponential" },
      { title: "M.Sc Artificial Intelligence", duration: "1 Year", feesPerYear: 2600000, demand: "Very High" }
    ]
  },

  // --- CANADA ---
  {
    name: "University of Toronto",
    shortName: "UofT",
    slug: "utoronto-canada",
    description: "The University of Toronto is Canada's top research institution, recognized globally for breakthroughs in machine learning, medicine, and business leadership.",
    location: "Toronto, Ontario, Canada",
    city: "Toronto",
    state: "Ontario",
    rating: 4.8,
    type: "Public Research Institution",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 2600000,
    avgPackage: 22.0,
    highestPackage: 75.0,
    nirfRank: 1,
    image: "/images/destinations/ca_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Sc Applied Computing", duration: "1.5 Years", feesPerYear: 2600000, demand: "Exponential" },
      { title: "Master of Management & Finance", duration: "1 Year", feesPerYear: 2800000, demand: "Very High" },
      { title: "B.Sc Computer Science", duration: "4 Years", feesPerYear: 2400000, demand: "High" }
    ]
  },
  {
    name: "University of British Columbia (UBC)",
    shortName: "UBC",
    slug: "ubc-canada",
    description: "The University of British Columbia (UBC) is a global center for research and teaching, consistently ranked among the top 20 public universities in the world.",
    location: "Vancouver, British Columbia, Canada",
    city: "Vancouver",
    state: "British Columbia",
    rating: 4.7,
    type: "Public University",
    ownership: "Public",
    category: "Arts & Science",
    feesPerYear: 2400000,
    avgPackage: 20.0,
    highestPackage: 70.0,
    nirfRank: 2,
    image: "/images/destinations/ca_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.S. Data Science", duration: "1.5 Years", feesPerYear: 2400000, demand: "Exponential" },
      { title: "B.Sc Computer Science", duration: "4 Years", feesPerYear: 2200000, demand: "Very High" },
      { title: "Master of Business Administration (MBA)", duration: "16 Months", feesPerYear: 2700000, demand: "High" }
    ]
  },
  {
    name: "McGill University",
    shortName: "McGill",
    slug: "mcgill-canada",
    description: "McGill University in Montreal, Quebec, is one of Canada's best-known institutions, attracting bright students from over 150 countries worldwide.",
    location: "Montreal, Quebec, Canada",
    city: "Montreal",
    state: "Quebec",
    rating: 4.8,
    type: "Public Research University",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 2300000,
    avgPackage: 21.0,
    highestPackage: 72.0,
    nirfRank: 3,
    image: "/images/destinations/ca_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Sc Computer Science (Machine Learning)", duration: "2 Years", feesPerYear: 2300000, demand: "Exponential" },
      { title: "Master of Management in Analytics", duration: "1 Year", feesPerYear: 2500000, demand: "Very High" }
    ]
  },
  {
    name: "University of Waterloo",
    shortName: "Waterloo",
    slug: "waterloo-canada",
    description: "The University of Waterloo is world-famous for its co-op education program, software engineering innovation, and producing tech startup founders.",
    location: "Waterloo, Ontario, Canada",
    city: "Waterloo",
    state: "Ontario",
    rating: 4.8,
    type: "Public University",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 2500000,
    avgPackage: 25.0,
    highestPackage: 85.0,
    nirfRank: 4,
    image: "/images/destinations/ca_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "Master of Mathematics in Computer Science", duration: "2 Years", feesPerYear: 2500000, demand: "Exponential" },
      { title: "Bachelor of Software Engineering (Co-op)", duration: "4 Years", feesPerYear: 2300000, demand: "Exponential" }
    ]
  },
  {
    name: "McMaster University",
    shortName: "McMaster",
    slug: "mcmaster-canada",
    description: "McMaster University in Hamilton, Ontario, is a research-intensive medical-doctoral university pioneering problem-based learning and biomedical innovation.",
    location: "Hamilton, Ontario, Canada",
    city: "Hamilton",
    state: "Ontario",
    rating: 4.6,
    type: "Public Research University",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 2100000,
    avgPackage: 18.0,
    highestPackage: 58.0,
    nirfRank: 5,
    image: "/images/destinations/ca_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Eng Software Engineering", duration: "1.5 Years", feesPerYear: 2100000, demand: "Very High" },
      { title: "Master of Biotechnology", duration: "1.5 Years", feesPerYear: 2200000, demand: "High" }
    ]
  },
  {
    name: "University of Alberta",
    shortName: "UAlberta",
    slug: "alberta-canada",
    description: "The University of Alberta in Edmonton is one of Canada's top 5 universities, leading global research in artificial intelligence (Amii), energy, and health sciences.",
    location: "Edmonton, Alberta, Canada",
    city: "Edmonton",
    state: "Alberta",
    rating: 4.6,
    type: "Public Research University",
    ownership: "Public",
    category: "Engineering",
    feesPerYear: 1900000,
    avgPackage: 18.0,
    highestPackage: 55.0,
    nirfRank: 6,
    image: "/images/destinations/ca_landmark_sketch.jpg",
    status: "PUBLISHED",
    courses: [
      { title: "M.Sc Computing Science (AI specialization)", duration: "2 Years", feesPerYear: 1900000, demand: "Exponential" },
      { title: "MBA Alberta School of Business", duration: "2 Years", feesPerYear: 2200000, demand: "High" }
    ]
  }
];

async function main() {
  console.log("Seeding 18 Top International College Profiles into Database...");

  let adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin-global@c2talents.com",
        passwordHash: "seededpasswordhash",
        role: "ADMIN",
        name: "C2Talents Global Desk"
      }
    });
  }

  for (const item of internationalColleges) {
    const existing = await prisma.collegeProfile.findFirst({
      where: {
        OR: [{ slug: item.slug }, { name: item.name }]
      }
    });

    if (existing) {
      await prisma.collegeProfile.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          shortName: item.shortName,
          slug: item.slug,
          description: item.description,
          location: item.location,
          city: item.city,
          state: item.state,
          rating: item.rating,
          type: item.type,
          ownership: item.ownership,
          category: item.category,
          feesPerYear: item.feesPerYear,
          avgPackage: item.avgPackage,
          highestPackage: item.highestPackage,
          nirfRank: item.nirfRank,
          image: item.image,
          status: item.status
        }
      });

      // Clear & recreate courses for this college
      await prisma.course.deleteMany({
        where: { collegeId: existing.id }
      });

      await prisma.course.createMany({
        data: item.courses.map((c) => ({
          collegeId: existing.id,
          title: c.title,
          duration: c.duration,
          feesPerYear: c.feesPerYear,
          demand: c.demand
        }))
      });

      console.log(`Updated ${item.name} (${item.slug}) with courses`);
    } else {
      const collegeUser = await prisma.user.create({
        data: {
          email: `${item.slug}@c2talents.com`,
          passwordHash: "seededpasswordhash",
          role: "COLLEGE",
          name: item.name
        }
      });

      const createdCollege = await prisma.collegeProfile.create({
        data: {
          userId: collegeUser.id,
          name: item.name,
          shortName: item.shortName,
          slug: item.slug,
          description: item.description,
          location: item.location,
          city: item.city,
          state: item.state,
          rating: item.rating,
          type: item.type,
          ownership: item.ownership,
          category: item.category,
          feesPerYear: item.feesPerYear,
          avgPackage: item.avgPackage,
          highestPackage: item.highestPackage,
          nirfRank: item.nirfRank,
          image: item.image,
          status: item.status,
          courses: {
            create: item.courses.map((c) => ({
              title: c.title,
              duration: c.duration,
              feesPerYear: c.feesPerYear,
              demand: c.demand
            }))
          }
        }
      });
      console.log(`Created ${item.name} (${item.slug}) with courses`);
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

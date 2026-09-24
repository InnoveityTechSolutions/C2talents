export interface StudyAbroadCountryData {
  name: string;
  code: string;
  slug: string;
  flag: string;
  description: string;
  heroImage: string;
  universityCount: string;
  averageTuition: string;
  popularIntakes: string;
  popularDegrees: string;
  whyStudy: string;
  popularCourses: string;
  costBreakdown: string;
  admissionRequirements: string;
  intakes: string;
  visaGuide: string;
  scholarships: string;
}

export const defaultCountriesData: StudyAbroadCountryData[] = [
  {
    name: "United States (USA)",
    code: "USA",
    slug: "usa",
    flag: "🇺🇸",
    description: "Build your global career with world-class Ivy League and Tier-1 research universities, unparalleled STEM OPT benefits, and globally recognized degrees.",
    heroImage: "/images/destinations/us_landmark_sketch.jpg",
    universityCount: "800+ Universities",
    averageTuition: "₹25L - ₹45L / yr",
    popularIntakes: "Fall (Aug/Sep), Spring (Jan)",
    popularDegrees: "MS / MBA / BS",
    whyStudy: JSON.stringify({
      academicReputation: "Home to top globally ranked institutions like MIT, Harvard, Stanford, and Carnegie Mellon offering cutting-edge curricula.",
      popularDestinations: "California (Silicon Valley), New York, Massachusetts (Boston), Texas, and Illinois.",
      careerOpportunities: "STEM OPT extensions allow up to 36 months of post-graduation work authorization in leading tech and financial hubs.",
      internationalEnvironment: "Diverse global community with over 1,000,000 international students enrolled annually.",
      researchOpportunities: "Highest R&D funding allocations globally with advanced university research labs.",
      postStudyOpportunities: "H-1B specialty occupation paths and global corporate leadership recruitment drives."
    }),
    popularCourses: JSON.stringify([
      "Computer Science",
      "Business & Management",
      "Engineering",
      "Data Science",
      "Healthcare",
      "Finance"
    ]),
    costBreakdown: JSON.stringify({
      tuitionFee: "₹25,00,000 - ₹45,00,000 / year (Estimated range depending on public vs private university)",
      livingExpenses: "₹10,00,000 - ₹15,00,000 / year",
      accommodation: "₹6,00,000 - ₹10,00,000 / year (On-campus / Shared apartment)",
      healthInsurance: "₹1,50,000 - ₹3,00,000 / year",
      otherCosts: "₹1,00,000 - ₹2,00,000 / year (Books, tech, local transit)"
    }),
    admissionRequirements: JSON.stringify({
      academicQualification: "12th Board Certificate with min 65-75% for UG; Bachelor's degree (3 or 4 years) with min 3.0 GPA / 65%+ for PG.",
      englishTest: "IELTS (6.5+ band), TOEFL iBT (80+ score), or Duolingo English Test (115+).",
      standardizedTests: "GRE/GMAT required for select Graduate programs; SAT/ACT test-optional for most UG.",
      requiredDocuments: "Official transcripts, Statement of Purpose (SOP), 2-3 Letters of Recommendation (LORs), Passport, Resume.",
      applicationProcess: "Direct online university portal application or Common App with application fees ($75-$120)."
    }),
    intakes: JSON.stringify([
      { name: "Fall Intake", month: "August / September", description: "Primary intake with maximum course options, scholarships, and assistantship opportunities." },
      { name: "Spring Intake", month: "January", description: "Secondary intake suitable for candidates needing extra preparation time." },
      { name: "Summer Intake", month: "May / June", description: "Limited specialized short courses and executive programs." }
    ]),
    visaGuide: JSON.stringify({
      visaType: "F-1 Academic Student Visa",
      process: "1. Receive I-20 Form from university. 2. Pay SEVIS I-901 fee ($350). 3. Complete DS-160 online form. 4. Schedule biometric and embassy interview.",
      requiredDocuments: "Passport, Form I-20, DS-160 confirmation page, SEVIS fee receipt, Financial proof (Bank statements/Loan letter), Academic marksheets.",
      officialUrl: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      disclaimer: "Information provided for educational guidance only. Please verify current rules with the official US Department of State authority."
    }),
    scholarships: JSON.stringify([
      {
        name: "Fulbright-Nehru Master's Fellowships",
        provider: "USIEF (US-India Educational Foundation)",
        eligibility: "Outstanding academic record with at least 3 years of professional experience.",
        funding: "Full tuition fee waiver, living stipend, airfare & accident/health coverage.",
        officialUrl: "https://www.usief.org.in"
      },
      {
        name: "University Merit Graduate Assistantships",
        provider: "Participating US Universities",
        eligibility: "High GRE score & top undergraduate academic rank.",
        funding: "50% - 100% Tuition Waiver plus monthly teaching/research stipend.",
        officialUrl: "https://www.c2talents.com"
      }
    ])
  },
  {
    name: "United Kingdom (UK)",
    code: "UK",
    slug: "uk",
    flag: "🇬🇧",
    description: "Accelerate your higher education with 1-year intensive Master's degrees, prestigious Russell Group universities, and 2-year Graduate Route post-study work visas.",
    heroImage: "/images/destinations/uk_landmark_sketch.jpg",
    universityCount: "160+ Universities",
    averageTuition: "₹18L - ₹32L / yr",
    popularIntakes: "September, January",
    popularDegrees: "M.Sc / MBA / B.Sc",
    whyStudy: JSON.stringify({
      academicReputation: "Renowned centuries-old education system featuring Oxford, Cambridge, Imperial, UCL, and Russell Group institutions.",
      popularDestinations: "London, Manchester, Edinburgh, Birmingham, and Bristol.",
      careerOpportunities: "2-year Graduate Route post-study work visa allows graduates to work or look for work at any skill level without sponsorship.",
      internationalEnvironment: "Cosmopolitan learning hubs attracting over 600,000 international students worldwide.",
      researchOpportunities: "REF (Research Excellence Framework) certified high-impact academic research projects.",
      postStudyOpportunities: "Skilled Worker Visa transition routes upon securing eligible employment."
    }),
    popularCourses: JSON.stringify([
      "Business & Management",
      "Computer Science",
      "Finance",
      "Engineering",
      "Healthcare",
      "Data Science"
    ]),
    costBreakdown: JSON.stringify({
      tuitionFee: "₹18,00,000 - ₹32,00,000 / year (Note: Most UK Master's programs are 1 year duration)",
      livingExpenses: "₹9,00,000 - ₹12,00,000 / year (Higher in London region)",
      accommodation: "₹5,00,000 - ₹8,00,000 / year",
      healthInsurance: "₹70,000 - ₹1,20,000 / year (IHS Immigration Health Surcharge)",
      otherCosts: "₹80,000 - ₹1,50,000 / year"
    }),
    admissionRequirements: JSON.stringify({
      academicQualification: "12th Board Certificate with min 65-70% for UG; Bachelor's degree (3 or 4 years) with min 55-65% for PG.",
      englishTest: "IELTS Academic (6.0-6.5+ band) or PTE Academic (58-65+). High 12th English score (75%+) waives IELTS in select universities.",
      standardizedTests: "GRE/GMAT generally NOT required for most UK Master's degrees except top business schools.",
      requiredDocuments: "Degree marksheets, SOP, 2 Reference letters, Passport, CV/Resume.",
      applicationProcess: "UCAS application for Undergraduates; Direct university portal for Postgraduates."
    }),
    intakes: JSON.stringify([
      { name: "September Intake", month: "September / October", description: "Main intake offering the maximum choice of degree programs and scholarship awards." },
      { name: "January Intake", month: "January / February", description: "Major secondary intake popular for postgraduate business and tech courses." }
    ]),
    visaGuide: JSON.stringify({
      visaType: "Student Visa (formerly Tier 4)",
      process: "1. Receive CAS (Confirmation of Acceptance for Studies) from university. 2. Pay IHS health surcharge. 3. Apply online & book VFS biometric appointment.",
      requiredDocuments: "Passport, CAS Statement, Financial proof (holding funds for 28 consecutive days), Academic certificates, IELTS/Proof of English.",
      officialUrl: "https://www.gov.uk/student-visa",
      disclaimer: "Information provided for educational guidance only. Please verify current rules with UK Visas and Immigration (UKVI)."
    }),
    scholarships: JSON.stringify([
      {
        name: "Chevening Scholarships",
        provider: "UK Foreign, Commonwealth & Development Office (FCDO)",
        eligibility: "Demonstrated leadership potential and 2 years of work experience.",
        funding: "Full tuition, monthly living allowance, return economy flight ticket.",
        officialUrl: "https://www.chevening.org"
      },
      {
        name: "GREAT Scholarships",
        provider: "British Council & UK Universities",
        eligibility: "Indian passports holding offer from participating UK university.",
        funding: "Minimum £10,000 towards tuition fees for one-year postgraduate study.",
        officialUrl: "https://study-uk.britishcouncil.org"
      }
    ])
  },
  {
    name: "Canada",
    code: "CA",
    slug: "canada",
    flag: "🇨🇦",
    description: "Experience world-class education, affordable tuition options, Post-Graduation Work Permits (PGWP) up to 3 years, and clear pathways to Permanent Residency.",
    heroImage: "/images/destinations/ca_landmark_sketch.jpg",
    universityCount: "220+ Universities",
    averageTuition: "₹15L - ₹28L / yr",
    popularIntakes: "September, January, May",
    popularDegrees: "MS / PG Diploma",
    whyStudy: JSON.stringify({
      academicReputation: "Globally acclaimed institutions including University of Toronto, UBC, McGill, and Waterloo.",
      popularDestinations: "Toronto (Ontario), Vancouver (British Columbia), Montreal (Quebec), and Alberta.",
      careerOpportunities: "PGWP (Post-Graduation Work Permit) permits up to 3 years of open work authorization post graduation.",
      internationalEnvironment: "Welcoming multicultural society prioritizing student safety and quality of living.",
      researchOpportunities: "State-of-the-art research innovation hubs in AI, renewable energy, and biotechnology.",
      postStudyOpportunities: "Express Entry (CEC) and Provincial Nominee Programs (PNP) providing direct PR eligibility."
    }),
    popularCourses: JSON.stringify([
      "Computer Science",
      "Data Science",
      "Engineering",
      "Business & Management",
      "Healthcare",
      "Finance"
    ]),
    costBreakdown: JSON.stringify({
      tuitionFee: "₹15,00,000 - ₹28,00,000 / year (Universities: ₹18-28L; Colleges/Diplomas: ₹12-16L)",
      livingExpenses: "₹8,00,000 - ₹12,00,000 / year (GIC requirement: CAD 20,635)",
      accommodation: "₹4,50,000 - ₹7,50,000 / year",
      healthInsurance: "₹50,000 - ₹90,000 / year (Provincial health coverage in select provinces)",
      otherCosts: "₹70,000 - ₹1,20,000 / year"
    }),
    admissionRequirements: JSON.stringify({
      academicQualification: "12th Board Certificate with min 65-70% for UG; Bachelor's degree with min 60-65% (First Class) for PG.",
      englishTest: "IELTS Academic (6.5 overall, min 6.0 in each band) or PTE Academic (60+).",
      standardizedTests: "GMAT/GRE recommended for top MBA/MS Engineering programs.",
      requiredDocuments: "Academic marksheets, SOP, 2 Reference letters, Passport, GIC Certificate.",
      applicationProcess: "Direct online application to university or college portals."
    }),
    intakes: JSON.stringify([
      { name: "Fall Intake", month: "September", description: "Primary intake for all university degree and diploma programs." },
      { name: "Winter Intake", month: "January", description: "Major secondary intake with extensive course availability." },
      { name: "Spring/Summer Intake", month: "May", description: "Selected short programs and diploma streams." }
    ]),
    visaGuide: JSON.stringify({
      visaType: "Canada Study Permit",
      process: "1. Obtain LOA (Letter of Acceptance) & PAL (Provincial Attestation Letter). 2. Purchase GIC ($20,635 CAD). 3. Complete upfront medical examination. 4. Apply online via IRCC portal.",
      requiredDocuments: "Passport, Letter of Acceptance, PAL, GIC Certificate, First-year tuition receipt, Proof of financial sufficiency, SOP.",
      officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
      disclaimer: "Information provided for educational guidance only. Please verify current rules with IRCC (Immigration, Refugees and Citizenship Canada)."
    }),
    scholarships: JSON.stringify([
      {
        name: "Lester B. Pearson International Scholarship",
        provider: "University of Toronto",
        eligibility: "Exceptional academic achievement and creative leadership.",
        funding: "Full tuition, books, incidental fees, and full residence support for 4 years.",
        officialUrl: "https://future.utoronto.ca"
      },
      {
        name: "Shastri Indo-Canadian Institute Fellowships",
        provider: "SICI",
        eligibility: "Indian students pursuing research/higher degrees in Canada.",
        funding: "Research grants and mobility stipends up to $10,000 CAD.",
        officialUrl: "https://www.shastri.org"
      }
    ])
  }
];

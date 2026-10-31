/**
 * C2 Talents — Canonical College Form Schema, Field Inventory & Validation Engine
 * 
 * Defines the complete field inventory across Sections 1–14, provides strict validation,
 * normalization of ChatGPT/Gemini outputs, and ensures 100% field completion tracking.
 */

export interface FieldDefinition {
  key: string;
  section: number;
  sectionTitle: string;
  label: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "text";
  required: boolean;
  aliases: string[];
  description: string;
}

export type FieldStatus = "VERIFIED" | "NEEDS_VERIFICATION" | "NOT_FOUND" | "NOT_APPLICABLE";

export interface FieldValidationResult {
  key: string;
  label: string;
  section: number;
  sectionTitle: string;
  value: any;
  status: FieldStatus;
  type: string;
  notes?: string;
}

export interface ValidationSummaryReport {
  collegeName: string;
  totalFieldsIdentified: number;
  fieldsPresentInJson: number;
  verifiedCount: number;
  needsVerificationCount: number;
  notFoundCount: number;
  notApplicableCount: number;
  coursesDiscovered: number;
  coursesIncludedInJson: number;
  duplicateCoursesDetected: number;
  dataTypeErrors: string[];
  missingFieldKeys: string[];
  fieldReport: FieldValidationResult[];
  qualityScore: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE FIELD INVENTORY ACROSS SECTIONS 1 TO 14
// ─────────────────────────────────────────────────────────────────────────────

export const COMPLETE_FIELD_INVENTORY: FieldDefinition[] = [
  // ── Section 1: Basic Information ──
  {
    key: "name",
    section: 1,
    sectionTitle: "Basic Information",
    label: "College Name",
    type: "string",
    required: true,
    aliases: ["collegeName", "college_name", "officialName", "institutionName"],
    description: "Full official legal name of the institution",
  },
  {
    key: "shortName",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Short Name / Acronym",
    type: "string",
    required: false,
    aliases: ["short_name", "shortCode", "abbreviation", "shortForm"],
    description: "Official short acronym or code (e.g. BWC, SKCET, IITM)",
  },
  {
    key: "slug",
    section: 1,
    sectionTitle: "Basic Information",
    label: "URL Slug",
    type: "string",
    required: false,
    aliases: ["urlSlug", "slug_url"],
    description: "SEO URL slug for the public college profile",
  },
  {
    key: "description",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Public Overview / About",
    type: "text",
    required: true,
    aliases: ["collegeAbout", "aboutText", "about", "college_about", "overview"],
    description: "Concise public introductory description of the college",
  },
  {
    key: "estYear",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Established Year",
    type: "number",
    required: false,
    aliases: ["est_year", "establishedYear", "established", "foundedYear", "yearOfEstablishment"],
    description: "Year of establishment (e.g. 1964)",
  },
  {
    key: "ownership",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Ownership",
    type: "string",
    required: false,
    aliases: ["ownershipType", "management", "ownership_type"],
    description: "Government, Private, Govt-Aided, Deemed, Autonomous",
  },
  {
    key: "type",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Institution Type",
    type: "string",
    required: true,
    aliases: ["collegeType", "institutionType", "type_of_institution"],
    description: "Government, Private, Govt-Aided, Autonomous, Deemed",
  },
  {
    key: "category",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Primary Category",
    type: "string",
    required: true,
    aliases: ["primaryCategory", "mainCategory", "stream", "collegeCategory"],
    description: "Primary institution category (Engineering, Arts & Science, Medical, Law, etc.)",
  },
  {
    key: "categories",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Selected Category Badges",
    type: "array",
    required: false,
    aliases: ["selectedCategories", "streams", "departments"],
    description: "Array of category badges (e.g. ['Arts & Science', 'Government', \"Women's College\"])",
  },
  {
    key: "affiliatedUniversity",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Affiliated University",
    type: "string",
    required: false,
    aliases: ["affiliated_university", "affiliation", "university", "affiliatedTo"],
    description: "Affiliated state or central university (e.g. University of Madras, Anna University)",
  },
  {
    key: "isAutonomous",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Autonomous Status",
    type: "boolean",
    required: false,
    aliases: ["is_autonomous", "autonomous"],
    description: "Whether the institution holds autonomous status from UGC",
  },
  {
    key: "accreditation",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Accreditation Details",
    type: "string",
    required: false,
    aliases: ["accreditedBy", "accreditations"],
    description: "Accreditation bodies (e.g. NAAC Re-accredited, NBA)",
  },
  {
    key: "approval",
    section: 1,
    sectionTitle: "Basic Information",
    label: "Approvals",
    type: "string",
    required: false,
    aliases: ["approvals", "approvedBy", "recognitions"],
    description: "Statutory approvals (e.g. UGC 2(f) & 12(B), AICTE, DCE Tamil Nadu)",
  },
  {
    key: "aicteApproved",
    section: 1,
    sectionTitle: "Basic Information",
    label: "AICTE Approved",
    type: "boolean",
    required: false,
    aliases: ["aicte_approved", "aicteApproval", "aicte"],
    description: "Whether technical programmes are AICTE approved",
  },
  {
    key: "ugcApproved",
    section: 1,
    sectionTitle: "Basic Information",
    label: "UGC Approved",
    type: "boolean",
    required: false,
    aliases: ["ugc_approved", "ugcApproval", "ugcRecognition", "ugc"],
    description: "Whether the college is recognized under UGC Act",
  },
  {
    key: "naacGrade",
    section: 1,
    sectionTitle: "Basic Information",
    label: "NAAC Grade",
    type: "string",
    required: false,
    aliases: ["naac_grade", "naac", "naacAccreditation", "naacRating"],
    description: "NAAC grade rating (e.g. A++, A+, A, B++)",
  },
  {
    key: "nirfRank",
    section: 1,
    sectionTitle: "Basic Information",
    label: "NIRF Rank",
    type: "number",
    required: false,
    aliases: ["nirf_rank", "nirf", "nirfRanking"],
    description: "National Institutional Ranking Framework rank number (or null if unranked)",
  },

  // ── Section 2: Location ──
  {
    key: "address",
    section: 2,
    sectionTitle: "Location",
    label: "Postal Address",
    type: "text",
    required: true,
    aliases: ["fullAddress", "full_address", "streetAddress"],
    description: "Complete postal address of the main campus",
  },
  {
    key: "landmark",
    section: 2,
    sectionTitle: "Location",
    label: "Nearby Landmark",
    type: "string",
    required: false,
    aliases: ["nearby", "near"],
    description: "Prominent landmark near the campus",
  },
  {
    key: "area",
    section: 2,
    sectionTitle: "Location",
    label: "Area / Locality",
    type: "string",
    required: false,
    aliases: ["locality", "zone"],
    description: "Campus locality or neighborhood name",
  },
  {
    key: "city",
    section: 2,
    sectionTitle: "Location",
    label: "City",
    type: "string",
    required: true,
    aliases: ["town"],
    description: "City or town name",
  },
  {
    key: "district",
    section: 2,
    sectionTitle: "Location",
    label: "District",
    type: "string",
    required: false,
    aliases: ["county"],
    description: "Revenue district name",
  },
  {
    key: "state",
    section: 2,
    sectionTitle: "Location",
    label: "State",
    type: "string",
    required: true,
    aliases: ["province"],
    description: "State or Union Territory",
  },
  {
    key: "pincode",
    section: 2,
    sectionTitle: "Location",
    label: "PIN Code",
    type: "string",
    required: false,
    aliases: ["pin", "zipCode", "postalCode", "zip"],
    description: "6-digit postal code",
  },
  {
    key: "latitude",
    section: 2,
    sectionTitle: "Location",
    label: "Latitude",
    type: "number",
    required: false,
    aliases: ["lat"],
    description: "Geographic latitude coordinate",
  },
  {
    key: "longitude",
    section: 2,
    sectionTitle: "Location",
    label: "Longitude",
    type: "number",
    required: false,
    aliases: ["lng", "long"],
    description: "Geographic longitude coordinate",
  },
  {
    key: "googleMapUrl",
    section: 2,
    sectionTitle: "Location",
    label: "Google Maps URL",
    type: "string",
    required: false,
    aliases: ["google_map_url", "mapUrl", "mapsUrl", "googleMaps", "mapLink"],
    description: "Official Google Maps location pin URL",
  },

  // ── Section 3: Contact & Links ──
  {
    key: "phone",
    section: 3,
    sectionTitle: "Contact Details",
    label: "Telephone / Landline",
    type: "string",
    required: false,
    aliases: ["telephone", "landline", "phone_number"],
    description: "Official office landline telephone number with STD code",
  },
  {
    key: "mobile",
    section: 3,
    sectionTitle: "Contact Details",
    label: "Admissions Mobile",
    type: "string",
    required: false,
    aliases: ["cell", "mobile_number", "contactNumber"],
    description: "Official 10-digit mobile contact number for admissions",
  },
  {
    key: "email",
    section: 3,
    sectionTitle: "Contact Details",
    label: "Official Email",
    type: "string",
    required: true,
    aliases: ["mail", "email_id", "emailId", "contactEmail"],
    description: "Official enquiries or admissions email address",
  },
  {
    key: "website",
    section: 3,
    sectionTitle: "Contact Details",
    label: "Official Website",
    type: "string",
    required: true,
    aliases: ["officialWebsite", "webUrl", "siteUrl", "site"],
    description: "Official college website URL",
  },
  {
    key: "facebook",
    section: 3,
    sectionTitle: "Contact Details",
    label: "Facebook URL",
    type: "string",
    required: false,
    aliases: ["facebookUrl", "facebook_url", "fb"],
    description: "Official Facebook page link",
  },
  {
    key: "instagram",
    section: 3,
    sectionTitle: "Contact Details",
    label: "Instagram URL",
    type: "string",
    required: false,
    aliases: ["instagramUrl", "instagram_url", "insta"],
    description: "Official Instagram profile link",
  },
  {
    key: "linkedin",
    section: 3,
    sectionTitle: "Contact Details",
    label: "LinkedIn URL",
    type: "string",
    required: false,
    aliases: ["linkedinUrl", "linkedin_url"],
    description: "Official LinkedIn institutional page link",
  },
  {
    key: "youtube",
    section: 3,
    sectionTitle: "Contact Details",
    label: "YouTube URL",
    type: "string",
    required: false,
    aliases: ["youtubeUrl", "youtube_url", "youtubeChannel"],
    description: "Official YouTube channel link",
  },

  // ── Section 4: Courses ──
  {
    key: "courses",
    section: 4,
    sectionTitle: "Courses Offered",
    label: "Courses Inventory",
    type: "array",
    required: true,
    aliases: ["programs", "coursesOffered", "coursesList", "academicPrograms"],
    description: "Complete list of degree programmes offered with duration, fee, eligibility, seats, and exams",
  },

  // ── Section 5: Academic Fees ──
  {
    key: "feesPerYear",
    section: 5,
    sectionTitle: "Fees & Financials",
    label: "Annual Tuition Fee",
    type: "number",
    required: true,
    aliases: ["annualFees", "annualFee", "tuitionFees", "fees_per_year", "fees", "avgFees"],
    description: "Average annual academic tuition fee in INR (or 0 if government fee waiver)",
  },
  {
    key: "courseWiseFees",
    section: 5,
    sectionTitle: "Fees & Financials",
    label: "Course-Wise Fee Structure",
    type: "text",
    required: false,
    aliases: ["course_wise_fees", "courseWiseFee", "feeBreakup", "feeDetails", "courseFees"],
    description: "Detailed multi-line breakdown of fees across individual degree programmes",
  },
  {
    key: "hostelFees",
    section: 5,
    sectionTitle: "Fees & Financials",
    label: "Hostel Fee Per Year (Sec 5)",
    type: "number",
    required: false,
    aliases: ["hostel_fees", "hostelFee", "annualHostelFee"],
    description: "Annual boarding and lodging hostel fee in INR",
  },
  {
    key: "transportFees",
    section: 5,
    sectionTitle: "Fees & Financials",
    label: "Transport Fee Per Year",
    type: "number",
    required: false,
    aliases: ["transport_fees", "transportFee", "busFee", "busFees", "transportationFee"],
    description: "Annual bus/transportation fee in INR",
  },
  {
    key: "scholarshipDetails",
    section: 5,
    sectionTitle: "Fees & Financials",
    label: "Scholarship Details",
    type: "text",
    required: false,
    aliases: ["scholarship_details", "scholarships", "scholarshipInfo", "scholarshipSchemes"],
    description: "Government scholarships, merit fee waivers, and minority financial aid",
  },
  {
    key: "educationLoanDetails",
    section: 5,
    sectionTitle: "Fees & Financials",
    label: "Education Loan Support",
    type: "text",
    required: false,
    aliases: ["education_loan_details", "loanDetails", "educationLoan", "loanAssistance"],
    description: "Bank tie-ups and education loan desk facilitation",
  },

  // ── Section 6: Facilities ──
  {
    key: "facilities",
    section: 6,
    sectionTitle: "Facilities & Amenities",
    label: "Campus Facilities",
    type: "array",
    required: false,
    aliases: ["amenities", "campusFacilities", "infrastructureFacilities", "campusAmenities"],
    description: "Supported amenities from: Hostel, Transport, Library, Sports, Gym, WiFi, Medical, Cafeteria, ATM, Bank, Auditorium, Labs, Placement Cell, Research Centre, Innovation Hub",
  },

  // ── Section 7: Placements ──
  {
    key: "highestPackage",
    section: 7,
    sectionTitle: "Placements",
    label: "Highest Package (LPA)",
    type: "number",
    required: false,
    aliases: ["highest_package", "highestCtc", "highest_ctc", "maxPackage", "highestSalary"],
    description: "Highest CTC package secured in LPA (e.g. 12.5)",
  },
  {
    key: "avgPackage",
    section: 7,
    sectionTitle: "Placements",
    label: "Average Package (LPA)",
    type: "number",
    required: false,
    aliases: ["avg_package", "averagePackage", "averageCtc", "average_ctc", "meanPackage"],
    description: "Average CTC package in LPA (e.g. 4.2)",
  },
  {
    key: "placementPercentage",
    section: 7,
    sectionTitle: "Placements",
    label: "Placement Rate (%)",
    type: "number",
    required: false,
    aliases: ["placement_percentage", "placementRate", "placement_rate", "percentagePlaced"],
    description: "Percentage of eligible students placed (0-100)",
  },
  {
    key: "topRecruiters",
    section: 7,
    sectionTitle: "Placements",
    label: "Top Recruiters",
    type: "text",
    required: false,
    aliases: ["top_recruiters", "recruiters", "recruitingCompanies", "majorRecruiters", "companiesVisiting"],
    description: "Comma-separated marquee corporate recruiters",
  },
  {
    key: "internshipDetails",
    section: 7,
    sectionTitle: "Placements",
    label: "Internship Details",
    type: "text",
    required: false,
    aliases: ["internship_details", "internships", "internshipOpportunities", "summerInternships"],
    description: "Industrial training, corporate internships, and stipend opportunities",
  },

  // ── Section 8: Admissions ──
  {
    key: "admissionEligibility",
    section: 8,
    sectionTitle: "Admissions",
    label: "Admission Eligibility",
    type: "text",
    required: false,
    aliases: ["admission_eligibility", "eligibilityCriteria", "criteria", "admissionRequirements"],
    description: "General academic criteria for undergraduate and postgraduate admissions",
  },
  {
    key: "admissionProcess",
    section: 8,
    sectionTitle: "Admissions",
    label: "Admission Process",
    type: "text",
    required: false,
    aliases: ["admission_process", "howToApply", "applicationProcess", "admissionProcedure", "process"],
    description: "Step-by-step application, counseling, and document verification process",
  },
  {
    key: "documentsRequired",
    section: 8,
    sectionTitle: "Admissions",
    label: "Documents Required",
    type: "text",
    required: false,
    aliases: ["documents_required", "requiredDocuments", "documents", "documentList"],
    description: "Required certificates (10th/12th marksheets, TC, Community, Conduct)",
  },
  {
    key: "counsellingInfo",
    section: 8,
    sectionTitle: "Admissions",
    label: "Counselling Information",
    type: "text",
    required: false,
    aliases: ["counselling_info", "counselingInfo", "counselling", "counselingDetails"],
    description: "Single-window counselling code, quota, and state allotment details",
  },
  {
    key: "admissionEntranceExams",
    section: 8,
    sectionTitle: "Admissions",
    label: "Accepted Entrance Exams",
    type: "string",
    required: false,
    aliases: ["admission_entrance_exams", "entranceExams", "entranceExam", "acceptedExams"],
    description: "Accepted qualifying examinations (e.g. TNEA, TANCET, Merit-Based)",
  },
  {
    key: "importantDates",
    section: 8,
    sectionTitle: "Admissions",
    label: "Important Admission Dates",
    type: "text",
    required: false,
    aliases: ["important_dates", "admissionDates", "deadlines", "keyDates", "schedule"],
    description: "Application release, cutoff notification, counseling schedule, and last date",
  },

  // ── Section 9: Hostel ──
  {
    key: "hostelAvailable",
    section: 9,
    sectionTitle: "Hostel & Accommodation",
    label: "Hostel Available",
    type: "boolean",
    required: false,
    aliases: ["hostel_available", "hasHostel", "hostel"],
    description: "Whether residential hostel facilities exist on campus",
  },
  {
    key: "boysHostel",
    section: 9,
    sectionTitle: "Hostel & Accommodation",
    label: "Boys Hostel",
    type: "boolean",
    required: false,
    aliases: ["boys_hostel", "hasBoysHostel", "boys"],
    description: "Whether boys hostel accommodation is provided",
  },
  {
    key: "girlsHostel",
    section: 9,
    sectionTitle: "Hostel & Accommodation",
    label: "Girls Hostel",
    type: "boolean",
    required: false,
    aliases: ["girls_hostel", "hasGirlsHostel", "girls"],
    description: "Whether girls hostel accommodation is provided",
  },
  {
    key: "acRooms",
    section: 9,
    sectionTitle: "Hostel & Accommodation",
    label: "AC Rooms",
    type: "boolean",
    required: false,
    aliases: ["ac_rooms", "hasAcRooms", "acHostel", "ac"],
    description: "Whether air-conditioned hostel rooms are available",
  },
  {
    key: "messAvailable",
    section: 9,
    sectionTitle: "Hostel & Accommodation",
    label: "Mess / Dining Available",
    type: "boolean",
    required: false,
    aliases: ["mess_available", "hasMess", "mess", "foodAvailable"],
    description: "Whether student dining mess is operated",
  },
  {
    key: "hostelFeePerYear",
    section: 9,
    sectionTitle: "Hostel & Accommodation",
    label: "Hostel Fee Per Year (Sec 9)",
    type: "number",
    required: false,
    aliases: ["hostel_fee_per_year", "hostelFee", "hostelFees", "annualHostelFee"],
    description: "Annual hostel boarding & mess fee in INR",
  },

  // ── Section 10: Gallery & Media ──
  {
    key: "logo",
    section: 10,
    sectionTitle: "Gallery & Media",
    label: "Official Logo URL",
    type: "string",
    required: false,
    aliases: ["logoUrl", "logo_url", "officialLogo"],
    description: "Direct URL to official institutional logo",
  },
  {
    key: "banner",
    section: 10,
    sectionTitle: "Gallery & Media",
    label: "Campus Banner URL",
    type: "string",
    required: false,
    aliases: ["bannerUrl", "banner_url", "campusBanner", "image", "coverImage"],
    description: "High-resolution campus banner/hero image URL",
  },
  {
    key: "collegeVideo",
    section: 10,
    sectionTitle: "Gallery & Media",
    label: "Campus Tour Video URL",
    type: "string",
    required: false,
    aliases: ["college_video", "videoUrl", "campusVideo", "video"],
    description: "YouTube URL of official campus tour or drone video",
  },
  {
    key: "galleryImages",
    section: 10,
    sectionTitle: "Gallery & Media",
    label: "Gallery Images",
    type: "array",
    required: false,
    aliases: ["gallery", "images", "photos", "campusImages"],
    description: "Array of campus photographs with { url, altText, caption, tags }",
  },

  // ── Section 11: SEO ──
  {
    key: "seoTitle",
    section: 11,
    sectionTitle: "SEO Optimization",
    label: "SEO Meta Title",
    type: "string",
    required: false,
    aliases: ["seo_title", "metaTitle", "pageTitle", "title"],
    description: "Browser page title for search engines",
  },
  {
    key: "seoDescription",
    section: 11,
    sectionTitle: "SEO Optimization",
    label: "SEO Meta Description",
    type: "text",
    required: false,
    aliases: ["seo_description", "metaDescription", "meta_description"],
    description: "Meta description for search engine snippet",
  },
  {
    key: "metaKeywords",
    section: 11,
    sectionTitle: "SEO Optimization",
    label: "Meta Keywords",
    type: "string",
    required: false,
    aliases: ["meta_keywords", "keywords", "seoKeywords", "tags"],
    description: "Comma-separated SEO keywords",
  },

  // ── Section 12: Status & Display Options ──
  {
    key: "status",
    section: 12,
    sectionTitle: "Status & Display",
    label: "Publication Status",
    type: "string",
    required: false,
    aliases: ["publicationStatus", "profileStatus", "publishStatus"],
    description: "PUBLISHED, DRAFT, or DATA_SUBMITTED",
  },
  {
    key: "featured",
    section: 12,
    sectionTitle: "Status & Display",
    label: "Featured Institution",
    type: "boolean",
    required: false,
    aliases: ["isFeatured", "featuredCollege"],
    description: "Highlight as a featured institution on the homepage",
  },
  {
    key: "trending",
    section: 12,
    sectionTitle: "Status & Display",
    label: "Trending Institution",
    type: "boolean",
    required: false,
    aliases: ["isTrending", "trendingCollege"],
    description: "Tag as trending on discovery and search feeds",
  },

  // ── Section 13: College Content Module (17 Rich-Text CMS Fields) ──
  {
    key: "collegeContent.overview",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "1. Overview",
    type: "text",
    required: false,
    aliases: ["overview", "collegeOverview", "summary", "intro", "introduction"],
    description: "Comprehensive 2-3 paragraph overview of the college",
  },
  {
    key: "collegeContent.about",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "2. About College",
    type: "text",
    required: false,
    aliases: ["about", "aboutCollege", "aboutUs", "aboutInstitution"],
    description: "Detailed history, founding vision, campus accreditation, and mission",
  },
  {
    key: "collegeContent.history",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "3. History & Milestones",
    type: "text",
    required: false,
    aliases: ["history", "collegeHistory", "milestones", "background"],
    description: "Founding milestones, legacy, and institutional evolution",
  },
  {
    key: "collegeContent.highlights",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "4. Key Highlights",
    type: "text",
    required: false,
    aliases: ["highlights", "keyHighlights", "collegeHighlights", "salientFeatures"],
    description: "Key statistics, NIRF rank, NAAC grade, awards, and unique distinctions",
  },
  {
    key: "collegeContent.whyChoose",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "5. Why Choose College",
    type: "text",
    required: false,
    aliases: ["whyChoose", "why_choose", "whyChooseCollege", "whyJoin"],
    description: "Top compelling reasons why prospective students should join",
  },
  {
    key: "collegeContent.campusLife",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "6. Campus Life & Culture",
    type: "text",
    required: false,
    aliases: ["campusLife", "campus_life", "studentLife", "lifeAtCampus"],
    description: "Vibrant student life, annual cultural/tech fests, and campus atmosphere",
  },
  {
    key: "collegeContent.facilitiesDescription",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "7. Facilities Description",
    type: "text",
    required: false,
    aliases: ["facilitiesDescription", "facilities_description", "facilitiesOverview", "infrastructure"],
    description: "Detailed description of academic infrastructure, labs, library, and sports",
  },
  {
    key: "collegeContent.placementOverview",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "8. Placement Overview",
    type: "text",
    required: false,
    aliases: ["placementOverview", "placement_overview", "placementsSummary", "placementReport"],
    description: "Career development cell, training programs, and annual recruitment highlights",
  },
  {
    key: "collegeContent.topRecruiters",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "9. Prominent Recruiters",
    type: "text",
    required: false,
    aliases: ["contentTopRecruiters", "topRecruiters", "recruitersList"],
    description: "Detailed recruiter breakdown and industry sector partnerships",
  },
  {
    key: "collegeContent.admissionGuide",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "10. Admission Guide",
    type: "text",
    required: false,
    aliases: ["admissionGuide", "admission_guide", "howToApply", "admissionProcedure"],
    description: "Step-by-step applicant guide covering application, quotas, and counselling",
  },
  {
    key: "collegeContent.eligibility",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "11. Detailed Eligibility",
    type: "text",
    required: false,
    aliases: ["eligibility", "detailedEligibility", "eligibilityDetails"],
    description: "Detailed course-wise marks, subject combinations, and quota criteria",
  },
  {
    key: "collegeContent.hostelLife",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "12. Hostel Life",
    type: "text",
    required: false,
    aliases: ["hostelLife", "hostel_life", "hostelEnvironment"],
    description: "Residential living, amenities, security, and dining mess details",
  },
  {
    key: "collegeContent.scholarships",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "13. Scholarships & Aid",
    type: "text",
    required: false,
    aliases: ["scholarships", "scholarshipSchemes", "financialAid"],
    description: "Government scholarships, institutional merit assistance, and fee concessions",
  },
  {
    key: "collegeContent.research",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "14. Research & Innovation",
    type: "text",
    required: false,
    aliases: ["research", "researchAndInnovation", "rnd"],
    description: "Research centers, funded projects, patents, and incubation facilities",
  },
  {
    key: "collegeContent.studentActivities",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "15. Student Activities",
    type: "text",
    required: false,
    aliases: ["studentActivities", "student_activities", "clubsAndActivities"],
    description: "Clubs, student chapters (IEEE/CSI), fine arts, sports, and NSS/NCC",
  },
  {
    key: "collegeContent.faq",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "16. FAQs",
    type: "text",
    required: false,
    aliases: ["faq", "faqs", "frequentlyAskedQuestions"],
    description: "Common questions and verified answers regarding admissions and campus",
  },
  {
    key: "collegeContent.seoArticle",
    section: 13,
    sectionTitle: "Content Management Module",
    label: "17. SEO Detailed Article",
    type: "text",
    required: false,
    aliases: ["seoArticle", "seo_article", "detailedArticle", "article"],
    description: "Long-form 350-500 word narrative article summarizing the institution",
  },

  // ── Section 14: Student Reviews ──
  {
    key: "reviews",
    section: 14,
    sectionTitle: "Student Reviews",
    label: "Student Reviews Array",
    type: "array",
    required: false,
    aliases: ["studentReviews", "student_reviews", "testimonials"],
    description: "Array of student reviews with ratings, pros, cons, and narrative feedback",
  },
];

export const TOTAL_FORM_FIELDS_COUNT = COMPLETE_FIELD_INVENTORY.length;

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTED CANONICAL FACILITIES LIST (Section 6)
// ─────────────────────────────────────────────────────────────────────────────

export const CANONICAL_FACILITIES = [
  "Hostel",
  "Transport",
  "Library",
  "Sports",
  "Gym",
  "WiFi",
  "Medical",
  "Cafeteria",
  "ATM",
  "Bank",
  "Auditorium",
  "Labs",
  "Placement Cell",
  "Research Centre",
  "Innovation Hub",
];

// ─────────────────────────────────────────────────────────────────────────────
// STRICT NORMALIZATION OF AI / CHATGPT OUTPUT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes any AI-generated JSON (flat or nested, ChatGPT or Gemini) into the
 * strict, canonical 14-section format expected by CollegeForm and the database.
 */
export function normalizeCollegeJson(rawInput: any): any {
  if (!rawInput || typeof rawInput !== "object") return {};

  const rootData =
    rawInput.data && typeof rawInput.data === "object" && !Array.isArray(rawInput.data)
      ? rawInput.data
      : rawInput.college && typeof rawInput.college === "object" && !Array.isArray(rawInput.college)
      ? rawInput.college
      : rawInput;

  const getVal = (primaryKey: string, aliases: string[] = [], sectionNames: string[] = []): any => {
    const allKeys = [primaryKey, ...aliases];
    const allSections = [
      ...sectionNames,
      "basicInfo", "basic_info",
      "location",
      "contact", "contactInfo",
      "fees", "feeStructure",
      "placements", "placement", "placementStats",
      "admissions", "admission",
      "hostel", "hostelDetails",
      "gallery", "media",
      "seo", "meta",
      "status", "displayOptions",
      "collegeContent", "content", "section13", "section_13", "cmsContent",
    ];

    // 1. Direct key on rootData
    for (const k of allKeys) {
      if (rootData[k] !== undefined && rootData[k] !== null) {
        if (typeof rootData[k] === "object" && "value" in rootData[k]) {
          return rootData[k].value;
        }
        if (typeof rootData[k] !== "object" || Array.isArray(rootData[k])) {
          return rootData[k];
        }
      }
    }

    // 2. Inside section container
    for (const s of allSections) {
      const container = rootData[s];
      if (container && typeof container === "object" && !Array.isArray(container)) {
        for (const k of allKeys) {
          if (container[k] !== undefined && container[k] !== null) {
            if (typeof container[k] === "object" && "value" in container[k]) {
              return container[k].value;
            }
            return container[k];
          }
        }
      }
    }

    return undefined;
  };

  const cleanNum = (v: any): number | null => {
    if (v === undefined || v === null || v === "") return null;
    if (typeof v === "number") return isNaN(v) ? null : v;
    const str = String(v).replace(/,/g, "").trim();
    const match = str.match(/-?\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  };

  const cleanStr = (v: any): string => {
    if (v === undefined || v === null) return "";
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    if (Array.isArray(v)) {
      return v.map(String).map((s) => s.trim()).filter(Boolean).join(", ");
    }
    return String(v).trim();
  };

  const cleanBool = (v: any, defaultVal: boolean = false): boolean => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      const trimmed = v.trim().toLowerCase();
      if (/^(yes|true|1|available|present|approved|autonomous)/.test(trimmed)) return true;
      if (/^(no|false|0|not|none|na)/.test(trimmed)) return false;
    }
    return defaultVal;
  };

  // Section 1: Basic Info
  const name = cleanStr(getVal("name", ["collegeName", "college_name", "officialName", "institutionName"], ["basicInfo"]));
  const shortName = cleanStr(getVal("shortName", ["short_name", "shortCode", "abbreviation"], ["basicInfo"]));
  const slug = cleanStr(getVal("slug", ["urlSlug"], ["basicInfo"])) || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "");
  const description = cleanStr(getVal("description", ["collegeAbout", "aboutText", "about"], ["basicInfo", "overview"]));
  const estYear = cleanNum(getVal("estYear", ["est_year", "establishedYear", "foundedYear"], ["basicInfo"]));
  const ownership = cleanStr(getVal("ownership", ["ownershipType", "management"], ["basicInfo"])) || "Private";
  const type = cleanStr(getVal("type", ["collegeType", "institutionType"], ["basicInfo"])) || ownership;
  const category = cleanStr(getVal("category", ["primaryCategory", "mainCategory"], ["basicInfo"])) || "Engineering";
  
  let rawCategories = getVal("categories", ["selectedCategories", "streams"], ["basicInfo"]);
  if (typeof rawCategories === "string") {
    rawCategories = rawCategories.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  } else if (!Array.isArray(rawCategories)) {
    rawCategories = [category];
  }

  const affiliatedUniversity = cleanStr(getVal("affiliatedUniversity", ["affiliated_university", "affiliation", "university"], ["basicInfo"]));
  const isAutonomous = cleanBool(getVal("isAutonomous", ["is_autonomous", "autonomous"], ["basicInfo"]));
  const accreditation = cleanStr(getVal("accreditation", ["accreditedBy", "accreditations"], ["basicInfo"]));
  const approval = cleanStr(getVal("approval", ["approvals", "approvedBy"], ["basicInfo"])) || "AICTE, UGC";
  const aicteApproved = cleanBool(getVal("aicteApproved", ["aicte_approved", "aicte"], ["basicInfo"]), true);
  const ugcApproved = cleanBool(getVal("ugcApproved", ["ugc_approved", "ugc"], ["basicInfo"]), true);
  const naacGrade = cleanStr(getVal("naacGrade", ["naac_grade", "naac"], ["basicInfo"]));
  const nirfRank = cleanNum(getVal("nirfRank", ["nirf_rank", "nirf"], ["basicInfo"]));

  // Section 2: Location
  const address = cleanStr(getVal("address", ["fullAddress", "streetAddress"], ["location"]));
  const landmark = cleanStr(getVal("landmark", ["nearby"], ["location"]));
  const area = cleanStr(getVal("area", ["locality"], ["location"]));
  let city = cleanStr(getVal("city", ["town"], ["location"]));
  const district = cleanStr(getVal("district", ["county"], ["location"])) || city;
  let state = cleanStr(getVal("state", ["province"], ["location"])) || "Tamil Nadu";
  const pincode = cleanStr(getVal("pincode", ["pin", "zipCode", "postalCode"], ["location"]));
  const latitude = cleanNum(getVal("latitude", ["lat"], ["location"]));
  const longitude = cleanNum(getVal("longitude", ["lng", "long"], ["location"]));
  const googleMapUrl = cleanStr(getVal("googleMapUrl", ["google_map_url", "mapUrl"], ["location"]));

  // Fallback for location string if city/state are empty
  const locationRaw = cleanStr(getVal("location", ["locationString"], ["location"]));
  if ((!city || !state) && locationRaw) {
    const parts = locationRaw.split(/[,–-]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      if (!city) city = parts[0];
      if (!state) state = parts[parts.length - 1];
    } else if (parts.length === 1 && !city) {
      city = parts[0];
    }
  }

  // Section 3: Contact
  const phone = cleanStr(getVal("phone", ["telephone", "landline"], ["contact"]));
  const mobile = cleanStr(getVal("mobile", ["cell", "mobile_number"], ["contact"]));
  const email = cleanStr(getVal("email", ["mail", "email_id"], ["contact"]));
  const website = cleanStr(getVal("website", ["officialWebsite", "webUrl"], ["contact"]));
  const facebook = cleanStr(getVal("facebook", ["facebookUrl"], ["contact", "socialMedia"]));
  const instagram = cleanStr(getVal("instagram", ["instagramUrl"], ["contact", "socialMedia"]));
  const linkedin = cleanStr(getVal("linkedin", ["linkedinUrl"], ["contact", "socialMedia"]));
  const youtube = cleanStr(getVal("youtube", ["youtubeUrl", "youtubeChannel"], ["contact", "socialMedia"]));

  // Section 4: Courses
  const rawCourses =
    getVal("courses", ["programs", "coursesOffered", "coursesList"], ["academic", "academics"]) || [];
  
  const courses = Array.isArray(rawCourses)
    ? rawCourses
        .map((c: any) => {
          if (!c) return null;
          const title = cleanStr(c.title || c.name || c.courseName || c.programName || c.degree || "");
          if (!title) return null;
          return {
            title,
            duration: cleanStr(c.duration) || "3 Years",
            feesPerYear: cleanNum(c.feesPerYear || c.fees || c.fee || c.annualFee || c.tuitionFee) ?? 0,
            eligibility: cleanStr(c.eligibility || c.eligibilityCriteria || c.criteria) || "Eligibility as per university norms",
            minGpa: cleanNum(c.minGpa),
            seats: cleanNum(c.seats || c.intake || c.capacity),
            entranceExam: cleanStr(c.entranceExam || c.entrance_exam || c.exam || "Merit Based"),
          };
        })
        .filter(Boolean)
    : [];

  // Section 5: Academic Fees
  let feesPerYear = cleanNum(getVal("feesPerYear", ["annualFees", "annualFee", "tuitionFees"], ["fees", "feeStructure"])) ?? 0;
  if (feesPerYear === 0 && courses.length > 0) {
    const firstCourseWithFee = courses.find((c: any) => c.feesPerYear > 0);
    if (firstCourseWithFee) {
      feesPerYear = firstCourseWithFee.feesPerYear;
    }
  }
  const courseWiseFees = cleanStr(getVal("courseWiseFees", ["course_wise_fees", "feeBreakup"], ["fees", "feeStructure"]));
  const hostelFees = cleanNum(getVal("hostelFees", ["hostel_fees", "hostelFee"], ["fees", "hostel"]));
  const transportFees = cleanNum(getVal("transportFees", ["transport_fees", "transportFee", "busFee"], ["fees"]));
  const scholarshipDetails = cleanStr(getVal("scholarshipDetails", ["scholarship_details", "scholarships"], ["fees", "scholarships"]));
  const educationLoanDetails = cleanStr(getVal("educationLoanDetails", ["education_loan_details", "loanDetails"], ["fees"]));

  // Section 6: Facilities (Normalized to 15 canonical facilities)
  const rawFac = getVal("facilities", ["amenities", "campusFacilities"], ["campus", "facilities"]);
  let facilities: string[] = [];
  if (Array.isArray(rawFac)) {
    facilities = rawFac.map(String).map((s) => s.trim()).filter(Boolean);
  } else if (typeof rawFac === "string") {
    facilities = rawFac.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  }

  const matchedFacilities = new Set<string>();
  for (const f of facilities) {
    const directMatch = CANONICAL_FACILITIES.find((cf) => cf.toLowerCase() === f.toLowerCase());
    if (directMatch) {
      matchedFacilities.add(directMatch);
      continue;
    }
    const lower = f.toLowerCase();
    if (/wi-?fi|internet|wireless/i.test(lower)) matchedFacilities.add("WiFi");
    else if (/lab|laboratory/i.test(lower)) matchedFacilities.add("Labs");
    else if (/librar/i.test(lower)) matchedFacilities.add("Library");
    else if (/hostel|dormitor|residen/i.test(lower)) matchedFacilities.add("Hostel");
    else if (/sport|playground|ground/i.test(lower)) matchedFacilities.add("Sports");
    else if (/gym|fitness/i.test(lower)) matchedFacilities.add("Gym");
    else if (/cafeteria|canteen|food|mess/i.test(lower)) matchedFacilities.add("Cafeteria");
    else if (/medic|health|clinic/i.test(lower)) matchedFacilities.add("Medical");
    else if (/transport|bus|shuttle/i.test(lower)) matchedFacilities.add("Transport");
    else if (/placement|career guidance/i.test(lower)) matchedFacilities.add("Placement Cell");
    else if (/auditorium|seminar hall/i.test(lower)) matchedFacilities.add("Auditorium");
    else if (/atm/i.test(lower)) matchedFacilities.add("ATM");
    else if (/bank/i.test(lower)) matchedFacilities.add("Bank");
    else if (/research|r&d/i.test(lower)) matchedFacilities.add("Research Centre");
    else if (/innovation|incubat/i.test(lower)) matchedFacilities.add("Innovation Hub");
  }

  // Section 7: Placements
  const highestPackage = cleanNum(getVal("highestPackage", ["highest_package", "highestCtc"], ["placements", "placement"])) ?? 0;
  const avgPackage = cleanNum(getVal("avgPackage", ["avg_package", "averagePackage", "averageCtc"], ["placements", "placement"])) ?? 0;
  const placementPercentage = cleanNum(getVal("placementPercentage", ["placement_percentage", "placementRate"], ["placements", "placement"]));
  const topRecruiters = cleanStr(getVal("topRecruiters", ["top_recruiters", "recruiters"], ["placements", "placement"]));
  const internshipDetails = cleanStr(getVal("internshipDetails", ["internship_details", "internships"], ["placements", "placement"]));

  // Section 8: Admissions
  const admissionEligibility = cleanStr(getVal("admissionEligibility", ["admission_eligibility", "eligibilityCriteria"], ["admissions", "admission"]));
  const admissionProcess = cleanStr(getVal("admissionProcess", ["admission_process", "howToApply"], ["admissions", "admission"]));
  const documentsRequired = cleanStr(getVal("documentsRequired", ["documents_required", "requiredDocuments"], ["admissions", "admission"]));
  const counsellingInfo = cleanStr(getVal("counsellingInfo", ["counselling_info", "counselingInfo"], ["admissions", "admission"]));
  const admissionEntranceExams = cleanStr(getVal("admissionEntranceExams", ["admission_entrance_exams", "entranceExams"], ["admissions", "admission"]));
  const importantDates = cleanStr(getVal("importantDates", ["important_dates", "admissionDates"], ["admissions", "admission"]));

  // Section 9: Hostel (Cross-sync with Section 5 hostelFees)
  const hostelAvailable = cleanBool(getVal("hostelAvailable", ["hostel_available", "hasHostel"], ["hostel"]));
  const boysHostel = cleanBool(getVal("boysHostel", ["boys_hostel"], ["hostel"]));
  const girlsHostel = cleanBool(getVal("girlsHostel", ["girls_hostel"], ["hostel"]));
  const acRooms = cleanBool(getVal("acRooms", ["ac_rooms"], ["hostel"]));
  const messAvailable = cleanBool(getVal("messAvailable", ["mess_available"], ["hostel"]));
  const hostelFeePerYear = cleanNum(getVal("hostelFeePerYear", ["hostel_fee_per_year", "hostelFee"], ["hostel"])) ?? hostelFees;

  // Section 10: Gallery & Media
  const logo = cleanStr(getVal("logo", ["logoUrl", "logo_url"], ["gallery", "media", "basicInfo"]));
  const banner = cleanStr(getVal("banner", ["bannerUrl", "banner_url", "image"], ["gallery", "media", "basicInfo"]));
  const collegeVideo = cleanStr(getVal("collegeVideo", ["college_video", "videoUrl"], ["gallery", "media", "basicInfo"]));
  const rawGallery = getVal("galleryImages", ["gallery", "images", "photos"], ["gallery", "media"]);
  const galleryImages = Array.isArray(rawGallery)
    ? rawGallery
        .map((img: any) => {
          if (typeof img === "string" && img.trim()) {
            return {
              url: img.trim(),
              altText: `${name} Campus`,
              caption: "Campus view",
              tags: "campus",
            };
          }
          if (img && typeof img === "object" && (img.url || img.imageUrl || img.src)) {
            return {
              url: cleanStr(img.url || img.imageUrl || img.src),
              altText: cleanStr(img.altText || img.alt || `${name} Campus`),
              caption: cleanStr(img.caption || "Campus view"),
              tags: cleanStr(img.tags || "campus"),
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  // Section 11: SEO
  const seoTitle = cleanStr(getVal("seoTitle", ["seo_title", "metaTitle"], ["seo"])) || `${name} Admissions, Courses & Fees`;
  const seoDescription = cleanStr(getVal("seoDescription", ["seo_description", "metaDescription"], ["seo"])) || `${name} official details, courses, eligibility and admissions.`;
  const metaKeywords = cleanStr(getVal("metaKeywords", ["meta_keywords", "keywords"], ["seo"]));

  // Section 12: Status
  const status = cleanStr(getVal("status", ["publicationStatus"], ["status"])) || "PUBLISHED";
  const featured = cleanBool(getVal("featured", ["isFeatured"], ["status"]), true);
  const trending = cleanBool(getVal("trending", ["isTrending"], ["status"]), true);

  // Section 13: College Content Module (All 17 fields)
  const ccObj =
    getVal("collegeContent", ["content", "section13", "section_13", "cmsContent"]) || {};

  const getCcField = (key: string, aliases: string[] = []): string => {
    if (typeof ccObj === "object" && ccObj !== null) {
      for (const k of [key, ...aliases]) {
        if (ccObj[k] !== undefined && ccObj[k] !== null) {
          if (typeof ccObj[k] === "string") return ccObj[k].trim();
          if (Array.isArray(ccObj[k])) {
            return ccObj[k].map(String).join("\n\n");
          }
          return String(ccObj[k]).trim();
        }
      }
    }
    return cleanStr(getVal(key, aliases, ["collegeContent", "content", "section13"]));
  };

  const collegeContent = {
    overview: getCcField("overview", ["collegeOverview", "summary"]),
    about: getCcField("about", ["aboutCollege", "aboutUs"]) || description,
    history: getCcField("history", ["collegeHistory", "milestones"]),
    highlights: getCcField("highlights", ["keyHighlights", "collegeHighlights"]),
    whyChoose: getCcField("whyChoose", ["why_choose", "whyChooseCollege"]),
    campusLife: getCcField("campusLife", ["campus_life", "studentLife"]),
    facilitiesDescription: getCcField("facilitiesDescription", ["facilities_description", "infrastructure"]),
    placementOverview: getCcField("placementOverview", ["placement_overview"]),
    topRecruiters: getCcField("topRecruiters", ["contentTopRecruiters"]) || topRecruiters,
    admissionGuide: getCcField("admissionGuide", ["admission_guide", "howToApply"]) || admissionProcess,
    eligibility: getCcField("eligibility", ["detailedEligibility"]) || admissionEligibility,
    hostelLife: getCcField("hostelLife", ["hostel_life"]),
    scholarships: getCcField("scholarships", ["scholarshipSchemes"]) || scholarshipDetails,
    research: getCcField("research", ["researchAndInnovation"]),
    studentActivities: getCcField("studentActivities", ["student_activities"]),
    faq: getCcField("faq", ["faqs", "frequentlyAskedQuestions"]),
    seoArticle: getCcField("seoArticle", ["seo_article", "detailedArticle"]),
    contentStatus: "PUBLISHED",
  };

  // Section 14: Reviews
  const rawReviews = getVal("reviews", ["studentReviews", "student_reviews", "testimonials"]) || [];
  const reviews = Array.isArray(rawReviews)
    ? rawReviews
        .map((r: any, idx: number) => {
          if (!r) return null;
          return {
            studentName: cleanStr(r.studentName || r.name || `Verified Student ${idx + 1}`),
            course: cleanStr(r.course || r.program || "Undergraduate / Postgraduate"),
            batchYear: cleanNum(r.batchYear || r.batch) ?? 2024,
            title: cleanStr(r.title || "Academic & Campus Experience"),
            rating: cleanNum(r.rating) ?? 4.5,
            academicRating: cleanNum(r.academicRating) ?? 4.5,
            infrastructureRating: cleanNum(r.infrastructureRating) ?? 4.0,
            placementRating: cleanNum(r.placementRating) ?? 4.5,
            campusRating: cleanNum(r.campusRating) ?? 4.2,
            valueForMoneyRating: cleanNum(r.valueForMoneyRating) ?? 4.4,
            likes: cleanStr(r.likes || r.pros || "Dedicated faculty, good campus amenities."),
            dislikes: cleanStr(r.dislikes || r.cons || "Hostel dining menu can offer more variety."),
            content: cleanStr(r.content || r.review || "Positive overall academic environment and career support."),
            isVerified: typeof r.isVerified === "boolean" ? r.isVerified : false,
          };
        })
        .filter(Boolean)
    : [];

  return {
    name,
    shortName,
    slug,
    description,
    estYear,
    ownership,
    type,
    category,
    categories: Array.from(new Set(rawCategories)),
    affiliatedUniversity,
    isAutonomous,
    accreditation,
    approval,
    aicteApproved,
    ugcApproved,
    naacGrade,
    nirfRank,

    address,
    landmark,
    area,
    city,
    district,
    state,
    pincode,
    latitude,
    longitude,
    googleMapUrl,

    phone,
    mobile,
    email,
    website,
    facebook,
    instagram,
    linkedin,
    youtube,

    courses,

    feesPerYear,
    courseWiseFees,
    hostelFees: hostelFees ?? hostelFeePerYear,
    transportFees,
    scholarshipDetails,
    educationLoanDetails,

    facilities: Array.from(matchedFacilities),

    highestPackage,
    avgPackage,
    placementPercentage,
    topRecruiters,
    internshipDetails,

    admissionEligibility,
    admissionProcess,
    documentsRequired,
    counsellingInfo,
    admissionEntranceExams,
    importantDates,

    hostelAvailable,
    boysHostel,
    girlsHostel,
    acRooms,
    messAvailable,
    hostelFeePerYear: hostelFeePerYear ?? hostelFees,

    logo,
    banner,
    collegeVideo,
    galleryImages,

    seoTitle,
    seoDescription,
    metaKeywords,

    status,
    featured,
    trending,

    collegeContent,
    reviews,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STRICT FIELD-BY-FIELD VALIDATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function validateCollegeJson(normalizedData: any): ValidationSummaryReport {
  const fieldReport: FieldValidationResult[] = [];
  const dataTypeErrors: string[] = [];
  const missingFieldKeys: string[] = [];

  let verifiedCount = 0;
  let needsVerificationCount = 0;
  let notFoundCount = 0;
  let notApplicableCount = 0;

  for (const field of COMPLETE_FIELD_INVENTORY) {
    let val: any = undefined;

    if (field.key.startsWith("collegeContent.")) {
      const subKey = field.key.replace("collegeContent.", "");
      val = normalizedData.collegeContent ? normalizedData.collegeContent[subKey] : undefined;
    } else {
      val = normalizedData[field.key];
    }

    let status: FieldStatus = "NOT_FOUND";
    let notes = "";

    // Determine value presence and status
    const isEmpty =
      val === undefined ||
      val === null ||
      val === "" ||
      (Array.isArray(val) && val.length === 0);

    if (isEmpty) {
      if (
        (field.key === "aicteApproved" && normalizedData.category === "Arts & Science") ||
        (field.key === "boysHostel" && normalizedData.category === "Women's College") ||
        (field.key === "transportFees" && normalizedData.ownership === "Government" && !normalizedData.transportFees)
      ) {
        status = "NOT_APPLICABLE";
        notApplicableCount++;
        notes = "Not applicable for this institution type";
      } else {
        status = "NOT_FOUND";
        notFoundCount++;
        missingFieldKeys.push(field.key);
      }
    } else {
      // Validate expected data type
      let typeMatches = true;
      if (field.type === "number" && typeof val !== "number") {
        dataTypeErrors.push(`Field '${field.key}' expected number but received ${typeof val} (${val})`);
        typeMatches = false;
      } else if (field.type === "boolean" && typeof val !== "boolean") {
        dataTypeErrors.push(`Field '${field.key}' expected boolean but received ${typeof val} (${val})`);
        typeMatches = false;
      } else if (field.type === "array" && !Array.isArray(val)) {
        dataTypeErrors.push(`Field '${field.key}' expected array but received ${typeof val}`);
        typeMatches = false;
      }

      if (typeMatches) {
        // Evaluate verification level
        if (field.key === "reviews") {
          // Reviews require manual verification unless explicitly flagged
          const hasUnverified = Array.isArray(val) && val.some((r: any) => !r.isVerified);
          if (hasUnverified) {
            status = "NEEDS_VERIFICATION";
            needsVerificationCount++;
            notes = `${val.length} reviews present (pending student verification)`;
          } else {
            status = "VERIFIED";
            verifiedCount++;
          }
        } else if (typeof val === "string" && (val.includes("TBD") || val.includes("Needs verification") || val.includes("Not verified"))) {
          status = "NEEDS_VERIFICATION";
          needsVerificationCount++;
          notes = "Marked for verification";
        } else {
          status = "VERIFIED";
          verifiedCount++;
        }
      } else {
        status = "NEEDS_VERIFICATION";
        needsVerificationCount++;
        notes = "Data type conversion required";
      }
    }

    fieldReport.push({
      key: field.key,
      label: field.label,
      section: field.section,
      sectionTitle: field.sectionTitle,
      value: val,
      status,
      type: field.type,
      notes,
    });
  }

  // Course inventory verification
  const coursesList = Array.isArray(normalizedData.courses) ? normalizedData.courses : [];
  const seenCourseKeys = new Set<string>();
  let duplicateCoursesDetected = 0;
  for (const c of coursesList) {
    const key = (c.title || "").trim().toLowerCase();
    if (seenCourseKeys.has(key)) {
      duplicateCoursesDetected++;
    } else {
      seenCourseKeys.add(key);
    }
  }

  const fieldsPresentInJson = verifiedCount + needsVerificationCount;
  const qualityScore = Math.min(100, Math.round((verifiedCount / TOTAL_FORM_FIELDS_COUNT) * 100));

  return {
    collegeName: normalizedData.name || "Unknown College",
    totalFieldsIdentified: TOTAL_FORM_FIELDS_COUNT,
    fieldsPresentInJson,
    verifiedCount,
    needsVerificationCount,
    notFoundCount,
    notApplicableCount,
    coursesDiscovered: coursesList.length,
    coursesIncludedInJson: coursesList.length - duplicateCoursesDetected,
    duplicateCoursesDetected,
    dataTypeErrors,
    missingFieldKeys,
    fieldReport,
    qualityScore,
  };
}

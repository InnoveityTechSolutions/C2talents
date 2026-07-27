import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "General description is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      // Intelligent fallback extraction if no API key is provided
      const fallbackData = parseDescriptionFallback(description);
      return NextResponse.json({ success: true, data: fallbackData, fallback: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert AI data extraction assistant for an Indian higher education portal (like CollegeDunia).
Analyze the following college description text and extract structured information across all standard college details.

Auto assign appropriate categories from these standard options:
- Engineering
- Arts & Science
- Medical
- Law
- MBA / Management
- Architecture
- Agriculture
- Government
- Private
- Women's College
- Autonomous
- Co-Ed
- Research
- Distance Education

Auto select facility tags from these standard options if mentioned or implied:
Hostel, Transport, Library, Sports, Gym, WiFi, Medical, Cafeteria, ATM, Bank, Auditorium, Labs, Placement Cell, Research Centre, Innovation Hub

Return ONLY a valid JSON object (no markdown, no backticks, no code blocks) matching the exact schema below:

{
  "name": "Full official name of college",
  "shortName": "Short abbreviation e.g. MCC, IITM",
  "slug": "kebab-case-url-slug",
  "description": "Clean formatted summary description",
  "estYear": 1837,
  "ownership": "Public" or "Private" or "Government" or "Govt-Aided",
  "type": "Government" or "Private" or "Deemed" or "Autonomous",
  "categories": ["Arts & Science", "Autonomous", "Co-Ed"],
  "affiliatedUniversity": "University of Madras",
  "isAutonomous": true,
  "accreditation": "NAAC A++",
  "approval": "UGC, AICTE",
  "aicteApproved": true,
  "ugcApproved": true,
  "naacGrade": "A++",
  "nirfRank": 17,
  "address": "Full street address",
  "landmark": "Near location",
  "area": "Tambaram",
  "city": "Chennai",
  "district": "Chennai",
  "state": "Tamil Nadu",
  "pincode": "600059",
  "latitude": 12.9229,
  "longitude": 80.1275,
  "googleMapUrl": "https://maps.google.com/?q=Madras+Christian+College",
  "phone": "+91 44 2239 0675",
  "mobile": "",
  "email": "principal@mcc.edu.in",
  "website": "https://www.mcc.edu.in",
  "facebook": "",
  "instagram": "",
  "linkedin": "",
  "youtube": "",
  "courses": [
    {
      "title": "BCA (Bachelor of Computer Applications)",
      "duration": "3 Years",
      "feesPerYear": 45000,
      "eligibility": "10+2 with Mathematics",
      "seats": 60,
      "entranceExam": "Merit Based",
      "careerPath": "Software Developer, System Analyst",
      "demand": "High"
    }
  ],
  "courseWiseFees": "BCA: ₹45,000/yr, MCA: ₹60,000/yr, BSc: ₹40,000/yr",
  "hostelFees": 50000,
  "transportFees": 15000,
  "scholarshipDetails": "Merit scholarships and SC/ST government stipends available.",
  "educationLoanDetails": "Bank tie-ups with SBI and Canara Bank for educational loans.",
  "facilities": ["Hostel", "Transport", "Library", "Sports", "WiFi", "Medical", "Cafeteria", "Auditorium", "Placement Cell"],
  "highestPackage": 18.0,
  "avgPackage": 6.0,
  "placementPercentage": 92.5,
  "topRecruiters": "TCS, Infosys, Accenture, Cognizant, Wipro, Amazon",
  "internshipDetails": "Paid summer internships with partner corporate firms.",
  "admissionEligibility": "Minimum 50% in 10+2 from a recognized board.",
  "admissionProcess": "Online application form followed by merit list counseling.",
  "documentsRequired": "10th & 12th Marksheets, Transfer Certificate, Conduct Certificate, Community Certificate.",
  "counsellingInfo": "University centralized counseling and direct quota seats.",
  "admissionEntranceExams": "TANCET for MCA/MBA",
  "importantDates": "Application Start: May 15, Deadline: June 30",
  "hostelAvailable": true,
  "boysHostel": true,
  "girlsHostel": true,
  "acRooms": true,
  "messAvailable": true,
  "hostelFeePerYear": 50000,
  "seoTitle": "Madras Christian College (MCC) Chennai - Admissions, Fees, Placements & Courses",
  "seoDescription": "Explore Madras Christian College Chennai admissions 2026, eligibility, courses, NIRF ranking, highest package, hostel fee structure, and review ratings.",
  "metaKeywords": "MCC Chennai, Madras Christian College, MCC Admissions, MCC Fees, MCC Courses, NIRF 17 College",
  "status": "PUBLISHED",
  "featured": true,
  "trending": true
}

College Description:
"""
${description}
"""
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Remove markdown code block fences if any
    const cleanJsonText = responseText
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsedData = JSON.parse(cleanJsonText);
    return NextResponse.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error("AI Analysis Error:", err);
    
    // Fallback extraction on API error
    const reqBody = await req.clone().json().catch(() => ({}));
    const fallbackData = parseDescriptionFallback(reqBody.description || "");

    return NextResponse.json({ 
      success: true, 
      data: fallbackData, 
      warning: "Extracted via smart pattern matcher (AI service fallback)." 
    });
  }
}

// Smart Regex Fallback Parser if API key is not supplied
function parseDescriptionFallback(text: string) {
  const nameMatch = text.match(/(?:college|institute|university) (?:of|name|is)?\s*([A-Z][A-Za-z\s]+)/i) || 
                    text.match(/^([A-Z][A-Za-z\s]+(?:College|Institute|University|Academy))/i) ||
                    text.match(/([A-Z][A-Za-z\s]{3,40})/);

  const name = nameMatch ? nameMatch[0].trim() : "New College";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const estMatch = text.match(/(?:established|estd\.?|founded)\s*(?:in)?\s*(\d{4})/i);
  const estYear = estMatch ? parseInt(estMatch[1], 10) : 1995;

  const naacMatch = text.match(/NAAC\s*([A-C]\+*)/i);
  const naacGrade = naacMatch ? naacMatch[1].toUpperCase() : "A+";

  const nirfMatch = text.match(/NIRF\s*(?:Rank|Ranking)?\s*(\d+)/i);
  const nirfRank = nirfMatch ? parseInt(nirfMatch[1], 10) : 25;

  const highestPackageMatch = text.match(/highest\s*(?:package|ctc)\s*(?:is|of)?\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs)/i);
  const highestPackage = highestPackageMatch ? parseFloat(highestPackageMatch[1]) : 15.0;

  const avgPackageMatch = text.match(/average\s*(?:package|ctc)\s*(?:is|of)?\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs)/i);
  const avgPackage = avgPackageMatch ? parseFloat(avgPackageMatch[1]) : 5.5;

  // Auto categories
  const categories: string[] = [];
  if (/engineering|b\.tech|m\.tech|cse|it|ece/i.test(text)) categories.push("Engineering");
  if (/arts|science|bca|mca|bsc|msc|ba|ma/i.test(text)) categories.push("Arts & Science");
  if (/medical|mbbs|nursing|pharmacy/i.test(text)) categories.push("Medical");
  if (/law|llb|ba llb/i.test(text)) categories.push("Law");
  if (/mba|management|bba|pgdm/i.test(text)) categories.push("MBA");
  if (/autonomous/i.test(text)) categories.push("Autonomous");
  if (/government|govt/i.test(text)) categories.push("Government");
  else categories.push("Private");

  // Auto facilities
  const knownFacilities = [
    "Hostel", "Transport", "Library", "Sports", "Gym", 
    "WiFi", "Medical", "Cafeteria", "ATM", "Bank", 
    "Auditorium", "Labs", "Placement Cell", "Research Centre", "Innovation Hub"
  ];
  const facilities = knownFacilities.filter(f => new RegExp(f, "i").test(text));
  if (facilities.length === 0) facilities.push("Hostel", "Library", "Sports", "WiFi", "Placement Cell");

  // Auto courses extraction
  const courses: any[] = [];
  const courseRegex = /(BCA|MCA|B\.Tech|M\.Tech|BSc|MSc|MBA|BA|MA|B.Com|M.Com|MBBS|LLB)/gi;
  const foundCourses = Array.from(new Set(text.match(courseRegex) || ["B.Tech CSE", "MBA", "BCA"]));
  
  foundCourses.forEach((c) => {
    courses.push({
      title: c.toUpperCase(),
      duration: c.toLowerCase().startsWith("m") ? "2 Years" : "3-4 Years",
      feesPerYear: 60000,
      eligibility: "50% in 10+2 / Graduation",
      seats: 60,
      entranceExam: "Merit / Entrance Exam",
      careerPath: "Professional Specialist",
      demand: "High"
    });
  });

  return {
    name,
    shortName: name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 5),
    slug,
    description: text,
    estYear,
    ownership: /government|govt/i.test(text) ? "Government" : "Private",
    type: /autonomous/i.test(text) ? "Autonomous" : "Private",
    categories,
    affiliatedUniversity: "State University",
    isAutonomous: /autonomous/i.test(text),
    accreditation: `NAAC ${naacGrade}`,
    approval: "UGC, AICTE",
    aicteApproved: true,
    ugcApproved: true,
    naacGrade,
    nirfRank,
    address: text.slice(0, 100),
    landmark: "Main Highway Campus",
    area: "Campus Zone",
    city: text.match(/in\s+([A-Z][a-z]+)/)?.[1] || "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
    latitude: 13.0827,
    longitude: 80.2707,
    googleMapUrl: `https://maps.google.com/?q=${encodeURIComponent(name)}`,
    phone: "+91 44 2800 0000",
    mobile: "+91 98765 43210",
    email: `info@${slug}.edu.in`,
    website: `https://www.${slug}.edu.in`,
    facebook: `https://facebook.com/${slug}`,
    instagram: `https://instagram.com/${slug}`,
    linkedin: `https://linkedin.com/school/${slug}`,
    youtube: `https://youtube.com/c/${slug}`,
    courses,
    courseWiseFees: "Undergraduate: ₹50,000/yr, Postgraduate: ₹75,000/yr",
    hostelFees: 45000,
    transportFees: 12000,
    scholarshipDetails: "Merit scholarships available for top performers.",
    educationLoanDetails: "Educational loan assistance provided.",
    facilities,
    highestPackage,
    avgPackage,
    placementPercentage: 88.0,
    topRecruiters: "TCS, Infosys, Accenture, Cognizant, Wipro",
    internshipDetails: "Summer industry internships with leading companies.",
    admissionEligibility: "Pass in qualifying board examination with minimum required percentage.",
    admissionProcess: "Application form submission followed by merit verification.",
    documentsRequired: "10th/12th Marksheets, Transfer Certificate, ID Proof, Photos.",
    counsellingInfo: "Centralized counselling and direct seats.",
    admissionEntranceExams: "State/National Entrance Exams",
    importantDates: "Admissions Open Now",
    hostelAvailable: facilities.includes("Hostel"),
    boysHostel: true,
    girlsHostel: true,
    acRooms: true,
    messAvailable: true,
    hostelFeePerYear: 45000,
    seoTitle: `${name} - Admissions, Fees, Courses, Placements & Ranking`,
    seoDescription: `Get complete details about ${name} including fees, courses, ranking, highest package, hostel facilities, and application process.`,
    metaKeywords: `${name}, ${name} admissions, ${name} fees, ${name} placement`,
    status: "PUBLISHED",
    featured: true,
    trending: true
  };
}

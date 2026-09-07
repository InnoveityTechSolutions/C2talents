import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      studentId,
      studentName,
      email,
      phone,
      selectedCountry,
      preferredCourse,
      qualification,
      academicScore,
      englishTest,
      englishScore,
      budget,
      preferredIntake
    } = body;

    if (!studentName || !email || !phone || !selectedCountry) {
      return NextResponse.json(
        { success: false, error: "Name, email, phone, and selected country are required." },
        { status: 400 }
      );
    }

    // Save or Update Lead in StudyAbroadLead database table
    const existingLead = await prisma.studyAbroadLead.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        selectedCountry: selectedCountry.trim()
      }
    });

    let lead;
    if (existingLead) {
      lead = await prisma.studyAbroadLead.update({
        where: { id: existingLead.id },
        data: {
          studentId: studentId || existingLead.studentId,
          studentName,
          phone,
          preferredCourse: preferredCourse || existingLead.preferredCourse,
          qualification: qualification || existingLead.qualification,
          academicScore: academicScore || existingLead.academicScore,
          englishTest: englishTest || existingLead.englishTest,
          englishScore: englishScore || existingLead.englishScore,
          budget: budget || existingLead.budget,
          preferredIntake: preferredIntake || existingLead.preferredIntake,
          updatedAt: new Date()
        }
      });
    } else {
      lead = await prisma.studyAbroadLead.create({
        data: {
          studentId: studentId || null,
          studentName,
          email: email.trim().toLowerCase(),
          phone,
          selectedCountry,
          preferredCourse: preferredCourse || "General",
          qualification: qualification || "12th Standard",
          academicScore: academicScore || "N/A",
          englishTest: englishTest || "Not taken",
          englishScore: englishScore || "N/A",
          budget: budget || "Moderate",
          preferredIntake: preferredIntake || "Fall",
          status: "NEW"
        }
      });
    }

    // Compute realistic, non-guaranteed evaluation profile
    const scoreNum = parseFloat(academicScore) || 70;
    const isHighAcademic = scoreNum >= 75 || academicScore.includes("8") || academicScore.includes("9") || academicScore.includes("A");
    const testTaken = englishTest && englishTest !== "Not taken";

    // Country specific guidance
    let countryUniversities: string[] = [];
    let estCostText = "₹15L - ₹35L / yr";

    if (selectedCountry.toLowerCase().includes("usa")) {
      countryUniversities = [
        "Northeastern University",
        "Arizona State University",
        "University of Texas at Dallas",
        "Illinois Institute of Technology"
      ];
      estCostText = "₹25L - ₹45L / yr";
    } else if (selectedCountry.toLowerCase().includes("uk")) {
      countryUniversities = [
        "University of Manchester",
        "University of Birmingham",
        "Queen Mary University of London",
        "Coventry University"
      ];
      estCostText = "₹18L - ₹32L / yr";
    } else {
      countryUniversities = [
        "University of Waterloo",
        "York University",
        "Conestoga College",
        "Seneca Polytechnic"
      ];
      estCostText = "₹15L - ₹28L / yr";
    }

    const missingRequirements: string[] = [];
    if (!testTaken) {
      missingRequirements.push(`English Language Proficiency Test (${selectedCountry.includes("USA") ? "IELTS / TOEFL / Duolingo" : "IELTS Academic"}) required for official admission.`);
    }
    if (scoreNum < 60) {
      missingRequirements.push("Academic aggregate score is below standard direct entry thresholds; foundation or pathway programs may be recommended.");
    }

    const recommendedNextSteps = [
      testTaken ? "Prepare official academic transcripts and SOP draft" : "Register and schedule your IELTS / TOEFL test date",
      "Consult with a C2Talents Study Abroad Counselor for personalized shortlist review",
      "Review scholarship deadlines and financial documentation requirements"
    ];

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      profileResult: {
        title: "Your Study Abroad Suitability Analysis",
        studentName,
        selectedCountry,
        preferredCourse: preferredCourse || "Selected Discipline",
        budgetFit: `Your budget selection (${budget}) alignment relative to ${selectedCountry}'s typical tuition & living expenses (${estCostText}).`,
        potentialMatches: countryUniversities.map((name) => ({
          name,
          matchConfidence: isHighAcademic ? "High Fit" : "Potential Fit",
          note: "Subject to official university review and credential verification."
        })),
        missingRequirements,
        recommendedNextSteps,
        disclaimer: "Estimated suitability is based solely on self-reported preliminary information and does not constitute a guaranteed admission offer or visa approval."
      }
    });
  } catch (error: any) {
    console.error("Error submitting study abroad eligibility:", error);
    return NextResponse.json(
      { success: false, error: "Failed to evaluate study abroad eligibility" },
      { status: 500 }
    );
  }
}

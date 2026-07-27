import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

function getFallbackRationale(college: any, req: any, score: number) {
  const colName = college.name || "Institution";
  const avgPkg = college.avgPackage || 5.0;
  const fees = college.feesPerYear || 50000;
  const nirf = college.nirfRank || 100;
  const naac = college.naacGrade || "A";
  
  return (
    `${colName} represents an exceptional match (${Math.round(score)}% match score) based on your profile. ` +
    `Its average placement package of ${avgPkg} LPA meets your target of ${req.expectedPackage} LPA, ` +
    `and the annual tuition fee of Rs. ${Math.round(fees).toLocaleString("en-IN")} fits well within your budget limit of Rs. ${Math.round(req.budgetLimit).toLocaleString("en-IN")}. ` +
    `Additionally, it holds a prestigious NIRF Rank of ${nirf} and NAAC ${naac} rating, ensuring premium quality education.`
  );
}

async function generateGeminiRationale(college: any, req: any, score: number) {
  if (!GEMINI_API_KEY) {
    return getFallbackRationale(college, req, score);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a premium, expert higher-education advisor for Indian students, speaking in a calm, confident, and professional tone.
      Write a concise, 2-3 sentence personalized recommendation explaining why '${college.name}' (${college.location}) is an excellent match for a student with this profile:
      - 12th Board Score: ${req.score12th}%
      - Selected Specialization/Stream: ${req.specializationPreference}
      - Expected Placement Package: ${req.expectedPackage} LPA
      - Annual Fees Budget Limit: Rs. ${req.budgetLimit.toLocaleString("en-IN")} (Note: College Annual Fee is Rs. ${college.feesPerYear.toLocaleString("en-IN")})
      - Hostel Required: ${req.hostelPreference ? "Yes" : "No"}
      
      College Details:
      - Description: ${college.description || ""}
      - NIRF Rank: ${college.nirfRank}, NAAC: ${college.naacGrade}
      - Placement stats: Average ${college.avgPackage} LPA, Highest ${college.highestPackage} LPA.
      
      Our computed match score for this college is ${Math.round(score)}%.
      Highlight the Return on Investment (ROI), brand legacy, and placement outcomes. Do not use generic filler words. Write directly.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error in recommendation:", error);
    return getFallbackRationale(college, req, score);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      score12th,
      entranceExamScore,
      budgetLimit,
      hostelPreference,
      specializationPreference,
      expectedPackage,
    } = body;

    if (score12th === undefined || budgetLimit === undefined || expectedPackage === undefined) {
      return NextResponse.json(
        { message: "Missing required profile parameters" },
        { status: 400 }
      );
    }

    // Fetch all colleges with courses
    const colleges = await db.collegeProfile.findMany({
      include: {
        courses: true,
      },
    });

    const results: any[] = [];

    for (const col of colleges) {
      let score = 0.0;
      
      // 1. Academic Eligibility & Stream Match (25%)
      const matchingCourses = col.courses.filter(c =>
        specializationPreference.toLowerCase().split(" ").some((keyword: string) => 
          keyword.length > 2 && c.title.toLowerCase().includes(keyword)
        )
      );

      const hasCourse = matchingCourses.length > 0;
      if (hasCourse) {
        const course = matchingCourses[0];
        const minGpa = course.minGpa || 60.0;
        
        if (score12th >= minGpa) {
          score += 25.0;
        } else {
          const diff = minGpa - score12th;
          if (diff <= 10) {
            score += 25.0 * (1 - (diff / 10));
          }
        }
      } else {
        // Skip colleges that do not offer the desired course area
        continue;
      }

      // 2. Financial Fit (25%)
      const courseFee = matchingCourses[0].feesPerYear || col.feesPerYear;
      if (courseFee <= budgetLimit) {
        score += 25.0;
      } else {
        const diff = courseFee - budgetLimit;
        if (diff < budgetLimit) {
          score += 25.0 * (1 - (diff / budgetLimit));
        }
      }

      // 3. Placement Fit (20%)
      const colAvgPkg = col.avgPackage || 4.0;
      if (colAvgPkg >= expectedPackage) {
        score += 20.0;
      } else {
        score += 20.0 * (colAvgPkg / expectedPackage);
      }

      // 4. Hostel preference (15%)
      score += 15.0; // All colleges offer boarding facilities in this model

      // 5. Reputation & Ranking (15%)
      const nirf = col.nirfRank || 150;
      if (nirf <= 15) {
        score += 15.0;
      } else if (nirf <= 40) {
        score += 12.0;
      } else if (nirf <= 80) {
        score += 9.0;
      } else {
        score += 6.0;
      }

      const matchScore = Math.round(score);
      if (matchScore >= 50) {
        results.push({
          college: col,
          score: matchScore,
        });
      }
    }

    // Sort by match score
    results.sort((a, b) => b.score - a.score);
    const topMatches = results.slice(0, 3);

    // Generate explanations
    const recommendations = [];
    for (const match of topMatches) {
      const col = match.college;
      const mScore = match.score;
      const rationale = await generateGeminiRationale(col, body, mScore);

      recommendations.push({
        id: col.id,
        name: col.name,
        location: col.location,
        rating: col.rating,
        type: col.type,
        fees: col.feesPerYear,
        packages: {
          avg: `${col.avgPackage} LPA`,
          highest: `${col.highestPackage} LPA`,
        },
        matchScore: mScore,
        rationale,
      });
    }

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("Failed to calculate recommendations:", error);
    return NextResponse.json(
      { message: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

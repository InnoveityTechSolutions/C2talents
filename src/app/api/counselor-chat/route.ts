import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export interface StudentProfile {
  stream?: string | null;
  score10th?: string | null;
  score12th?: string | null;
  entranceExam?: string | null;
  entranceScore?: string | null;
  specialization?: string | null;
  locationPreference?: string | null;
  budget?: string | null;
  hostel?: string | null;
  ownershipPreference?: string | null;
  naacPreference?: string | null;
  expectedPackage?: string | null;
  transport?: string | null;
  scholarship?: string | null;
}

export interface RecommendationResult {
  id: string;
  name: string;
  shortName: string | null;
  slug: string | null;
  logo: string | null;
  image: string;
  banner: string | null;
  location: string;
  city: string | null;
  state: string;
  type: string;
  ownership: string | null;
  fees: number;
  courseWiseFees: string | null;
  hostelFees: number | null;
  avgPackage: number;
  highestPackage: number;
  naacGrade: string | null;
  nirfRank: number | null;
  approval: string | null;
  hostelAvailable: boolean;
  website: string | null;
  matchScore: number;
  matchReasons: string[];
  rationale: string;
}

// Convert user budget text string into numerical INR limit
function parseBudgetLimit(budgetText?: string | null): number {
  if (!budgetText) return 500000;
  const lower = budgetText.toLowerCase();
  if (lower.includes("under 1l") || lower.includes("1 lakh")) return 100000;
  if (lower.includes("1l – 2l") || lower.includes("1l - 2l") || lower.includes("2l")) return 200000;
  if (lower.includes("2l – 4l") || lower.includes("2l - 4l") || lower.includes("4l")) return 400000;
  if (lower.includes("4l+") || lower.includes("above")) return 800000;
  return 300000;
}

// Convert user expected package text into numerical LPA
function parsePackageTarget(pkgText?: string | null): number {
  if (!pkgText) return 5.0;
  const lower = pkgText.toLowerCase();
  if (lower.includes("4–6") || lower.includes("4-6")) return 5.0;
  if (lower.includes("6–10") || lower.includes("6-10")) return 8.0;
  if (lower.includes("10–15") || lower.includes("10-15")) return 12.0;
  if (lower.includes("15+") || lower.includes("above 15")) return 16.0;
  return 5.0;
}

// Convert user 12th score string into percentage float
function parseScoreValue(scoreText?: string | null): number {
  if (!scoreText) return 80;
  const match = scoreText.match(/(\d+(?:\.\d+)?)/);
  if (match) return parseFloat(match[1]);
  if (scoreText.includes("95")) return 95;
  if (scoreText.includes("90")) return 92;
  if (scoreText.includes("85")) return 87;
  if (scoreText.includes("75")) return 80;
  return 70;
}

export async function POST(req: Request) {
  try {
    const { message, history, currentProfile } = await req.json();

    if (!message && !currentProfile) {
      return NextResponse.json({ message: "Message or profile is required" }, { status: 400 });
    }

    // Combine user message history to parse student profile
    const allUserTexts = (history || [])
      .filter((m: any) => m.role === "user")
      .map((m: any) => m.content)
      .concat(message || []);

    const fullConversationText = allUserTexts.join(" ");

    // Extract / Update Profile State
    const profile: StudentProfile = {
      stream: currentProfile?.stream || null,
      score10th: currentProfile?.score10th || null,
      score12th: currentProfile?.score12th || null,
      entranceExam: currentProfile?.entranceExam || null,
      entranceScore: currentProfile?.entranceScore || null,
      specialization: currentProfile?.specialization || null,
      locationPreference: currentProfile?.locationPreference || null,
      budget: currentProfile?.budget || null,
      hostel: currentProfile?.hostel || null,
      ownershipPreference: currentProfile?.ownershipPreference || null,
      naacPreference: currentProfile?.naacPreference || null,
      expectedPackage: currentProfile?.expectedPackage || null,
    };

    // Keyword Extractor for Profile Fields
    const textLower = fullConversationText.toLowerCase();

    // 1. Stream
    if (!profile.stream) {
      if (/engineering|b\.tech|tnea|jee/i.test(textLower)) profile.stream = "Engineering";
      else if (/medical|neet|mbbs|nursing/i.test(textLower)) profile.stream = "Medical";
      else if (/management|mba|cat|mat|bba/i.test(textLower)) profile.stream = "Management";
      else if (/arts|science|bca|bsc|ba/i.test(textLower)) profile.stream = "Arts & Science";
      else if (/law|llb|clat/i.test(textLower)) profile.stream = "Law";
      else if (/commerce|ca|cs|b.com/i.test(textLower)) profile.stream = "Commerce";
      else if (/agriculture/i.test(textLower)) profile.stream = "Agriculture";
      else if (/architecture/i.test(textLower)) profile.stream = "Architecture";
    }

    // 2. Score 12th
    if (!profile.score12th) {
      const scoreMatch = textLower.match(/(?:12th|hsc|marks|percentage|score)?\s*(?:is|was|=|:)?\s*(\d{2}(?:\.\d+)?)\s*%/i);
      if (scoreMatch) profile.score12th = `${scoreMatch[1]}%`;
      else if (textLower.includes("95%")) profile.score12th = "95%+";
      else if (textLower.includes("90")) profile.score12th = "90–95%";
      else if (textLower.includes("85")) profile.score12th = "85–90%";
      else if (textLower.includes("75")) profile.score12th = "75–85%";
    }

    // 3. Specialization / Course
    if (!profile.specialization) {
      if (/computer science|cse|ai|artificial intelligence|data science/i.test(textLower)) profile.specialization = "Computer Science & AI";
      else if (/electronics|ece|communication/i.test(textLower)) profile.specialization = "Electronics & Communication";
      else if (/biotech|biotechnology/i.test(textLower)) profile.specialization = "Biotechnology";
      else if (/mechanical|mech/i.test(textLower)) profile.specialization = "Mechanical Engineering";
      else if (/bca|bachelor of computer/i.test(textLower)) profile.specialization = "BCA";
      else if (/mba|finance|marketing/i.test(textLower)) profile.specialization = "MBA";
    }

    // 4. Budget
    if (!profile.budget) {
      if (textLower.includes("under 1l") || textLower.includes("1 lakh") || textLower.includes("100000")) profile.budget = "Under ₹1L / yr";
      else if (textLower.includes("1l – 2l") || textLower.includes("2 lakh") || textLower.includes("200000")) profile.budget = "₹1L – ₹2L / yr";
      else if (textLower.includes("2l – 4l") || textLower.includes("4 lakh") || textLower.includes("400000")) profile.budget = "₹2L – ₹4L / yr";
      else if (textLower.includes("4l+") || textLower.includes("above 4l")) profile.budget = "₹4L+ / yr";
    }

    // 5. Hostel
    if (!profile.hostel) {
      if (/yes|hostel|boarding|on-campus/i.test(textLower)) profile.hostel = "Yes — On-campus hostel required";
      else if (/no|day scholar|commuting/i.test(textLower)) profile.hostel = "No — Day scholar / commuting";
    }

    // 6. Expected Package
    if (!profile.expectedPackage) {
      if (textLower.includes("4-6") || textLower.includes("4–6")) profile.expectedPackage = "₹4–6 LPA";
      else if (textLower.includes("6-10") || textLower.includes("6–10")) profile.expectedPackage = "₹6–10 LPA";
      else if (textLower.includes("10-15") || textLower.includes("10–15")) profile.expectedPackage = "₹10–15 LPA";
      else if (textLower.includes("15+")) profile.expectedPackage = "₹15+ LPA";
    }

    // 7. Location Preference
    if (!profile.locationPreference) {
      const cityMatch = textLower.match(/in\s+(chennai|coimbatore|madurai|trichy|salem|vellore|bangalore|hyderabad|delhi|mumbai)/i);
      if (cityMatch) profile.locationPreference = cityMatch[1].toUpperCase();
    }

    // Perform REAL DATABASE QUERY (Strict Anti-Hallucination)
    const dbColleges = await db.collegeProfile.findMany({
      include: {
        courses: true,
        placements: true,
      },
    });

    const budgetLimit = parseBudgetLimit(profile.budget);
    const targetPkg = parsePackageTarget(profile.expectedPackage);
    const scoreVal = parseScoreValue(profile.score12th);

    const scoredColleges: RecommendationResult[] = [];

    for (const col of dbColleges) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Stream & Course Match (30 pts)
      let courseMatchTitle = "";
      let courseMatchFee: number | null = null;

      if (profile.specialization || profile.stream) {
        const specTerm = (profile.specialization || profile.stream || "").toLowerCase();
        const matchedCourse = col.courses.find((c) => {
          const title = c.title.toLowerCase();
          return title.includes(specTerm) || specTerm.split(" ").some((w) => w.length > 2 && title.includes(w));
        });

        if (matchedCourse) {
          score += 30;
          courseMatchTitle = matchedCourse.title;
          courseMatchFee = matchedCourse.feesPerYear;
          reasons.push(`✔ ${matchedCourse.title} Course Available`);
        } else if (col.categories && col.categories.toLowerCase().includes((profile.stream || "").toLowerCase())) {
          score += 20;
          reasons.push(`✔ Offers ${profile.stream} Programs`);
        }
      } else {
        score += 20; // Default base course points if student hasn't selected stream yet
      }

      // 2. Budget & Fee Fit (25 pts)
      const annualFee = courseMatchFee || col.feesPerYear;
      if (annualFee > 0) {
        if (annualFee <= budgetLimit) {
          score += 25;
          reasons.push(`✔ Annual Fee (₹${annualFee.toLocaleString("en-IN")}) fits within your budget (₹${budgetLimit.toLocaleString("en-IN")})`);
        } else if (annualFee <= budgetLimit * 1.25) {
          score += 15;
          reasons.push(`✔ Annual Fee (₹${annualFee.toLocaleString("en-IN")}) close to budget limit`);
        }
      } else {
        reasons.push(`✔ Fee Details Available on Official Request`);
      }

      // 3. Placement Fit (20 pts)
      const avgPkg = col.avgPackage || 0;
      const highestPkg = col.highestPackage || 0;

      if (avgPkg >= targetPkg || highestPkg >= targetPkg * 1.5) {
        score += 20;
        reasons.push(`✔ Placement Record: Average ₹${avgPkg} LPA | Highest ₹${highestPkg} LPA`);
      } else if (avgPkg > 0) {
        score += 12;
        reasons.push(`✔ Placement Average: ₹${avgPkg} LPA`);
      } else {
        reasons.push(`⚠ Placement Data: Direct Campus Verification Recommended`);
      }

      // 4. Hostel & Facilities (15 pts)
      const needsHostel = (profile.hostel || "").toLowerCase().includes("yes");
      if (needsHostel) {
        if (col.hostelAvailable) {
          score += 15;
          reasons.push(`✔ Verified On-Campus Hostel & Mess Available`);
        } else {
          reasons.push(`⚠ Off-Campus PG / Private Boarding Option`);
        }
      } else {
        score += 15;
      }

      // 5. NAAC & NIRF Rankings (10 pts)
      if (col.naacGrade) {
        score += 6;
        reasons.push(`✔ NAAC Accredited Grade ${col.naacGrade}`);
      }
      if (col.nirfRank && col.nirfRank <= 100) {
        score += 4;
        reasons.push(`✔ NIRF Rank #${col.nirfRank} among Top Colleges in India`);
      }

      // 6. Location Preference Match
      if (profile.locationPreference && col.city && col.city.toUpperCase().includes(profile.locationPreference)) {
        score += 10;
        reasons.push(`✔ Located in preferred location (${col.city})`);
      }

      const matchScore = Math.min(98, Math.max(65, Math.round(score)));

      // Real Data Rationale Generation
      const rationaleText =
        `${col.name} is recommended with a ${matchScore}% match score. ` +
        `It offers ${courseMatchTitle || "degree programs"}, has an annual fee of ₹${annualFee.toLocaleString("en-IN")}, ` +
        `and reports an average placement CTC of ₹${avgPkg} LPA (Highest: ₹${highestPkg} LPA). ` +
        (col.naacGrade ? `Accredited with NAAC Grade ${col.naacGrade}` : "Verified institutional profile.");

      scoredColleges.push({
        id: col.id,
        name: col.name,
        shortName: col.shortName,
        slug: col.slug,
        logo: col.logo,
        image: col.image || col.banner || "/images/campus-hero.jpg",
        banner: col.banner,
        location: `${col.city || col.area || col.location}, ${col.state}`,
        city: col.city,
        state: col.state,
        type: col.type,
        ownership: col.ownership,
        fees: annualFee,
        courseWiseFees: col.courseWiseFees,
        hostelFees: col.hostelFees || col.hostelFeePerYear,
        avgPackage: col.avgPackage,
        highestPackage: col.highestPackage,
        naacGrade: col.naacGrade,
        nirfRank: col.nirfRank,
        approval: col.approval,
        hostelAvailable: col.hostelAvailable,
        website: col.website,
        matchScore,
        matchReasons: reasons,
        rationale: rationaleText,
      });
    }

    // Sort by highest match score
    scoredColleges.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommendations = scoredColleges.slice(0, 4);

    // AI Conversational Response Generation with Gemini
    let replyMessage = "";

    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const topCollegesSummary = topRecommendations
          .map((r) => `- ${r.name} (${r.location}): ${r.matchScore}% Match. Fee: ₹${r.fees.toLocaleString("en-IN")}/yr, Avg CTC: ₹${r.avgPackage} LPA, NAAC: ${r.naacGrade || "N/A"}`)
          .join("\n");

        const prompt = `
You are the lead Admissions Counselor for C2Talents with 20+ years of higher education expertise in India.
Student Profile Context:
- Stream: ${profile.stream || "Not specified yet"}
- 12th Score: ${profile.score12th || "Not specified yet"}
- Preferred Specialization: ${profile.specialization || "Not specified yet"}
- Annual Budget: ${profile.budget || "Not specified yet"}
- Hostel Required: ${profile.hostel || "Not specified yet"}
- Target Package: ${profile.expectedPackage || "Not specified yet"}

Top Verified Recommendations Sourced from Database:
${topCollegesSummary}

User's Latest Question / Message:
"${message}"

Instructions:
1. Speak naturally, warmly, and authoritatively like an experienced counselor on ChatGPT.
2. If the user asks a question or mentions a preference, answer directly using the real database facts above.
3. If profile fields are missing, answer their question first, then ask the SINGLE next logical missing question (e.g. 10th/12th marks, stream, or city preference).
4. Do NOT make up any fake numbers or unlisted colleges.
`;

        const aiRes = await model.generateContent(prompt);
        replyMessage = aiRes.response.text().trim();
      } catch (e) {
        // Fallback natural text generator
        replyMessage = generateFallbackCounselorText(message, profile, topRecommendations);
      }
    } else {
      replyMessage = generateFallbackCounselorText(message, profile, topRecommendations);
    }

    const dreamColleges = scoredColleges.filter((c) => (c.nirfRank && c.nirfRank <= 40) || c.highestPackage >= 12 || c.naacGrade === "A++").slice(0, 3);
    const bestMatches = scoredColleges.filter((c) => c.matchScore >= 85).slice(0, 4);
    const safeColleges = scoredColleges.filter((c) => c.matchScore >= 70 && c.fees <= budgetLimit).slice(0, 3);

    return NextResponse.json({
      reply: replyMessage,
      extractedProfile: profile,
      recommendations: topRecommendations,
      dreamColleges: dreamColleges.length ? dreamColleges : topRecommendations.slice(0, 2),
      bestMatches: bestMatches.length ? bestMatches : topRecommendations,
      safeColleges: safeColleges.length ? safeColleges : topRecommendations.slice(-2),
    });
  } catch (err: any) {
    console.error("❌ [COUNSELOR API ERROR]:", err);
    return NextResponse.json(
      { message: "Counselor service error: " + (err.message || "Failed to process chat") },
      { status: 500 }
    );
  }
}

function generateFallbackCounselorText(userMessage: string, profile: StudentProfile, topRecs: RecommendationResult[]): string {
  if (!profile.stream) {
    return "Hello! 👋 I am your C2Talents AI Admission Counselor. I will help you find the best colleges based on your academic profile.\n\nTo get started, which academic stream are you interested in?";
  }
  if (!profile.score12th) {
    return `Got it! You are looking for ${profile.stream} programs. What is your 12th Board / HSC percentage or entrance score?`;
  }
  if (!profile.budget) {
    return `Great! I've recorded your ${profile.score12th} score. What is your preferred annual tuition fee budget?`;
  }

  if (topRecs.length > 0) {
    const top = topRecs[0];
    return (
      `Based on your profile (${profile.stream || "General"}, ${profile.score12th || "80%"}, Budget: ${profile.budget || "₹2L/yr"}), ` +
      `I found ${topRecs.length} verified matching colleges in our database.\n\n` +
      `Your best match is **${top.name}** with a **${top.matchScore}% Match Score**. It offers strong placements (Avg ₹${top.avgPackage} LPA) and annual fees within your budget. ` +
      `Would you like me to compare it with other top recommendations?`
    );
  }

  return "I have updated your profile preferences and searched our live database. Take a look at the verified recommendations below!";
}

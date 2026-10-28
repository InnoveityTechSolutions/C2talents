import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, generateCollegePublishedEmailHtml } from "@/lib/email";
import { upsertCollegeCourses } from "@/lib/courses/courseDeduplication";
import { normalizeAndDeduplicateContactNumbers } from "@/lib/ai/contactNormalizer";

export const dynamic = "force-dynamic";

function safeFloat(val: any, defaultVal: number | null = null): number | null {
  if (val === null || val === undefined || val === "") return defaultVal;
  const parsed = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(parsed) ? defaultVal : parsed;
}

function safeInt(val: any, defaultVal: number | null = null): number | null {
  if (val === null || val === undefined || val === "") return defaultVal;
  const parsed = typeof val === "number" ? val : parseInt(String(val).replace(/[^0-9-]/g, ""), 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

function safeUrl(rawUrl: any, defaultFallback: string | null = null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return defaultFallback;
  const trimmed = rawUrl.trim();
  if (!trimmed) return defaultFallback;
  return trimmed;
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const registrationRequest = await db.collegeRegistrationRequest.findUnique({
      where: { id },
    });

    if (!registrationRequest) {
      return NextResponse.json({ error: "Registration request not found." }, { status: 404 });
    }

    if (!registrationRequest.submittedData) {
      return NextResponse.json(
        { error: "No profile data submitted yet for this college." },
        { status: 400 }
      );
    }

    let payload: any = {};
    try {
      payload = JSON.parse(registrationRequest.submittedData);
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse submitted college profile data." }, { status: 400 });
    }

    const collegeName = payload.name || registrationRequest.collegeName;

    // 1. Resolve target CollegeProfile ID (check explicit link, email owner, or domain/name match)
    let targetCollegeId = registrationRequest.publishedCollegeId;
    const candidateEmail = (payload.email || registrationRequest.email || "").trim().toLowerCase();

    if (!targetCollegeId && candidateEmail) {
      const userMatch = await db.user.findUnique({
        where: { email: candidateEmail },
        include: { college: true },
      });
      if (userMatch?.college) {
        targetCollegeId = userMatch.college.id;
      }
    }

    if (!targetCollegeId) {
      const websiteUrl = payload.website || registrationRequest.website;
      let domain = "";
      if (websiteUrl) {
        try {
          domain = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`).hostname.replace(/^www\./, "");
        } catch (e) {}
      }

      const match = await db.collegeProfile.findFirst({
        where: {
          OR: [
            { name: collegeName.trim() },
            ...(domain ? [{ website: { contains: domain } }] : []),
          ],
        },
      });
      if (match) {
        targetCollegeId = match.id;
      }
    }

    let baseSlug = (payload.slug || collegeName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!baseSlug) baseSlug = `college-${Date.now()}`;

    let finalSlug = baseSlug;
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.collegeProfile.findUnique({ where: { slug: finalSlug } });
      if (!existing || (targetCollegeId && existing.id === targetCollegeId) || (registrationRequest.publishedCollegeId && existing.id === registrationRequest.publishedCollegeId)) {
        break;
      }
      finalSlug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;
      attempts++;
    }

    let publishedCollege: any;

    const normalizedContacts = normalizeAndDeduplicateContactNumbers(
      payload.phone,
      payload.mobile || (registrationRequest.mobile !== "9999999999" ? registrationRequest.mobile : "")
    );

    if (targetCollegeId) {
      // Update existing published CollegeProfile
      publishedCollege = await db.collegeProfile.update({
        where: { id: targetCollegeId },
        data: {
          name: collegeName.trim(),
          shortName: payload.shortName || collegeName.slice(0, 5).toUpperCase(),
          slug: finalSlug,
          description: payload.description || payload.aboutText || `${collegeName} is a leading institution in ${payload.location || registrationRequest.location}.`,
          location: payload.location || registrationRequest.location,
          address: payload.address || "",
          landmark: payload.landmark || "",
          area: payload.area || "",
          city: payload.city || registrationRequest.location.split(",")[0] || "Chennai",
          district: payload.district || payload.city || "Chennai",
          state: payload.state || "Tamil Nadu",
          pincode: payload.pincode || "",
          latitude: safeFloat(payload.latitude),
          longitude: safeFloat(payload.longitude),
          googleMapUrl: safeUrl(payload.googleMapUrl),
          phone: normalizedContacts.phone || payload.phone || "",
          mobile: normalizedContacts.mobile || "",
          email: payload.email || registrationRequest.email,
          website: safeUrl(payload.website || registrationRequest.website),
          facebook: safeUrl(payload.facebook),
          instagram: safeUrl(payload.instagram),
          linkedin: safeUrl(payload.linkedin),
          youtube: safeUrl(payload.youtube),
          type: payload.type || payload.ownership || "Private",
          ownership: payload.ownership || payload.type || "Private",
          category: payload.category || "Engineering",
          categories: Array.isArray(payload.categories) ? payload.categories.join(", ") : payload.categories || "",
          affiliatedUniversity: payload.affiliatedUniversity || "",
          isAutonomous: Boolean(payload.isAutonomous),
          accreditation: payload.accreditation || "",
          approval: payload.approval || "AICTE, UGC",
          aicteApproved: Boolean(payload.aicteApproved ?? true),
          ugcApproved: Boolean(payload.ugcApproved ?? true),
          naacGrade: payload.naacGrade || "A",
          nirfRank: safeInt(payload.nirfRank),
          feesPerYear: safeFloat(payload.feesPerYear, 0) ?? 0,
          courseWiseFees: payload.courseWiseFees || "",
          hostelFees: safeFloat(payload.hostelFees),
          transportFees: safeFloat(payload.transportFees),
          scholarshipDetails: payload.scholarshipDetails || "",
          educationLoanDetails: payload.educationLoanDetails || "",
          facilities: Array.isArray(payload.facilities) ? payload.facilities.join(", ") : payload.facilities || "",
          avgPackage: safeFloat(payload.avgPackage, 0) ?? 0,
          highestPackage: safeFloat(payload.highestPackage, 0) ?? 0,
          placementPercentage: safeFloat(payload.placementPercentage),
          internshipDetails: payload.internshipDetails || "",
          topRecruiters: payload.topRecruiters || "",
          admissionEligibility: payload.admissionEligibility || "",
          admissionProcess: payload.admissionProcess || "",
          documentsRequired: payload.documentsRequired || "",
          counsellingInfo: payload.counsellingInfo || "",
          admissionEntranceExams: payload.admissionEntranceExams || "",
          importantDates: payload.importantDates || "",
          hostelAvailable: Boolean(payload.hostelAvailable),
          boysHostel: Boolean(payload.boysHostel),
          girlsHostel: Boolean(payload.girlsHostel),
          acRooms: Boolean(payload.acRooms),
          messAvailable: Boolean(payload.messAvailable),
          hostelFeePerYear: safeFloat(payload.hostelFeePerYear),
          image: safeUrl(payload.image || payload.banner, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80")!,
          logo: safeUrl(payload.logo, "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80"),
          banner: safeUrl(payload.banner || payload.image, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"),
          estYear: safeInt(payload.estYear),
          seoTitle: payload.seoTitle || `${collegeName} Admissions, Courses & Fees`,
          seoDescription: payload.seoDescription || `Official profile details for ${collegeName}.`,
          metaKeywords: payload.metaKeywords || "",
          status: "PUBLISHED",
          featured: Boolean(payload.featured ?? true),
          trending: Boolean(payload.trending ?? true),
        },
      });
    } else {
      // Create fresh User account and CollegeProfile record safely without email constraint errors
      let targetUserId: string;

      const existingUser = candidateEmail
        ? await db.user.findUnique({ where: { email: candidateEmail }, include: { college: true } })
        : null;

      if (existingUser && !existingUser.college) {
        // Reuse this unlinked user account
        targetUserId = existingUser.id;
      } else {
        let uniqueEmail = candidateEmail && !existingUser ? candidateEmail : null;
        if (!uniqueEmail) {
          const cleanSlug = finalSlug.replace(/[^a-z0-9]/g, "").slice(0, 15);
          uniqueEmail = `college_${cleanSlug}_${Date.now()}@c2talents.com`;
        }

        const newUser = await db.user.create({
          data: {
            email: uniqueEmail,
            passwordHash: "saas_verified_college_hash",
            role: "COLLEGE",
            name: collegeName,
          },
        });
        targetUserId = newUser.id;
      }

      publishedCollege = await db.collegeProfile.create({
        data: {
          userId: targetUserId,
          name: collegeName.trim(),
          shortName: payload.shortName || collegeName.slice(0, 5).toUpperCase(),
          slug: finalSlug,
          description: payload.description || payload.aboutText || `${collegeName} is a leading educational institution in ${payload.location || registrationRequest.location}.`,
          location: payload.location || registrationRequest.location,
          address: payload.address || "",
          landmark: payload.landmark || "",
          area: payload.area || "",
          city: payload.city || registrationRequest.location.split(",")[0] || "Chennai",
          district: payload.district || payload.city || "Chennai",
          state: payload.state || "Tamil Nadu",
          pincode: payload.pincode || "",
          latitude: safeFloat(payload.latitude),
          longitude: safeFloat(payload.longitude),
          googleMapUrl: safeUrl(payload.googleMapUrl),
          phone: normalizedContacts.phone || payload.phone || "",
          mobile: normalizedContacts.mobile || "",
          email: payload.email || registrationRequest.email,
          website: safeUrl(payload.website || registrationRequest.website),
          facebook: safeUrl(payload.facebook),
          instagram: safeUrl(payload.instagram),
          linkedin: safeUrl(payload.linkedin),
          youtube: safeUrl(payload.youtube),
          type: payload.type || payload.ownership || "Private",
          ownership: payload.ownership || payload.type || "Private",
          category: payload.category || "Engineering",
          categories: Array.isArray(payload.categories) ? payload.categories.join(", ") : payload.categories || "",
          affiliatedUniversity: payload.affiliatedUniversity || "",
          isAutonomous: Boolean(payload.isAutonomous),
          accreditation: payload.accreditation || "",
          approval: payload.approval || "AICTE, UGC",
          aicteApproved: Boolean(payload.aicteApproved ?? true),
          ugcApproved: Boolean(payload.ugcApproved ?? true),
          naacGrade: payload.naacGrade || "A",
          nirfRank: safeInt(payload.nirfRank),
          feesPerYear: safeFloat(payload.feesPerYear, 0) ?? 0,
          courseWiseFees: payload.courseWiseFees || "",
          hostelFees: safeFloat(payload.hostelFees),
          transportFees: safeFloat(payload.transportFees),
          scholarshipDetails: payload.scholarshipDetails || "",
          educationLoanDetails: payload.educationLoanDetails || "",
          facilities: Array.isArray(payload.facilities) ? payload.facilities.join(", ") : payload.facilities || "",
          avgPackage: safeFloat(payload.avgPackage, 0) ?? 0,
          highestPackage: safeFloat(payload.highestPackage, 0) ?? 0,
          placementPercentage: safeFloat(payload.placementPercentage),
          internshipDetails: payload.internshipDetails || "",
          topRecruiters: payload.topRecruiters || "",
          admissionEligibility: payload.admissionEligibility || "",
          admissionProcess: payload.admissionProcess || "",
          documentsRequired: payload.documentsRequired || "",
          counsellingInfo: payload.counsellingInfo || "",
          admissionEntranceExams: payload.admissionEntranceExams || "",
          importantDates: payload.importantDates || "",
          hostelAvailable: Boolean(payload.hostelAvailable),
          boysHostel: Boolean(payload.boysHostel),
          girlsHostel: Boolean(payload.girlsHostel),
          acRooms: Boolean(payload.acRooms),
          messAvailable: Boolean(payload.messAvailable),
          hostelFeePerYear: safeFloat(payload.hostelFeePerYear),
          image: safeUrl(payload.image || payload.banner, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80")!,
          logo: safeUrl(payload.logo, "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80"),
          banner: safeUrl(payload.banner || payload.image, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"),
          estYear: safeInt(payload.estYear),
          seoTitle: payload.seoTitle || `${collegeName} Admissions, Courses & Fees`,
          seoDescription: payload.seoDescription || `Official profile details for ${collegeName}.`,
          metaKeywords: payload.metaKeywords || "",
          status: "PUBLISHED",
          featured: Boolean(payload.featured ?? true),
          trending: Boolean(payload.trending ?? true),
        },
      });
    }

    // 1. Upsert Courses (Section 4)
    if (Array.isArray(payload.courses) && payload.courses.length > 0) {
      await upsertCollegeCourses(publishedCollege.id, payload.courses);
    }

    // 2. Upsert Gallery Images (Section 12)
    if (Array.isArray(payload.galleryImages) && payload.galleryImages.length > 0) {
      await db.galleryImage.deleteMany({ where: { collegeId: publishedCollege.id } });
      await db.galleryImage.createMany({
        data: payload.galleryImages
          .map((g: any) => ({
            collegeId: publishedCollege.id,
            url: typeof g === "string" ? safeUrl(g) : safeUrl(g?.url),
            altText: typeof g === "object" && g?.altText ? String(g.altText) : `${collegeName} Campus`,
            caption: typeof g === "object" && g?.caption ? String(g.caption) : "Campus Infrastructure",
            tags: typeof g === "object" && g?.tags ? String(g.tags) : "campus",
          }))
          .filter((img: any) => Boolean(img.url)),
      });
    }

    // 3. Upsert College Content (Section 13)
    const contentPayload = payload.collegeContent || payload.content || {};
    const hasContent = Boolean(
      contentPayload.overview ||
      contentPayload.about ||
      contentPayload.history ||
      contentPayload.highlights ||
      payload.overview ||
      payload.about
    );

    if (hasContent) {
      const contentData = {
        overview: contentPayload.overview || payload.overview || null,
        about: contentPayload.about || payload.about || null,
        history: contentPayload.history || null,
        highlights: contentPayload.highlights || null,
        whyChoose: contentPayload.whyChoose || null,
        campusLife: contentPayload.campusLife || null,
        facilitiesDescription: contentPayload.facilitiesDescription || null,
        placementOverview: contentPayload.placementOverview || null,
        topRecruiters: contentPayload.topRecruiters || null,
        admissionGuide: contentPayload.admissionGuide || null,
        eligibility: contentPayload.eligibility || null,
        hostelLife: contentPayload.hostelLife || null,
        scholarships: contentPayload.scholarships || null,
        research: contentPayload.research || null,
        studentActivities: contentPayload.studentActivities || null,
        faq: contentPayload.faq || null,
        seoArticle: contentPayload.seoArticle || null,
        contentStatus: "PUBLISHED",
      };

      await db.collegeContent.upsert({
        where: { collegeId: publishedCollege.id },
        create: {
          collegeId: publishedCollege.id,
          ...contentData,
        },
        update: contentData,
      });
    }

    // 4. Upsert Student Reviews (Section 14)
    const reviewsList = Array.isArray(payload.reviews) && payload.reviews.length > 0
      ? payload.reviews
      : Array.isArray(payload.studentReviews) && payload.studentReviews.length > 0
      ? payload.studentReviews
      : [];

    if (reviewsList.length > 0) {
      await db.review.deleteMany({ where: { collegeId: publishedCollege.id } });
      await db.review.createMany({
        data: reviewsList.map((r: any) => ({
          collegeId: publishedCollege.id,
          studentName: r.studentName || r.reviewerName || "Verified Student",
          course: r.course || "Undergraduate / Postgraduate",
          batchYear: safeInt(r.batchYear) || new Date().getFullYear(),
          title: r.title || "Academic & Campus Experience",
          rating: safeFloat(r.rating, 4.2) ?? 4.2,
          academicRating: safeFloat(r.academicRating, 4.5) ?? 4.5,
          infrastructureRating: safeFloat(r.infrastructureRating, 4.0) ?? 4.0,
          placementRating: safeFloat(r.placementRating, 4.2) ?? 4.2,
          campusRating: safeFloat(r.campusRating, 4.0) ?? 4.0,
          valueForMoneyRating: safeFloat(r.valueForMoneyRating, 4.5) ?? 4.5,
          likes: r.likes || r.pros || "",
          dislikes: r.dislikes || r.cons || "",
          content: r.content || r.review || r.likes || "Feedback based on academic curriculum and college facilities.",
          helpfulCount: safeInt(r.helpfulCount) || 12,
          isVerified: Boolean(r.isVerified ?? true),
        })),
      });
    }

    // Update CollegeRegistrationRequest status to PUBLISHED
    const updatedRequest = await db.collegeRegistrationRequest.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedCollegeId: publishedCollege.id,
        adminNotes: "Profile reviewed and published live onto C2Talents.",
      },
    });

    // Safely send live published confirmation email to college
    try {
      const recipientEmail = publishedCollege.email || registrationRequest.email;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://c2talents.com";
      const liveUrl = `${appUrl}/colleges/${publishedCollege.slug}`;

      const { generateCollegePublishedEmailDetails } = await import("@/lib/email");
      const { subject: dynamicSubject, html: emailHtml } = await generateCollegePublishedEmailDetails({
        collegeName: publishedCollege.name,
        contactPerson: registrationRequest.contactPerson,
        collegeSlug: publishedCollege.slug,
        liveUrl,
      });

      await sendEmail({
        to: recipientEmail,
        subject: dynamicSubject,
        html: emailHtml,
      });
    } catch (emailErr: any) {
      console.warn(`[PUBLISH EMAIL NOTICE]: Live publication email skipped for ${collegeName}:`, emailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `${collegeName} has been published successfully and is now live on C2Talents!`,
      publishedCollege,
      request: updatedRequest,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/submitted-colleges/[id]/publish Error]:", err);
    return NextResponse.json(
      { error: "Failed to publish college profile: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}

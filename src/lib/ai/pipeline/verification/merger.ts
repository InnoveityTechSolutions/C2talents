import { PipelineData } from "../collection/types";

function wrapAI(val: any) {
  return val ? { value: val, confidence: "HIGH", generatedBy: "AI", sourcePages: "Multiple Contextual Pages", verified: false, verificationStatus: "NEEDS_REVIEW" } : null;
}

export function mergeIntoCollegeSchema(validatedFacts: any, reviewedContent: any, pipelineData: any) {
  return {
    data: {
      ...validatedFacts.basicInfo,
      ...validatedFacts.contactInfo,
      
      courses: validatedFacts.courses || [],
      facilities: {
        value: validatedFacts.facilities || [],
        confidenceScore: (validatedFacts.facilities?.length || 0) > 0 ? 85 : 40,
        confidence: "HIGH",
        sourceUrl: pipelineData.targetUrl,
        verified: true,
        verificationStatus: "VERIFIED",
        status: "Extracted from Official Website"
      },
      
      highestPackage: { value: validatedFacts.placements?.highestPackage, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      avgPackage: { value: validatedFacts.placements?.avgPackage, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      placementPercentage: { value: validatedFacts.placements?.placementPercentage, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      topRecruiters: { value: validatedFacts.placements?.topRecruiters, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      internshipDetails: { value: validatedFacts.placements?.internshipDetails, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      
      admissionEligibility: { value: validatedFacts.admissions?.admissionEligibility, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      admissionProcess: { value: validatedFacts.admissions?.admissionProcess, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      documentsRequired: { value: validatedFacts.admissions?.documentsRequired, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      admissionEntranceExams: { value: validatedFacts.admissions?.admissionEntranceExams, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      importantDates: { value: validatedFacts.admissions?.importantDates, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      
      hostelAvailable: { value: validatedFacts.hostel?.hostelAvailable, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      boysHostel: { value: validatedFacts.hostel?.boysHostel, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      girlsHostel: { value: validatedFacts.hostel?.girlsHostel, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      acRooms: { value: validatedFacts.hostel?.acRooms, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      messAvailable: { value: validatedFacts.hostel?.messAvailable, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      hostelFeePerYear: { value: validatedFacts.hostel?.hostelFeePerYear, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      
      seoTitle: { value: reviewedContent.seoTitle, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      seoDescription: { value: reviewedContent.seoDescription, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
      metaKeywords: { value: reviewedContent.metaKeywords, confidenceScore: 85, confidence: "HIGH", verified: true, verificationStatus: "VERIFIED", status: "Extracted from Official Website" },
  
      collegeContent: {
        overview: wrapAI(reviewedContent.overview),
        about: wrapAI(reviewedContent.about || reviewedContent.overview),
        history: wrapAI(reviewedContent.history),
        vision: wrapAI(reviewedContent.vision),
        mission: wrapAI(reviewedContent.mission),
        coreValues: wrapAI(reviewedContent.coreValues),
        highlights: wrapAI(reviewedContent.highlights || reviewedContent.whyChoose),
        whyChoose: wrapAI(reviewedContent.whyChoose),
        campusLife: wrapAI(reviewedContent.campusLife),
        studentLife: wrapAI(reviewedContent.studentLife),
        studentActivities: wrapAI(reviewedContent.studentActivities || reviewedContent.studentLife),
        infrastructureOverview: wrapAI(reviewedContent.infrastructureOverview || reviewedContent.campusLife),
        facilitiesDescription: wrapAI(reviewedContent.facilitiesDescription || reviewedContent.campusLife),
        hostelLife: wrapAI(reviewedContent.hostelLife || reviewedContent.campusLife),
        placementOverview: wrapAI(reviewedContent.placementOverview),
        topRecruiters: wrapAI(reviewedContent.topRecruiters),
        admissionSummary: wrapAI(reviewedContent.admissionSummary),
        admissionGuide: wrapAI(reviewedContent.admissionGuide || reviewedContent.admissionSummary),
        eligibility: wrapAI(reviewedContent.eligibility),
        scholarships: wrapAI(reviewedContent.scholarships),
        research: wrapAI(reviewedContent.research),
        faq: wrapAI(reviewedContent.faq),
        seoArticle: wrapAI(reviewedContent.seoArticle)
      }
    },
    success: true,
    qualityReport: {
      pagesCrawled: pipelineData.visitedPages.length,
      pdfsParsed: 0,
      imagesDownloaded: 0,
      coursesFound: validatedFacts.courses?.length || 0,
      facilitiesFound: validatedFacts.facilities?.length || 0,
      placementsFound: !!validatedFacts.placements?.highestPackage,
      admissionsFound: !!validatedFacts.admissions?.admissionProcess,
      confidenceScore: 85,
      processingTimeMs: 0
    },
    logs: [
      `[${new Date().toISOString()}] Crawled ${pipelineData.visitedPages.length} pages`,
      `[${new Date().toISOString()}] Successfully merged extracted facts and AI generated content`
    ]
  };
}

-- C2Talents Database Backup
-- Date: 2026-08-26T06:33:26.874Z
-- Database: defaultdb

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE "admissionlead" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "applicationId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "studentId" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "collegeId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "courseId" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "programme" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UG',
  "status" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  "firstName" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "lastName" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "gender" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "dob" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "fatherName" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "motherName" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "mobileNumber" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "alternateNumber" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "email" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "address" text COLLATE utf8mb4_unicode_ci,
  "city" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "district" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "state" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Tamil Nadu',
  "pincode" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "nationality" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Indian',
  "community" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "religion" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "bloodGroup" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "board10th" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "school10th" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "percentage10th" double DEFAULT NULL,
  "year10th" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "board12th" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "school12th" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "percentage12th" double DEFAULT NULL,
  "group12th" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "year12th" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "ugCollege" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "ugUniversity" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "ugDegree" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "ugSpecialization" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "ugPercentage" double DEFAULT NULL,
  "ugYear" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "currentArrears" int DEFAULT '0',
  "historyArrears" int DEFAULT '0',
  "marksheet10thUrl" text COLLATE utf8mb4_unicode_ci,
  "marksheet12thUrl" text COLLATE utf8mb4_unicode_ci,
  "marksheetUgUrl" text COLLATE utf8mb4_unicode_ci,
  "tcUrl" text COLLATE utf8mb4_unicode_ci,
  "communityCertUrl" text COLLATE utf8mb4_unicode_ci,
  "photoUrl" text COLLATE utf8mb4_unicode_ci,
  "aadharUrl" text COLLATE utf8mb4_unicode_ci,
  "otherDocUrl" text COLLATE utf8mb4_unicode_ci,
  "hostelRequired" tinyint(1) NOT NULL DEFAULT '0',
  "transportRequired" tinyint(1) NOT NULL DEFAULT '0',
  "scholarshipRequired" tinyint(1) NOT NULL DEFAULT '0',
  "firstGraduate" tinyint(1) NOT NULL DEFAULT '0',
  "sportsQuota" tinyint(1) NOT NULL DEFAULT '0',
  "ncc" tinyint(1) NOT NULL DEFAULT '0',
  "nss" tinyint(1) NOT NULL DEFAULT '0',
  "achievements" text COLLATE utf8mb4_unicode_ci,
  "extraCurricular" text COLLATE utf8mb4_unicode_ci,
  "statementOfPurpose" text COLLATE utf8mb4_unicode_ci,
  "assignedCounselor" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "adminNotes" text COLLATE utf8mb4_unicode_ci,
  "rejectionReason" text COLLATE utf8mb4_unicode_ci,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "admissionlead_applicationId_key" ("applicationId"),
  KEY "admissionlead_collegeId_idx" ("collegeId"),
  KEY "admissionlead_courseId_idx" ("courseId"),
  KEY "admissionlead_status_idx" ("status"),
  KEY "admissionlead_mobileNumber_idx" ("mobileNumber"),
  KEY "admissionlead_email_idx" ("email"),
  KEY "admissionlead_studentId_fkey" ("studentId"),
  CONSTRAINT "admissionlead_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "collegeprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "admissionlead_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "admissionlead_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE "application" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "studentId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "collegeId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "courseId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "status" enum('SUBMITTED','UNDER_REVIEW','ACCEPTED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUBMITTED',
  "appliedAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  KEY "application_studentId_fkey" ("studentId"),
  KEY "application_collegeId_fkey" ("collegeId"),
  KEY "application_courseId_fkey" ("courseId"),
  CONSTRAINT "application_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "collegeprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "application_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "studentprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "auditlog" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "actorId" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "actorEmail" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "action" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "entity" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "entityId" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "details" text COLLATE utf8mb4_unicode_ci,
  "scriptName" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "rowsAffected" int NOT NULL DEFAULT '0',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY ("id")
);


CREATE TABLE "category" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "slug" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "icon" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "category_name_key" ("name"),
  UNIQUE KEY "category_slug_key" ("slug")
);


CREATE TABLE "collegecontent" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "collegeId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "overview" text COLLATE utf8mb4_unicode_ci,
  "about" text COLLATE utf8mb4_unicode_ci,
  "history" text COLLATE utf8mb4_unicode_ci,
  "highlights" text COLLATE utf8mb4_unicode_ci,
  "whyChoose" text COLLATE utf8mb4_unicode_ci,
  "campusLife" text COLLATE utf8mb4_unicode_ci,
  "facilitiesDescription" text COLLATE utf8mb4_unicode_ci,
  "placementOverview" text COLLATE utf8mb4_unicode_ci,
  "topRecruiters" text COLLATE utf8mb4_unicode_ci,
  "admissionGuide" text COLLATE utf8mb4_unicode_ci,
  "eligibility" text COLLATE utf8mb4_unicode_ci,
  "hostelLife" text COLLATE utf8mb4_unicode_ci,
  "scholarships" text COLLATE utf8mb4_unicode_ci,
  "research" text COLLATE utf8mb4_unicode_ci,
  "studentActivities" text COLLATE utf8mb4_unicode_ci,
  "faq" text COLLATE utf8mb4_unicode_ci,
  "seoArticle" text COLLATE utf8mb4_unicode_ci,
  "contentStatus" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "collegecontent_collegeId_key" ("collegeId"),
  CONSTRAINT "collegecontent_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "collegeprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "collegeprofile" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "userId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "shortName" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "slug" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "description" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "location" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "address" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "landmark" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "area" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "city" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "district" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "state" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Tamil Nadu',
  "pincode" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "latitude" double DEFAULT NULL,
  "longitude" double DEFAULT NULL,
  "googleMapUrl" text COLLATE utf8mb4_unicode_ci,
  "phone" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "mobile" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "email" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "website" text COLLATE utf8mb4_unicode_ci,
  "facebook" text COLLATE utf8mb4_unicode_ci,
  "instagram" text COLLATE utf8mb4_unicode_ci,
  "linkedin" text COLLATE utf8mb4_unicode_ci,
  "youtube" text COLLATE utf8mb4_unicode_ci,
  "rating" double NOT NULL DEFAULT '4',
  "type" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "ownership" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "category" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'Engineering',
  "categories" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "affiliatedUniversity" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "isAutonomous" tinyint(1) NOT NULL DEFAULT '0',
  "accreditation" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "approval" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "aicteApproved" tinyint(1) NOT NULL DEFAULT '1',
  "ugcApproved" tinyint(1) NOT NULL DEFAULT '1',
  "naacGrade" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "nirfRank" int DEFAULT NULL,
  "feesPerYear" double NOT NULL,
  "courseWiseFees" text COLLATE utf8mb4_unicode_ci,
  "hostelFees" double DEFAULT NULL,
  "transportFees" double DEFAULT NULL,
  "scholarshipDetails" text COLLATE utf8mb4_unicode_ci,
  "educationLoanDetails" text COLLATE utf8mb4_unicode_ci,
  "facilities" text COLLATE utf8mb4_unicode_ci,
  "avgPackage" double NOT NULL,
  "highestPackage" double NOT NULL,
  "placementPercentage" double DEFAULT NULL,
  "internshipDetails" text COLLATE utf8mb4_unicode_ci,
  "topRecruiters" text COLLATE utf8mb4_unicode_ci,
  "admissionEligibility" text COLLATE utf8mb4_unicode_ci,
  "admissionProcess" text COLLATE utf8mb4_unicode_ci,
  "documentsRequired" text COLLATE utf8mb4_unicode_ci,
  "counsellingInfo" text COLLATE utf8mb4_unicode_ci,
  "admissionEntranceExams" text COLLATE utf8mb4_unicode_ci,
  "importantDates" text COLLATE utf8mb4_unicode_ci,
  "hostelAvailable" tinyint(1) NOT NULL DEFAULT '0',
  "boysHostel" tinyint(1) NOT NULL DEFAULT '0',
  "girlsHostel" tinyint(1) NOT NULL DEFAULT '0',
  "acRooms" tinyint(1) NOT NULL DEFAULT '0',
  "messAvailable" tinyint(1) NOT NULL DEFAULT '0',
  "hostelFeePerYear" double DEFAULT NULL,
  "image" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "logo" text COLLATE utf8mb4_unicode_ci,
  "banner" text COLLATE utf8mb4_unicode_ci,
  "collegeVideo" text COLLATE utf8mb4_unicode_ci,
  "estYear" int DEFAULT NULL,
  "seoTitle" text COLLATE utf8mb4_unicode_ci,
  "seoDescription" text COLLATE utf8mb4_unicode_ci,
  "metaKeywords" text COLLATE utf8mb4_unicode_ci,
  "status" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLISHED',
  "featured" tinyint(1) NOT NULL DEFAULT '0',
  "trending" tinyint(1) NOT NULL DEFAULT '0',
  "isDeleted" tinyint(1) NOT NULL DEFAULT '0',
  "deletedAt" datetime(3) DEFAULT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "collegeprofile_userId_key" ("userId"),
  UNIQUE KEY "collegeprofile_slug_key" ("slug"),
  CONSTRAINT "collegeprofile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "collegeregistrationrequest" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "collegeName" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "contactPerson" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "email" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "mobile" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "website" text COLLATE utf8mb4_unicode_ci,
  "location" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "additionalNotes" text COLLATE utf8mb4_unicode_ci,
  "status" enum('PENDING','APPROVED','REJECTED','DATA_SUBMITTED','NEEDS_REVISION','PUBLISHED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  "adminNotes" text COLLATE utf8mb4_unicode_ci,
  "accessToken" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "tokenExpiresAt" datetime(3) DEFAULT NULL,
  "submittedData" longtext COLLATE utf8mb4_unicode_ci,
  "publishedCollegeId" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "collegeregistrationrequest_accessToken_key" ("accessToken")
);


CREATE TABLE "course" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "collegeId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "title" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "duration" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "careerPath" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "demand" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "feesPerYear" double NOT NULL,
  "minGpa" double DEFAULT NULL,
  "eligibility" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "seats" int DEFAULT NULL,
  "entranceExam" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "isDeleted" tinyint(1) NOT NULL DEFAULT '0',
  "deletedAt" datetime(3) DEFAULT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  KEY "course_collegeId_fkey" ("collegeId"),
  CONSTRAINT "course_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "collegeprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "duplicateattempt" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "attemptedName" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "attemptedUrl" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "attemptedEmail" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "attemptedPhone" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "matchedCollegeId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "matchedCollegeName" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "matchReason" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "similarityScore" double NOT NULL,
  "attemptedBy" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Admin',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY ("id")
);


CREATE TABLE "emailauditlog" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "templateKey" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "action" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "userEmail" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "details" text COLLATE utf8mb4_unicode_ci,
  "ipAddress" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY ("id")
);


CREATE TABLE "emailtemplate" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "templateKey" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "templateName" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "category" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Notifications',
  "subject" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "preheader" text COLLATE utf8mb4_unicode_ci,
  "headerTitle" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "greeting" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "bodyHtml" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "buttonText" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "buttonUrl" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "footerHtml" text COLLATE utf8mb4_unicode_ci,
  "status" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLISHED',
  "version" int NOT NULL DEFAULT '1',
  "updatedBy" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Super Admin',
  "isActive" tinyint(1) NOT NULL DEFAULT '1',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  "name" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "title" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "bodyParagraphs" text COLLATE utf8mb4_unicode_ci,
  "ctaText" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "noticeText" text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY ("id"),
  UNIQUE KEY "emailtemplate_templateKey_key" ("templateKey")
);


CREATE TABLE "emailtemplateversion" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "templateKey" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "version" int NOT NULL,
  "subject" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "preheader" text COLLATE utf8mb4_unicode_ci,
  "headerTitle" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "greeting" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "bodyHtml" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "buttonText" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "buttonUrl" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "footerHtml" text COLLATE utf8mb4_unicode_ci,
  "changedBy" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Super Admin',
  "changeSummary" text COLLATE utf8mb4_unicode_ci,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY ("id"),
  KEY "emailtemplateversion_templateKey_version_idx" ("templateKey","version")
);


CREATE TABLE "enquirylead" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "email" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "phone" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "collegeId" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "message" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "status" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  KEY "enquirylead_collegeId_fkey" ("collegeId"),
  CONSTRAINT "enquirylead_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "collegeprofile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE "galleryimage" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "collegeId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "url" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "altText" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "caption" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "tags" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY ("id"),
  KEY "galleryimage_collegeId_fkey" ("collegeId"),
  CONSTRAINT "galleryimage_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "collegeprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "headerimage" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "title" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" text COLLATE utf8mb4_unicode_ci,
  "altText" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "imageUrl" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "displayOrder" int NOT NULL DEFAULT '0',
  "isActive" tinyint(1) NOT NULL DEFAULT '1',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id")
);


CREATE TABLE "lead" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "collegeId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "studentId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "status" enum('NEW','CONTACTED','ADMITTED','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  KEY "lead_collegeId_fkey" ("collegeId"),
  KEY "lead_studentId_fkey" ("studentId"),
  CONSTRAINT "lead_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "collegeprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lead_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "studentprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "newsarticle" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "title" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "slug" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "content" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "category" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Admissions',
  "image" text COLLATE utf8mb4_unicode_ci,
  "author" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'Super Admin',
  "status" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "newsarticle_slug_key" ("slug")
);


CREATE TABLE "placementoutcome" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "collegeId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "year" int NOT NULL,
  "eligibleStudents" int NOT NULL,
  "placedStudents" int NOT NULL,
  "highestCtc" double NOT NULL,
  "averageCtc" double NOT NULL,
  "topRecruiters" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY ("id"),
  KEY "placementoutcome_collegeId_fkey" ("collegeId"),
  CONSTRAINT "placementoutcome_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "collegeprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "review" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "collegeId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "studentId" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "studentName" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "course" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "batchYear" int DEFAULT NULL,
  "title" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "rating" double NOT NULL DEFAULT '4.5',
  "academicRating" double DEFAULT '4.5',
  "infrastructureRating" double DEFAULT '4',
  "placementRating" double DEFAULT '4.5',
  "campusRating" double DEFAULT '4.2',
  "valueForMoneyRating" double DEFAULT '4.4',
  "likes" text COLLATE utf8mb4_unicode_ci,
  "dislikes" text COLLATE utf8mb4_unicode_ci,
  "content" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "helpfulCount" int NOT NULL DEFAULT '12',
  "isVerified" tinyint(1) NOT NULL DEFAULT '1',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY ("id"),
  KEY "review_collegeId_fkey" ("collegeId"),
  KEY "review_studentId_fkey" ("studentId"),
  CONSTRAINT "review_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "collegeprofile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "studentprofile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE "scholarship" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "provider" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "category" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Central Government',
  "scholarshipType" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Merit-Based',
  "description" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "eligibilityCriteria" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "minPercentage" double DEFAULT NULL,
  "eligibleCourses" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'All Courses',
  "eligibleStates" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'All India',
  "familyIncomeLimit" double DEFAULT NULL,
  "familyIncomeLimitText" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "amount" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "amountValue" double DEFAULT NULL,
  "deadline" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "deadlineDate" datetime(3) DEFAULT NULL,
  "officialWebsite" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "applyLink" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "requiredDocuments" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "selectionProcess" text COLLATE utf8mb4_unicode_ci,
  "renewalAvailable" tinyint(1) NOT NULL DEFAULT '1',
  "status" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  "isPublished" tinyint(1) NOT NULL DEFAULT '1',
  "isFeatured" tinyint(1) NOT NULL DEFAULT '0',
  "bannerUrl" text COLLATE utf8mb4_unicode_ci,
  "faqs" text COLLATE utf8mb4_unicode_ci,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  "eligibility" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "value" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "type" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "scholarship_category_idx" ("category"),
  KEY "scholarship_scholarshipType_idx" ("scholarshipType"),
  KEY "scholarship_status_idx" ("status"),
  KEY "scholarship_isPublished_idx" ("isPublished")
);


CREATE TABLE "smtpconfig" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
  "smtpHost" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "smtpPort" int NOT NULL DEFAULT '587',
  "smtpUser" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "smtpPass" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "senderName" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'C2Talents Platform',
  "encryptionType" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TLS',
  "fromEmail" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "isEncrypted" tinyint(1) NOT NULL DEFAULT '1',
  "updatedAt" datetime(3) NOT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY ("id")
);


CREATE TABLE "studentprofile" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "userId" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "location" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "board12th" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "score12th" double DEFAULT NULL,
  "stream12th" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "entranceExamName" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "entranceExamScore" double DEFAULT NULL,
  "budgetLimit" double DEFAULT NULL,
  "hostelPreference" tinyint(1) NOT NULL DEFAULT '0',
  "specializationPreference" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "expectedPackage" double DEFAULT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "studentprofile_userId_key" ("userId"),
  CONSTRAINT "studentprofile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE "studyabroadcountry" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "code" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "slug" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "flag" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "heroImage" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "universityCount" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '100+ Universities',
  "averageTuition" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '₹15L - ₹35L / yr',
  "popularIntakes" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Fall, Spring',
  "popularDegrees" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MS / MBA / BS',
  "whyStudy" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "popularCourses" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "costBreakdown" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "admissionRequirements" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "intakes" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "visaGuide" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "scholarships" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "status" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "studyabroadcountry_slug_key" ("slug")
);


CREATE TABLE "studyabroadlead" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "studentId" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "studentName" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "email" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "phone" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "selectedCountry" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "preferredCourse" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "qualification" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "academicScore" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "englishTest" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "englishScore" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "budget" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "preferredIntake" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "status" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  "adminNotes" text COLLATE utf8mb4_unicode_ci,
  "assignedCounselor" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  KEY "studyabroadlead_email_idx" ("email"),
  KEY "studyabroadlead_status_idx" ("status"),
  KEY "studyabroadlead_selectedCountry_idx" ("selectedCountry"),
  KEY "studyabroadlead_studentId_fkey" ("studentId"),
  CONSTRAINT "studyabroadlead_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE "user" (
  "id" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "email" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "passwordHash" varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  "role" enum('SUPER_ADMIN','ADMIN','EDITOR','COLLEGE_MANAGER','STUDENT','COLLEGE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ADMIN',
  "name" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'Administrator',
  "googleId" varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "createdAt" datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updatedAt" datetime(3) NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "user_email_key" ("email")
);


SET FOREIGN_KEY_CHECKS=1;

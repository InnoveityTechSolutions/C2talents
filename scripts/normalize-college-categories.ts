/**
 * Production-Ready Database Architecture Normalization Script
 *
 * Command to run:
 * npx tsx scripts/normalize-college-categories.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Standard normalized academic categories
export type AcademicCategory =
  | 'Engineering'
  | 'Medical'
  | 'Arts & Science'
  | 'Commerce'
  | 'Law'
  | 'Management'
  | 'Polytechnic'
  | 'Agriculture'
  | 'Architecture'
  | 'Dental'
  | 'Nursing'
  | 'Pharmacy'
  | 'Education'
  | 'Paramedical'
  | 'Physiotherapy'
  | 'Fine Arts'
  | 'Hotel Management'
  | 'Aviation';

// Standard normalized ownership types
export type OwnershipType =
  | 'Government'
  | 'Private'
  | 'Aided'
  | 'Deemed'
  | 'Autonomous';

/**
 * Normalizes College Name, Categories string, and Course Titles to determine correct Academic Category
 */
function determineCategory(name: string, legacyCategories?: string | null, legacyType?: string | null, courseTitles: string[] = []): AcademicCategory {
  const nameLower = name.toLowerCase();

  // 1. Strict Name Keyword Matching (Highest Precision)
  if (/\bpolytechnic\b/.test(nameLower)) return 'Polytechnic';
  if (/\bdental\b/.test(nameLower)) return 'Dental';
  if (/\b(pharmacy|pharm)\b/.test(nameLower)) return 'Pharmacy';
  if (/\bnursing\b/.test(nameLower)) return 'Nursing';
  if (/\bphysiotherapy\b/.test(nameLower)) return 'Physiotherapy';
  if (/\bparamedical\b/.test(nameLower)) return 'Paramedical';
  if (/\b(medical|mbbs|homoeopathy|siddha|ayurveda)\b/.test(nameLower)) return 'Medical';
  if (/\barchitecture\b/.test(nameLower)) return 'Architecture';
  if (/\bagriculture\b/.test(nameLower)) return 'Agriculture';
  if (/\b(hotel management|catering)\b/.test(nameLower)) return 'Hotel Management';
  if (/\bfine arts\b/.test(nameLower)) return 'Fine Arts';
  if (/\b(teacher training|teachers training|education|b\.ed|m\.ed)\b/.test(nameLower)) return 'Education';
  if (/\b(engineering|technology|technological|b\.tech|m\.tech)\b/.test(nameLower)) return 'Engineering';
  if (/\b(law|llb|ll\.b)\b/.test(nameLower)) return 'Law';
  if (/\b(management|business|mba|bba)\b/.test(nameLower)) return 'Management';
  if (/\b(arts and science|arts & science|arts, science|arts college|science college)\b/.test(nameLower)) return 'Arts & Science';
  if (/\bcommerce\b/.test(nameLower)) return 'Commerce';

  // 2. Course Titles Inspection
  for (const title of courseTitles) {
    const t = title.toLowerCase();
    if (/\b(b\.tech|m\.tech|engineering|computer science|civil|mechanical|electrical)\b/.test(t)) return 'Engineering';
    if (/\b(mbbs|md|ms|clinical|medical)\b/.test(t)) return 'Medical';
    if (/\b(b\.ed|m\.ed|education)\b/.test(t)) return 'Education';
    if (/\b(b\.com|m\.com|commerce)\b/.test(t)) return 'Commerce';
    if (/\b(llb|ll\.b|law)\b/.test(t)) return 'Law';
    if (/\b(mba|bba|management)\b/.test(t)) return 'Management';
    if (/\b(b\.sc|b\.a\.|arts|science)\b/.test(t)) return 'Arts & Science';
  }

  // 3. Fallback Context Inspection
  const combinedText = `${name} ${legacyCategories || ''} ${legacyType || ''}`.toLowerCase();
  if (/\b(engineering|technology)\b/.test(combinedText)) return 'Engineering';
  if (/\b(medical|health)\b/.test(combinedText)) return 'Medical';
  if (/\b(arts|science)\b/.test(combinedText)) return 'Arts & Science';
  if (/\bcommerce\b/.test(combinedText)) return 'Commerce';
  if (/\bmanagement\b/.test(combinedText)) return 'Management';
  if (/\blaw\b/.test(combinedText)) return 'Law';

  return 'Arts & Science'; // Default safe category
}

/**
 * Normalizes legacy type/ownership text to standard OwnershipType
 */
function determineOwnership(legacyType?: string | null, legacyOwnership?: string | null, name: string = ''): OwnershipType {
  const combinedText = `${legacyOwnership || ''} ${legacyType || ''} ${name}`.toLowerCase();

  if (/\bdeemed\b/.test(combinedText)) return 'Deemed';
  if (/\b(aided|govt-aided)\b/.test(combinedText)) return 'Aided';
  if (/\b(government|govt|state university)\b/.test(combinedText)) return 'Government';
  if (/\bautonomous\b/.test(combinedText)) return 'Autonomous';

  return 'Private';
}

import { createDatabaseBackup } from '../src/lib/backup';

async function main() {
  console.log('====================================================');
  console.log('🔄 Starting College Ownership & Academic Category Normalization (Precise)');
  console.log('====================================================\n');

  console.log('📦 Triggering automatic pre-normalization database backup...');
  await createDatabaseBackup('pre-normalization');

  // Fetch all colleges with their courses
  const colleges = await prisma.collegeProfile.findMany({
    include: {
      courses: {
        select: { title: true },
      },
    },
  });

  const totalColleges = colleges.length;
  console.log(`Processing ${totalColleges} total colleges...\n`);

  const categoryStats: Record<string, number> = {};
  const ownershipStats: Record<string, number> = {};

  let updatedCount = 0;

  for (const college of colleges) {
    const courseTitles = college.courses.map((c) => c.title);

    const targetCategory = determineCategory(college.name, college.categories, college.type, courseTitles);
    const targetOwnership = determineOwnership(college.type, college.ownership, college.name);

    // Track statistics
    categoryStats[targetCategory] = (categoryStats[targetCategory] || 0) + 1;
    ownershipStats[targetOwnership] = (ownershipStats[targetOwnership] || 0) + 1;

    // Update database
    await prisma.collegeProfile.update({
      where: { id: college.id },
      data: {
        category: targetCategory,
        ownership: targetOwnership,
        type: targetOwnership, // Keep legacy type synchronized with ownership
      },
    });

    updatedCount++;
    console.log(`[${updatedCount}/${totalColleges}] ✅ ${college.name} -> Category: "${targetCategory}" | Ownership: "${targetOwnership}"`);
  }

  // Generate Report
  console.log('\n====================================================');
  console.log('📊 NORMALIZATION & DATA VERIFICATION REPORT');
  console.log('====================================================');
  console.log(`🏫 Total Colleges Processed : ${totalColleges}`);
  console.log('----------------------------------------------------');
  console.log('📚 ACADEMIC CATEGORY BREAKDOWN:');
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   - ${cat.padEnd(20)}: ${count} Colleges`);
    });

  console.log('----------------------------------------------------');
  console.log('🏛️ OWNERSHIP TYPE BREAKDOWN:');
  Object.entries(ownershipStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([own, count]) => {
      console.log(`   - ${own.padEnd(20)}: ${count} Colleges`);
    });

  console.log('====================================================\n');
}

main()
  .catch((err) => {
    console.error('Fatal error during category normalization:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

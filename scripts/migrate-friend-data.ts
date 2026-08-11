/**
 * Production-Ready Data Migration Script: colleges_db -> c2talents
 *
 * Command to run:
 * npx tsx scripts/migrate-friend-data.ts
 *
 * Requirements:
 * 1. Connect to BOTH MySQL databases (colleges_db and c2talents).
 * 2. Read every row from colleges_db.colleges.
 * 3. Create a new UUID for every imported college.
 * 4. Maintain an in-memory mapping: old college_id -> new UUID.
 * 5. Map friend columns to Prisma CollegeProfile fields.
 * 6. Fill unavailable fields with safe defaults.
 * 7. Generate a unique slug.
 * 8. Prevent duplicate imports by checking college name or website.
 * 9. Insert every college using Prisma.
 * 10. Read colleges_db.courses.
 * 11. Use the mapping to connect each course to the correct imported college.
 * 12. Map course_name -> title.
 * 13. Map duration.
 * 14. Fill remaining fields with defaults.
 * 15. Skip duplicate courses.
 * 16. Wrap inserts in transactions.
 * 17. Log: Total colleges imported, Total courses imported, Failed rows.
 * 18. Make the script safe to run multiple times.
 * 19. Do not modify the source database.
 * 20. Accessible via `npx tsx scripts/migrate-friend-data.ts`.
 */

import { PrismaClient, Role } from '@prisma/client';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client for target database (c2talents)
const prisma = new PrismaClient();

// Configuration for source database connection (colleges_db)
const SOURCE_DB_CONFIG: mysql.ConnectionOptions = {
  host: process.env.SOURCE_DB_HOST || '127.0.0.1',
  port: parseInt(process.env.SOURCE_DB_PORT || '3306', 10),
  user: process.env.SOURCE_DB_USER || 'root',
  password: process.env.SOURCE_DB_PASSWORD || '',
  database: process.env.SOURCE_DB_NAME || 'colleges_db',
};

// Helper: Slugify string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, '');  // Trim leading and trailing hyphens
}

// Helper: Safely parse floats with fallback
function parseFloatSafe(val: any, fallback: number = 0.0): number {
  if (val === null || val === undefined || val === '') return fallback;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? fallback : parsed;
}

// Helper: Safely parse string with fallback
import { createDatabaseBackup } from '../src/lib/backup';
import { createAuditLog } from '../src/lib/audit';

function parseStringSafe(val: any, fallback: string = ''): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
}

async function main() {
  console.log('====================================================');
  console.log('🚀 Starting Friend Data Migration (colleges_db -> c2talents)');
  console.log('====================================================\n');

  // Trigger Automatic Pre-Migration Backup
  console.log('📦 Triggering automatic pre-migration database backup...');
  await createDatabaseBackup('pre-migration');

  // Stats tracking
  let totalCollegesImported = 0;
  let totalCollegesSkipped = 0;
  let totalCollegesFailed = 0;

  let totalCoursesImported = 0;
  let totalCoursesSkipped = 0;
  let totalCoursesFailed = 0;

  const failedRowsLog: { type: 'COLLEGE' | 'COURSE'; sourceId: any; reason: string }[] = [];

  // In-memory mapping: old college_id -> new UUID
  const collegeIdMap = new Map<string | number, string>();

  // Track created/seen slugs in current process
  const generatedSlugs = new Set<string>();

  let sourceConn: mysql.Connection | null = null;

  try {
    // 1. Connect to source MySQL database (colleges_db)
    console.log(`🔌 Connecting to source database "${SOURCE_DB_CONFIG.database}" at ${SOURCE_DB_CONFIG.host}:${SOURCE_DB_CONFIG.port}...`);
    try {
      sourceConn = await mysql.createConnection(SOURCE_DB_CONFIG);
      console.log('✅ Connected successfully to source database.\n');
    } catch (err: any) {
      console.error('❌ Failed to connect to source database:', err.message);
      console.log('\n💡 Tip: Ensure MySQL is running and colleges_db exists, or configure environment variables:');
      console.log('   SOURCE_DB_HOST, SOURCE_DB_USER, SOURCE_DB_PASSWORD, SOURCE_DB_NAME\n');
      throw err;
    }

    // Default password hash for auto-generated college user accounts
    const defaultPasswordHash = await bcrypt.hash('College@123', 10);

    // 2. Read every row from colleges_db.colleges
    console.log('📦 Reading colleges from source database...');
    let sourceColleges: any[] = [];
    try {
      const [rows] = await sourceConn.query('SELECT * FROM colleges');
      sourceColleges = rows as any[];
      console.log(`Found ${sourceColleges.length} colleges in source database.\n`);
    } catch (err: any) {
      console.error('❌ Failed to query "colleges" table in source database:', err.message);
      throw err;
    }

    // Process Colleges
    console.log('⏳ Processing and importing colleges into Prisma...');
    for (const rawCollege of sourceColleges) {
      const oldId = rawCollege.id ?? rawCollege.college_id ?? rawCollege.col_id;
      const collegeName = parseStringSafe(
        rawCollege.name ?? rawCollege.college_name ?? rawCollege.title,
        'Unnamed College'
      );
      const website = parseStringSafe(rawCollege.website ?? rawCollege.url ?? rawCollege.web_address, '');
      const rawEmail = parseStringSafe(rawCollege.email ?? rawCollege.contact_email, '');

      if (!oldId) {
        console.warn(`⚠️ Skipping college with missing ID: ${collegeName}`);
        failedRowsLog.push({ type: 'COLLEGE', sourceId: 'UNKNOWN', reason: 'Missing source ID' });
        totalCollegesFailed++;
        continue;
      }

      try {
        // 8. Prevent duplicate imports by checking college name or website
        const existingCollege = await prisma.collegeProfile.findFirst({
          where: {
            OR: [
              { name: { equals: collegeName } },
              ...(website ? [{ website: { equals: website } }] : []),
            ],
          },
        });

        if (existingCollege) {
          console.log(`⏭️ College already exists (Name: "${collegeName}") -> Mapping old ID [${oldId}] to existing UUID [${existingCollege.id}]`);
          collegeIdMap.set(oldId, existingCollege.id);
          totalCollegesSkipped++;
          continue;
        }

        // 3. Create a new UUID for every imported college
        const newCollegeId = crypto.randomUUID();

        // 7. Generate a unique slug
        let baseSlug = slugify(collegeName) || `college-${newCollegeId.slice(0, 8)}`;
        let uniqueSlug = baseSlug;
        let slugCounter = 1;

        while (
          generatedSlugs.has(uniqueSlug) ||
          (await prisma.collegeProfile.findUnique({ where: { slug: uniqueSlug } }))
        ) {
          uniqueSlug = `${baseSlug}-${slugCounter}`;
          slugCounter++;
        }
        generatedSlugs.add(uniqueSlug);

        // Prepare email for user account relation (CollegeProfile -> User required 1:1 relation)
        let collegeEmail = rawEmail || `college_${newCollegeId}@migration.c2talents.com`;

        // Check if user already exists and whether that user already has a CollegeProfile attached
        let existingUser = await prisma.user.findUnique({
          where: { email: collegeEmail },
          include: { college: true },
        });

        // If existing user already has a college profile linked, generate a fresh unique email for this college
        if (existingUser && existingUser.college) {
          collegeEmail = `college_${newCollegeId}@migration.c2talents.com`;
          existingUser = null; // Forces creation of a new User for this college
        }

        // 5 & 6. Map columns to Prisma CollegeProfile fields with safe defaults
        const description = parseStringSafe(
          rawCollege.description ?? rawCollege.about ?? rawCollege.info,
          'No description available.'
        );

        const location = parseStringSafe(
          rawCollege.location ?? rawCollege.city ?? rawCollege.address ?? rawCollege.district,
          'Tamil Nadu'
        );

        const type = parseStringSafe(
          rawCollege.type ?? rawCollege.ownership ?? rawCollege.category,
          'Private'
        );

        const state = parseStringSafe(rawCollege.state, 'Tamil Nadu');
        const feesPerYear = parseFloatSafe(rawCollege.fees_per_year ?? rawCollege.fees ?? rawCollege.tuition_fee, 0.0);
        const avgPackage = parseFloatSafe(rawCollege.avg_package ?? rawCollege.avgPackage ?? rawCollege.average_package, 0.0);
        const highestPackage = parseFloatSafe(rawCollege.highest_package ?? rawCollege.highestPackage, 0.0);
        const image = parseStringSafe(
          rawCollege.image ?? rawCollege.banner ?? rawCollege.logo ?? rawCollege.image_url,
          '/images/default-college.jpg'
        );

        // 16. Wrap inserts in transactions (Create User + CollegeProfile)
        await prisma.$transaction(async (tx) => {
          let userId: string;

          if (existingUser) {
            userId = existingUser.id;
          } else {
            const newUser = await tx.user.create({
              data: {
                email: collegeEmail,
                passwordHash: defaultPasswordHash,
                role: Role.COLLEGE,
                name: collegeName,
              },
            });
            userId = newUser.id;
          }

          // 9. Insert college using Prisma
          await tx.collegeProfile.create({
            data: {
              id: newCollegeId,
              userId: userId,
              name: collegeName,
              shortName: parseStringSafe(rawCollege.short_name ?? rawCollege.shortName, null as any),
              slug: uniqueSlug,
              description: description,
              location: location,
              address: parseStringSafe(rawCollege.address, null as any),
              landmark: parseStringSafe(rawCollege.landmark, null as any),
              area: parseStringSafe(rawCollege.area, null as any),
              city: parseStringSafe(rawCollege.city, null as any),
              district: parseStringSafe(rawCollege.district, null as any),
              state: state,
              pincode: parseStringSafe(rawCollege.pincode ?? rawCollege.zip, null as any),
              latitude: rawCollege.latitude ? parseFloatSafe(rawCollege.latitude, null as any) : null,
              longitude: rawCollege.longitude ? parseFloatSafe(rawCollege.longitude, null as any) : null,
              phone: parseStringSafe(rawCollege.phone ?? rawCollege.telephone, null as any),
              mobile: parseStringSafe(rawCollege.mobile ?? rawCollege.contact_no, null as any),
              email: collegeEmail,
              website: website || null,
              rating: parseFloatSafe(rawCollege.rating, 4.0),
              type: type,
              ownership: parseStringSafe(rawCollege.ownership, null as any),
              categories: parseStringSafe(rawCollege.categories, null as any),
              affiliatedUniversity: parseStringSafe(rawCollege.affiliated_university ?? rawCollege.university, null as any),
              isAutonomous: Boolean(rawCollege.is_autonomous ?? rawCollege.isAutonomous ?? false),
              accreditation: parseStringSafe(rawCollege.accreditation, null as any),
              approval: parseStringSafe(rawCollege.approval, null as any),
              aicteApproved: Boolean(rawCollege.aicte_approved ?? true),
              ugcApproved: Boolean(rawCollege.ugc_approved ?? true),
              naacGrade: parseStringSafe(rawCollege.naac_grade ?? rawCollege.naacGrade, null as any),
              nirfRank: rawCollege.nirf_rank ? parseInt(String(rawCollege.nirf_rank), 10) : null,
              feesPerYear: feesPerYear,
              hostelFees: rawCollege.hostel_fees ? parseFloatSafe(rawCollege.hostel_fees) : null,
              avgPackage: avgPackage,
              highestPackage: highestPackage,
              image: image,
              logo: parseStringSafe(rawCollege.logo, null as any),
              banner: parseStringSafe(rawCollege.banner, null as any),
              estYear: rawCollege.est_year ? parseInt(String(rawCollege.est_year), 10) : null,
              status: 'PUBLISHED',
            },
          });
        });

        // 4. Maintain in-memory mapping: old college_id -> new UUID
        collegeIdMap.set(oldId, newCollegeId);
        totalCollegesImported++;
        console.log(`✅ Imported College: "${collegeName}" (Old ID: ${oldId} -> New UUID: ${newCollegeId})`);
      } catch (err: any) {
        console.error(`❌ Error importing college "${collegeName}" (Old ID: ${oldId}):`, err.message);

        // Fallback: check if college profile exists in target DB despite error to map oldId
        const fallbackCheck = await prisma.collegeProfile.findFirst({
          where: { name: { equals: collegeName } },
        });
        if (fallbackCheck) {
          console.log(`  ↪️ Recovered mapping for old ID [${oldId}] -> Existing UUID [${fallbackCheck.id}]`);
          collegeIdMap.set(oldId, fallbackCheck.id);
        }

        failedRowsLog.push({ type: 'COLLEGE', sourceId: oldId, reason: err.message });
        totalCollegesFailed++;
      }
    }

    console.log(`\n🎉 College import stage completed: ${totalCollegesImported} imported, ${totalCollegesSkipped} skipped, ${totalCollegesFailed} failed.\n`);

    // 10. Read colleges_db.courses
    console.log('📦 Reading courses from source database...');
    let sourceCourses: any[] = [];
    try {
      const [rows] = await sourceConn.query('SELECT * FROM courses');
      sourceCourses = rows as any[];
      console.log(`Found ${sourceCourses.length} courses in source database.\n`);
    } catch (err: any) {
      console.warn('⚠️ Querying "courses" table in source database failed or table missing:', err.message);
      sourceCourses = [];
    }

    // Process Courses
    if (sourceCourses.length > 0) {
      console.log('⏳ Processing and importing courses into Prisma...');
      for (const rawCourse of sourceCourses) {
        const courseId = rawCourse.id ?? rawCourse.course_id;
        const oldCollegeId = rawCourse.college_id ?? rawCourse.col_id ?? rawCourse.collegeId;
        const courseTitle = parseStringSafe(
          rawCourse.course_name ?? rawCourse.title ?? rawCourse.name,
          'Standard Course'
        );
        const duration = parseStringSafe(
          rawCourse.duration ?? rawCourse.course_duration,
          '3 Years'
        );

        // 11. Use the mapping to connect each course to the correct imported college
        const targetCollegeUuid = collegeIdMap.get(oldCollegeId);

        if (!targetCollegeUuid) {
          console.warn(`⚠️ Skipping course "${courseTitle}": Unmapped old college_id [${oldCollegeId}]`);
          failedRowsLog.push({
            type: 'COURSE',
            sourceId: courseId,
            reason: `Unmapped source college_id: ${oldCollegeId}`,
          });
          totalCoursesFailed++;
          continue;
        }

        try {
          // 15. Skip duplicate courses (check title under same college)
          const existingCourse = await prisma.course.findFirst({
            where: {
              collegeId: targetCollegeUuid,
              title: { equals: courseTitle },
            },
          });

          if (existingCourse) {
            console.log(`⏭️ Course already exists ("${courseTitle}" for College ${targetCollegeUuid}) -> Skipping.`);
            totalCoursesSkipped++;
            continue;
          }

          // 12 - 14. Map fields with defaults and insert using transaction
          const feesPerYear = parseFloatSafe(rawCourse.fees_per_year ?? rawCourse.fees, 0.0);
          const minGpa = rawCourse.min_gpa ? parseFloatSafe(rawCourse.min_gpa) : null;
          const seats = rawCourse.seats ? parseInt(String(rawCourse.seats), 10) : null;

          // 16. Wrap insert in transaction
          await prisma.$transaction(async (tx) => {
            await tx.course.create({
              data: {
                collegeId: targetCollegeUuid,
                title: courseTitle,
                duration: duration,
                feesPerYear: feesPerYear,
                careerPath: parseStringSafe(rawCourse.career_path, null as any),
                demand: parseStringSafe(rawCourse.demand, null as any),
                minGpa: minGpa,
                eligibility: parseStringSafe(rawCourse.eligibility, null as any),
                seats: seats,
                entranceExam: parseStringSafe(rawCourse.entrance_exam, null as any),
              },
            });
          });

          totalCoursesImported++;
          console.log(`✅ Imported Course: "${courseTitle}" for College UUID: ${targetCollegeUuid}`);
        } catch (err: any) {
          console.error(`❌ Error importing course "${courseTitle}" (Source ID: ${courseId}):`, err.message);
          failedRowsLog.push({ type: 'COURSE', sourceId: courseId, reason: err.message });
          totalCoursesFailed++;
        }
      }
    }
  } catch (err: any) {
    console.error('💥 Critical migration script error:', err.message);
  } finally {
    // Clean up connections
    if (sourceConn) {
      await sourceConn.end();
      console.log('\n🔌 Closed source database connection.');
    }
    await prisma.$disconnect();
    console.log('🔌 Disconnected Prisma Client.');
  }

  // 17. Log Summary Report
  console.log('\n====================================================');
  console.log('📊 MIGRATION SUMMARY REPORT');
  console.log('====================================================');
  console.log(`🏫 Colleges Imported : ${totalCollegesImported}`);
  console.log(`🏫 Colleges Skipped  : ${totalCollegesSkipped} (Duplicates)`);
  console.log(`🏫 Colleges Failed   : ${totalCollegesFailed}`);
  console.log('----------------------------------------------------');
  console.log(`📚 Courses Imported  : ${totalCoursesImported}`);
  console.log(`📚 Courses Skipped   : ${totalCoursesSkipped} (Duplicates / Unmapped)`);
  console.log(`📚 Courses Failed    : ${totalCoursesFailed}`);
  console.log('----------------------------------------------------');
  console.log(`❌ Total Failed Rows : ${failedRowsLog.length}`);

  if (failedRowsLog.length > 0) {
    console.log('\n🔍 Detailed Failed Rows Breakdown:');
    failedRowsLog.forEach((item, index) => {
      console.log(`   ${index + 1}. [${item.type}] Source ID: ${item.sourceId} | Reason: ${item.reason}`);
    });
  }
  console.log('====================================================\n');
}

// Execute migration
main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

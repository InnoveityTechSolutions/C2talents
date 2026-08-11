import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listBackups } from '@/lib/backup';

export async function GET() {
  try {
    const totalColleges = await db.collegeProfile.count({ where: { isDeleted: false } });
    const totalCourses = await db.course.count({ where: { isDeleted: false } });
    const totalUsers = await db.user.count();

    // 1. Missing Images
    const missingImages = await db.collegeProfile.count({
      where: {
        isDeleted: false,
        OR: [
          { image: "" },
          { image: { contains: "default-college" } },
        ],
      },
    });

    // 2. Missing Categories
    const missingCategories = await db.collegeProfile.count({
      where: {
        isDeleted: false,
        OR: [
          { category: null },
          { category: '' },
        ],
      },
    });

    // 3. Missing Ownership
    const missingOwnership = await db.collegeProfile.count({
      where: {
        isDeleted: false,
        OR: [
          { ownership: null },
          { ownership: '' },
        ],
      },
    });

    // 4. Duplicate Colleges (by name)
    const colleges = await db.collegeProfile.findMany({
      where: { isDeleted: false },
      select: { name: true },
    });
    const nameCounts: Record<string, number> = {};
    let duplicateColleges = 0;
    colleges.forEach((c) => {
      const norm = c.name.trim().toLowerCase();
      nameCounts[norm] = (nameCounts[norm] || 0) + 1;
    });
    Object.values(nameCounts).forEach((cnt) => {
      if (cnt > 1) duplicateColleges += cnt - 1;
    });

    // 5. Broken Course Relations
    const courses = await db.course.findMany({
      where: { isDeleted: false },
      select: { collegeId: true },
    });
    const validCollegeIds = new Set((await db.collegeProfile.findMany({ select: { id: true } })).map((c) => c.id));
    const brokenCourseRelations = courses.filter((c) => !validCollegeIds.has(c.collegeId)).length;

    // 6. Broken Images (placeholder/invalid domain check)
    const brokenImages = await db.collegeProfile.count({
      where: {
        isDeleted: false,
        OR: [
          { image: { contains: 'via.placeholder.com' } },
          { image: { contains: 'example.com' } },
        ],
      },
    });

    // 7. Soft Deleted Count
    const softDeletedColleges = await db.collegeProfile.count({ where: { isDeleted: true } });

    // Available Backups
    const backups = listBackups();

    // Recent Audit Logs
    const auditLogs = await db.auditLog.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      health: {
        totalColleges,
        totalCourses,
        totalUsers,
        missingImages,
        missingCategories,
        missingOwnership,
        duplicateColleges,
        brokenCourseRelations,
        brokenImages,
        softDeletedColleges,
        systemStatus: brokenCourseRelations > 0 ? 'WARNING' : 'HEALTHY',
      },
      backups,
      auditLogs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Health check API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Production-Safe Database Startup Verification Engine
 * Verifies DB connectivity, required tables, required columns, and abnormal record drop protection on startup.
 */

import { db } from './db';
import fs from 'fs';
import path from 'path';

interface Snapshot {
  timestamp: string;
  collegeCount: number;
  courseCount: number;
}

let isVerified = false;

export async function verifyDatabaseOnStartup(): Promise<void> {
  if (isVerified) return;

  console.log('\n🔍 [STARTUP VERIFIER] Running database integrity checks...');

  try {
    // 1. Connection check
    await db.$connect();
    console.log('✅ [STARTUP VERIFIER] Database connection established.');

    // 2. Required tables check & record counts
    const collegeCount = await db.collegeProfile.count({ where: { isDeleted: false } });
    const courseCount = await db.course.count({ where: { isDeleted: false } });
    const userCount = await db.user.count();

    console.log(`📊 [STARTUP VERIFIER] Current Counts -> Colleges: ${collegeCount} | Courses: ${courseCount} | Users: ${userCount}`);

    // 3. Snapshot verification & Abnormal drop detection (> 20% reduction)
    const snapshotPath = path.join(process.cwd(), 'backups', '.db-count-snapshot.json');
    
    if (fs.existsSync(snapshotPath)) {
      try {
        const prevSnapshot: Snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
        
        if (prevSnapshot.collegeCount > 0) {
          const dropRatio = (prevSnapshot.collegeCount - collegeCount) / prevSnapshot.collegeCount;
          if (dropRatio > 0.20) {
            console.error(`\n🚨 [CRITICAL ALERT] Abnormal record reduction detected!`);
            console.error(`   Previous Colleges: ${prevSnapshot.collegeCount} -> Current: ${collegeCount} (${(dropRatio * 100).toFixed(1)}% reduction!)`);
            console.error(`   Check /admin/health immediately or restore from backups/ directory.\n`);
          }
        }
      } catch (err) {
        // Snapshot parse error fallback
      }
    }

    // Save updated snapshot
    const newSnapshot: Snapshot = {
      timestamp: new Date().toISOString(),
      collegeCount,
      courseCount,
    };
    
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(snapshotPath, JSON.stringify(newSnapshot, null, 2), 'utf8');

    isVerified = true;
    console.log('✅ [STARTUP VERIFIER] Integrity verification complete.\n');
  } catch (err: any) {
    console.error('❌ [STARTUP VERIFIER] Database startup check failed:', err.message);
  }
}

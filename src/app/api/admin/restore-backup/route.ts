import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { createDatabaseBackup } from '@/lib/backup';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const { filename, confirmation } = await req.json();

    if (confirmation !== 'RESTORE DATA') {
      return NextResponse.json(
        { error: 'Invalid confirmation phrase. Type "RESTORE DATA" to proceed.' },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json({ error: 'Backup filename required.' }, { status: 400 });
    }

    const backupDir = path.join(process.cwd(), 'backups');
    const filepath = path.join(backupDir, path.basename(filename));

    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: 'Selected backup file does not exist.' }, { status: 404 });
    }

    console.log(`\n🔄 [RESTORE TOOL] Starting restore operation from "${filename}"...`);

    // 1. Create immediate pre-restore safety backup
    console.log('📦 Creating pre-restore safety snapshot...');
    await createDatabaseBackup('pre-restore-safety');

    // 2. Execute SQL file restoration
    const dbUrl = process.env.DATABASE_URL || 'mysql://root@127.0.0.1:3306/c2talents';
    const urlObj = new URL(dbUrl);
    const host = urlObj.hostname || '127.0.0.1';
    const port = parseInt(urlObj.port || '3306', 10);
    const user = urlObj.username || 'root';
    const password = urlObj.password || '';
    const database = urlObj.pathname.replace('/', '') || 'c2talents';

    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
    });

    const sqlContent = fs.readFileSync(filepath, 'utf8');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
    await conn.query(sqlContent);
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
    await conn.end();

    // 3. Log Audit Entry
    await createAuditLog({
      action: 'RESTORE',
      entity: 'Database',
      details: `Database restored from backup file "${filename}"`,
      scriptName: 'POST /api/admin/restore-backup',
    });

    console.log(`✅ [RESTORE TOOL] Restoration completed from "${filename}".`);

    return NextResponse.json({
      success: true,
      message: `Database successfully restored from ${filename}`,
    });
  } catch (err: any) {
    console.error('Restore error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

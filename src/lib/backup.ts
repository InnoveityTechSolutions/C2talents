/**
 * Production-Safe Database Automatic Backup Engine
 * Creates timestamped SQL backups before any migration, seed, normalization, or bulk import.
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { execSync } from 'child_process';

export interface BackupResult {
  filename: string;
  filepath: string;
  sizeBytes: number;
  createdAt: Date;
}

export async function createDatabaseBackup(prefix: string = 'auto'): Promise<BackupResult> {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `c2talents_${prefix}_${timestamp}.sql`;
  const filepath = path.join(backupDir, filename);

  const dbUrl = process.env.DATABASE_URL || 'mysql://root@127.0.0.1:3306/c2talents';
  
  // Parse DATABASE_URL
  const urlObj = new URL(dbUrl);
  const host = urlObj.hostname || '127.0.0.1';
  const port = urlObj.port || '3306';
  const user = urlObj.username || 'root';
  const password = urlObj.password || '';
  const database = urlObj.pathname.replace('/', '') || 'c2talents';

  console.log(`\n📦 [BACKUP SYSTEM] Creating database backup for "${database}"...`);

  // Attempt 1: Try mysqldump if available
  let backupSuccess = false;
  try {
    const mysqldumpCmd = `mysqldump --host=${host} --port=${port} --user=${user} ${password ? `--password=${password}` : ''} ${database} > "${filepath}"`;
    execSync(mysqldumpCmd, { stdio: 'pipe' });
    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
      backupSuccess = true;
      console.log(`✅ [BACKUP SYSTEM] Created via mysqldump: ${filename}`);
    }
  } catch (err) {
    // mysqldump not in PATH or failed -> Fallback to pure Node.js SQL generator
  }

  // Attempt 2: Node.js pure SQL Dumper fallback
  if (!backupSuccess) {
    let conn: mysql.Connection | null = null;
    try {
      conn = await mysql.createConnection({
        host,
        port: parseInt(port, 10),
        user,
        password,
        database,
      });

      const [tables]: any = await conn.query('SHOW TABLES');
      const tableKey = Object.keys(tables[0] || {})[0];
      let sqlDump = `-- C2Talents Database Backup\n-- Date: ${new Date().toISOString()}\n-- Database: ${database}\n\n`;
      sqlDump += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

      for (const tableObj of tables) {
        const tableName = tableObj[tableKey];
        const [createTable]: any = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
        sqlDump += `${createTable[0]['Create Table']};\n\n`;

        const [rows]: any = await conn.query(`SELECT * FROM \`${tableName}\``);
        for (const row of rows) {
          const keys = Object.keys(row).map((k) => `\`${k}\``).join(', ');
          const values = Object.values(row).map((v) => {
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number' || typeof v === 'boolean') return v;
            if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(v).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
          }).join(', ');

          sqlDump += `INSERT INTO \`${tableName}\` (${keys}) VALUES (${values});\n`;
        }
        sqlDump += `\n`;
      }

      sqlDump += `SET FOREIGN_KEY_CHECKS=1;\n`;
      fs.writeFileSync(filepath, sqlDump, 'utf8');
      backupSuccess = true;
      console.log(`✅ [BACKUP SYSTEM] Created via Node.js SQL generator: ${filename}`);
    } catch (err: any) {
      console.error(`❌ [BACKUP SYSTEM] Backup failed:`, err.message);
    } finally {
      if (conn) await conn.end();
    }
  }

  if (!backupSuccess || !fs.existsSync(filepath) || fs.statSync(filepath).size === 0) {
    throw new Error(`CRITICAL_BACKUP_FAILURE: Backup failed! Execution aborted to prevent un-backed data mutation.`);
  }

  const stat = fs.statSync(filepath);
  return {
    filename,
    filepath,
    sizeBytes: stat.size,
    createdAt: new Date(),
  };
}

export function listBackups(): BackupResult[] {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) return [];

  const files = fs.readdirSync(backupDir).filter((f) => f.endsWith('.sql'));
  return files.map((file) => {
    const fp = path.join(backupDir, file);
    const stat = fs.statSync(fp);
    return {
      filename: file,
      filepath: fp,
      sizeBytes: stat.size,
      createdAt: stat.mtime,
    };
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

import { db } from './db';

export interface AuditLogOptions {
  actorId?: string;
  actorEmail?: string;
  action: 'CREATE' | 'UPDATE' | 'SOFT_DELETE' | 'HARD_DELETE' | 'BULK_IMPORT' | 'MIGRATION' | 'RESTORE';
  entity: 'CollegeProfile' | 'Course' | 'Database' | 'User' | 'System';
  entityId?: string;
  details?: string;
  scriptName?: string;
  rowsAffected?: number;
}

export async function createAuditLog(options: AuditLogOptions) {
  try {
    return await db.auditLog.create({
      data: {
        actorId: options.actorId,
        actorEmail: options.actorEmail || 'system',
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
        details: options.details,
        scriptName: options.scriptName,
        rowsAffected: options.rowsAffected || 0,
      },
    });
  } catch (err: any) {
    console.error('⚠️ [AUDIT SYSTEM] Failed to write audit log:', err.message);
  }
}

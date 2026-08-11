/**
 * Production-Safe Environment Guard & Database Safety Engine
 * Prevents accidental execution of destructive operations in Production and Development.
 */

export function isProduction(): boolean {
  const env = (process.env.APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
  return env === 'production' || env === 'prod';
}

export function isDestructiveAllowed(): boolean {
  if (isProduction()) {
    return false;
  }
  
  // Requires explicit flag in non-production environments
  return process.argv.includes('--dangerously-clean-db-i-know-what-i-am-doing') ||
         process.env.ALLOW_DESTRUCTIVE_DB_OPS === 'true';
}

export function assertSafeDatabaseOperation(operationName: string, isDestructive: boolean = false): void {
  if (isProduction()) {
    if (isDestructive) {
      console.error(`\n🚨 [SECURITY ALERT] Destructive operation "${operationName}" is STRICTLY BLOCKED in Production!`);
      throw new Error(`CRITICAL_SAFETY_VIOLATION: Operation "${operationName}" is disabled in production to protect real client data.`);
    }
  }

  if (isDestructive && !isDestructiveAllowed()) {
    console.error(`\n⚠️ [SAFETY WARNING] Destructive operation "${operationName}" requires explicit confirmation.`);
    console.error(`   To run in development, pass flag: --dangerously-clean-db-i-know-what-i-am-doing\n`);
    throw new Error(`SAFETY_LOCK: Operation "${operationName}" was blocked. Explicit confirmation flag required.`);
  }
}

export function assertEnvironmentIsolation(): void {
  const dbUrl = process.env.DATABASE_URL || '';
  const isProdDb = dbUrl.includes('prod') || dbUrl.includes('production') || dbUrl.includes('aws') || dbUrl.includes('azure') || dbUrl.includes('rds');
  
  if (!isProduction() && isProdDb && !process.env.ALLOW_PROD_DB_CONNECT) {
    throw new Error(`ENVIRONMENT_ISOLATION_ERROR: Local dev script detected production database URL! Execution blocked for safety.`);
  }
}

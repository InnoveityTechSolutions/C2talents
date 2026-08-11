import { createDatabaseBackup } from '../src/lib/backup';

async function main() {
  const result = await createDatabaseBackup('manual');
  console.log(`\n🎉 Backup Created Successfully!`);
  console.log(`File : ${result.filename}`);
  console.log(`Path : ${result.filepath}`);
  console.log(`Size : ${(result.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});

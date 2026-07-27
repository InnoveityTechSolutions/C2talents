import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
  console.log("=== CHECKING SUPERADMIN ACCOUNT IN DATABASE ===");
  const user = await prisma.user.findUnique({
    where: { email: 'superadmin@c2talents.com' },
  });

  if (!user) {
    console.log("❌ USER NOT FOUND in database!");
    return;
  }

  console.log("✅ USER FOUND:", {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    passwordHash: user.passwordHash,
  });

  const isMatch = await bcrypt.compare('Admin@123', user.passwordHash);
  console.log("🔐 Password Comparison test for 'Admin@123':", isMatch ? "MATCH SUCCESSFUL! ✅" : "MATCH FAILED! ❌");
}

check().catch(console.error).finally(() => prisma.$disconnect());

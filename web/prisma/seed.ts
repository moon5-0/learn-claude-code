/**
 * Database seed script
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const users = [
    {
      email: 'admin@example.com',
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
    },
    {
      email: 'user@example.com',
      username: 'testuser',
      password: await bcrypt.hash('user123', 10),
    },
    {
      email: 'demo@example.com',
      username: 'demo',
      password: await bcrypt.hash('demo123', 10),
    },
  ];

  console.log('👤 Creating users...');
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`  ✓ Created user: ${created.username} (${created.email})`);
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('  - admin@example.com / admin123');
  console.log('  - user@example.com / user123');
  console.log('  - demo@example.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

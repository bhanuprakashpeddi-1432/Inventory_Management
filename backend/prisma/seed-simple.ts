import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seed for login testing...');

  // Create users using upsert to handle existing data
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@store.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@store.com' },
    update: {
      name: 'Inventory Manager',
      password: hashedPassword,
      role: UserRole.MANAGER,
      isActive: true,
    },
    create: {
      email: 'manager@store.com',
      name: 'Inventory Manager',
      password: hashedPassword,
      role: UserRole.MANAGER,
      isActive: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@store.com' },
    update: {
      name: 'Regular User',
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
    },
    create: {
      email: 'user@store.com',
      name: 'Regular User',
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
    },
  });

  console.log('✅ Users created/updated successfully!');
  console.log('Demo Credentials:');
  console.log('- Admin:', admin.email, '/ admin123');
  console.log('- Manager:', manager.email, '/ admin123');
  console.log('- User:', user.email, '/ admin123');

  // Test user verification
  const testUser = await prisma.user.findUnique({
    where: { email: 'admin@store.com' }
  });

  if (testUser) {
    const isValidPassword = await bcrypt.compare('admin123', testUser.password);
    console.log('✅ Password verification test:', isValidPassword ? 'PASSED' : 'FAILED');
  }

  console.log('🎉 Simple seeding completed - login should now work!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

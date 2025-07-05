const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test if users table exists and has data
    const userCount = await prisma.user.count();
    console.log(`👥 Found ${userCount} users in database`);
    
    if (userCount === 0) {
      console.log('⚠️  No users found! Run: npm run seed');
    } else {
      // Check for demo users
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@store.com' }
      });
      
      if (adminUser) {
        console.log('✅ Admin user exists');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Name: ${adminUser.name}`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   Active: ${adminUser.isActive}`);
      } else {
        console.log('❌ Admin user not found!');
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MySQL server might not be running');
    } else if (error.message.includes('Unknown database')) {
      console.log('💡 Database "inventory_management" does not exist');
      console.log('   Create it with: CREATE DATABASE inventory_management;');
    } else if (error.message.includes('Access denied')) {
      console.log('💡 Check your database credentials in .env file');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

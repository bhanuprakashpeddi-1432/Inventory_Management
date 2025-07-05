import { PrismaClient, UserRole, ProductStatus, StockMovementType, SocialPlatform, AlertType, AlertPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data (except users to avoid login issues)
  console.log('🧹 Cleaning up existing data...');
  await prisma.report.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.trendData.deleteMany();
  await prisma.forecastData.deleteMany();
  await prisma.salesData.deleteMany();
  await prisma.supplierProduct.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.reorderPoint.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();

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

  console.log('✅ Users created/updated:', { admin: admin.email, manager: manager.email, user: user.email });

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Tech Innovations Inc.',
        email: 'orders@techinnovations.com',
        phone: '+1-555-0123',
        contactPerson: 'John Smith',
        address: '123 Tech Street, Silicon Valley, CA 94000'
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Eco Products Co.',
        email: 'supply@ecoproducts.com',
        phone: '+1-555-0456',
        contactPerson: 'Sarah Johnson',
        address: '456 Green Ave, Portland, OR 97205'
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Fitness World Suppliers',
        email: 'wholesale@fitnessworld.com',
        phone: '+1-555-0789',
        contactPerson: 'Mike Davis',
        address: '789 Fit Blvd, Austin, TX 78701'
      }
    })
  ]);

  console.log('✅ Suppliers created:', suppliers.length);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wireless Earbuds Pro',
        description: 'Premium wireless earbuds with noise cancellation',
        category: 'Electronics',
        sku: 'WEP-001',
        currentStock: 85,
        minStock: 20,
        maxStock: 200,
        unitPrice: 129.99,
        leadTime: 7,
        status: ProductStatus.IN_STOCK,
        trendScore: 8,
        createdBy: admin.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Organic Cotton T-Shirt',
        description: 'Sustainable organic cotton t-shirt',
        category: 'Apparel',
        sku: 'OCT-002',
        currentStock: 15,
        minStock: 25,
        maxStock: 150,
        unitPrice: 24.99,
        leadTime: 14,
        status: ProductStatus.LOW_STOCK,
        trendScore: 5,
        createdBy: admin.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Stainless Steel Water Bottle',
        description: 'Eco-friendly insulated water bottle',
        category: 'Accessories',
        sku: 'SWB-003',
        currentStock: 0,
        minStock: 10,
        maxStock: 80,
        unitPrice: 34.99,
        leadTime: 10,
        status: ProductStatus.OUT_OF_STOCK,
        trendScore: 9,
        createdBy: admin.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Yoga Mat Premium',
        description: 'High-quality non-slip yoga mat',
        category: 'Fitness',
        sku: 'YMP-004',
        currentStock: 42,
        minStock: 15,
        maxStock: 60,
        unitPrice: 49.99,
        leadTime: 5,
        status: ProductStatus.IN_STOCK,
        trendScore: 7,
        createdBy: admin.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bluetooth Speaker',
        description: 'Portable bluetooth speaker with bass boost',
        category: 'Electronics',
        sku: 'BTS-005',
        currentStock: 8,
        minStock: 10,
        maxStock: 50,
        unitPrice: 79.99,
        leadTime: 7,
        status: ProductStatus.LOW_STOCK,
        trendScore: 6,
        createdBy: admin.id,
      },
    }),
  ]);

  // Create supplier-product relationships
  await Promise.all([
    prisma.supplierProduct.create({
      data: {
        supplierId: suppliers[0].id,
        productId: products[0].id, // Wireless Earbuds
        cost: 89.99,
        leadTime: 7,
        minOrderQty: 50,
      }
    }),
    prisma.supplierProduct.create({
      data: {
        supplierId: suppliers[1].id,
        productId: products[1].id, // Organic T-Shirt
        cost: 14.99,
        leadTime: 14,
        minOrderQty: 100,
      }
    }),
    prisma.supplierProduct.create({
      data: {
        supplierId: suppliers[1].id,
        productId: products[2].id, // Water Bottle
        cost: 19.99,
        leadTime: 10,
        minOrderQty: 25,
      }
    }),
    prisma.supplierProduct.create({
      data: {
        supplierId: suppliers[2].id,
        productId: products[3].id, // Yoga Mat
        cost: 29.99,
        leadTime: 5,
        minOrderQty: 20,
      }
    }),
    prisma.supplierProduct.create({
      data: {
        supplierId: suppliers[0].id,
        productId: products[4].id, // Bluetooth Speaker
        cost: 54.99,
        leadTime: 7,
        minOrderQty: 30,
      }
    }),
  ]);

  // Create sales data for the past 7 months
  const months = ['2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01', '2025-05-01', '2025-06-01', '2025-07-01'];
  const salesDataEntries = [];

  for (const product of products) {
    for (let i = 0; i < months.length; i++) {
      const baseAmount = Math.floor(Math.random() * 50) + 20;
      salesDataEntries.push({
        productId: product.id,
        date: new Date(months[i]),
        forecast: baseAmount + Math.floor(Math.random() * 20) - 10,
        actual: i < 6 ? baseAmount + Math.floor(Math.random() * 15) - 7 : null, // July has no actual yet
      });
    }
  }

  await prisma.salesData.createMany({
    data: salesDataEntries,
  });

  // Create reorder points
  for (const product of products) {
    await prisma.reorderPoint.create({
      data: {
        productId: product.id,
        reorderLevel: product.minStock + 5,
        reorderQuantity: Math.floor((product.maxStock - product.minStock) * 0.7),
        leadTimeDays: product.leadTime,
        safetyStock: Math.floor(product.minStock * 0.2),
      },
    });
  }

  // Create stock movements
  const stockMovements = [];
  for (const product of products) {
    // Initial stock in
    stockMovements.push({
      productId: product.id,
      type: StockMovementType.IN,
      quantity: product.currentStock + 50,
      reason: 'Initial inventory',
      reference: `PO-${Date.now()}-${product.sku}`,
    });

    // Some sales out
    stockMovements.push({
      productId: product.id,
      type: StockMovementType.OUT,
      quantity: 50,
      reason: 'Sales',
      reference: `SALE-${Date.now()}-${product.sku}`,
    });
  }

  await prisma.stockMovement.createMany({
    data: stockMovements,
  });

  // Create trend data
  await prisma.trendData.createMany({
    data: [
      {
        name: '#WirelessEarbuds',
        platform: SocialPlatform.TWITTER,
        mentions: 12500,
        change: 32.5,
        sentiment: 'positive',
        keywords: JSON.stringify(['wireless', 'earbuds', 'bluetooth', 'music']),
      },
      {
        name: 'EcoFriendlyBottles',
        platform: SocialPlatform.INSTAGRAM,
        mentions: 8200,
        change: -12.3,
        sentiment: 'positive',
        keywords: JSON.stringify(['eco', 'sustainable', 'water', 'bottle']),
      },
      {
        name: 'SummerFashion',
        platform: SocialPlatform.TIKTOK,
        mentions: 35600,
        change: 78.9,
        sentiment: 'positive',
        keywords: JSON.stringify(['summer', 'fashion', 'organic', 'cotton']),
      },
      {
        name: 'HomeWorkout',
        platform: SocialPlatform.INSTAGRAM,
        mentions: 14300,
        change: 24.7,
        sentiment: 'positive',
        keywords: JSON.stringify(['yoga', 'fitness', 'home', 'workout']),
      },
    ],
  });

  // Create alerts
  await prisma.alert.createMany({
    data: [
      {
        type: AlertType.STOCK_OUT,
        title: 'Stock Out Alert',
        message: 'Stainless Steel Water Bottle is out of stock',
        action: 'Reorder now',
        productId: products[2].id,
        priority: AlertPriority.CRITICAL,
      },
      {
        type: AlertType.STOCK_LOW,
        title: 'Low Stock Warning',
        message: 'Bluetooth Speaker stock is below minimum threshold',
        action: 'Check supplier',
        productId: products[4].id,
        priority: AlertPriority.HIGH,
      },
      {
        type: AlertType.TREND_SPIKE,
        title: 'Trending Product',
        message: 'Wireless Earbuds trending on social media',
        action: 'Increase stock',
        productId: products[0].id,
        priority: AlertPriority.MEDIUM,
      },
      {
        type: AlertType.REORDER_NEEDED,
        title: 'Reorder Required',
        message: 'Organic Cotton T-Shirt shipment needed',
        productId: products[1].id,
        priority: AlertPriority.HIGH,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Created ${await prisma.user.count()} users`);
  console.log(`📦 Created ${await prisma.product.count()} products`);
  console.log(`🏭 Created ${await prisma.supplier.count()} suppliers`);
  console.log(`📊 Created ${await prisma.salesData.count()} sales data entries`);
  console.log(`📈 Created ${await prisma.trendData.count()} trend data entries`);
  console.log(`🚨 Created ${await prisma.alert.count()} alerts`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

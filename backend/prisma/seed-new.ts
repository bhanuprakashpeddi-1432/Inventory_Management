import { PrismaClient, UserRole, ProductStatus, StockMovementType, SocialPlatform, AlertType, AlertPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data (except users to avoid login issues)
  console.log('🧹 Cleaning up existing data...');
  try {
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
    console.log('✅ Existing data cleaned up');
  } catch (error) {
    console.log('⚠️ Some cleanup failed, continuing with seeding...');
  }

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
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Tech Innovations Inc.',
      email: 'orders@techinnovations.com',
      phone: '+1-555-0123',
      contactPerson: 'John Smith',
      address: '123 Tech Street, Silicon Valley, CA 94000'
    }
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Eco Products Co.',
      email: 'supply@ecoproducts.com',
      phone: '+1-555-0456',
      contactPerson: 'Sarah Johnson',
      address: '456 Green Ave, Portland, OR 97205'
    }
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: 'Home Essentials Ltd.',
      email: 'sales@homeessentials.com',
      phone: '+1-555-0789',
      contactPerson: 'Mike Wilson',
      address: '789 Comfort Blvd, Austin, TX 73301'
    }
  });

  const suppliers = [supplier1, supplier2, supplier3];
  console.log('✅ Suppliers created:', suppliers.length);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        category: 'Electronics',
        sku: 'ELC-WBH-001',
        currentStock: 45,
        minStock: 10,
        maxStock: 100,
        unitPrice: 89.99,
        leadTime: 7,
        status: ProductStatus.IN_STOCK,
        trendScore: 8,
        createdBy: admin.id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Organic Cotton T-Shirt',
        description: 'Eco-friendly cotton t-shirt in various colors',
        category: 'Clothing',
        sku: 'CLT-OCT-001',
        currentStock: 25,
        minStock: 15,
        maxStock: 200,
        unitPrice: 24.99,
        leadTime: 14,
        status: ProductStatus.LOW_STOCK,
        trendScore: 6,
        createdBy: admin.id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Home Security Camera',
        description: '1080p HD security camera with night vision',
        category: 'Electronics',
        sku: 'ELC-SHC-001',
        currentStock: 12,
        minStock: 5,
        maxStock: 50,
        unitPrice: 129.99,
        leadTime: 10,
        status: ProductStatus.IN_STOCK,
        trendScore: 9,
        createdBy: admin.id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Bamboo Kitchen Utensil Set',
        description: 'Sustainable bamboo kitchen utensils',
        category: 'Home & Garden',
        sku: 'HGD-BKU-001',
        currentStock: 8,
        minStock: 12,
        maxStock: 75,
        unitPrice: 34.99,
        leadTime: 21,
        status: ProductStatus.LOW_STOCK,
        trendScore: 7,
        createdBy: admin.id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Fitness Tracker Watch',
        description: 'Advanced fitness tracking with heart rate monitor',
        category: 'Electronics',
        sku: 'ELC-FTW-001',
        currentStock: 0,
        minStock: 8,
        maxStock: 60,
        unitPrice: 199.99,
        leadTime: 14,
        status: ProductStatus.OUT_OF_STOCK,
        trendScore: 10,
        createdBy: admin.id,
      }
    })
  ]);

  console.log('✅ Products created:', products.length);

  // Create supplier-product relationships
  await Promise.all([
    prisma.supplierProduct.create({
      data: {
        supplierId: supplier1.id,
        productId: products[0].id, // Headphones
        cost: 65.00,
        leadTime: 7,
        minOrderQty: 10
      }
    }),
    prisma.supplierProduct.create({
      data: {
        supplierId: supplier2.id,
        productId: products[1].id, // T-Shirt
        cost: 18.00,
        leadTime: 14,
        minOrderQty: 25
      }
    }),
    prisma.supplierProduct.create({
      data: {
        supplierId: supplier1.id,
        productId: products[2].id, // Security Camera
        cost: 95.00,
        leadTime: 10,
        minOrderQty: 5
      }
    }),
    prisma.supplierProduct.create({
      data: {
        supplierId: supplier3.id,
        productId: products[3].id, // Bamboo Utensils
        cost: 22.00,
        leadTime: 21,
        minOrderQty: 12
      }
    }),
    prisma.supplierProduct.create({
      data: {
        supplierId: supplier1.id,
        productId: products[4].id, // Fitness Tracker
        cost: 150.00,
        leadTime: 14,
        minOrderQty: 8
      }
    })
  ]);

  console.log('✅ Supplier-product relationships created');

  // Create reorder points
  await Promise.all(products.map(product => 
    prisma.reorderPoint.create({
      data: {
        productId: product.id,
        reorderLevel: product.minStock,
        reorderQuantity: Math.floor((product.maxStock - product.minStock) * 0.8),
        leadTimeDays: product.leadTime,
        safetyStock: Math.floor(product.minStock * 0.2),
        isActive: true
      }
    })
  ));

  console.log('✅ Reorder points created');

  // Create some sample stock movements
  const stockMovements = [
    {
      productId: products[0].id,
      type: StockMovementType.IN,
      quantity: 50,
      reason: 'Initial stock',
    },
    {
      productId: products[1].id,
      type: StockMovementType.OUT,
      quantity: 15,
      reason: 'Sales',
    },
    {
      productId: products[2].id,
      type: StockMovementType.IN,
      quantity: 20,
      reason: 'Restocking',
    }
  ];

  await Promise.all(stockMovements.map(movement =>
    prisma.stockMovement.create({
      data: {
        productId: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        reference: `REF-${Date.now()}`
      }
    })
  ));

  console.log('✅ Stock movements created');

  // Create sample alerts
  await Promise.all([
    prisma.alert.create({
      data: {
        type: AlertType.STOCK_LOW,
        title: 'Low Stock Alert',
        message: 'Organic Cotton T-Shirt is running low on stock',
        action: 'Reorder immediately',
        productId: products[1].id,
        priority: AlertPriority.MEDIUM
      }
    }),
    prisma.alert.create({
      data: {
        type: AlertType.STOCK_OUT,
        title: 'Out of Stock Alert', 
        message: 'Fitness Tracker Watch is out of stock',
        action: 'Emergency reorder required',
        productId: products[4].id,
        priority: AlertPriority.HIGH
      }
    })
  ]);

  console.log('✅ Alerts created');

  // Create sample sales data and forecasts
  const now = new Date();
  const salesDataPromises = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));      for (const product of products) {
        const salesQuantity = Math.floor(Math.random() * 10) + 1;
        salesDataPromises.push(
          prisma.salesData.create({
            data: {
              productId: product.id,
              forecast: salesQuantity,
              actual: i < 29 ? salesQuantity + Math.floor(Math.random() * 4) - 2 : null,
              date: date
            }
          })
        );
      }
  }

  await Promise.all(salesDataPromises);
  console.log('✅ Sales data created');

  // Create sample trend data
  await Promise.all([
    prisma.trendData.create({
      data: {
        name: 'wireless headphones',
        platform: SocialPlatform.TWITTER,
        mentions: 1250,
        change: 85.5,
        sentiment: 'positive',
        keywords: JSON.stringify(['wireless', 'headphones', 'audio', 'bluetooth'])
      }
    }),
    prisma.trendData.create({
      data: {
        name: 'fitness tracker',
        platform: SocialPlatform.INSTAGRAM,
        mentions: 980,
        change: 92.3,
        sentiment: 'positive',
        keywords: JSON.stringify(['fitness', 'tracker', 'health', 'wearable'])
      }
    })
  ]);

  console.log('✅ Trend data created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('- Admin: admin@store.com / admin123');
  console.log('- Manager: manager@store.com / admin123');
  console.log('- User: user@store.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import express from 'express';
import { PrismaClient, StockMovementType } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { AuthenticatedRequest, requireManagerOrAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Add stock movement
router.post('/movement', requireManagerOrAdmin, [
  body('productId').isString().withMessage('Product ID is required'),
  body('type').isIn(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER']).withMessage('Invalid movement type'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('reason').optional().isString()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, type, quantity, reason, reference } = req.body;

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate new stock level
    let newStock = product.currentStock;
    if (type === StockMovementType.IN) {
      newStock += quantity;
    } else if (type === StockMovementType.OUT) {
      newStock = Math.max(0, newStock - quantity);
    } else if (type === StockMovementType.ADJUSTMENT) {
      newStock = quantity; // Direct adjustment to specific amount
    }

    // Update product stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          reason,
          reference
        }
      });

      // Update product stock and status
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: newStock,
          status: newStock === 0 ? 'OUT_OF_STOCK' :
                  newStock <= product.minStock ? 'LOW_STOCK' : 'IN_STOCK'
        }
      });

      return { movement, product: updatedProduct };
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'STOCK_MOVEMENT',
        resource: 'INVENTORY',
        details: JSON.stringify({
          productId,
          type,
          quantity,
          oldStock: product.currentStock,
          newStock
        })
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process stock movement' });
  }
});

// Get stock movements with filtering
router.get('/movements', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const productId = req.query.productId;
    const type = req.query.type;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            select: { name: true, sku: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ]);

    res.json({
      movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Get reorder recommendations
router.get('/reorder-recommendations', async (req: any, res: any) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { status: 'OUT_OF_STOCK' },
          { status: 'LOW_STOCK' }
        ]
      },
      include: {
        reorderPoints: true,
        supplierProducts: {
          include: {
            supplier: true
          }
        }
      }
    });

    const recommendations = products.map(product => {
      const reorderPoint = product.reorderPoints[0];
      const supplier = product.supplierProducts[0];

      return {
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          currentStock: product.currentStock,
          minStock: product.minStock,
          status: product.status
        },
        reorderPoint: reorderPoint ? {
          reorderLevel: reorderPoint.reorderLevel,
          reorderQuantity: reorderPoint.reorderQuantity,
          leadTimeDays: reorderPoint.leadTimeDays
        } : null,
        supplier: supplier ? {
          name: supplier.supplier.name,
          cost: supplier.cost,
          minOrderQty: supplier.minOrderQty
        } : null,
        urgency: product.status === 'OUT_OF_STOCK' ? 'CRITICAL' :
                product.currentStock <= product.minStock * 0.5 ? 'HIGH' : 'MEDIUM'
      };
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reorder recommendations' });
  }
});

export default router;

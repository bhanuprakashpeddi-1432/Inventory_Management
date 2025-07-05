import express from 'express';
import { PrismaClient, ProductStatus } from '@prisma/client';
import { body, validationResult, query } from 'express-validator';
import { AuthenticatedRequest, requireManagerOrAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all products with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('status').optional().isIn(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED']),
  query('search').optional().isString()
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const status = req.query.status as ProductStatus;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplierProducts: {
            include: {
              supplier: true
            }
          },
          reorderPoints: true
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        supplierProducts: {
          include: {
            supplier: true
          }
        },
        reorderPoints: true,
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        salesData: {
          take: 12,
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', requireManagerOrAdmin, [
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('category').isLength({ min: 1 }).withMessage('Category is required'),
  body('sku').isLength({ min: 1 }).withMessage('SKU is required'),
  body('currentStock').isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minStock').isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
  body('maxStock').isInt({ min: 1 }).withMessage('Max stock must be a positive integer'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
  body('leadTime').isInt({ min: 1 }).withMessage('Lead time must be a positive integer')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await prisma.product.create({
      data: {
        ...req.body,
        createdBy: req.user!.id,
        status: req.body.currentStock === 0 ? ProductStatus.OUT_OF_STOCK :
                req.body.currentStock <= req.body.minStock ? ProductStatus.LOW_STOCK :
                ProductStatus.IN_STOCK
      }
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        resource: 'PRODUCT',
        details: JSON.stringify({ productId: product.id, name: product.name })
      }
    });

    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', requireManagerOrAdmin, [
  body('name').optional().isLength({ min: 1 }),
  body('category').optional().isLength({ min: 1 }),
  body('currentStock').optional().isInt({ min: 0 }),
  body('minStock').optional().isInt({ min: 0 }),
  body('maxStock').optional().isInt({ min: 1 }),
  body('unitPrice').optional().isFloat({ min: 0 }),
  body('leadTime').optional().isInt({ min: 1 })
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updateData: any = { ...req.body };

    // Update status based on stock levels
    if (updateData.currentStock !== undefined) {
      updateData.status = updateData.currentStock === 0 ? ProductStatus.OUT_OF_STOCK :
                         updateData.currentStock <= (updateData.minStock || existingProduct.minStock) ? ProductStatus.LOW_STOCK :
                         ProductStatus.IN_STOCK;
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        resource: 'PRODUCT',
        details: JSON.stringify({ productId: product.id, changes: req.body })
      }
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (soft delete)
router.delete('/:id', requireManagerOrAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        resource: 'PRODUCT',
        details: JSON.stringify({ productId: product.id, name: product.name })
      }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ForecastService } from '../services/forecast';

const router = express.Router();
const prisma = new PrismaClient();
const forecastService = new ForecastService();

// Get dashboard analytics
router.get('/dashboard', async (req: any, res: any) => {
  try {
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      recentMovements,
      topCategories
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { status: 'LOW_STOCK', isActive: true } }),
      prisma.product.count({ where: { status: 'OUT_OF_STOCK', isActive: true } }),
      prisma.product.aggregate({
        where: { isActive: true },
        _sum: { currentStock: true }
      }),
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } }
        }
      }),
      prisma.product.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { category: true },
        _sum: { currentStock: true }
      })
    ]);

    res.json({
      summary: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalStockValue: totalValue._sum.currentStock || 0
      },
      recentMovements,
      topCategories
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// Get sales analytics
router.get('/sales', async (req: any, res: any) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await prisma.salesData.findMany({
      where: {
        date: { gte: startDate }
      },
      include: {
        product: { select: { name: true, category: true } }
      },
      orderBy: { date: 'asc' }
    });

    // Group by date
    const dailySales = salesData.reduce((acc: any, sale) => {
      const dateStr = sale.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, forecast: 0, actual: 0 };
      }
      acc[dateStr].forecast += sale.forecast;
      acc[dateStr].actual += sale.actual || 0;
      return acc;
    }, {});

    res.json({
      dailySales: Object.values(dailySales),
      totalForecast: salesData.reduce((sum, sale) => sum + sale.forecast, 0),
      totalActual: salesData.reduce((sum, sale) => sum + (sale.actual || 0), 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// Get forecast data
router.get('/forecast/:productId', async (req: any, res: any) => {
  try {
    const { productId } = req.params;
    const days = parseInt(req.query.days) || 7;

    const forecast = await forecastService.getProductForecast(productId, days);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Generate new forecast
router.post('/forecast/:productId', async (req: any, res: any) => {
  try {
    const { productId } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        salesData: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await forecastService.generateProductForecast(product);
    
    res.json({ message: 'Forecast generated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

export default router;

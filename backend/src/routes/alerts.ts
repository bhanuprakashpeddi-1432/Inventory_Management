import express from 'express';
import { PrismaClient, AlertType, AlertPriority } from '@prisma/client';
import { WebSocketService } from '../services/websocket';

const router = express.Router();
const prisma = new PrismaClient();

export class AlertService {
  private prisma: PrismaClient;
  private websocketService: WebSocketService;

  constructor(websocketService: WebSocketService) {
    this.prisma = new PrismaClient();
    this.websocketService = websocketService;
  }

  startAlertMonitoring() {
    // Check for alerts every 5 minutes
    setInterval(async () => {
      await this.checkStockLevels();
      await this.checkForecastDeviations();
    }, 5 * 60 * 1000);
  }

  async checkStockLevels() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { reorderPoints: true }
    });

    for (const product of products) {
      if (product.currentStock === 0) {
        await this.createAlert({
          type: AlertType.STOCK_OUT,
          title: 'Stock Out Alert',
          message: `${product.name} is out of stock`,
          action: 'Reorder immediately',
          productId: product.id,
          priority: AlertPriority.CRITICAL
        });
      } else if (product.currentStock <= product.minStock) {
        await this.createAlert({
          type: AlertType.STOCK_LOW,
          title: 'Low Stock Warning',
          message: `${product.name} stock is below minimum threshold`,
          action: 'Review reorder requirements',
          productId: product.id,
          priority: AlertPriority.HIGH
        });
      }
    }
  }

  async checkForecastDeviations() {
    // Check for significant deviations between forecast and actual sales
    const salesData = await this.prisma.salesData.findMany({
      where: {
        actual: { not: null },
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      include: { product: true }
    });

    for (const sale of salesData) {
      const deviation = Math.abs((sale.actual! - sale.forecast) / sale.forecast);
      if (deviation > 0.3) { // 30% deviation
        await this.createAlert({
          type: AlertType.FORECAST_DEVIATION,
          title: 'Forecast Deviation',
          message: `${sale.product.name} sales deviated significantly from forecast`,
          productId: sale.productId,
          priority: AlertPriority.MEDIUM
        });
      }
    }
  }

  async createAlert(alertData: any) {
    const alert = await this.prisma.alert.create({
      data: alertData
    });

    // Broadcast to connected clients
    this.websocketService.broadcastAlert(alert);
    
    return alert;
  }
}

// Get alerts with pagination
router.get('/', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const isRead = req.query.isRead === 'true';
    const priority = req.query.priority;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.isRead !== undefined) where.isRead = isRead;
    if (priority) where.priority = priority;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.alert.count({ where })
    ]);

    res.json({
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Mark alert as read
router.patch('/:id/read', async (req: any, res: any) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Resolve alert
router.patch('/:id/resolve', async (req: any, res: any) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { 
        isResolved: true,
        resolvedAt: new Date()
      }
    });

    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Get alert statistics
router.get('/stats', async (req: any, res: any) => {
  try {
    const [total, unread, byPriority, byType] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({ where: { isRead: false } }),
      prisma.alert.groupBy({
        by: ['priority'],
        _count: { priority: true }
      }),
      prisma.alert.groupBy({
        by: ['type'],
        _count: { type: true }
      })
    ]);

    res.json({
      total,
      unread,
      byPriority,
      byType
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

export default router;

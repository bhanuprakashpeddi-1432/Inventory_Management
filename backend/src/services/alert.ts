import { PrismaClient, AlertType, AlertPriority } from '@prisma/client';
import { WebSocketService } from './websocket';

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

    console.log('🚨 Alert monitoring service started');
  }

  async checkStockLevels() {
    try {
      const products = await this.prisma.product.findMany({
        where: { isActive: true },
        include: { reorderPoints: true }
      });

      for (const product of products) {
        // Check if alert already exists for this product
        const existingAlert = await this.prisma.alert.findFirst({
          where: {
            productId: product.id,
            type: { in: [AlertType.STOCK_OUT, AlertType.STOCK_LOW] },
            isResolved: false
          }
        });

        if (product.currentStock === 0 && !existingAlert) {
          await this.createAlert({
            type: AlertType.STOCK_OUT,
            title: 'Stock Out Alert',
            message: `${product.name} is out of stock`,
            action: 'Reorder immediately',
            productId: product.id,
            priority: AlertPriority.CRITICAL
          });
        } else if (product.currentStock <= product.minStock && product.currentStock > 0 && !existingAlert) {
          await this.createAlert({
            type: AlertType.STOCK_LOW,
            title: 'Low Stock Warning',
            message: `${product.name} stock is below minimum threshold (${product.currentStock}/${product.minStock})`,
            action: 'Review reorder requirements',
            productId: product.id,
            priority: AlertPriority.HIGH
          });
        }

        // Check for reorder point triggers
        const reorderPoint = product.reorderPoints[0];
        if (reorderPoint && product.currentStock <= reorderPoint.reorderLevel) {
          const existingReorderAlert = await this.prisma.alert.findFirst({
            where: {
              productId: product.id,
              type: AlertType.REORDER_NEEDED,
              isResolved: false
            }
          });

          if (!existingReorderAlert) {
            await this.createAlert({
              type: AlertType.REORDER_NEEDED,
              title: 'Reorder Needed',
              message: `${product.name} has reached reorder point. Suggested quantity: ${reorderPoint.reorderQuantity}`,
              action: 'Create purchase order',
              productId: product.id,
              priority: AlertPriority.HIGH
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking stock levels:', error);
    }
  }

  async checkForecastDeviations() {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const salesData = await this.prisma.salesData.findMany({
        where: {
          actual: { not: null },
          date: { gte: threeDaysAgo }
        },
        include: { product: true }
      });

      for (const sale of salesData) {
        if (sale.actual && sale.forecast > 0) {
          const deviation = Math.abs((sale.actual - sale.forecast) / sale.forecast);
          
          if (deviation > 0.3) { // 30% deviation threshold
            const existingAlert = await this.prisma.alert.findFirst({
              where: {
                productId: sale.productId,
                type: AlertType.FORECAST_DEVIATION,
                createdAt: { gte: threeDaysAgo },
                isResolved: false
              }
            });

            if (!existingAlert) {
              await this.createAlert({
                type: AlertType.FORECAST_DEVIATION,
                title: 'Forecast Deviation Alert',
                message: `${sale.product.name} sales deviated ${Math.round(deviation * 100)}% from forecast (Actual: ${sale.actual}, Forecast: ${sale.forecast})`,
                action: 'Review forecasting model',
                productId: sale.productId,
                priority: deviation > 0.5 ? AlertPriority.HIGH : AlertPriority.MEDIUM
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking forecast deviations:', error);
    }
  }

  async createAlert(alertData: {
    type: AlertType;
    title: string;
    message: string;
    action?: string;
    productId?: string;
    priority: AlertPriority;
  }) {
    try {
      const alert = await this.prisma.alert.create({
        data: alertData
      });

      // Broadcast to connected clients
      this.websocketService.broadcastAlert(alert);
      
      console.log(`🚨 Alert created: ${alert.title} - ${alert.message}`);
      
      return alert;
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  async resolveAlert(alertId: string) {
    try {
      const alert = await this.prisma.alert.update({
        where: { id: alertId },
        data: {
          isResolved: true,
          resolvedAt: new Date()
        }
      });

      return alert;
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  }

  async getActiveAlerts() {
    return await this.prisma.alert.findMany({
      where: { isResolved: false },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }
}

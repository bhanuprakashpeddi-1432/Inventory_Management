import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

export class ForecastService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Start daily forecasting job
  startDailyForecasting() {
    // Run every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('🔮 Running daily forecast generation...');
      await this.generateDailyForecasts();
    });
  }

  // Generate forecasts for all products
  async generateDailyForecasts() {
    try {
      const products = await this.prisma.product.findMany({
        where: { isActive: true },
        include: {
          salesData: {
            orderBy: { date: 'desc' },
            take: 30 // Last 30 days
          }
        }
      });

      for (const product of products) {
        await this.generateProductForecast(product);
      }

      console.log('✅ Daily forecasts generated successfully');
    } catch (error) {
      console.error('❌ Error generating forecasts:', error);
    }
  }

  // Generate forecast for a specific product
  async generateProductForecast(product: any) {
    try {
      const salesHistory = product.salesData;
      
      if (salesHistory.length < 7) {
        console.log(`⚠️ Insufficient data for product ${product.name}`);
        return;
      }

      // Different forecasting algorithms
      const linearForecast = this.linearRegressionForecast(salesHistory);
      const seasonalForecast = this.seasonalForecast(salesHistory);
      const trendForecast = this.trendAdjustedForecast(salesHistory, product.trendScore);

      // Save forecasts to database
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + 7); // 7 days ahead

      await Promise.all([
        this.saveForecast(product.id, forecastDate, linearForecast, 'linear'),
        this.saveForecast(product.id, forecastDate, seasonalForecast, 'seasonal'),
        this.saveForecast(product.id, forecastDate, trendForecast, 'trend-adjusted')
      ]);

    } catch (error) {
      console.error(`Error forecasting for product ${product.id}:`, error);
    }
  }

  // Linear regression forecast
  private linearRegressionForecast(salesData: any[]): { quantity: number; confidence: number } {
    if (salesData.length < 2) return { quantity: 0, confidence: 0 };

    const n = salesData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    salesData.forEach((data, index) => {
      const x = index;
      const y = data.actual || data.forecast;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecastQuantity = Math.max(0, Math.round(slope * n + intercept));
    const confidence = this.calculateConfidence(salesData, slope, intercept);

    return { quantity: forecastQuantity, confidence };
  }

  // Seasonal forecast (simple moving average with seasonal adjustment)
  private seasonalForecast(salesData: any[]): { quantity: number; confidence: number } {
    const recentData = salesData.slice(0, 7); // Last 7 days
    const average = recentData.reduce((sum, data) => sum + (data.actual || data.forecast), 0) / recentData.length;

    // Simple seasonal multiplier based on day of week
    const today = new Date().getDay();
    const seasonalMultipliers = [0.9, 1.1, 1.2, 1.1, 1.3, 1.4, 1.0]; // Sunday to Saturday
    
    const seasonalQuantity = Math.max(0, Math.round(average * seasonalMultipliers[today]));
    const confidence = Math.min(95, 60 + (recentData.length * 5));

    return { quantity: seasonalQuantity, confidence };
  }

  // Trend-adjusted forecast
  private trendAdjustedForecast(salesData: any[], trendScore: number): { quantity: number; confidence: number } {
    const baseQuantity = salesData.slice(0, 3).reduce((sum, data) => sum + (data.actual || data.forecast), 0) / 3;
    
    // Adjust based on trend score (1-10)
    const trendMultiplier = 0.8 + (trendScore / 10) * 0.4; // Range: 0.8 to 1.2
    
    const trendQuantity = Math.max(0, Math.round(baseQuantity * trendMultiplier));
    const confidence = Math.min(95, 50 + (trendScore * 4));

    return { quantity: trendQuantity, confidence };
  }

  // Calculate confidence score
  private calculateConfidence(salesData: any[], slope: number, intercept: number): number {
    let sumSquaredErrors = 0;
    
    salesData.forEach((data, index) => {
      const predicted = slope * index + intercept;
      const actual = data.actual || data.forecast;
      sumSquaredErrors += Math.pow(predicted - actual, 2);
    });

    const mse = sumSquaredErrors / salesData.length;
    const confidence = Math.max(30, Math.min(95, 100 - (mse * 2)));
    
    return Math.round(confidence);
  }

  // Save forecast to database
  private async saveForecast(productId: string, forecastDate: Date, forecast: { quantity: number; confidence: number }, algorithm: string) {
    try {
      await this.prisma.forecastData.create({
        data: {
          productId,
          forecastDate,
          quantity: forecast.quantity,
          confidence: forecast.confidence,
          algorithm
        }
      });
    } catch (error) {
      console.error('Error saving forecast:', error);
    }
  }

  // Get forecast for a product
  async getProductForecast(productId: string, days: number = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await this.prisma.forecastData.findMany({
      where: {
        productId,
        forecastDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { forecastDate: 'asc' }
    });
  }
}

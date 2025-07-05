import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get trending data
router.get('/', async (req: any, res: any) => {
  try {
    const platform = req.query.platform;
    const limit = parseInt(req.query.limit) || 10;

    const where: any = {};
    if (platform) where.platform = platform.toUpperCase();

    const trends = await prisma.trendData.findMany({
      where,
      take: limit,
      orderBy: { mentions: 'desc' }
    });

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get trending topics that might affect inventory
router.get('/inventory-impact', async (req: any, res: any) => {
  try {
    const trends = await prisma.trendData.findMany({
      where: {
        change: { gt: 20 }, // Trending up by more than 20%
        mentions: { gt: 1000 }
      },
      orderBy: { change: 'desc' }
    });

    // Match trends with products (simple keyword matching)
    const products = await prisma.product.findMany({
      where: { isActive: true }
    });

    const impactAnalysis = trends.map(trend => {
      const keywords = trend.keywords ? JSON.parse(trend.keywords) : [];
      const relatedProducts = products.filter(product => {
        const productWords = product.name.toLowerCase().split(' ');
        return keywords.some((keyword: string) => 
          productWords.some((word: string) => word.includes(keyword.toLowerCase()))
        );
      });

      return {
        trend,
        relatedProducts: relatedProducts.map(p => ({
          id: p.id,
          name: p.name,
          currentStock: p.currentStock,
          status: p.status
        })),
        recommendedAction: Number(trend.change) > 50 ? 'INCREASE_STOCK' : 'MONITOR'
      };
    });

    res.json(impactAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze trend impact' });
  }
});

export default router;

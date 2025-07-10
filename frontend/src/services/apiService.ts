import api from './api';

// Add missing interface definitions
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DashboardAnalytics {
  summary: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalValue: number;
  };
  recentMovements: StockMovement[];
}

export interface SalesAnalytics {
  daily: Array<{
    date: string;
    sales: number;
    revenue: number;
    units: number;
  }>;
  total: {
    sales: number;
    revenue: number;
    units: number;
  };
}

export interface ProductForecast {
  forecasts: Array<{
    date: string;
    quantity: number;
    confidence: number;
  }>;
  accuracy: number;
  trend: number;
}

export interface AlertStats {
  total: number;
  unread: number;
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  byType: {
    [key: string]: number;
  };
}

export interface ReorderRecommendation {
  productId: string;
  product: {
    name: string;
    sku: string;
    currentStock: number;
    minStock: number;
  };
  recommendedQuantity: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
}

export interface TrendImpact {
  trendId: string;
  productId: string;
  impact: number;
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  leadTime: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  trendScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  reason?: string;
  reference?: string;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
  };
}

export interface Alert {
  id: string;
  type: 'STOCK_LOW' | 'STOCK_OUT' | 'REORDER_NEEDED' | 'FORECAST_DEVIATION' | 'TREND_SPIKE' | 'SYSTEM_ERROR';
  title: string;
  message: string;
  action?: string;
  productId?: string;
  isRead: boolean;
  isResolved: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  resolvedAt?: string;
}

export interface TrendData {
  id: string;
  name: string;
  platform: 'TWITTER' | 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | 'YOUTUBE';
  mentions: number;
  change: number;
  sentiment?: string;
  keywords?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'INVENTORY_SUMMARY' | 'SALES_FORECAST' | 'STOCK_MOVEMENT' | 'TREND_ANALYSIS' | 'REORDER_REPORT';
  format: 'PDF' | 'EXCEL' | 'CSV';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  filePath?: string;
  createdAt: string;
  completedAt?: string;
  creator: {
    name: string;
  };
}

class ApiService {
  /**
   * API Service for Inventory Management
   * 
   * DUMMY DATA METHODS (for testing without backend):
   * - getSalesAnalytics(): Returns mock sales data
   * - getProductForecast(): Returns mock forecast data
   * - generateForecast(): Simulates forecast generation
   * - getTrends(): Returns mock social media trends
   * - getTrendImpact(): Returns mock trend impact data
   * 
   * To switch to real APIs, uncomment the API calls in each method.
   */

  // Helper method for error handling
  private handleError(error: unknown, context: string): never {
    console.error(`API Error in ${context}:`, error);
    throw error;
  }

  // Products API
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<ProductsResponse> {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getProducts');
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getProduct');
    }
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    try {
      const response = await api.post('/products', product);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'createProduct');
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
      const response = await api.put(`/products/${id}`, product);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'updateProduct');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      return this.handleError(error, 'deleteProduct');
    }
  }

  // Inventory API
  async addStockMovement(movement: {
    productId: string;
    type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
    quantity: number;
    reason?: string;
    reference?: string;
  }): Promise<{ movement: StockMovement; product: Product }> {
    const response = await api.post('/inventory/movement', movement);
    return response.data;
  }

  async getStockMovements(params?: {
    page?: number;
    limit?: number;
    productId?: string;
    type?: string;
  }): Promise<{ movements: StockMovement[]; pagination: Pagination }> {
    const response = await api.get('/inventory/movements', { params });
    return response.data;
  }

  async getReorderRecommendations(): Promise<ReorderRecommendation[]> {
    const response = await api.get('/inventory/reorder-recommendations');
    return response.data;
  }

  // Analytics API
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getDashboardAnalytics');
    }
  }

  async getSalesAnalytics(days: number = 30): Promise<SalesAnalytics> {
    try {
      // Return dummy data for testing
      const dummyData: SalesAnalytics = {
        daily: Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - i - 1));
          return {
            date: date.toISOString().split('T')[0],
            sales: Math.floor(Math.random() * 1000) + 500,
            revenue: Math.floor(Math.random() * 50000) + 25000,
            units: Math.floor(Math.random() * 100) + 50
          };
        }),
        total: {
          sales: Math.floor(Math.random() * 30000) + 15000,
          revenue: Math.floor(Math.random() * 1500000) + 750000,
          units: Math.floor(Math.random() * 3000) + 1500
        }
      };
      return dummyData;
      
      // Uncomment below to use real API
      // const response = await api.get('/analytics/sales', { params: { days } });
      // return response.data;
    } catch (error) {
      return this.handleError(error, 'getSalesAnalytics');
    }
  }

  async getProductForecast(productId: string, days: number = 7): Promise<ProductForecast> {
    try {
      // Return dummy data for testing
      console.log(`Generating dummy forecast for product: ${productId}`);
      const dummyData: ProductForecast = {
        forecasts: Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i + 1);
          return {
            date: date.toISOString().split('T')[0],
            quantity: Math.floor(Math.random() * 200) + 50,
            confidence: Math.floor(Math.random() * 30) + 70 // 70-100% confidence
          };
        }),
        accuracy: Math.floor(Math.random() * 15) + 85, // 85-100% accuracy
        trend: Math.floor(Math.random() * 40) - 20 // -20 to +20 trend
      };
      return dummyData;
      
      // Uncomment below to use real API
      // const response = await api.get(`/analytics/forecast/${productId}`, { params: { days } });
      // return response.data;
    } catch (error) {
      return this.handleError(error, 'getProductForecast');
    }
  }

  async generateForecast(productId: string): Promise<void> {
    try {
      // Simulate API call with dummy data
      console.log(`Generating forecast for product: ${productId}`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Forecast generated successfully for product: ${productId}`);
      
      // Uncomment below to use real API
      // await api.post(`/analytics/forecast/${productId}`);
    } catch (error) {
      return this.handleError(error, 'generateForecast');
    }
  }

  // Alerts API
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    priority?: string;
  }): Promise<{ alerts: Alert[]; pagination: Pagination }> {
    const response = await api.get('/alerts', { params });
    return response.data;
  }

  async markAlertAsRead(id: string): Promise<Alert> {
    const response = await api.patch(`/alerts/${id}/read`);
    return response.data;
  }

  async resolveAlert(id: string): Promise<Alert> {
    const response = await api.patch(`/alerts/${id}/resolve`);
    return response.data;
  }

  async getAlertStats(): Promise<AlertStats> {
    const response = await api.get('/alerts/stats');
    return response.data;
  }

  // Trends API
  async getTrends(params?: {
    platform?: string;
    limit?: number;
  }): Promise<TrendData[]> {
    // Return dummy data for testing
    const platforms = ['TWITTER', 'INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'YOUTUBE'] as const;
    const trendNames = [
      'Sustainable Products', 'Smart Home Devices', 'Organic Food', 'Fitness Equipment',
      'Gaming Accessories', 'Winter Fashion', 'Health Supplements', 'Tech Gadgets',
      'Home Decor', 'Beauty Products', 'Kitchen Appliances', 'Outdoor Gear'
    ];
    const sentiments = ['positive', 'negative', 'neutral'];
    
    const limit = params?.limit || 10;
    const filterPlatform = params?.platform;
    
    const dummyData: TrendData[] = Array.from({ length: limit }, (_, i) => {
      const platform = filterPlatform || platforms[Math.floor(Math.random() * platforms.length)];
      const trendName = trendNames[Math.floor(Math.random() * trendNames.length)];
      
      return {
        id: `trend-${i + 1}`,
        name: trendName,
        platform: platform as 'TWITTER' | 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | 'YOUTUBE',
        mentions: Math.floor(Math.random() * 50000) + 1000,
        change: Math.floor(Math.random() * 200) - 100, // -100% to +100%
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        keywords: `${trendName.toLowerCase()}, trending, popular, viral, ${platform.toLowerCase()}`,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    });
    
    return dummyData;
    
    // Uncomment below to use real API
    // const response = await api.get('/trends', { params });
    // return response.data;
  }

  async getTrendImpact(): Promise<TrendImpact[]> {
    // Return dummy data for testing
    const impactTypes = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'] as const;
    
    const dummyData: TrendImpact[] = Array.from({ length: 8 }, (_, i) => ({
      trendId: `trend-${i + 1}`,
      productId: `product-${Math.floor(Math.random() * 50) + 1}`,
      impact: Math.floor(Math.random() * 100) - 50, // -50 to +50
      type: impactTypes[Math.floor(Math.random() * impactTypes.length)],
      confidence: Math.floor(Math.random() * 40) + 60 // 60-100% confidence
    }));
    
    return dummyData;
    
    // Uncomment below to use real API
    // const response = await api.get('/trends/inventory-impact');
    // return response.data;
  }

  // Reports API
  async generateInventoryReport(format: 'PDF' | 'EXCEL', includeMovements: boolean = false): Promise<{ reportId: string; message: string }> {
    const response = await api.post('/reports/inventory', { format, includeMovements });
    return response.data;
  }

  async generateForecastReport(format: 'PDF' | 'EXCEL', days: number = 30): Promise<{ reportId: string; message: string }> {
    const response = await api.post('/reports/forecast', { format, days });
    return response.data;
  }

  async getReport(id: string): Promise<Report> {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  }

  async getReports(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ reports: Report[]; pagination: Pagination }> {
    const response = await api.get('/reports', { params });
    return response.data;
  }

  async downloadReport(id: string): Promise<Blob> {
    const response = await api.get(`/reports/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new ApiService();

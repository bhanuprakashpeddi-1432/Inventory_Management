import api from './api';

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
  // Products API
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<ProductsResponse> {
    const response = await api.get('/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    const response = await api.post('/products', product);
    return response.data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
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
  }): Promise<{ movements: StockMovement[]; pagination: any }> {
    const response = await api.get('/inventory/movements', { params });
    return response.data;
  }

  async getReorderRecommendations(): Promise<any[]> {
    const response = await api.get('/inventory/reorder-recommendations');
    return response.data;
  }

  // Analytics API
  async getDashboardAnalytics(): Promise<any> {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  }

  async getSalesAnalytics(days: number = 30): Promise<any> {
    const response = await api.get('/analytics/sales', { params: { days } });
    return response.data;
  }

  async getProductForecast(productId: string, days: number = 7): Promise<any> {
    const response = await api.get(`/analytics/forecast/${productId}`, { params: { days } });
    return response.data;
  }

  async generateForecast(productId: string): Promise<void> {
    await api.post(`/analytics/forecast/${productId}`);
  }

  // Alerts API
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    priority?: string;
  }): Promise<{ alerts: Alert[]; pagination: any }> {
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

  async getAlertStats(): Promise<any> {
    const response = await api.get('/alerts/stats');
    return response.data;
  }

  // Trends API
  async getTrends(params?: {
    platform?: string;
    limit?: number;
  }): Promise<TrendData[]> {
    const response = await api.get('/trends', { params });
    return response.data;
  }

  async getTrendImpact(): Promise<any[]> {
    const response = await api.get('/trends/inventory-impact');
    return response.data;
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
  }): Promise<{ reports: Report[]; pagination: any }> {
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

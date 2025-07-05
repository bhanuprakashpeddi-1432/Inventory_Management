// Re-export types from API service for better organization
export type {
  Product,
  ProductsResponse,
  StockMovement,
  Alert,
  TrendData,
  Report
} from '../services/apiService';

// Additional frontend-specific types
export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  recentMovements: number;
  activeAlerts: number;
}

export interface ForecastData {
  date: string;
  actual?: number;
  forecast: number;
  confidence?: number;
}

export interface SalesData {
  date: string;
  sales: number;
  revenue: number;
  units: number;
}

export interface ChartData {
  date: string;
  [key: string]: string | number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  department?: string;
  isActive: boolean;
  createdAt: string;
}

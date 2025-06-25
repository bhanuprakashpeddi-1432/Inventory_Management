export interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  leadTime: number; // in days
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  trendScore: number; // 1-10
}

export interface SalesData {
  date: string;
  forecast: number;
  actual: number;
}

export interface Trend {
  id: string;
  name: string;
  platform: 'twitter' | 'tiktok' | 'instagram';
  mentions: number;
  change: number; // percentage
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  message: string;
  action?: string;
}

export interface Trend {
  id: string;
  name: string;
  platform: 'twitter' | 'tiktok' | 'instagram';
  mentions: number;
  change: number; // percentage
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Earbuds Pro',
    category: 'Electronics',
    currentStock: 10,
    minStock: 20,
    maxStock: 100,
    leadTime: 7,
    status: 'in-stock',
    trendScore: 8
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    category: 'Apparel',
    currentStock: 15,
    minStock: 25,
    maxStock: 150,
    leadTime: 14,
    status: 'low-stock',
    trendScore: 5
  },
  {
    id: '3',
    name: 'Stainless Steel Water Bottle',
    category: 'Accessories',
    currentStock: 0,
    minStock: 10,
    maxStock: 80,
    leadTime: 10,
    status: 'out-of-stock',
    trendScore: 9
  },
  {
    id: '4',
    name: 'Yoga Mat',
    category: 'Fitness',
    currentStock: 28,
    minStock: 15,
    maxStock: 60,
    leadTime: 5,
    status: 'in-stock',
    trendScore: 7
  },
  {
    id: '5',
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    currentStock: 8,
    minStock: 10,
    maxStock: 50,
    leadTime: 7,
    status: 'low-stock',
    trendScore: 6
  }
];

export const salesData: SalesData[] = [
  { date: 'Jan', forecast: 65, actual: 58 },
  { date: 'Feb', forecast: 59, actual: 63 },
  { date: 'Mar', forecast: 80, actual: 82 },
  { date: 'Apr', forecast: 81, actual: 75 },
  { date: 'May', forecast: 56, actual: 60 },
  { date: 'Jun', forecast: 55, actual: 48 },
  { date: 'Jul', forecast: 40, actual: 45 }
];

export const trends: Trend[] = [
  {
    id: '1',
    name: '#WirelessEarbuds',
    platform: 'twitter',
    mentions: 12500,
    change: 32
  },
  {
    id: '2',
    name: 'EcoFriendlyBottles',
    platform: 'instagram',
    mentions: 8200,
    change: -12
  },
  {
    id: '3',
    name: 'SummerFashion',
    platform: 'tiktok',
    mentions: 35600,
    change: 78
  },
  {
    id: '4',
    name: 'HomeWorkout',
    platform: 'instagram',
    mentions: 14300,
    change: 24
  }
];

export const alerts: Alert[] = [
  {
    id: '1',
    type: 'error',
    message: 'Stainless Steel Water Bottle is out of stock',
    action: 'Reorder now'
  },
  {
    id: '2',
    type: 'warning',
    message: 'Bluetooth Speaker stock is below minimum threshold',
    action: 'Check supplier'
  },
  {
    id: '3',
    type: 'info',
    message: 'Wireless Earbuds trending on social media',
    action: 'Increase stock'
  },
  {
    id: '4',
    type: 'success',
    message: 'Organic Cotton T-Shirt shipment arriving tomorrow'
  }
];
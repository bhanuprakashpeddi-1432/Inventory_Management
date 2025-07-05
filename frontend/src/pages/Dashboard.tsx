import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sidebar } from "../components/EnhancedSidebar";
import { ProductOverview } from "../components/ProductOverview";
import { ForecastChart } from "../components/ForecastChart";
import { TrendFeed } from "../components/TrendFeed";
import { RealTimeAlerts } from "../components/RealTimeAlerts";
import { ReportGenerator } from "../components/ReportGenerator";
import { InventoryManager } from "../components/InventoryManager";
import apiService, { type Product } from "../services/apiService";
import websocketService from "../services/websocket";
import { LogOut, Settings, User } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";

interface StockMovement {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  createdAt: string;
}

interface DashboardSummary {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

interface DashboardData {
  summary: DashboardSummary;
  recentMovements: StockMovement[];
}

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      const [productsResponse, analytics] = await Promise.all([
        apiService.getProducts({ limit: 50 }),
        apiService.getDashboardAnalytics()
      ]);

      setProducts(productsResponse.products);
      setDashboardData(analytics);
      
      if (productsResponse.products.length > 0) {
        setSelectedProduct(productsResponse.products[0]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const setupWebSocketListeners = useCallback(() => {
    // Listen for real-time inventory updates
    websocketService.onInventoryUpdate((data: {
      productId: string;
      updates: Partial<Product>;
    }) => {
      if (data.productId) {
        setProducts(prev => 
          prev.map(product => 
            product.id === data.productId 
              ? { ...product, ...data.updates }
              : product
          )
        );

        // Update selected product if it's the one that changed
        setSelectedProduct(prev => 
          prev?.id === data.productId 
            ? { ...prev, ...data.updates }
            : prev
        );
      }
    });

    // Listen for stock movements
    websocketService.onStockMovement((movement: StockMovement) => {
      console.log('Stock movement received:', movement);
      // Update products without full reload to prevent infinite loop
      setProducts(prev => [...prev]); // Trigger re-render
    });
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    setupWebSocketListeners();

    return () => {
      // Cleanup WebSocket listeners
      websocketService.off('inventory-update');
      websocketService.off('stock-movement');
    };
  }, [setupWebSocketListeners]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts(prev => {
      const existing = prev.find(p => p.id === updatedProduct.id);
      if (existing) {
        // Update existing product
        return prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      } else {
        // Add new product
        return [updatedProduct, ...prev];
      }
    });

    // Update selected product if it's the one that was updated
    if (selectedProduct?.id === updatedProduct.id || !selectedProduct) {
      setSelectedProduct(updatedProduct);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* Enhanced Header with User Menu */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Store Inventory Manager</h1>
            {websocketService.isConnected() ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Offline</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Dashboard Stats */}
            {dashboardData && (
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{dashboardData.summary.totalProducts}</div>
                  <div className="text-muted-foreground">Products</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600">{dashboardData.summary.lowStockProducts}</div>
                  <div className="text-muted-foreground">Low Stock</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">{dashboardData.summary.outOfStockProducts}</div>
                  <div className="text-muted-foreground">Out of Stock</div>
                </div>
              </div>
            )}

            {/* User Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{user?.name}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role.toLowerCase()}</p>
                  </div>
                  <hr />
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 container px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div className="bg-background rounded-lg shadow-sm p-4 h-full max-h-[700px] lg:max-h-none overflow-y-auto">
            <Sidebar 
              products={products}
              onSelectProduct={handleProductSelect} 
              selectedProductId={selectedProduct?.id || ''}
              onProductUpdate={handleProductUpdate}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="lg:col-span-9 order-1 lg:order-2 grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* Top Row - Product Overview and Alerts */}
          <div className="xl:col-span-8 bg-background rounded-lg shadow-sm p-6 h-fit min-h-[400px]">
            <ProductOverview product={selectedProduct} />
          </div>

          <div className="xl:col-span-4 bg-background rounded-lg shadow-sm p-6 h-fit min-h-[400px]">
            <RealTimeAlerts />
          </div>
          
          {/* Second Row - Inventory Manager and Report Generator */}
          <div className="xl:col-span-8 bg-background rounded-lg shadow-sm p-6 h-fit min-h-[350px]">
            <InventoryManager 
              selectedProduct={selectedProduct}
              onProductUpdate={handleProductUpdate}
            />
          </div>

          <div className="xl:col-span-4 bg-background rounded-lg shadow-sm p-6 h-fit min-h-[350px]">
            <ReportGenerator />
          </div>

          {/* Third Row - Trend Feed */}
          <div className="xl:col-span-12 bg-background rounded-lg shadow-sm p-6 h-fit min-h-[380px]">
            <TrendFeed />
          </div>
          
          {/* Fourth Row - Forecast Chart */}
          <div className="xl:col-span-12 bg-background rounded-lg shadow-sm p-6 h-fit min-h-[450px]">
            <ForecastChart selectedProductId={selectedProduct?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
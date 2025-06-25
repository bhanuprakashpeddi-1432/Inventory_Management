import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from "@/components/ui/alert";
import type { Product } from "../data/dummyData";
import { AlertTriangle } from "lucide-react";

interface ProductOverviewProps {
  product: Product | null;
}

export const ProductOverview = ({ product }: ProductOverviewProps) => {
  if (!product) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Select a product to view details</p>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (product.status) {
      case 'in-stock':
        return <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>;
      case 'low-stock':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Low Stock</Badge>;
      case 'out-of-stock':
        return <Badge className="bg-red-500 hover:bg-red-600">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  const getStockPercentage = () => {
    return Math.min(100, Math.round((product.currentStock / product.maxStock) * 100));
  };

  return (
    <Card className="p-6 h-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-x1 font-bold">{product.name}</h2>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Current Stock</h3>
          <p className="text-3xl font-bold">{product.currentStock}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Stock Range</h3>
          <p className="text-lg">
            {product.minStock} - {product.maxStock}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Stock Level</span>
          <span>{getStockPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              product.status === 'in-stock'
                ? 'bg-green-500'
                : product.status === 'low-stock'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${getStockPercentage()}%` }}
          ></div>
        </div>
      </div>

      {product.status === 'in-stock' && (
        <Alert variant="default" className="mb-4">
          <AlertTitle>In Stock</AlertTitle>
          <AlertDescription>
            This product is currently in stock.
          </AlertDescription>
        </Alert>
      )}

      {product.status === 'low-stock' && (
        <Alert variant="default" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Stock Warning</AlertTitle>
          <AlertDescription>
            Current stock is below minimum threshold.
          </AlertDescription>
        </Alert>
      )}

      {product.status === 'out-of-stock' && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Out of Stock</AlertTitle>
          <AlertDescription>
            This product is currently out of stock.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Trend Analysis</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div
              className="h-2.5 rounded-full bg-blue-500"
              style={{ width: `${product.trendScore * 10}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{product.trendScore}/10</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {product.trendScore > 7
            ? "High demand expected"
            : product.trendScore > 4
            ? "Moderate demand expected"
            : "Low demand expected"}
        </p>
      </div>
    </Card>
  );
};
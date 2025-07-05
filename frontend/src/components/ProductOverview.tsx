import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { Product } from "../types";

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
      case 'IN_STOCK':
        return <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>;
      case 'LOW_STOCK':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Low Stock</Badge>;
      case 'OUT_OF_STOCK':
        return <Badge className="bg-red-500 hover:bg-red-600">Out of Stock</Badge>;
      case 'DISCONTINUED':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Discontinued</Badge>;
      default:
        return null;
    }
  };

  const getStockPercentage = () => {
    return Math.min(100, Math.round((product.currentStock / product.maxStock) * 100));
  };

  const getStockBarColor = () => {
    switch (product.status) {
      case 'IN_STOCK':
        return 'bg-green-500';
      case 'LOW_STOCK':
        return 'bg-yellow-500';
      case 'OUT_OF_STOCK':
        return 'bg-red-500';
      case 'DISCONTINUED':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card className="p-6 h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-sm text-muted-foreground">{product.sku}</p>
        </div>
        {getStatusBadge()}
      </div>

      {product.description && (
        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Current Stock</h3>
          <p className="text-3xl font-bold">{typeof product.currentStock === 'number' ? product.currentStock.toLocaleString() : '0'}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Stock Range</h3>
          <p className="text-lg">
            {typeof product.minStock === 'number' ? product.minStock.toLocaleString() : '0'} - {typeof product.maxStock === 'number' ? product.maxStock.toLocaleString() : '0'}
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Unit Price</h3>
          <p className="text-lg font-semibold">${typeof product.unitPrice === 'number' ? product.unitPrice.toFixed(2) : '0.00'}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Category</h3>
          <p className="text-lg">{product.category}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Stock Level</span>
          <span>{getStockPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${getStockBarColor()}`}
            style={{ width: `${getStockPercentage()}%` }}
          ></div>
        </div>
      </div>

      {product.status === 'IN_STOCK' && (
        <Alert variant="default" className="mb-4">
          <AlertTitle>In Stock</AlertTitle>
          <AlertDescription>
            This product is currently in stock with {product.currentStock} units available.
          </AlertDescription>
        </Alert>
      )}

      {product.status === 'LOW_STOCK' && (
        <Alert variant="default" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Stock Warning</AlertTitle>
          <AlertDescription>
            Current stock ({product.currentStock}) is below minimum threshold ({product.minStock}).
          </AlertDescription>
        </Alert>
      )}

      {product.status === 'OUT_OF_STOCK' && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Out of Stock</AlertTitle>
          <AlertDescription>
            This product is currently out of stock. Reorder recommended.
          </AlertDescription>
        </Alert>
      )}

      {product.status === 'DISCONTINUED' && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Discontinued</AlertTitle>
          <AlertDescription>
            This product has been discontinued and is no longer being restocked.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Trend Analysis</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div
              className="h-2.5 rounded-full bg-blue-500"
              style={{ width: `${Math.min(100, (typeof product.trendScore === 'number' ? product.trendScore : 0) * 10)}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{typeof product.trendScore === 'number' ? product.trendScore.toFixed(1) : '0.0'}/10</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {product.trendScore > 7
            ? "High demand expected"
            : product.trendScore > 4
            ? "Moderate demand expected"
            : "Low demand expected"}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Lead Time:</span>
            <span className="ml-2 font-medium">{product.leadTime} days</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Value:</span>
            <span className="ml-2 font-medium">${(product.currentStock * product.unitPrice).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
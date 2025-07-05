import { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Package, ArrowLeftRight, History, Save } from "lucide-react";
import apiService, { type Product, type StockMovement } from '../services/apiService';

interface InventoryManagerProps {
  selectedProduct: Product | null;
  onProductUpdate: (product: Product) => void;
}

export const InventoryManager = ({ selectedProduct, onProductUpdate }: InventoryManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [showAddStock, setShowAddStock] = useState(false);
  const [stockForm, setStockForm] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER',
    quantity: 0,
    reason: '',
    reference: ''
  });

  const loadStockMovements = useCallback(async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await apiService.getStockMovements({
        productId: selectedProduct.id,
        limit: 10
      });
      setMovements(response.movements);
    } catch (error) {
      console.error('Failed to load stock movements:', error);
    }
  }, [selectedProduct]);

  useEffect(() => {
    loadStockMovements();
  }, [loadStockMovements]);

  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const response = await apiService.addStockMovement({
        productId: selectedProduct.id,
        ...stockForm
      });

      onProductUpdate(response.product);
      await loadStockMovements();
      
      setShowAddStock(false);
      setStockForm({
        type: 'IN',
        quantity: 0,
        reason: '',
        reference: ''
      });
    } catch (error) {
      console.error('Failed to add stock movement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'OUT':
        return <Minus className="w-4 h-4 text-red-500" />;
      case 'ADJUSTMENT':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'TRANSFER':
        return <ArrowLeftRight className="w-4 h-4 text-purple-500" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-green-500';
      case 'OUT':
        return 'bg-red-500';
      case 'ADJUSTMENT':
        return 'bg-blue-500';
      case 'TRANSFER':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!selectedProduct) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Select a product to manage inventory</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Inventory Management
          </h3>
          <p className="text-sm text-muted-foreground">{selectedProduct.name}</p>
        </div>
        <Button 
          onClick={() => setShowAddStock(!showAddStock)}
          size="sm"
        >
          {showAddStock ? 'Cancel' : 'Add Movement'}
        </Button>
      </div>

      {/* Current Stock Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{selectedProduct.currentStock}</p>
          <p className="text-sm text-green-600">Current</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{selectedProduct.minStock}</p>
          <p className="text-sm text-yellow-600">Minimum</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{selectedProduct.maxStock}</p>
          <p className="text-sm text-blue-600">Maximum</p>
        </div>
      </div>

      {/* Add Stock Form */}
      {showAddStock && (
        <Card className="p-4 mb-4 border-2 border-blue-200">
          <form onSubmit={handleStockMovement} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Movement Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={stockForm.type}
                  onChange={(e) => setStockForm(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER'
                  }))}
                >
                  <option value="IN">Stock In</option>
                  <option value="OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={stockForm.reason}
                onChange={(e) => setStockForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Optional reason for movement"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reference</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={stockForm.reference}
                onChange={(e) => setStockForm(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="PO #, Invoice #, etc."
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Processing...' : 'Add Movement'}
            </Button>
          </form>
        </Card>
      )}

      {/* Recent Movements */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center mb-3">
          <History className="w-4 h-4 mr-2" />
          <h4 className="font-medium">Recent Movements</h4>
        </div>

        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No stock movements recorded
          </p>
        ) : (
          <div className="space-y-2">
            {movements.map((movement) => (
              <Card key={movement.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getMovementIcon(movement.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={`text-white ${getMovementColor(movement.type)}`}
                        >
                          {movement.type}
                        </Badge>
                        <span className="font-medium">
                          {movement.type === 'OUT' ? '-' : '+'}{movement.quantity}
                        </span>
                      </div>
                      {movement.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {movement.reason}
                        </p>
                      )}
                      {movement.reference && (
                        <p className="text-xs text-muted-foreground">
                          Ref: {movement.reference}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

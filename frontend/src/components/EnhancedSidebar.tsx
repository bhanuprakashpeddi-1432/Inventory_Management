import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, X, Plus, Edit, Search } from "lucide-react";
import { Badge } from "./ui/badge";
import { ProductForm } from "./ProductForm";
import type { Product } from "../services/apiService";

type SidebarProps = {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  selectedProductId: string;
  onProductUpdate: (product: Product) => void;
};

export const Sidebar = ({ products, onSelectProduct, selectedProductId, onProductUpdate }: SidebarProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'LOW_STOCK':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'OUT_OF_STOCK':
        return <X className="w-4 h-4 text-red-500" />;
      case 'DISCONTINUED':
        return <X className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'In Stock';
      case 'LOW_STOCK':
        return 'Low Stock';
      case 'OUT_OF_STOCK':
        return 'Out of Stock';
      case 'DISCONTINUED':
        return 'Discontinued';
      default:
        return status;
    }
  };

  const handleAddProduct = (product: Product) => {
    onProductUpdate(product);
    setShowAddForm(false);
  };

  const handleEditProduct = (product: Product) => {
    onProductUpdate(product);
    setEditingProduct(null);
  };

  if (showAddForm) {
    return (
      <div className="h-full overflow-y-auto">
        <ProductForm
          onSave={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
        />
      </div>
    );
  }

  if (editingProduct) {
    return (
      <div className="h-full overflow-y-auto">
        <ProductForm
          product={editingProduct}
          onSave={handleEditProduct}
          onCancel={() => setEditingProduct(null)}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Products ({products.length})</h2>
        <Button size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {filteredProducts.map((product) => (
          <AccordionItem 
            key={product.id} 
            value={product.id}
            className={product.id === selectedProductId ? "bg-accent/10" : ""}
          >
            <AccordionTrigger 
              className={`hover:no-underline ${product.id === selectedProductId ? "font-medium" : ""}`}
              onClick={() => onSelectProduct(product)}
            >
              <div className="flex items-center space-x-2 w-full">
                {getStatusIcon(product.status)}
                <span className="flex-1 text-left text-sm">{product.name}</span>
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{product.name}</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(product);
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Current Stock:</div>
                  <div className="font-medium">{typeof product.currentStock === 'number' ? product.currentStock.toLocaleString() : '0'}</div>
                  <div>Min Stock:</div>
                  <div className="font-medium">{typeof product.minStock === 'number' ? product.minStock.toLocaleString() : '0'}</div>
                  <div>Max Stock:</div>
                  <div className="font-medium">{typeof product.maxStock === 'number' ? product.maxStock.toLocaleString() : '0'}</div>
                  <div>Status:</div>
                  <div className="font-medium">{getStatusText(product.status)}</div>
                  <div>SKU:</div>
                  <div className="font-medium">{product.sku}</div>
                  <div>Lead Time:</div>
                  <div className="font-medium">{product.leadTime} days</div>
                  <div>Unit Price:</div>
                  <div className="font-medium">${typeof product.unitPrice === 'number' ? product.unitPrice.toFixed(2) : '0.00'}</div>
                  <div>Trend Score:</div>
                  <div className="font-medium">{typeof product.trendScore === 'number' ? product.trendScore.toFixed(1) : '0.0'}/10</div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {filteredProducts.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground text-sm">
            {searchTerm ? 'No products match your search' : 'No products found'}
          </p>
          {!searchTerm && (
            <Button 
              className="mt-2" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add First Product
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

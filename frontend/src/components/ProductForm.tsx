import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Save, X, Edit } from "lucide-react";
import apiService, { type Product } from '../services/apiService';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const ProductForm = ({ product, onSave, onCancel, isModal = false }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    sku: product?.sku || '',
    currentStock: product?.currentStock || 0,
    minStock: product?.minStock || 0,
    maxStock: product?.maxStock || 0,
    unitPrice: product?.unitPrice || 0,
    leadTime: product?.leadTime || 7,
    status: product?.status || 'IN_STOCK' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let savedProduct: Product;

      if (product) {
        // Update existing product
        savedProduct = await apiService.updateProduct(product.id, formData);
        console.log('Product updated successfully');
      } else {
        // Create new product
        savedProduct = await apiService.createProduct(formData);
        console.log('Product created successfully');
      }

      onSave(savedProduct);
      
      if (!product) {
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      sku: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unitPrice: 0,
      leadTime: 7,
      status: 'IN_STOCK' as const
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className={`p-6 ${isModal ? 'w-full max-w-2xl' : ''}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          {product ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          {product ? 'Edit Product' : 'Add New Product'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">SKU *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Stock</label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.currentStock}
              onChange={(e) => handleInputChange('currentStock', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Stock *</label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.minStock}
              onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Stock *</label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.maxStock}
              onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value) || 0)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Unit Price ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lead Time (days)</label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.leadTime}
              onChange={(e) => handleInputChange('leadTime', parseInt(e.target.value) || 7)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

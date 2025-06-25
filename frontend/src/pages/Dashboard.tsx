import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ProductOverview } from "../components/ProductOverview";
import { ForecastChart } from "../components/ForecastChart";
import { TrendFeed } from "../components/TrendFeed";
import { Alerts } from "../components/Alerts";
import { products } from "../data/dummyData";
import type { Product } from "../data/dummyData";

export const Dashboard = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* Fixed Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">Inventory Optimizer</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 container px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar - Fixed Position */}
        <div className="lg:col-span-3">
          <div className="bg-background rounded-lg shadow-sm p-4 h-full">
            <Sidebar 
              onSelectProduct={handleProductSelect} 
              selectedProductId={selectedProduct.id}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Product Overview and Trend Feed */}
          <div className="md:col-span-2 bg-background rounded-lg shadow-sm p-6">
            <ProductOverview product={selectedProduct} />
          </div>

          {/* Alerts */}
          <div className="md:col-span-1 bg-background rounded-lg shadow-sm p-6">
            <Alerts />
          </div>
          
          <div className="md:col-span-3 bg-background rounded-lg shadow-sm p-6">
            <TrendFeed />
          </div>
          
          {/* Forecast Chart */}
          <div className="md:col-span-3 bg-background rounded-lg shadow-sm p-6">
            <ForecastChart />
          </div>
        </div>
      </div>
    </div>
  );
};
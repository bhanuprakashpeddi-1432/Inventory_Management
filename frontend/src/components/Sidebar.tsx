import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { products } from "../data/dummyData";
import { Check, AlertTriangle, X } from "lucide-react";
import { Badge } from "./ui/badge";
import type { Product } from "../data/dummyData";

type SidebarProps = {
  onSelectProduct: (product: Product) => void;
  selectedProductId: string;
};

export const Sidebar = ({ onSelectProduct, selectedProductId }: SidebarProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'low-stock':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'out-of-stock':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Products</h2>
      <Accordion type="single" collapsible className="w-full">
        {products.map((product) => (
          <AccordionItem 
            key={product.id} 
            value={product.id}
            className={product.id === selectedProductId ? "bg-accent/10" : ""}
          >
            <AccordionTrigger 
              className={`hover:no-underline ${product.id === selectedProductId ? "font-medium" : ""}`}
              onClick={() => onSelectProduct(product)}
            >
              <div className="flex items-center space-x-2">
                {getStatusIcon(product.status)}
                <span>{product.name}</span>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Current Stock:</div>
                  <div className="font-medium">{product.currentStock}</div>
                  <div>Min Stock:</div>
                  <div>{product.minStock}</div>
                  <div>Max Stock:</div>
                  <div>{product.maxStock}</div>
                  <div>Lead Time:</div>
                  <div>{product.leadTime} days</div>
                  <div>Trend Score:</div>
                  <div>
                    <Badge variant={product.trendScore > 7 ? 'default' : 'secondary'}>
                      {product.trendScore}/10
                    </Badge>
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
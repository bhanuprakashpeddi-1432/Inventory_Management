
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, Check } from "lucide-react";

export const OrderButton = () => {
  return (
    <div className="flex space-x-2">
      <Button className="flex-1">
        <ShoppingCart className="mr-2 h-4 w-4" />
        Order Now
      </Button>
      <Button variant="outline" className="flex-1">
        <Clock className="mr-2 h-4 w-4" />
        Schedule
      </Button>
      <Button variant="outline" size="icon">
        <Check className="h-4 w-4" />
      </Button>
    </div>
  );
};
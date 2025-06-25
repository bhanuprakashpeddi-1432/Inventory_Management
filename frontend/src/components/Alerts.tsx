import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { alerts } from "../data/dummyData";
import { AlertTriangle, X, Check, Info } from "lucide-react";

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <X className="h-4 w-4" />;
    case 'success':
      return <Check className="h-4 w-4" />;
    case 'info':
      return <Info className="h-4 w-4" />;
    default:
      return null;
  }
};

export const Alerts = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Alerts & Suggestions</h2>
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : alert.type}>
          {getAlertIcon(alert.type)}
          <AlertTitle className="capitalize">{alert.type}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
          {alert.action && (
            <Button variant="outline" size="sm" className="ml-auto">
              {alert.action}
            </Button>
          )}
        </Alert>
      ))}
    </div>
  );
};
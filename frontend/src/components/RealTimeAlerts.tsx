import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import apiService from '../services/apiService';
import type { Alert as AlertType } from '../services/apiService';
import websocketService from '../services/websocket';
import { AlertTriangle, X, Check, Info, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'STOCK_LOW':
    case 'REORDER_NEEDED':
      return <AlertTriangle className="h-4 w-4" />;
    case 'STOCK_OUT':
      return <X className="h-4 w-4" />;
    case 'TREND_SPIKE':
      return <Check className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL':
      return 'destructive';
    case 'HIGH':
      return 'destructive';
    case 'MEDIUM':
      return 'default';
    case 'LOW':
      return 'secondary';
    default:
      return 'default';
  }
};

export const RealTimeAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    
    // Setup real-time alert updates
    websocketService.onAlert((newAlert: AlertType) => {
      setAlerts(prev => [newAlert, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.error(newAlert.message, {
        duration: 6000,
        icon: getAlertIcon(newAlert.type),
      });
    });

    return () => {
      websocketService.off('new-alert');
    };
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await apiService.getAlerts({ limit: 10, isRead: false });
      setAlerts(response.alerts);
      setUnreadCount(response.alerts.filter(alert => !alert.isRead).length);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await apiService.markAlertAsRead(alertId);
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await apiService.resolveAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Alert resolved successfully');
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Alerts & Notifications</h2>
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Alerts & Notifications</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="font-semibold">Recent Alerts</h3>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No alerts</p>
              ) : (
                alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2 rounded border ${!alert.isRead ? 'bg-accent/50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                      <Badge variant={getPriorityColor(alert.priority) as 'default' | 'secondary' | 'destructive'} className="text-xs">
                        {alert.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                          className="text-xs"
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs"
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {alerts.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No active alerts</p>
            <p className="text-sm text-muted-foreground/70">All systems running smoothly</p>
          </div>
        </Card>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {alerts.slice(0, 4).map((alert) => (
            <Card key={alert.id} className={`p-4 ${!alert.isRead ? 'border-l-4 border-l-orange-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm truncate">{alert.title}</span>
                      <Badge variant={getPriorityColor(alert.priority) as 'default' | 'secondary' | 'destructive'} className="text-xs shrink-0">
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{alert.message}</p>
                    {alert.action && (
                      <p className="text-xs text-blue-600 mt-2 line-clamp-1">
                        Action: {alert.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(alert.id)}
                    className="text-xs"
                  >
                    Mark Read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resolveAlert(alert.id)}
                  className="text-xs"
                >
                  Resolve
                </Button>
              </div>
            </Card>
          ))}
          {alerts.length > 4 && (
            <Card className="p-3 text-center">
              <p className="text-sm text-muted-foreground">
                +{alerts.length - 4} more alerts
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

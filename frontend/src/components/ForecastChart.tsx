import { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import apiService from '../services/apiService';
import websocketService from '../services/websocket';
import type { ForecastData } from '../types';

interface ForecastChartProps {
  selectedProductId?: string;
}

export const ForecastChart = ({ selectedProductId }: ForecastChartProps) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);

  const loadForecastData = useCallback(async () => {
    if (!selectedProductId) return;
    
    setLoading(true);
    try {
      const forecast = await apiService.getProductForecast(selectedProductId, 14);
      const sales = await apiService.getSalesAnalytics(14);
      
      // Transform data for chart
      const chartData = forecast.forecasts?.map((item: { date: string; quantity: number; confidence: number }, index: number) => ({
        date: new Date(item.date).toLocaleDateString(),
        forecast: item.quantity,
        confidence: item.confidence,
        actual: sales.daily?.[index]?.units || undefined
      })) || [];

      setForecastData(chartData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load forecast data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProductId]);

  const generateNewForecast = async () => {
    if (!selectedProductId) return;
    
    setLoading(true);
    try {
      await apiService.generateForecast(selectedProductId);
      await loadForecastData();
    } catch (error) {
      console.error('Failed to generate forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecastData();
  }, [loadForecastData]);

  useEffect(() => {
    // Check WebSocket connection status
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  const accuracy = forecastData.length > 0 
    ? forecastData
        .filter(d => d.actual !== undefined)
        .reduce((acc, d) => acc + (d.confidence || 0), 0) / 
      forecastData.filter(d => d.actual !== undefined).length
    : 0;

  const trend = forecastData.length > 1 
    ? forecastData[forecastData.length - 1].forecast - forecastData[0].forecast
    : 0;

  if (!selectedProductId) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Select a product to view forecast</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">Forecast vs Actual Sales</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewForecast}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{typeof accuracy === 'number' ? accuracy.toFixed(1) : '0.0'}%</p>
          <p className="text-sm text-muted-foreground">Accuracy</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center">
            {(typeof trend === 'number' ? trend : 0) > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500 mr-1" />
            )}
            <p className="text-2xl font-bold">{typeof trend === 'number' ? Math.abs(trend).toFixed(0) : '0'}</p>
          </div>
          <p className="text-sm text-muted-foreground">Trend</p>
        </div>
        <div className="text-center">
          <Badge variant={forecastData.length > 0 ? "default" : "secondary"}>
            {forecastData.length} Days
          </Badge>
          <p className="text-sm text-muted-foreground">Forecast</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={forecastData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number | string, name: string) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name === 'forecast' ? 'Forecast' : 'Actual'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="forecast" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="actual" 
              stroke="#82ca9d" 
              fill="#82ca9d" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#8884d8] rounded-full mr-2"></div>
          <span className="text-sm">Forecast</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#82ca9d] rounded-full mr-2"></div>
          <span className="text-sm">Actual</span>
        </div>
      </div>
    </Card>
  );
};
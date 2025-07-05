import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Twitter, Instagram, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import apiService from '../services/apiService';
import websocketService from '../services/websocket';
import type { TrendData } from '../types';

export const TrendFeed = () => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const trendData = await apiService.getTrends({ limit: 10 });
      setTrends(trendData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTrends = () => {
    loadTrends();
  };

  useEffect(() => {
    loadTrends();

    // Check connection status
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'tiktok':
        return (
          <div className="w-4 h-4 bg-black text-white rounded-sm flex items-center justify-center text-xs font-bold">
            TK
          </div>
        );
      case 'facebook':
        return (
          <div className="w-4 h-4 bg-blue-600 text-white rounded-sm flex items-center justify-center text-xs font-bold">
            F
          </div>
        );
      case 'youtube':
        return (
          <div className="w-4 h-4 bg-red-600 text-white rounded-sm flex items-center justify-center text-xs font-bold">
            YT
          </div>
        );
      default:
        return null;
    }
  };

  const getTrendBadge = (change: number) => {
    const isPositive = change > 0;
    return (
      <Badge 
        variant={isPositive ? 'default' : 'secondary'}
        className={`flex items-center gap-1 ${
          isPositive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {typeof change === 'number' ? Math.abs(change).toFixed(1) : '0.0'}%
      </Badge>
    );
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="p-6 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Trending Now</h2>
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
            onClick={refreshTrends}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {trends.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No trends available</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto">
          {trends.map((trend) => (
            <Popover key={trend.id}>
              <PopoverTrigger asChild>
                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(trend.platform)}
                      <div className="min-w-0 flex-1">
                        <span className="font-medium truncate block">{trend.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {trend.mentions.toLocaleString()} mentions
                          </span>
                          {trend.sentiment && (
                            <span className={`text-xs font-medium ${getSentimentColor(trend.sentiment)}`}>
                              {trend.sentiment}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {getTrendBadge(trend.change)}
                  </div>
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{trend.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {trend.platform}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mentions</p>
                      <p className="font-medium">{typeof trend.mentions === 'number' ? trend.mentions.toLocaleString() : '0'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Change</p>
                      <p className={`font-medium ${(typeof trend.change === 'number' ? trend.change : 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(typeof trend.change === 'number' ? trend.change : 0) > 0 ? '+' : ''}{typeof trend.change === 'number' ? trend.change.toFixed(1) : '0.0'}%
                      </p>
                    </div>
                    {trend.sentiment && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Sentiment</p>
                          <p className={`font-medium capitalize ${getSentimentColor(trend.sentiment)}`}>
                            {trend.sentiment}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {trend.keywords && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {trend.keywords.split(',').slice(0, 5).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Trending since {new Date(trend.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      )}
    </Card>
  );
};
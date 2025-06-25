import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trends } from "@/data/dummyData";
import { Twitter, Instagram, TrendingUp, TrendingDown } from "lucide-react";

export const TrendFeed = () => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'tiktok':
        return <span className="text-xs font-bold">TK</span>;
      default:
        return null;
    }
  };

  const getTrendBadge = (change: number) => {
    return (
      <Badge 
        variant={change > 0 ? 'default' : 'secondary'}
        className="flex items-center gap-1"
      >
        {change > 0 ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {Math.abs(change)}%
      </Badge>
    );
  };

  return (
    <Card className="p-6 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Trending Now</h2>
      <div className="space-y-4">
        {trends.map((trend) => (
          <Popover key={trend.id}>
            <PopoverTrigger asChild>
              <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(trend.platform)}
                    <span className="font-medium">{trend.name}</span>
                  </div>
                  {getTrendBadge(trend.change)}
                </div>
              </Card>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-semibold">{trend.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {trend.mentions.toLocaleString()} mentions
                </p>
                <p className="text-sm">
                  {trend.change > 0 ? 'Up' : 'Down'} {Math.abs(trend.change)}% from last week
                </p>
                <div className="pt-2">
                  <Badge variant="outline" className="text-xs">
                    {trend.platform}
                  </Badge>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </Card>
  );
};
import { Card, CardContent } from '@/components/ui/card';
import type { TokenStats } from '@/types/token';

interface StatsCardsProps {
  stats?: TokenStats;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-800">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-3 bg-gray-600 rounded mb-2"></div>
                <div className="h-6 bg-gray-600 rounded mb-1"></div>
                <div className="h-2 bg-gray-600 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400">No data available</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gray-800">
        <CardContent className="p-4">
          <div className="text-sm text-gray-400">Last 15min</div>
          <div className="text-xl font-bold text-green-500 font-mono">{stats.last15min}</div>
          <div className="text-xs text-gray-500">new launches</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800">
        <CardContent className="p-4">
          <div className="text-sm text-gray-400">Avg Liquidity</div>
          <div className="text-xl font-bold text-white font-mono">
            ${(stats.avgLiquidity / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-gray-500">filtered tokens</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800">
        <CardContent className="p-4">
          <div className="text-sm text-gray-400">Social Buzz</div>
          <div className="text-xl font-bold text-yellow-500 font-mono">{stats.socialMentions}</div>
          <div className="text-xs text-gray-500">mentions/hour</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800">
        <CardContent className="p-4">
          <div className="text-sm text-gray-400">Success Rate</div>
          <div className="text-xl font-bold text-green-500 font-mono">{stats.successRate}%</div>
          <div className="text-xs text-gray-500">24h filter accuracy</div>
        </CardContent>
      </Card>
    </div>
  );
}

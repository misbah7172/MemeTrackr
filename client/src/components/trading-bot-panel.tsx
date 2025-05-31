import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Square, Settings, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TradingStatus {
  isActive: boolean;
  settings: {
    maxInvestment: number;
    stopLoss: number;
    takeProfit: number;
    minLiquidity: number;
    minHolders: number;
    socialSentimentWeight: number;
    enabled: boolean;
  };
  portfolio: {
    totalValue: number;
    availableBalance: number;
    totalProfit: number;
    activeTrades: number;
    successRate: number;
  };
}

export function TradingBotPanel() {
  const [status, setStatus] = useState<TradingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    maxInvestment: 100,
    stopLoss: 20,
    takeProfit: 50,
    minLiquidity: 10000,
    minHolders: 50,
    socialSentimentWeight: 0.3,
    enabled: false
  });

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/trading/status');
      const data = await response.json();
      setStatus(data);
      setSettings(data.settings);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch trading status:', error);
      setIsLoading(false);
    }
  };

  const toggleBot = async () => {
    try {
      const endpoint = status?.isActive ? '/api/trading/stop' : '/api/trading/start';
      await apiRequest('POST', endpoint);
      await fetchStatus();
    } catch (error) {
      console.error('Failed to toggle bot:', error);
    }
  };

  const updateSettings = async () => {
    try {
      await apiRequest('POST', '/api/trading/settings', settings);
      await fetchStatus();
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            Trading Bot
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={status?.isActive ? "default" : "secondary"}
              className={status?.isActive ? "bg-green-600" : "bg-gray-600"}
            >
              {status?.isActive ? "ACTIVE" : "STOPPED"}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Portfolio Overview */}
        {status?.portfolio && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-400">Total Value</div>
              <div className="text-lg font-bold text-white font-mono">
                ${status.portfolio.totalValue}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Available</div>
              <div className="text-lg font-bold text-white font-mono">
                ${status.portfolio.availableBalance}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Profit</div>
              <div className="text-lg font-bold text-green-500 font-mono">
                +${status.portfolio.totalProfit}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Success Rate</div>
              <div className="text-lg font-bold text-blue-400 font-mono">
                {status.portfolio.successRate}%
              </div>
            </div>
          </div>
        )}

        <Separator className="bg-gray-700" />

        {/* Bot Controls */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium text-white">Auto Trading</div>
            <div className="text-xs text-gray-400">
              {status?.isActive 
                ? "Bot is analyzing and executing trades automatically" 
                : "Bot is stopped and not making trades"
              }
            </div>
          </div>
          <Button
            onClick={toggleBot}
            className={status?.isActive 
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-green-600 hover:bg-green-700"
            }
          >
            {status?.isActive ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Bot
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Bot
              </>
            )}
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <>
            <Separator className="bg-gray-700" />
            <div className="space-y-4">
              <h4 className="font-medium text-white">Trading Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-300">Max Investment ($)</Label>
                  <Input
                    type="number"
                    value={settings.maxInvestment}
                    onChange={(e) => setSettings({...settings, maxInvestment: Number(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-300">Stop Loss (%)</Label>
                  <Input
                    type="number"
                    value={settings.stopLoss}
                    onChange={(e) => setSettings({...settings, stopLoss: Number(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-300">Take Profit (%)</Label>
                  <Input
                    type="number"
                    value={settings.takeProfit}
                    onChange={(e) => setSettings({...settings, takeProfit: Number(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-300">Min Liquidity ($)</Label>
                  <Input
                    type="number"
                    value={settings.minLiquidity}
                    onChange={(e) => setSettings({...settings, minLiquidity: Number(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateSettings}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Quick Stats */}
        <div className="text-xs text-gray-400 space-y-1">
          <div>Max per trade: ${settings.maxInvestment}</div>
          <div>Stop loss: {settings.stopLoss}% | Take profit: {settings.takeProfit}%</div>
          <div>Min liquidity: ${settings.minLiquidity.toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from 'react';
import { useTokens } from '@/hooks/use-tokens';
import { TokenTable } from '@/components/token-table';
import { FilterSidebar } from '@/components/filter-sidebar';
import { StatsCards } from '@/components/stats-cards';
import { SocialFeed } from '@/components/social-feed';
import { TradingBotPanel } from '@/components/trading-bot-panel';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TokenFilters } from '@/types/token';

export default function Dashboard() {
  const { tokens, filteredTokens, stats, socialMentions, isLoading, refreshData } = useTokens();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayTokens, setDisplayTokens] = useState(filteredTokens);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update display tokens when filtered tokens change
  useEffect(() => {
    setDisplayTokens(filteredTokens);
  }, [filteredTokens]);

  const handleFiltersChange = (filters: TokenFilters) => {
    // Client-side filtering of already filtered tokens
    const filtered = filteredTokens.filter(token => {
      const age = (Date.now() - new Date(token.launchTime).getTime()) / (1000 * 60);
      
      return (
        token.liquidity >= filters.minLiquidity &&
        token.holders >= filters.minHolders &&
        token.transactions >= filters.minTransactions &&
        age <= filters.maxAge &&
        token.chain === filters.chain &&
        (!filters.socialMentions || token.socialMentions > 0)
      );
    });
    
    setDisplayTokens(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <i className="fas fa-radar text-green-500 text-2xl mr-3"></i>
                <h1 className="text-xl font-bold text-white">Meme Coin Radar</h1>
              </div>
              <div className="flex items-center space-x-2 ml-8">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Live</span>
                <span className="text-xs text-gray-500 font-mono">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Tokens Found</div>
                <div className="text-lg font-semibold text-green-500 font-mono">
                  {stats?.totalFound || 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Filtered</div>
                <div className="text-lg font-semibold text-yellow-500 font-mono">
                  {stats?.filtered || 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">High Alert</div>
                <div className="text-lg font-semibold text-red-400 font-mono">
                  {stats?.highAlert || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Filter Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <FilterSidebar onFiltersChange={handleFiltersChange} />
            
            {/* Trading Bot Panel */}
            <div className="mt-6">
              <TradingBotPanel />
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="col-span-12 lg:col-span-9">
            <Tabs defaultValue="discovery" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="discovery">Token Discovery</TabsTrigger>
                <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
                <TabsTrigger value="social">Social Feed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="discovery" className="space-y-4">
                {/* Stats Cards */}
                <StatsCards stats={stats} isLoading={isLoading} />

                {/* Token Table */}
                <TokenTable 
                  tokens={displayTokens} 
                  isLoading={isLoading} 
                  onRefresh={refreshData}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value="social">
                <SocialFeed mentions={socialMentions} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

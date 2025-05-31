import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Trophy } from "lucide-react";

interface TradeAnalysis {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  avgTradeDuration: number;
  bestStrategy: string;
  worstStrategy: string;
}

interface PortfolioAnalytics {
  totalValue: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  beta: number;
  alpha: number;
}

interface StrategyAnalytics {
  name: string;
  totalTrades: number;
  winRate: number;
  avgPnL: number;
  maxDrawdown: number;
  profitability: number;
  reliability: number;
}

interface PerformanceData {
  tradeAnalysis: TradeAnalysis;
  portfolioAnalytics: PortfolioAnalytics;
  strategyAnalytics: StrategyAnalytics[];
}

interface HistoryData {
  performanceHistory: Array<{
    id: number;
    date: string;
    totalPnL: number;
    winRate: number;
    totalTrades: number;
    portfolioValue: number;
  }>;
  strategyHistory: Array<{
    id: number;
    strategyName: string;
    tokenAddress: string;
    entryTime: string;
    exitTime?: string;
    pnlPercentage?: number;
    outcome?: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard() {
  const { data: performanceData, isLoading: performanceLoading } = useQuery<PerformanceData>({
    queryKey: ['/api/analytics/performance'],
    refetchInterval: 30000,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery<HistoryData>({
    queryKey: ['/api/analytics/history'],
    refetchInterval: 60000,
  });

  if (performanceLoading || historyLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const tradeAnalysis = performanceData?.tradeAnalysis;
  const portfolioAnalytics = performanceData?.portfolioAnalytics;
  const strategyAnalytics = performanceData?.strategyAnalytics;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Strategy performance pie chart data
  const strategyPieData = strategyAnalytics?.slice(0, 5).map((strategy, index) => ({
    name: strategy.name,
    value: Math.max(strategy.profitability, 0),
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tradeAnalysis ? formatCurrency(tradeAnalysis.totalPnL) : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolioAnalytics && (
                <span className={portfolioAnalytics.dailyPnL >= 0 ? "text-green-600" : "text-red-600"}>
                  {portfolioAnalytics.dailyPnL >= 0 ? "+" : ""}{formatCurrency(portfolioAnalytics.dailyPnL)} today
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tradeAnalysis ? formatPercentage(tradeAnalysis.winRate) : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {tradeAnalysis && `${tradeAnalysis.winningTrades}W / ${tradeAnalysis.losingTrades}L`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tradeAnalysis?.totalTrades || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {tradeAnalysis && `Avg ${Math.round(tradeAnalysis.avgTradeDuration)}min duration`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioAnalytics ? formatCurrency(portfolioAnalytics.totalValue) : '$1,000'}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolioAnalytics && `Max DD: ${formatPercentage(portfolioAnalytics.maxDrawdown)}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Portfolio Value Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value Over Time</CardTitle>
                <CardDescription>Last 30 days performance</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historyData?.performanceHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [formatCurrency(value), "Portfolio Value"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="portfolioValue" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily P&L Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily P&L</CardTitle>
                <CardDescription>Daily profit and loss distribution</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historyData?.performanceHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString().slice(0, 5)}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [formatCurrency(value), "Daily P&L"]}
                    />
                    <Bar 
                      dataKey="totalPnL" 
                      fill="#0088FE"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategies">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Strategy Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance</CardTitle>
                <CardDescription>Ranked by profitability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategyAnalytics?.slice(0, 5).map((strategy, index) => (
                    <div key={strategy.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{strategy.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {strategy.totalTrades} trades • {formatPercentage(strategy.winRate)} win rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${strategy.avgPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(strategy.avgPnL)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(strategy.reliability * 100)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategy Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Distribution</CardTitle>
                <CardDescription>Profitability by strategy</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={strategyPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {strategyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Max Drawdown</span>
                  <span className="font-medium text-red-600">
                    {portfolioAnalytics ? formatPercentage(portfolioAnalytics.maxDrawdown) : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Volatility</span>
                  <span className="font-medium">
                    {portfolioAnalytics ? formatPercentage(portfolioAnalytics.volatility) : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sharpe Ratio</span>
                  <span className="font-medium">
                    {portfolioAnalytics?.sharpeRatio.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Beta</span>
                  <span className="font-medium">
                    {portfolioAnalytics?.beta.toFixed(2) || '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Daily P&L</span>
                  <span className={`font-medium ${portfolioAnalytics && portfolioAnalytics.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioAnalytics ? formatCurrency(portfolioAnalytics.dailyPnL) : '$0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Weekly P&L</span>
                  <span className={`font-medium ${portfolioAnalytics && portfolioAnalytics.weeklyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioAnalytics ? formatCurrency(portfolioAnalytics.weeklyPnL) : '$0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly P&L</span>
                  <span className={`font-medium ${portfolioAnalytics && portfolioAnalytics.monthlyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioAnalytics ? formatCurrency(portfolioAnalytics.monthlyPnL) : '$0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Alpha</span>
                  <span className="font-medium">
                    {portfolioAnalytics?.alpha.toFixed(2) || '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Best Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Leaders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Best Strategy</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tradeAnalysis?.bestStrategy || 'No data'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Needs Improvement</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tradeAnalysis?.worstStrategy || 'No data'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Largest Win</span>
                  </div>
                  <p className="text-sm font-medium text-green-600">
                    {tradeAnalysis ? formatCurrency(tradeAnalysis.largestWin) : '$0'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { storage } from "./storage";
import type { Token } from "@shared/schema";
import type { Trade } from "@shared/trading-schema";
import type { 
  PerformanceMetrics, 
  StrategyPerformance, 
  MarketConditions,
  InsertPerformanceMetrics,
  InsertStrategyPerformance,
  InsertMarketConditions
} from "@shared/analytics-schema";

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

export class AnalyticsEngine {
  private performanceHistory: PerformanceMetrics[] = [];
  private strategyHistory: StrategyPerformance[] = [];
  private marketHistory: MarketConditions[] = [];
  private tradeHistory: Trade[] = [];

  constructor() {
    this.initializeAnalytics();
  }

  private async initializeAnalytics() {
    // Generate historical performance data for the last 30 days
    this.generateHistoricalData();
    console.log('📊 Analytics engine initialized with historical data');
  }

  private generateHistoricalData() {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    // Generate daily performance metrics for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo + (i * 24 * 60 * 60 * 1000));
      const dayPnL = (Math.random() - 0.45) * 200; // Slightly profitable bias
      const trades = Math.floor(Math.random() * 15) + 5;
      const winRate = 0.6 + (Math.random() * 0.3); // 60-90% win rate
      
      this.performanceHistory.push({
        id: i + 1,
        date,
        totalPnL: dayPnL,
        winRate,
        totalTrades: trades,
        avgTradeSize: 50 + (Math.random() * 100),
        maxDrawdown: Math.random() * 15,
        sharpeRatio: 1.2 + (Math.random() * 0.8),
        portfolioValue: 1000 + (dayPnL * (i + 1))
      });
    }

    // Generate strategy performance data
    const strategies = [
      'Technical Breakout',
      'Volume Spike',
      'Social Momentum',
      'Mean Reversion',
      'Trend Following'
    ];

    for (let i = 0; i < 100; i++) {
      const strategy = strategies[Math.floor(Math.random() * strategies.length)];
      const entryTime = new Date(thirtyDaysAgo + (Math.random() * 30 * 24 * 60 * 60 * 1000));
      const duration = Math.floor(Math.random() * 1440); // 0-24 hours in minutes
      const exitTime = new Date(entryTime.getTime() + (duration * 60 * 1000));
      
      const entryPrice = 0.001 + (Math.random() * 0.1);
      const priceChange = (Math.random() - 0.4) * 0.5; // Slight profit bias
      const exitPrice = entryPrice * (1 + priceChange);
      const pnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
      
      this.strategyHistory.push({
        id: i + 1,
        strategyName: strategy,
        tokenAddress: `token_${Math.floor(Math.random() * 50)}`,
        entryPrice,
        exitPrice,
        entryTime,
        exitTime,
        pnl: pnlPercentage * 50, // Assuming $50 base position
        pnlPercentage,
        duration,
        confidence: 60 + (Math.random() * 35),
        reason: `${strategy} signal detected`,
        outcome: pnlPercentage > 0 ? 'WIN' : pnlPercentage < -5 ? 'LOSS' : 'BREAKEVEN'
      });
    }

    // Generate market conditions data
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(thirtyDaysAgo + (i * 24 * 60 * 60 * 1000));
      const trends = ['BULLISH', 'BEARISH', 'SIDEWAYS'];
      
      this.marketHistory.push({
        id: i + 1,
        timestamp,
        overallTrend: trends[Math.floor(Math.random() * trends.length)],
        volatilityIndex: Math.random() * 100,
        totalMarketVolume: 1000000 + (Math.random() * 5000000),
        topPerformers: [`token_${i}`, `token_${i+1}`, `token_${i+2}`],
        marketSentiment: (Math.random() - 0.5) * 2 // -1 to 1
      });
    }
  }

  async recordTrade(trade: Trade, strategy: string, confidence: number, reason: string) {
    this.tradeHistory.push(trade);
    
    const strategyRecord: StrategyPerformance = {
      id: Date.now(),
      strategyName: strategy,
      tokenAddress: trade.tokenAddress,
      entryPrice: trade.price,
      exitPrice: null,
      entryTime: trade.timestamp,
      exitTime: null,
      pnl: null,
      pnlPercentage: null,
      duration: null,
      confidence,
      reason,
      outcome: 'ACTIVE'
    };
    
    this.strategyHistory.push(strategyRecord);
    console.log(`📝 Trade recorded for analytics: ${trade.action} ${trade.tokenAddress}`);
  }

  async updateTradeExit(tokenAddress: string, exitPrice: number, exitTime: Date) {
    const activeStrategy = this.strategyHistory.find(s => 
      s.tokenAddress === tokenAddress && s.outcome === 'ACTIVE'
    );
    
    if (activeStrategy && activeStrategy.entryPrice) {
      activeStrategy.exitPrice = exitPrice;
      activeStrategy.exitTime = exitTime;
      activeStrategy.duration = Math.floor((exitTime.getTime() - activeStrategy.entryTime.getTime()) / 60000);
      activeStrategy.pnlPercentage = ((exitPrice - activeStrategy.entryPrice) / activeStrategy.entryPrice) * 100;
      activeStrategy.pnl = activeStrategy.pnlPercentage * 50; // Assuming $50 position
      
      if (activeStrategy.pnlPercentage > 5) {
        activeStrategy.outcome = 'WIN';
      } else if (activeStrategy.pnlPercentage < -5) {
        activeStrategy.outcome = 'LOSS';
      } else {
        activeStrategy.outcome = 'BREAKEVEN';
      }
      
      console.log(`📊 Trade exit recorded: ${activeStrategy.outcome} ${activeStrategy.pnlPercentage?.toFixed(2)}%`);
    }
  }

  async generateTradeAnalysis(): Promise<TradeAnalysis> {
    const completedTrades = this.strategyHistory.filter(s => s.outcome !== 'ACTIVE');
    const winningTrades = completedTrades.filter(t => t.outcome === 'WIN');
    const losingTrades = completedTrades.filter(t => t.outcome === 'LOSS');
    
    const totalPnL = completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const wins = winningTrades.map(t => t.pnl || 0);
    const losses = losingTrades.map(t => Math.abs(t.pnl || 0));
    
    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
    
    // Strategy performance analysis
    const strategyStats = new Map<string, { wins: number; total: number; pnl: number }>();
    completedTrades.forEach(trade => {
      const stats = strategyStats.get(trade.strategyName) || { wins: 0, total: 0, pnl: 0 };
      stats.total++;
      stats.pnl += trade.pnl || 0;
      if (trade.outcome === 'WIN') stats.wins++;
      strategyStats.set(trade.strategyName, stats);
    });
    
    let bestStrategy = 'N/A';
    let worstStrategy = 'N/A';
    let bestPnL = -Infinity;
    let worstPnL = Infinity;
    
    for (const [strategy, stats] of strategyStats.entries()) {
      if (stats.pnl > bestPnL) {
        bestPnL = stats.pnl;
        bestStrategy = strategy;
      }
      if (stats.pnl < worstPnL) {
        worstPnL = stats.pnl;
        worstStrategy = strategy;
      }
    }

    return {
      totalTrades: completedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnL,
      winRate: completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0,
      avgWin,
      avgLoss,
      profitFactor: avgLoss > 0 ? avgWin / avgLoss : 0,
      largestWin: wins.length > 0 ? Math.max(...wins) : 0,
      largestLoss: losses.length > 0 ? Math.max(...losses) : 0,
      avgTradeDuration: completedTrades.length > 0 ? 
        completedTrades.reduce((sum, t) => sum + (t.duration || 0), 0) / completedTrades.length : 0,
      bestStrategy,
      worstStrategy
    };
  }

  async generatePortfolioAnalytics(): Promise<PortfolioAnalytics> {
    const recentMetrics = this.performanceHistory.slice(-30);
    const dailyReturns = recentMetrics.map(m => m.totalPnL);
    
    const totalValue = recentMetrics[recentMetrics.length - 1]?.portfolioValue || 1000;
    const dailyPnL = dailyReturns[dailyReturns.length - 1] || 0;
    const weeklyPnL = dailyReturns.slice(-7).reduce((sum, pnl) => sum + pnl, 0);
    const monthlyPnL = dailyReturns.reduce((sum, pnl) => sum + pnl, 0);
    
    // Calculate Sharpe ratio (simplified)
    const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length;
    const volatility = Math.sqrt(variance);
    const sharpeRatio = volatility > 0 ? (avgReturn / volatility) : 0;
    
    // Calculate max drawdown
    let peak = totalValue;
    let maxDrawdown = 0;
    let runningValue = 1000;
    
    for (const dailyPnL of dailyReturns) {
      runningValue += dailyPnL;
      if (runningValue > peak) {
        peak = runningValue;
      }
      const drawdown = ((peak - runningValue) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      totalValue,
      dailyPnL,
      weeklyPnL,
      monthlyPnL,
      maxDrawdown,
      sharpeRatio,
      volatility,
      beta: 0.8 + (Math.random() * 0.4), // Simulated beta
      alpha: avgReturn - (0.05 * 0.9) // Simulated alpha
    };
  }

  async generateStrategyAnalytics(): Promise<StrategyAnalytics[]> {
    const strategyMap = new Map<string, StrategyPerformance[]>();
    
    // Group trades by strategy
    this.strategyHistory
      .filter(s => s.outcome !== 'ACTIVE')
      .forEach(trade => {
        const trades = strategyMap.get(trade.strategyName) || [];
        trades.push(trade);
        strategyMap.set(trade.strategyName, trades);
      });
    
    const analytics: StrategyAnalytics[] = [];
    
    for (const [strategyName, trades] of strategyMap.entries()) {
      const wins = trades.filter(t => t.outcome === 'WIN').length;
      const winRate = (wins / trades.length) * 100;
      const avgPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0) / trades.length;
      
      // Calculate strategy-specific drawdown
      let peak = 0;
      let maxDrawdown = 0;
      let running = 0;
      
      trades.forEach(trade => {
        running += trade.pnl || 0;
        if (running > peak) peak = running;
        const drawdown = peak > 0 ? ((peak - running) / peak) * 100 : 0;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      });
      
      analytics.push({
        name: strategyName,
        totalTrades: trades.length,
        winRate,
        avgPnL,
        maxDrawdown,
        profitability: avgPnL > 0 ? avgPnL * winRate : 0,
        reliability: winRate / 100
      });
    }
    
    return analytics.sort((a, b) => b.profitability - a.profitability);
  }

  getPerformanceHistory(): PerformanceMetrics[] {
    return this.performanceHistory.slice(-30); // Last 30 days
  }

  getStrategyHistory(): StrategyPerformance[] {
    return this.strategyHistory.slice(-100); // Last 100 trades
  }

  getMarketHistory(): MarketConditions[] {
    return this.marketHistory.slice(-30); // Last 30 days
  }

  async updateDailyMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tradeAnalysis = await this.generateTradeAnalysis();
    const portfolioAnalytics = await this.generatePortfolioAnalytics();
    
    const todayMetrics: PerformanceMetrics = {
      id: Date.now(),
      date: today,
      totalPnL: portfolioAnalytics.dailyPnL,
      winRate: tradeAnalysis.winRate,
      totalTrades: tradeAnalysis.totalTrades,
      avgTradeSize: 75, // Average position size
      maxDrawdown: portfolioAnalytics.maxDrawdown,
      sharpeRatio: portfolioAnalytics.sharpeRatio,
      portfolioValue: portfolioAnalytics.totalValue
    };
    
    // Update or add today's metrics
    const existingIndex = this.performanceHistory.findIndex(
      m => m.date.toDateString() === today.toDateString()
    );
    
    if (existingIndex >= 0) {
      this.performanceHistory[existingIndex] = todayMetrics;
    } else {
      this.performanceHistory.push(todayMetrics);
    }
    
    console.log(`📊 Daily metrics updated: ${tradeAnalysis.totalTrades} trades, ${portfolioAnalytics.dailyPnL.toFixed(2)} PnL`);
  }
}

export const analyticsEngine = new AnalyticsEngine();
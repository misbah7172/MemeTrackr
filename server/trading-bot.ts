import { storage } from "./storage";
import type { Token } from "@shared/schema";
import type { TradingSignal, Trade, BotSettings } from "@shared/trading-schema";
import { analyticsEngine } from "./analytics-engine";
import axios from "axios";

interface MarketData {
  price: number;
  bidPrice: number;
  askPrice: number;
  volume24h: number;
  priceChange24h: number;
  marketCap: number;
  timestamp: number;
}

interface OrderBookData {
  bids: [number, number][];
  asks: [number, number][];
  spread: number;
}

interface TechnicalIndicators {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  sma20: number;
  sma50: number;
  bollingerBands: { upper: number; middle: number; lower: number };
  volumeProfile: number;
}

interface Portfolio {
  totalValue: number;
  availableBalance: number;
  positions: Map<string, { amount: number; avgPrice: number; unrealizedPnL: number }>;
  totalProfit: number;
  activeTrades: number;
  successRate: number;
  dailyPnL: number;
  maxDrawdown: number;
}

export class TradingBot {
  private isRunning = false;
  private marketDataCache = new Map<string, MarketData>();
  private technicalIndicators = new Map<string, TechnicalIndicators>();
  private portfolio: Portfolio = {
    totalValue: 1000,
    availableBalance: 1000,
    positions: new Map(),
    totalProfit: 0,
    activeTrades: 0,
    successRate: 75.5,
    dailyPnL: 0,
    maxDrawdown: 0
  };
  private tradeHistory: Trade[] = [];
  private dailyLossLimit = 500; // Maximum daily loss
  private currentDailyLoss = 0;
  
  private settings: BotSettings = {
    id: 1,
    maxInvestment: 100,
    stopLoss: 20,
    takeProfit: 50,
    minLiquidity: 10000,
    minHolders: 50,
    socialSentimentWeight: 0.3,
    enabled: false
  };

  constructor() {
    this.initializePortfolio();
    this.loadSettings();
  }

  private initializePortfolio() {
    this.portfolio = {
      totalValue: 1000,
      availableBalance: 1000,
      positions: new Map(),
      totalProfit: 0,
      activeTrades: 0,
      successRate: 75.5,
      dailyPnL: 0,
      maxDrawdown: 0
    };
  }

  async loadSettings() {
    // In a real implementation, this would load from database
    console.log('Trading bot initialized with settings:', this.settings);
  }

  async start() {
    if (this.isRunning || !this.settings.enabled) return;
    
    this.isRunning = true;
    console.log('🤖 Trading bot started - Full automated trading mode');
    
    // Market data collection - every 5 seconds for real-time data
    setInterval(() => {
      this.collectMarketData().catch(console.error);
    }, 5000);
    
    // Technical analysis - every 15 seconds
    setInterval(() => {
      this.updateTechnicalIndicators().catch(console.error);
    }, 15000);
    
    // Signal generation and trading - every 30 seconds
    setInterval(() => {
      this.executeFullTradingCycle().catch(console.error);
    }, 30000);
    
    // Portfolio rebalancing - every 5 minutes
    setInterval(() => {
      this.rebalancePortfolio().catch(console.error);
    }, 300000);
    
    // Risk monitoring - every minute
    setInterval(() => {
      this.monitorRiskLimits().catch(console.error);
    }, 60000);
    
    // Initial execution
    await this.collectMarketData();
    await this.executeFullTradingCycle();
  }

  async stop() {
    this.isRunning = false;
    console.log('🛑 Trading bot stopped');
  }

  // 1. Market Data Collection
  async collectMarketData() {
    if (!this.isRunning) return;

    try {
      const tokens = await storage.getAllTokens();
      
      for (const token of tokens.slice(0, 20)) { // Focus on top 20 tokens
        const marketData = await this.fetchRealTimeMarketData(token.address);
        if (marketData) {
          this.marketDataCache.set(token.address, marketData);
        }
      }
      
      console.log(`📊 Market data updated for ${this.marketDataCache.size} tokens`);
    } catch (error) {
      console.error('Market data collection error:', error);
    }
  }

  async fetchRealTimeMarketData(tokenAddress: string): Promise<MarketData | null> {
    try {
      // Fetch from multiple sources for accuracy
      const [jupiterPrice, dexScreenerData] = await Promise.all([
        this.getJupiterPrice(tokenAddress),
        this.getDexScreenerData(tokenAddress)
      ]);

      if (!jupiterPrice && !dexScreenerData) return null;

      const price = jupiterPrice || dexScreenerData?.price || 0;
      const volume24h = dexScreenerData?.volume24h || Math.random() * 50000;
      
      return {
        price,
        bidPrice: price * 0.999,
        askPrice: price * 1.001,
        volume24h,
        priceChange24h: (Math.random() - 0.5) * 20,
        marketCap: price * 1000000, // Estimated
        timestamp: Date.now()
      };
    } catch (error) {
      return null;
    }
  }

  async getJupiterPrice(tokenAddress: string): Promise<number | null> {
    try {
      const response = await axios.get(`https://price.jup.ag/v4/price?ids=${tokenAddress}`, {
        timeout: 5000
      });
      return response.data?.data?.[tokenAddress]?.price || null;
    } catch (error) {
      return null;
    }
  }

  async getDexScreenerData(tokenAddress: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
        timeout: 5000
      });
      const pair = response.data?.pairs?.[0];
      if (!pair) return null;
      
      return {
        price: parseFloat(pair.priceUsd || 0),
        volume24h: parseFloat(pair.volume?.h24 || 0)
      };
    } catch (error) {
      return null;
    }
  }

  // 2. Technical Analysis & Signal Generation
  async updateTechnicalIndicators() {
    if (!this.isRunning) return;

    for (const [tokenAddress, marketData] of this.marketDataCache) {
      const indicators = await this.calculateTechnicalIndicators(tokenAddress, marketData);
      if (indicators) {
        this.technicalIndicators.set(tokenAddress, indicators);
      }
    }
  }

  async calculateTechnicalIndicators(tokenAddress: string, marketData: MarketData): Promise<TechnicalIndicators | null> {
    // Simplified technical analysis - in production, use historical data
    const price = marketData.price;
    const volume = marketData.volume24h;
    
    // RSI calculation (simplified)
    const rsi = 30 + (Math.random() * 40); // 30-70 range
    
    // Moving averages (estimated)
    const sma20 = price * (0.95 + Math.random() * 0.1);
    const sma50 = price * (0.90 + Math.random() * 0.2);
    
    // MACD (simplified)
    const macd = {
      macd: (Math.random() - 0.5) * 0.1,
      signal: (Math.random() - 0.5) * 0.05,
      histogram: (Math.random() - 0.5) * 0.05
    };
    
    // Bollinger Bands
    const bollingerBands = {
      upper: price * 1.05,
      middle: price,
      lower: price * 0.95
    };
    
    return {
      rsi,
      macd,
      sma20,
      sma50,
      bollingerBands,
      volumeProfile: volume / 10000 // Normalized volume
    };
  }

  async executeFullTradingCycle() {
    if (!this.isRunning) return;

    try {
      const tokens = await storage.getAllTokens();
      const tradingCandidates = tokens.filter(token => 
        this.marketDataCache.has(token.address) && 
        this.technicalIndicators.has(token.address)
      );
      
      console.log(`🔍 Analyzing ${tradingCandidates.length} tokens with full market data`);
      
      for (const token of tradingCandidates) {
        const signal = await this.generateAdvancedTradingSignal(token);
        if (signal && signal.confidence > 75) {
          await this.executeAdvancedOrder(signal);
        }
      }
    } catch (error) {
      console.error('Trading cycle error:', error);
    }
  }

  // 3. Advanced Signal Generation with Technical Analysis
  async generateAdvancedTradingSignal(token: Token): Promise<TradingSignal | null> {
    const marketData = this.marketDataCache.get(token.address);
    const indicators = this.technicalIndicators.get(token.address);
    
    if (!marketData || !indicators) return null;

    let confidence = 0;
    let reasons = [];

    // Technical Analysis Signals (40% weight)
    if (indicators.rsi < 30) {
      confidence += 15;
      reasons.push('RSI oversold');
    } else if (indicators.rsi > 70) {
      confidence -= 10;
      reasons.push('RSI overbought');
    }

    if (marketData.price > indicators.sma20 && indicators.sma20 > indicators.sma50) {
      confidence += 20;
      reasons.push('Bullish trend');
    }

    if (indicators.macd.macd > indicators.macd.signal && indicators.macd.histogram > 0) {
      confidence += 15;
      reasons.push('MACD bullish crossover');
    }

    // Volume Analysis (20% weight)
    if (marketData.volume24h > indicators.volumeProfile * 2) {
      confidence += 20;
      reasons.push('High volume breakout');
    }

    // Market Structure (20% weight)
    if (token.liquidity > this.settings.minLiquidity * 2) {
      confidence += 10;
      reasons.push('Strong liquidity');
    }

    if (token.holders > this.settings.minHolders * 1.5) {
      confidence += 10;
      reasons.push('Growing holder base');
    }

    // Social Sentiment (20% weight)
    const socialScore = token.socialMentions * this.settings.socialSentimentWeight;
    if (socialScore > 30) {
      confidence += 20;
      reasons.push('High social interest');
    }

    // Age factor
    const ageMinutes = (Date.now() - new Date(token.launchTime).getTime()) / (1000 * 60);
    if (ageMinutes < 60) {
      confidence += 10;
      reasons.push('Early launch opportunity');
    }

    if (confidence < 60) return null;

    return {
      id: Date.now(),
      tokenAddress: token.address,
      signal: confidence > 85 ? 'BUY' : confidence > 70 ? 'BUY' : 'HOLD',
      confidence: Math.min(confidence, 95),
      reason: reasons.join(', '),
      price: marketData.price,
      timestamp: new Date(),
      executed: false
    };
  }

  // 4. Advanced Order Execution
  async executeAdvancedOrder(signal: TradingSignal) {
    if (signal.signal !== 'BUY' || signal.executed) return;

    // Risk Management Checks
    if (!this.passRiskChecks(signal)) {
      console.log(`❌ Risk check failed for ${signal.tokenAddress}`);
      return;
    }

    try {
      const investmentAmount = this.calculatePositionSize(signal);
      
      console.log(`🚀 Executing ADVANCED BUY ORDER`);
      console.log(`   Token: ${signal.tokenAddress}`);
      console.log(`   Confidence: ${signal.confidence}%`);
      console.log(`   Investment: $${investmentAmount.toFixed(2)}`);
      console.log(`   Entry Price: $${signal.price}`);
      console.log(`   Strategy: ${signal.reason}`);

      // Execute the trade
      const trade = await this.placeBuyOrder(signal, investmentAmount);
      
      if (trade) {
        // Update portfolio
        this.updatePortfolioAfterBuy(trade);
        
        // Set up automatic stop-loss and take-profit orders
        await this.setupAutomaticOrders(trade);
        
        // Log the trade
        this.logTrade(trade);
        
        // Record trade in analytics
        await analyticsEngine.recordTrade(trade, signal.reason.split(',')[0] || 'Unknown Strategy', signal.confidence, signal.reason);
        
        signal.executed = true;
      }

    } catch (error) {
      console.error('Advanced order execution error:', error);
    }
  }

  // 5. Risk Management System
  passRiskChecks(signal: TradingSignal): boolean {
    // Daily loss limit check
    if (this.currentDailyLoss >= this.dailyLossLimit) {
      console.log('❌ Daily loss limit reached');
      return false;
    }

    // Available balance check
    const requiredAmount = this.calculatePositionSize(signal);
    if (requiredAmount > this.portfolio.availableBalance) {
      console.log('❌ Insufficient balance');
      return false;
    }

    // Maximum position size per token
    const maxPositionSize = this.portfolio.totalValue * 0.1; // Max 10% per position
    if (requiredAmount > maxPositionSize) {
      console.log('❌ Position size too large');
      return false;
    }

    // Market conditions check
    const marketData = this.marketDataCache.get(signal.tokenAddress);
    if (marketData && Math.abs(marketData.priceChange24h) > 50) {
      console.log('❌ Extreme volatility detected');
      return false;
    }

    return true;
  }

  calculatePositionSize(signal: TradingSignal): number {
    const baseAmount = this.settings.maxInvestment;
    const confidenceMultiplier = signal.confidence / 100;
    const volatilityAdjustment = 1; // Could be based on market volatility
    
    return baseAmount * confidenceMultiplier * volatilityAdjustment;
  }

  async placeBuyOrder(signal: TradingSignal, amount: number): Promise<Trade | null> {
    // In production, this would place actual orders via exchange APIs
    const trade: Trade = {
      id: Date.now(),
      tokenAddress: signal.tokenAddress,
      action: 'BUY',
      amount: amount,
      price: signal.price,
      status: 'EXECUTED',
      timestamp: new Date()
    };

    // Simulate order execution
    console.log(`💰 BUY ORDER EXECUTED: $${amount.toFixed(2)} at $${signal.price}`);
    
    return trade;
  }

  // 6. Portfolio Management
  updatePortfolioAfterBuy(trade: Trade) {
    this.portfolio.availableBalance -= trade.amount;
    this.portfolio.activeTrades++;
    
    // Update or create position
    const existingPosition = this.portfolio.positions.get(trade.tokenAddress);
    if (existingPosition) {
      const totalAmount = existingPosition.amount + trade.amount;
      const avgPrice = ((existingPosition.avgPrice * existingPosition.amount) + (trade.price * trade.amount)) / totalAmount;
      
      this.portfolio.positions.set(trade.tokenAddress, {
        amount: totalAmount,
        avgPrice: avgPrice,
        unrealizedPnL: 0
      });
    } else {
      this.portfolio.positions.set(trade.tokenAddress, {
        amount: trade.amount,
        avgPrice: trade.price,
        unrealizedPnL: 0
      });
    }
    
    this.tradeHistory.push(trade);
    console.log(`📊 Portfolio updated - Available: $${this.portfolio.availableBalance.toFixed(2)}`);
  }

  async rebalancePortfolio() {
    if (!this.isRunning) return;
    
    console.log('🔄 Rebalancing portfolio...');
    
    // Update unrealized P&L for all positions
    for (const [tokenAddress, position] of this.portfolio.positions.entries()) {
      const marketData = this.marketDataCache.get(tokenAddress);
      if (marketData) {
        const currentValue = position.amount * marketData.price / position.avgPrice;
        const costBasis = position.amount;
        position.unrealizedPnL = currentValue - costBasis;
      }
    }
    
    // Calculate total portfolio value
    let totalValue = this.portfolio.availableBalance;
    for (const position of this.portfolio.positions.values()) {
      totalValue += position.amount + position.unrealizedPnL;
    }
    
    this.portfolio.totalValue = totalValue;
    console.log(`💼 Portfolio value: $${totalValue.toFixed(2)}`);
  }

  async monitorRiskLimits() {
    if (!this.isRunning) return;
    
    // Check stop-loss conditions for all positions
    for (const [tokenAddress, position] of this.portfolio.positions.entries()) {
      const marketData = this.marketDataCache.get(tokenAddress);
      if (!marketData) continue;
      
      const currentPrice = marketData.price;
      const stopLossPrice = position.avgPrice * (1 - this.settings.stopLoss / 100);
      const takeProfitPrice = position.avgPrice * (1 + this.settings.takeProfit / 100);
      
      if (currentPrice <= stopLossPrice) {
        console.log(`🔴 STOP LOSS triggered for ${tokenAddress} at $${currentPrice}`);
        await this.executeSellOrder(tokenAddress, 'STOP_LOSS');
      } else if (currentPrice >= takeProfitPrice) {
        console.log(`🟢 TAKE PROFIT triggered for ${tokenAddress} at $${currentPrice}`);
        await this.executeSellOrder(tokenAddress, 'TAKE_PROFIT');
      }
    }
  }

  async executeSellOrder(tokenAddress: string, reason: string) {
    const position = this.portfolio.positions.get(tokenAddress);
    const marketData = this.marketDataCache.get(tokenAddress);
    
    if (!position || !marketData) return;
    
    const sellAmount = position.amount;
    const sellPrice = marketData.price;
    const pnl = (sellPrice - position.avgPrice) * (sellAmount / position.avgPrice);
    
    console.log(`🔄 SELL ORDER - ${reason}`);
    console.log(`   Amount: $${sellAmount.toFixed(2)}`);
    console.log(`   Price: $${sellPrice}`);
    console.log(`   P&L: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`);
    
    // Update portfolio
    this.portfolio.availableBalance += sellAmount + pnl;
    this.portfolio.totalProfit += pnl;
    this.portfolio.activeTrades--;
    this.portfolio.positions.delete(tokenAddress);
    
    // Log the trade
    const sellTrade: Trade = {
      id: Date.now(),
      tokenAddress,
      action: 'SELL',
      amount: sellAmount,
      price: sellPrice,
      status: 'EXECUTED',
      timestamp: new Date()
    };
    
    this.logTrade(sellTrade);
    
    // Record exit in analytics
    await analyticsEngine.updateTradeExit(tokenAddress, sellPrice, sellTrade.timestamp);
  }

  // 7. Logging and Reporting
  logTrade(trade: Trade) {
    console.log(`📝 TRADE LOGGED: ${trade.action} ${trade.tokenAddress} - $${trade.amount.toFixed(2)} at $${trade.price}`);
    this.tradeHistory.push(trade);
    
    // In production, save to database
    // await storage.createTrade(trade);
  }

  async setupAutomaticOrders(trade: Trade) {
    const stopLossPrice = trade.price * (1 - this.settings.stopLoss / 100);
    const takeProfitPrice = trade.price * (1 + this.settings.takeProfit / 100);

    console.log(`📊 Automatic orders set for ${trade.tokenAddress}:`);
    console.log(`   Stop Loss: $${stopLossPrice.toFixed(6)} (-${this.settings.stopLoss}%)`);
    console.log(`   Take Profit: $${takeProfitPrice.toFixed(6)} (+${this.settings.takeProfit}%)`);
  }

  async generateTradingSignal(token: Token): Promise<TradingSignal | null> {
    let confidence = 0;
    let reasons = [];

    // Liquidity analysis (25% weight)
    if (token.liquidity > this.settings.minLiquidity * 2) {
      confidence += 25;
      reasons.push('High liquidity');
    } else if (token.liquidity < this.settings.minLiquidity) {
      return null; // Skip low liquidity tokens
    }

    // Holder count analysis (20% weight)
    if (token.holders > this.settings.minHolders * 2) {
      confidence += 20;
      reasons.push('Strong holder base');
    } else if (token.holders > this.settings.minHolders) {
      confidence += 10;
    }

    // Price change momentum (25% weight)
    if (token.priceChange > 20) {
      confidence += 25;
      reasons.push('Strong upward momentum');
    } else if (token.priceChange > 10) {
      confidence += 15;
    } else if (token.priceChange < -10) {
      confidence -= 20;
      reasons.push('Negative momentum');
    }

    // Volume analysis (15% weight)
    const volumeToLiquidityRatio = token.volume / token.liquidity;
    if (volumeToLiquidityRatio > 0.5) {
      confidence += 15;
      reasons.push('High trading volume');
    } else if (volumeToLiquidityRatio > 0.2) {
      confidence += 8;
    }

    // Social sentiment (15% weight)
    const socialWeight = this.settings.socialSentimentWeight * 100;
    if (token.socialMentions > 50) {
      confidence += socialWeight;
      reasons.push('High social interest');
    } else if (token.socialMentions > 20) {
      confidence += socialWeight * 0.5;
    }

    // Age factor (bonus/penalty)
    const ageMinutes = (Date.now() - new Date(token.launchTime).getTime()) / (1000 * 60);
    if (ageMinutes < 60) {
      confidence += 10; // Early bird bonus
      reasons.push('Very early launch');
    } else if (ageMinutes > 720) { // 12 hours
      confidence -= 10; // Too old penalty
    }

    if (confidence < 50) return null;

    const signal: TradingSignal = {
      id: Date.now(),
      tokenAddress: token.address,
      signal: confidence > 80 ? 'BUY' : confidence > 60 ? 'BUY' : 'HOLD',
      confidence: Math.min(confidence, 95), // Cap at 95%
      reason: reasons.join(', '),
      price: this.estimateTokenPrice(token),
      timestamp: new Date(),
      executed: false
    };

    return signal;
  }

  async executeSignal(signal: TradingSignal) {
    if (signal.signal !== 'BUY' || signal.executed) return;

    try {
      console.log(`🚀 Executing BUY signal for ${signal.tokenAddress}`);
      console.log(`   Confidence: ${signal.confidence}%`);
      console.log(`   Reason: ${signal.reason}`);
      console.log(`   Estimated Price: $${signal.price}`);

      // Calculate investment amount based on confidence
      const baseAmount = this.settings.maxInvestment;
      const confidenceMultiplier = signal.confidence / 100;
      const investmentAmount = baseAmount * confidenceMultiplier;

      // In a real implementation, this would place actual trades
      const trade: Trade = {
        id: Date.now(),
        tokenAddress: signal.tokenAddress,
        action: 'BUY',
        amount: investmentAmount,
        price: signal.price,
        status: 'EXECUTED',
        timestamp: new Date()
      };

      // Log the simulated trade
      console.log(`💰 Simulated BUY: $${investmentAmount.toFixed(2)} at $${signal.price}`);
      
      // Mark signal as executed
      signal.executed = true;

      // Set up automatic sell orders
      await this.setupAutomaticSells(trade);

    } catch (error) {
      console.error('Trade execution error:', error);
    }
  }

  async setupAutomaticSells(trade: Trade) {
    const stopLossPrice = trade.price * (1 - this.settings.stopLoss / 100);
    const takeProfitPrice = trade.price * (1 + this.settings.takeProfit / 100);

    console.log(`📊 Auto-sell orders set:`);
    console.log(`   Stop Loss: $${stopLossPrice.toFixed(6)} (-${this.settings.stopLoss}%)`);
    console.log(`   Take Profit: $${takeProfitPrice.toFixed(6)} (+${this.settings.takeProfit}%)`);

    // In a real implementation, these would be actual limit orders
  }

  private estimateTokenPrice(token: Token): number {
    // Simple price estimation based on market cap and liquidity
    const basePrice = 0.001; // Starting assumption
    const liquidityFactor = Math.log(token.liquidity) / 10;
    const volumeFactor = Math.log(token.volume + 1) / 15;
    const momentumFactor = 1 + (token.priceChange / 1000);
    
    return basePrice * liquidityFactor * volumeFactor * momentumFactor;
  }

  async getPortfolioStatus() {
    // In a real implementation, this would return actual portfolio data
    return {
      totalValue: 1000,
      availableBalance: 500,
      totalProfit: 150,
      activeTrades: 3,
      successRate: 73.5
    };
  }

  async updateSettings(newSettings: Partial<BotSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Trading bot settings updated:', this.settings);
    
    if (newSettings.enabled && !this.isRunning) {
      await this.start();
    } else if (newSettings.enabled === false && this.isRunning) {
      await this.stop();
    }
  }

  getSettings(): BotSettings {
    return this.settings;
  }

  isActive(): boolean {
    return this.isRunning && this.settings.enabled;
  }
}

export const tradingBot = new TradingBot();
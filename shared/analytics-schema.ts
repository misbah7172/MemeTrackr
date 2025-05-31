import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalPnL: real("total_pnl").notNull(),
  winRate: real("win_rate").notNull(),
  totalTrades: integer("total_trades").notNull(),
  avgTradeSize: real("avg_trade_size").notNull(),
  maxDrawdown: real("max_drawdown").notNull(),
  sharpeRatio: real("sharpe_ratio").notNull(),
  portfolioValue: real("portfolio_value").notNull(),
});

export const strategyPerformance = pgTable("strategy_performance", {
  id: serial("id").primaryKey(),
  strategyName: text("strategy_name").notNull(),
  tokenAddress: text("token_address").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  entryTime: timestamp("entry_time").notNull(),
  exitTime: timestamp("exit_time"),
  pnl: real("pnl"),
  pnlPercentage: real("pnl_percentage"),
  duration: integer("duration"), // in minutes
  confidence: real("confidence").notNull(),
  reason: text("reason").notNull(),
  outcome: text("outcome"), // 'WIN', 'LOSS', 'BREAKEVEN', 'ACTIVE'
});

export const marketConditions = pgTable("market_conditions", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  overallTrend: text("overall_trend").notNull(), // 'BULLISH', 'BEARISH', 'SIDEWAYS'
  volatilityIndex: real("volatility_index").notNull(),
  totalMarketVolume: real("total_market_volume").notNull(),
  topPerformers: text("top_performers").array(),
  marketSentiment: real("market_sentiment").notNull(), // -1 to 1
});

export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
});

export const insertStrategyPerformanceSchema = createInsertSchema(strategyPerformance).omit({
  id: true,
});

export const insertMarketConditionsSchema = createInsertSchema(marketConditions).omit({
  id: true,
});

export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetrics = z.infer<typeof insertPerformanceMetricsSchema>;
export type StrategyPerformance = typeof strategyPerformance.$inferSelect;
export type InsertStrategyPerformance = z.infer<typeof insertStrategyPerformanceSchema>;
export type MarketConditions = typeof marketConditions.$inferSelect;
export type InsertMarketConditions = z.infer<typeof insertMarketConditionsSchema>;
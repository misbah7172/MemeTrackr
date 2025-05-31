import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tradingSignals = pgTable("trading_signals", {
  id: serial("id").primaryKey(),
  tokenAddress: text("token_address").notNull(),
  signal: text("signal").notNull(), // 'BUY', 'SELL', 'HOLD'
  confidence: real("confidence").notNull(), // 0-100
  reason: text("reason").notNull(),
  price: real("price").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  executed: boolean("executed").notNull().default(false),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  tokenAddress: text("token_address").notNull(),
  action: text("action").notNull(), // 'BUY', 'SELL'
  amount: real("amount").notNull(),
  price: real("price").notNull(),
  status: text("status").notNull().default("PENDING"), // 'PENDING', 'EXECUTED', 'FAILED'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  maxInvestment: real("max_investment").notNull().default(100), // Max per trade
  stopLoss: real("stop_loss").notNull().default(20), // Percentage
  takeProfit: real("take_profit").notNull().default(50), // Percentage
  minLiquidity: real("min_liquidity").notNull().default(10000),
  minHolders: integer("min_holders").notNull().default(50),
  socialSentimentWeight: real("social_sentiment_weight").notNull().default(0.3),
  enabled: boolean("enabled").notNull().default(false),
});

export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  timestamp: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  timestamp: true,
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
});

export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
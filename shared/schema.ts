import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  chain: text("chain").notNull().default("solana"),
  liquidity: real("liquidity").notNull().default(0),
  holders: integer("holders").notNull().default(0),
  volume: real("volume").notNull().default(0),
  priceChange: real("price_change").notNull().default(0),
  transactions: integer("transactions").notNull().default(0),
  socialMentions: integer("social_mentions").notNull().default(0),
  launchTime: timestamp("launch_time").notNull().defaultNow(),
  isFiltered: boolean("is_filtered").notNull().default(false),
  isHighAlert: boolean("is_high_alert").notNull().default(false),
});

export const socialMentions = pgTable("social_mentions", {
  id: serial("id").primaryKey(),
  tokenAddress: text("token_address"),
  platform: text("platform").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  retweets: integer("retweets").notNull().default(0),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  launchTime: true,
});

export const insertSocialMentionSchema = createInsertSchema(socialMentions).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type SocialMention = typeof socialMentions.$inferSelect;
export type InsertSocialMention = z.infer<typeof insertSocialMentionSchema>;

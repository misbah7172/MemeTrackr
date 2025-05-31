import { users, tokens, socialMentions, type User, type InsertUser, type Token, type InsertToken, type SocialMention, type InsertSocialMention } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Token management
  getAllTokens(): Promise<Token[]>;
  getToken(address: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  updateToken(address: string, updates: Partial<InsertToken>): Promise<Token | undefined>;
  getFilteredTokens(): Promise<Token[]>;
  getHighAlertTokens(): Promise<Token[]>;
  
  // Social mentions
  getSocialMentions(limit?: number): Promise<SocialMention[]>;
  createSocialMention(mention: InsertSocialMention): Promise<SocialMention>;
  getSocialMentionsByToken(tokenAddress: string): Promise<SocialMention[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tokens: Map<string, Token>;
  private socialMentions: Map<number, SocialMention>;
  private currentUserId: number;
  private currentMentionId: number;

  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.socialMentions = new Map();
    this.currentUserId = 1;
    this.currentMentionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values()).sort(
      (a, b) => new Date(b.launchTime).getTime() - new Date(a.launchTime).getTime()
    );
  }

  async getToken(address: string): Promise<Token | undefined> {
    return this.tokens.get(address);
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const token: Token = {
      ...insertToken,
      id: Date.now(),
      launchTime: new Date(),
      chain: insertToken.chain || "solana",
      liquidity: insertToken.liquidity || 0,
      holders: insertToken.holders || 0,
      volume: insertToken.volume || 0,
      priceChange: insertToken.priceChange || 0,
      transactions: insertToken.transactions || 0,
      socialMentions: insertToken.socialMentions || 0,
      isFiltered: insertToken.isFiltered || false,
      isHighAlert: insertToken.isHighAlert || false,
    };
    this.tokens.set(insertToken.address, token);
    return token;
  }

  async updateToken(address: string, updates: Partial<InsertToken>): Promise<Token | undefined> {
    const existing = this.tokens.get(address);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.tokens.set(address, updated);
    return updated;
  }

  async getFilteredTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values())
      .filter(token => token.isFiltered)
      .sort((a, b) => new Date(b.launchTime).getTime() - new Date(a.launchTime).getTime());
  }

  async getHighAlertTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values())
      .filter(token => token.isHighAlert)
      .sort((a, b) => new Date(b.launchTime).getTime() - new Date(a.launchTime).getTime());
  }

  async getSocialMentions(limit = 50): Promise<SocialMention[]> {
    return Array.from(this.socialMentions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createSocialMention(insertMention: InsertSocialMention): Promise<SocialMention> {
    const mention: SocialMention = {
      ...insertMention,
      id: this.currentMentionId++,
      timestamp: new Date(),
      tokenAddress: insertMention.tokenAddress || null,
      likes: insertMention.likes || 0,
      retweets: insertMention.retweets || 0,
    };
    this.socialMentions.set(mention.id, mention);
    return mention;
  }

  async getSocialMentionsByToken(tokenAddress: string): Promise<SocialMention[]> {
    return Array.from(this.socialMentions.values())
      .filter(mention => mention.tokenAddress === tokenAddress)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const storage = new MemStorage();

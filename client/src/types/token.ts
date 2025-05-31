export interface Token {
  id: number;
  address: string;
  name: string;
  symbol: string;
  chain: string;
  liquidity: number;
  holders: number;
  volume: number;
  priceChange: number;
  transactions: number;
  socialMentions: number;
  launchTime: string;
  isFiltered: boolean;
  isHighAlert: boolean;
}

export interface SocialMention {
  id: number;
  tokenAddress: string | null;
  platform: string;
  username: string;
  content: string;
  likes: number;
  retweets: number;
  timestamp: string;
}

export interface TokenStats {
  totalFound: number;
  filtered: number;
  highAlert: number;
  last15min: number;
  avgLiquidity: number;
  socialMentions: number;
  successRate: number;
}

export interface TokenFilters {
  minLiquidity: number;
  minHolders: number;
  minTransactions: number;
  maxAge: number;
  socialMentions: boolean;
  chain: string;
}

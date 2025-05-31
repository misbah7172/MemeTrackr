import { apiRequest } from './queryClient';
import type { Token, SocialMention, TokenStats } from '@/types/token';

export const api = {
  tokens: {
    getAll: (): Promise<Token[]> => 
      fetch('/api/tokens').then(res => res.json()),
    
    getFiltered: (): Promise<Token[]> => 
      fetch('/api/tokens/filtered').then(res => res.json()),
    
    getHighAlert: (): Promise<Token[]> => 
      fetch('/api/tokens/high-alert').then(res => res.json()),
  },
  
  social: {
    getMentions: (): Promise<SocialMention[]> => 
      fetch('/api/social-mentions').then(res => res.json()),
  },
  
  stats: {
    get: (): Promise<TokenStats> => 
      fetch('/api/stats').then(res => res.json()),
  },
  
  refresh: () => 
    apiRequest('POST', '/api/refresh'),
};

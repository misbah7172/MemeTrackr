import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEffect } from 'react';

export function useTokens() {
  const queryClient = useQueryClient();
  
  const tokens = useQuery({
    queryKey: ['/api/tokens'],
    queryFn: api.tokens.getAll,
    refetchInterval: 30000, // 30 seconds
  });

  const filteredTokens = useQuery({
    queryKey: ['/api/tokens/filtered'],
    queryFn: api.tokens.getFiltered,
    refetchInterval: 30000,
  });

  const highAlertTokens = useQuery({
    queryKey: ['/api/tokens/high-alert'],
    queryFn: api.tokens.getHighAlert,
    refetchInterval: 30000,
  });

  const stats = useQuery({
    queryKey: ['/api/stats'],
    queryFn: api.stats.get,
    refetchInterval: 5000, // 5 seconds for real-time stats
  });

  const socialMentions = useQuery({
    queryKey: ['/api/social-mentions'],
    queryFn: api.social.getMentions,
    refetchInterval: 15000, // 15 seconds
  });

  const refreshData = async () => {
    try {
      await api.refresh();
      // Invalidate all queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/filtered'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/high-alert'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-mentions'] });
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  return {
    tokens: tokens.data || [],
    filteredTokens: filteredTokens.data || [],
    highAlertTokens: highAlertTokens.data || [],
    stats: stats.data,
    socialMentions: socialMentions.data || [],
    isLoading: tokens.isLoading || filteredTokens.isLoading || stats.isLoading,
    refreshData,
  };
}

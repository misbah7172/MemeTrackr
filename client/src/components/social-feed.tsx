import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SocialMention } from '@/types/token';

interface SocialFeedProps {
  mentions: SocialMention[];
  isLoading: boolean;
}

export function SocialFeed({ mentions, isLoading }: SocialFeedProps) {
  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ago`;
    }
  };

  const getBorderColor = (likes: number) => {
    if (likes > 200) return 'border-red-500';
    if (likes > 100) return 'border-yellow-500';
    return 'border-green-500';
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Recent Social Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="border-l-4 border-gray-600 pl-4 py-2">
                  <div className="h-4 bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mentions.length === 0) {
    return (
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Recent Social Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-400">No recent social mentions found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Recent Social Mentions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mentions.map((mention) => (
            <div 
              key={mention.id} 
              className={`border-l-4 ${getBorderColor(mention.likes)} pl-4 py-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fab fa-twitter text-blue-400"></i>
                  <span className="text-sm font-medium text-white">{mention.username}</span>
                  <span className="text-xs text-gray-500">{formatTime(mention.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>
                    <i className="fas fa-heart mr-1"></i>
                    {mention.likes}
                  </span>
                  <span>
                    <i className="fas fa-retweet mr-1"></i>
                    {mention.retweets}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-1">{mention.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

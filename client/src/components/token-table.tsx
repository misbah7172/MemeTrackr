import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Download } from 'lucide-react';
import type { Token } from '@/types/token';

interface TokenTableProps {
  tokens: Token[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function TokenTable({ tokens, isLoading, onRefresh }: TokenTableProps) {
  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h`;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getGradientColor = (index: number) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-red-500 to-orange-500',
      'from-yellow-500 to-amber-500',
    ];
    return gradients[index % gradients.length];
  };

  const getSocialBadgeColor = (mentions: number) => {
    if (mentions > 100) return 'bg-red-500 bg-opacity-20 text-red-400';
    if (mentions > 50) return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
    return 'bg-green-500 bg-opacity-20 text-green-400';
  };

  const getSocialIcon = (mentions: number) => {
    if (mentions > 100) return 'fas fa-fire';
    if (mentions > 50) return 'fas fa-rocket';
    return 'fas fa-chart-line';
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">High-Potential Token Launches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">No tokens found matching current filters</p>
            <Button 
              onClick={onRefresh}
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">High-Potential Token Launches</CardTitle>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 bg-gray-900">
                <TableHead className="text-gray-400 font-medium">Token</TableHead>
                <TableHead className="text-gray-400 font-medium">Age</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">Liquidity</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">Holders</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">24h Change</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">Volume</TableHead>
                <TableHead className="text-gray-400 font-medium text-center">Social</TableHead>
                <TableHead className="text-gray-400 font-medium text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token, index) => (
                <TableRow 
                  key={token.address} 
                  className="border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center">
                      <div 
                        className={`w-8 h-8 bg-gradient-to-r ${getGradientColor(index)} rounded-full mr-3 flex items-center justify-center text-xs font-bold text-white`}
                      >
                        {getInitials(token.name)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{token.name}</div>
                        <div className="text-xs text-gray-400 font-mono">
                          {token.address.slice(0, 6)}...{token.address.slice(-4)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono text-sm">
                    {formatTime(token.launchTime)}
                  </TableCell>
                  <TableCell className="text-white font-mono text-sm text-right">
                    {formatCurrency(token.liquidity)}
                  </TableCell>
                  <TableCell className="text-white font-mono text-sm text-right">
                    {token.holders}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-500 font-mono text-sm">
                      +{token.priceChange.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-white font-mono text-sm text-right">
                    {formatCurrency(token.volume)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${getSocialBadgeColor(token.socialMentions)} border-none`}>
                      <i className={`${getSocialIcon(token.socialMentions)} mr-1`}></i>
                      {token.socialMentions}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        asChild
                      >
                        <a 
                          href={`https://jup.ag/swap/SOL-${token.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Buy
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-gray-600 hover:bg-gray-500 text-white text-xs"
                        asChild
                      >
                        <a 
                          href={`https://dexscreener.com/solana/${token.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Chart
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

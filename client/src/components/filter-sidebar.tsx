import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { TokenFilters } from '@/types/token';

interface FilterSidebarProps {
  onFiltersChange: (filters: TokenFilters) => void;
}

export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<TokenFilters>({
    minLiquidity: 5000,
    minHolders: 20,
    minTransactions: 20,
    maxAge: 60,
    socialMentions: true,
    chain: 'solana',
  });

  const handleFilterChange = (key: keyof TokenFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
  };

  const resetFilters = () => {
    const defaultFilters: TokenFilters = {
      minLiquidity: 5000,
      minHolders: 20,
      minTransactions: 20,
      maxAge: 60,
      socialMentions: true,
      chain: 'solana',
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card className="bg-gray-800 sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chain Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-300 mb-2 block">Blockchain</Label>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={filters.chain === 'solana' ? 'default' : 'secondary'}
              onClick={() => handleFilterChange('chain', 'solana')}
              className={filters.chain === 'solana' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <i className="fab fa-solana mr-1"></i> Solana
            </Button>
            <Button
              size="sm"
              variant={filters.chain === 'ethereum' ? 'default' : 'secondary'}
              onClick={() => handleFilterChange('chain', 'ethereum')}
              className={filters.chain === 'ethereum' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <i className="fab fa-ethereum mr-1"></i> ETH
            </Button>
          </div>
        </div>

        {/* Liquidity Filter */}
        <div>
          <Label className="text-sm font-medium text-gray-300 mb-2 block">Min Liquidity</Label>
          <Select 
            value={filters.minLiquidity.toString()} 
            onValueChange={(value) => handleFilterChange('minLiquidity', parseInt(value))}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">$1K+</SelectItem>
              <SelectItem value="5000">$5K+</SelectItem>
              <SelectItem value="10000">$10K+</SelectItem>
              <SelectItem value="25000">$25K+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Holder Filter */}
        <div>
          <Label className="text-sm font-medium text-gray-300 mb-2 block">Min Holders</Label>
          <Input
            type="number"
            value={filters.minHolders}
            onChange={(e) => handleFilterChange('minHolders', parseInt(e.target.value) || 0)}
            className="bg-gray-700 border-gray-600 text-white font-mono"
            min="1"
          />
        </div>

        {/* Volume Filter */}
        <div>
          <Label className="text-sm font-medium text-gray-300 mb-2 block">Min Transactions (15m)</Label>
          <Input
            type="number"
            value={filters.minTransactions}
            onChange={(e) => handleFilterChange('minTransactions', parseInt(e.target.value) || 0)}
            className="bg-gray-700 border-gray-600 text-white font-mono"
            min="1"
          />
        </div>

        {/* Age Filter */}
        <div>
          <Label className="text-sm font-medium text-gray-300 mb-2 block">Max Age</Label>
          <Select 
            value={filters.maxAge.toString()} 
            onValueChange={(value) => handleFilterChange('maxAge', parseInt(value))}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="240">4 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Social Mentions */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="socialMentions"
            checked={filters.socialMentions}
            onCheckedChange={(checked) => handleFilterChange('socialMentions', checked)}
          />
          <Label htmlFor="socialMentions" className="text-sm text-gray-300">
            Has social mentions
          </Label>
        </div>

        {/* Filter Actions */}
        <div className="space-y-2">
          <Button 
            onClick={applyFilters}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Apply Filters
          </Button>
          <Button 
            onClick={resetFilters}
            variant="secondary"
            className="w-full bg-gray-600 hover:bg-gray-500 text-white"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

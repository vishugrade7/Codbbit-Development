'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter as FilterIcon, Check, ListFilter, BarChartHorizontal, CheckCircle, Tag } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from './ui/separator';
import { useDebounce } from '@/hooks/use-debounce';

export type FilterState = {
  status: 'All' | 'Solved' | 'Unsolved';
  difficulty: 'All' | 'Easy' | 'Medium' | 'Hard';
  search: string;
  category: string;
};

interface ProblemFilterProps {
  onFilterChange: (filters: Omit<FilterState, 'category'>) => void;
  categories: string[];
}

export function ProblemFilter({ onFilterChange, categories = [] }: ProblemFilterProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterState['status']>('All');
  const [difficulty, setDifficulty] = useState<FilterState['difficulty']>('All');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    onFilterChange({
      search: debouncedSearch,
      status,
      difficulty,
    });
  }, [debouncedSearch, status, difficulty, onFilterChange]);
  
  const FilterRadioGroup = ({ title, icon, options, value, onValueChange }: { title: string, icon: React.ReactNode, options: string[], value: string, onValueChange: (value: any) => void }) => (
    <div className="grid gap-2">
      <p className="font-medium text-sm flex items-center gap-2 text-muted-foreground">
        {icon}
        {title}
      </p>
      {options.map(option => (
        <button key={option} onClick={() => onValueChange(option)} className="flex items-center text-sm text-foreground hover:text-primary">
          <div className="w-5 h-5 mr-2 flex items-center justify-center">
            {value === option && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search problems by title..."
          className="pl-9 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="w-10 h-10">
            <FilterIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-4" align="end">
          <div className="grid gap-4">
            <FilterRadioGroup 
                title="Status"
                icon={<CheckCircle className="h-4 w-4" />}
                options={['All', 'Solved', 'Unsolved']}
                value={status}
                onValueChange={(val: 'All' | 'Solved' | 'Unsolved') => setStatus(val)}
            />
             <Separator />
             <FilterRadioGroup 
                title="Difficulty"
                icon={<BarChartHorizontal className="h-4 w-4" />}
                options={['All', 'Easy', 'Medium', 'Hard']}
                value={difficulty}
                onValueChange={(val: 'All' | 'Easy' | 'Medium' | 'Hard') => setDifficulty(val)}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

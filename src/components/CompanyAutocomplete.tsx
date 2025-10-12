
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

interface Company {
  name: string;
  domain: string;
  logo: string;
}

interface CompanyAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CompanyAutocomplete({ value, onValueChange }: CompanyAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(inputValue, 300);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${term}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const data: Company[] = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error(error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchSuggestions]);

  const handleSelect = (companyName: string) => {
    onValueChange(companyName);
    setInputValue(companyName);
    setOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onValueChange(e.target.value);
      if (!open) setOpen(true);
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="e.g., Salesforce"
          className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {open && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
          <Command>
            <CommandList>
              {isLoading && suggestions.length === 0 ? (
                <CommandEmpty>
                    <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    </div>
                </CommandEmpty>
              ) : (
                suggestions.map((company) => (
                  <CommandItem
                    key={company.domain}
                    onSelect={() => handleSelect(company.name)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://img.logo.dev/${company.domain}`} alt={company.name} />
                      <AvatarFallback className="text-xs bg-muted">{company.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{company.name}</span>
                    <span className="text-xs text-muted-foreground">{company.domain}</span>
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}

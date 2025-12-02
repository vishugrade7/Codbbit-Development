
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CountUp from './ui/CountUp';
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  changeText?: string;
  changeValue?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  isLoading?: boolean;
  variant?: 'default' | 'primary';
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  isLoading, 
  changeText,
  changeValue,
  changeType = 'neutral',
  variant = 'default'
}: StatCardProps) {
  
  const ChangeIcon = changeType === 'positive' ? TrendingUp : TrendingDown;
  const prevValue = React.useRef(typeof value === 'number' ? value : 0);

  React.useEffect(() => {
    if (typeof value === 'number') {
      prevValue.current = value;
    }
  }, [value]);

  return (
    <Card className={cn(
        "rounded-2xl",
        variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-card'
    )}>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium" style={{color: variant === 'primary' ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted-foreground))'}}>
              <div className={cn("flex h-6 w-6 items-center justify-center rounded-full",
                variant === 'primary' ? 'bg-white/20' : 'bg-muted'
              )}>
                <Icon className="h-3 w-3" style={{color: variant === 'primary' ? 'white' : 'hsl(var(--foreground))'}}/>
              </div>
              <span>{title}</span>
            </div>
            <div className="text-2xl font-bold">
              {typeof value === 'number' ? (
                <CountUp from={prevValue.current} to={value} duration={1.5} />
              ) : (
                value
              )}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{color: variant === 'primary' ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted-foreground))'}}>
              {changeType !== 'neutral' && changeValue !== undefined && (
                <div className={cn("flex items-center gap-1 font-semibold", changeType === 'positive' ? 'text-emerald-400' : 'text-red-400')}>
                  <ChangeIcon className="h-3 w-3" />
                  {changeType === 'positive' ? `+${changeValue}` : changeValue}%
                </div>
              )}
              <span>{changeText}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

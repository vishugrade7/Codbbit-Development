
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

  return (
    <Card className={cn(
        "rounded-2xl",
        variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-card'
    )}>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium" style={{color: variant === 'primary' ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted-foreground))'}}>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full",
                variant === 'primary' ? 'bg-white/20' : 'bg-muted'
              )}>
                <Icon className="h-4 w-4" style={{color: variant === 'primary' ? 'white' : 'hsl(var(--foreground))'}}/>
              </div>
              <span>{title}</span>
            </div>
            <div className="text-4xl font-bold">{value}</div>
            <div className="flex items-center gap-1 text-sm" style={{color: variant === 'primary' ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted-foreground))'}}>
              {changeType !== 'neutral' && changeValue !== undefined && (
                <div className={cn("flex items-center gap-1 font-semibold", changeType === 'positive' ? 'text-emerald-400' : 'text-red-400')}>
                  <ChangeIcon className="h-4 w-4" />
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

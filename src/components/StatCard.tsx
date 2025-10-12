
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  isLoading?: boolean;
  color?: 'pink' | 'green' | 'blue' | 'purple' | 'light-blue' | 'red';
}

export function StatCard({ title, value, icon: Icon, isLoading, color }: StatCardProps) {
  const colorClasses = {
    pink: 'from-pink-100 to-pink-50',
    green: 'from-green-100 to-green-50',
    blue: 'from-blue-100 to-blue-50',
    purple: 'from-purple-100 to-purple-50',
    'light-blue': 'from-sky-100 to-sky-50',
    red: 'from-red-100 to-red-50',
  };

  return (
    <Card className={cn('overflow-hidden border-none shadow-md', isLoading ? 'bg-gray-100' : `bg-gradient-to-br ${colorClasses[color || 'pink']}`)}>
      <CardContent className="p-4">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-5 w-24" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-800">{value}</div>
                <Icon className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

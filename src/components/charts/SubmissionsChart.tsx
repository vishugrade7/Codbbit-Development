
'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface SubmissionsChartProps {
  users: UserProfile[] | null;
}

const chartConfig = {
  submissions: {
    label: 'Submissions',
    color: 'hsl(var(--chart-1))',
  },
};

export function SubmissionsChart({ users }: SubmissionsChartProps) {
  const chartData = React.useMemo(() => {
    if (!users) {
      return [];
    }
    const submissionsByDate: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Initialize last 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        submissionsByDate[dateString] = 0;
    }

    users.forEach(user => {
      if (user.submissionHeatmap) {
        Object.entries(user.submissionHeatmap).forEach(([dateStr, count]) => {
          if (new Date(dateStr) >= thirtyDaysAgo) {
            submissionsByDate[dateStr] = (submissionsByDate[dateStr] || 0) + count;
          }
        });
      }
    });
    
    return Object.entries(submissionsByDate)
        .map(([date, submissions]) => ({ date, submissions }))
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [users]);
  
  if (!users) {
      return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey="submissions"
          type="natural"
          fill="var(--color-submissions)"
          fillOpacity={0.4}
          stroke="var(--color-submissions)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

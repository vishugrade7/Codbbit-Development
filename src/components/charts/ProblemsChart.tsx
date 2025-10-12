
'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

interface ProblemsChartProps {
  problems: { id: string; Questions: Partial<Question>[] }[] | null;
}

const COLORS = {
  Easy: 'hsl(var(--chart-2))', // Green
  Medium: 'hsl(var(--chart-4))', // Yellow
  Hard: 'hsl(var(--chart-1))',   // Red
};


export function ProblemsChart({ problems }: ProblemsChartProps) {
  const chartData = React.useMemo(() => {
    if (!problems) {
      return [];
    }

    const distribution = problems.reduce(
      (acc, category) => {
        (category.Questions || []).forEach((q) => {
          if (q.difficulty) {
            acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
          }
        });
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      fill: COLORS[name as keyof typeof COLORS] || 'hsl(var(--muted-foreground))',
    }));
  }, [problems]);

  if (!problems) {
      return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
      <ChartContainer
        config={{}}
        className="mx-auto aspect-square h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
          >
             {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
  );
}

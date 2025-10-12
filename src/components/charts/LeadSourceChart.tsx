
'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'Jan', email: 7896, api: 325, scrap: 24 },
  { month: 'Feb', email: 7950, api: 330, scrap: 26 },
  { month: 'Mar', email: 8000, api: 400, scrap: 28 },
  { month: 'Apr', email: 8100, api: 420, scrap: 25 },
  { month: 'May', email: 8050, api: 500, scrap: 30 },
  { month: 'Jun', email: 8200, api: 550, scrap: 32 },
  { month: 'Jul', email: 8300, api: 560, scrap: 35 },
  { month: 'Aug', email: 8350, api: 570, scrap: 38 },
  { month: 'Sep', email: 8400, api: 580, scrap: 40 },
  { month: 'Oct', email: 8450, api: 600, scrap: 42 },
  { month: 'Nov', email: 8500, api: 620, scrap: 45 },
  { month: 'Dec', email: 8600, api: 650, scrap: 50 },
];

const chartConfig = {
  email: {
    label: 'Email Pursing',
    color: 'hsl(var(--chart-1))',
  },
  api: {
    label: 'API',
    color: 'hsl(var(--chart-2))',
  },
  scrap: {
    label: 'Lead Scrap',
    color: 'hsl(var(--chart-3))',
  },
};

export function LeadSourceChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <AreaChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} hide />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Legend
            content={({ payload }) => (
                <div className="flex flex-col gap-2 p-4">
                {payload?.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="font-medium text-sm">{entry.value}</span>
                        </div>
                        <span className="font-bold text-sm">{chartData[chartData.length - 1][entry.dataKey as keyof typeof chartData[0]]}</span>
                    </div>
                ))}
                </div>
          )}
        />
        <Area
          dataKey="email"
          type="natural"
          fill="var(--color-email)"
          fillOpacity={0}
          stroke="var(--color-email)"
          stackId="a"
        />
        <Area
          dataKey="api"
          type="natural"
          fill="var(--color-api)"
          fillOpacity={0}
          stroke="var(--color-api)"
          stackId="a"
        />
         <Area
          dataKey="scrap"
          type="natural"
          fill="var(--color-scrap)"
          fillOpacity={0}
          stroke="var(--color-scrap)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}

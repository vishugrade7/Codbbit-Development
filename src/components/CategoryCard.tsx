
'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = {
  name: string;
  questionCount: number;
  solved: number;
};

interface CategoryCardProps {
  category: Category;
  index: number;
}

const colorThemes = [
  'green', 'yellow', 'purple', 'blue', 'red', 'teal', 'orange'
];

export function CategoryCard({ category, index }: CategoryCardProps) {
  const theme = colorThemes[index % colorThemes.length];
  const progress = category.questionCount > 0 ? (category.solved / category.questionCount) * 100 : 0;

  const cardClasses = cn(
    'transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col',
    'dark:bg-opacity-20 dark:backdrop-blur-sm',
    {
      'bg-category-green-bg border-category-green-border text-category-green-fg': theme === 'green',
      'bg-category-yellow-bg border-category-yellow-border text-category-yellow-fg': theme === 'yellow',
      'bg-category-purple-bg border-category-purple-border text-category-purple-fg': theme === 'purple',
      'bg-category-blue-bg border-category-blue-border text-category-blue-fg': theme === 'blue',
      'bg-category-red-bg border-category-red-border text-category-red-fg': theme === 'red',
      'bg-category-teal-bg border-category-teal-border text-category-teal-fg': theme === 'teal',
      'bg-category-orange-bg border-category-orange-border text-category-orange-fg': theme === 'orange',
    }
  );

  const buttonClasses = cn(
    'font-semibold rounded-md text-sm px-4',
    {
      'bg-category-green-fg/10 text-category-green-fg hover:bg-category-green-fg/20': theme === 'green',
      'bg-category-yellow-fg/10 text-category-yellow-fg hover:bg-category-yellow-fg/20': theme === 'yellow',
      'bg-category-purple-fg/10 text-category-purple-fg hover:bg-category-purple-fg/20': theme === 'purple',
      'bg-category-blue-fg/10 text-category-blue-fg hover:bg-category-blue-fg/20': theme === 'blue',
      'bg-category-red-fg/10 text-category-red-fg hover:bg-category-red-fg/20': theme === 'red',
      'bg-category-teal-fg/10 text-category-teal-fg hover:bg-category-teal-fg/20': theme === 'teal',
      'bg-category-orange-fg/10 text-category-orange-fg hover:bg-category-orange-fg/20': theme === 'orange',
    }
  );
  
  const progressIndicatorClasses = cn(
    'h-1.5',
    {
        'bg-category-green-fg': theme === 'green',
        'bg-category-yellow-fg': theme === 'yellow',
        'bg-category-purple-fg': theme === 'purple',
        'bg-category-blue-fg': theme === 'blue',
        'bg-category-red-fg': theme === 'red',
        'bg-category-teal-fg': theme === 'teal',
        'bg-category-orange-fg': theme === 'orange',
    }
  );


  return (
    <Card className={cardClasses}>
      <CardHeader className="py-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5" />
          <CardTitle className="text-base font-bold">{category.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-0">
        <div className="flex justify-start text-xs gap-8">
          <div className="flex flex-col items-start">
            <span className="text-lg font-bold">{category.questionCount}</span>
            <span className="text-xs opacity-70 -mt-1">Questions</span>
          </div>
          <div className="flex flex-col items-start">
             <span className="text-lg font-bold">{category.solved}</span>
            <span className="text-xs opacity-70 -mt-1">Solved</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-0 pb-4">
        <div className="w-full">
            <div className="text-xs opacity-70 mb-1">Progress</div>
            <Progress value={progress} className={cn("h-1.5 bg-foreground/10")} indicatorClassName={progressIndicatorClasses}/>
        </div>
        <Button asChild variant="ghost" className={cn("w-20 mt-1 h-8 text-xs", buttonClasses)}>
          <Link href={`/problems/${encodeURIComponent(category.name)}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

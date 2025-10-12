
'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProblemSheet } from '@/lib/types';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


interface ProblemSheetCardProps {
  sheet: ProblemSheet;
  index: number;
}

const colorThemes = [
  'green', 'yellow', 'purple', 'blue', 'red', 'teal', 'orange'
];

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
};

export function ProblemSheetCard({ sheet, index }: ProblemSheetCardProps) {
  const theme = colorThemes[index % colorThemes.length];
  const firestore = useFirestore();
  const { user } = useUser();

  const isOwner = user?.uid === sheet.createdBy;

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !sheet.createdBy) return null;
    return doc(firestore, 'users', sheet.createdBy);
  }, [firestore, sheet.createdBy]);
  
  const { data: creator } = useDoc<UserProfile>(userDocRef);


  const cardClasses = cn(
    'border-2 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col',
    'dark:bg-opacity-20 dark:backdrop-blur-sm',
    'glass:bg-opacity-20 glass:backdrop-blur-sm',
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

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-base font-bold">{sheet.name}</CardTitle>
          </div>
          {isOwner && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={`/sheets/edit/${sheet.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-2">
        <div className="flex justify-start text-xs gap-8">
          <div className="flex flex-col items-start">
            <span className="text-lg font-bold">{sheet.questionIds.length}</span>
            <span className="text-xs text-muted-foreground -mt-1">Questions</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-lg font-bold">{sheet.followers}</span>
            <span className="text-xs text-muted-foreground -mt-1">Followers</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 pb-4">
        <Button className="gap-1 rounded-full py-1 pl-1 pr-3 text-xs h-auto cursor-default bg-muted-foreground/10 hover:bg-muted-foreground/20">
            <Avatar className="h-5 w-5">
                <AvatarImage src={creator?.avatarUrl} />
                <AvatarFallback className="text-xs bg-muted-foreground/20">
                    {getInitials(creator?.name)}
                </AvatarFallback>
            </Avatar>
            <span className="font-normal text-muted-foreground">@{creator?.username || '...'}</span>
        </Button>
        <Button asChild variant="ghost" className={buttonClasses}>
          <Link href={`/sheets/${sheet.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

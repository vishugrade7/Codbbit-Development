'use client';

import { useMemo, useState, useEffect, use } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Question, UserProfile } from '@/lib/types';
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset, Spinner } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProblemFilter } from '@/components/ProblemFilter';
import type { FilterState } from '@/components/ProblemFilter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryDoc {
    Questions: Partial<Question>[];
}

export default function CategoryPage({
  params: paramsPromise,
}: {
  params: Promise<{ category: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const categoryDocRef = useMemoFirebase(() => {
    if (!firestore || !params?.category) return null;
    const categoryName = decodeURIComponent(params.category);
    return doc(firestore, 'problems', categoryName);
  }, [firestore, params?.category]);

  const { data: categoryDoc, isLoading } = useDoc<CategoryDoc>(categoryDocRef);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  
  const [filters, setFilters] = useState<Omit<FilterState, 'category'>>({
    status: 'All',
    difficulty: 'All',
    search: '',
  });

  const solvedProblemIds = useMemo(() => {
      return new Set(userProfile?.solvedProblems ? Object.keys(userProfile.solvedProblems) : []);
  }, [userProfile]);

  const filteredQuestions = useMemo(() => {
    if (!categoryDoc?.Questions) return [];
    
    return categoryDoc.Questions.filter(q => {
        const isSolved = solvedProblemIds.has(q.id!) || solvedProblemIds.has(q.title!);
        const searchMatch = !filters.search || q.title?.toLowerCase().includes(filters.search.toLowerCase());
        const difficultyMatch = filters.difficulty === 'All' || q.difficulty === filters.difficulty;
        const statusMatch = filters.status === 'All' ||
            (filters.status === 'Solved' && isSolved) ||
            (filters.status === 'Unsolved' && !isSolved);
        
        return searchMatch && difficultyMatch && statusMatch;
    });
  }, [categoryDoc, filters, solvedProblemIds]);


  const getDifficultyDotClass = (difficulty: 'Easy' | 'Medium' | 'Hard' | undefined) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (isLoading || !params) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  
  if (!isLoading && !categoryDoc) {
    notFound();
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 bg-background min-h-screen">
          <header className="px-4 py-8 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.push('/problems')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                  {decodeURIComponent(params.category)}
                </h1>
                <p className="text-muted-foreground mt-1">
                  A list of problems in the {decodeURIComponent(params.category)} category.
                </p>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <ProblemFilter onFilterChange={setFilters} />
            </div>
          </header>

          <div className="pb-8">
            <Card className="rounded-none border-x-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px] text-center border-b">Status</TableHead>
                                <TableHead className="border-b">Title</TableHead>
                                <TableHead className="w-[150px] border-b">Difficulty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuestions?.map((question) => {
                                const isSolved = solvedProblemIds.has(question.id!) || solvedProblemIds.has(question.title!);
                                return (
                                    <TableRow key={question.id || question.title}>
                                        <TableCell className="text-center py-4">
                                            {isSolved ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-muted-foreground/20 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Link href={`/problems/${params.category}/${question.id || question.title}`} className="font-medium hover:underline">
                                                {question.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className="gap-1.5 w-20 justify-center">
                                            <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(question.difficulty))} aria-hidden="true"></span>
                                            {question.difficulty}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
                </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

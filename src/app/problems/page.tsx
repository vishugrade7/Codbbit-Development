
'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Question, UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { CategoryCard } from '@/components/CategoryCard';


type Category = {
  id: string;
  name: string;
  questionCount: number; 
  solved: number;
  Questions?: Partial<Question>[];
};


export default function PracticeProblemsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const problemsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'problems');
  }, [firestore]);

  const { data: categoriesData, isLoading } = useCollection<Category>(problemsCollectionRef);

  const categories: Category[] = useMemo(() => {
    if (!categoriesData) return [];
    
    const solvedProblemIds = userProfile?.solvedProblems ? new Set(Object.keys(userProfile.solvedProblems)) : new Set();

    return categoriesData.map(categoryDoc => {
      const questions = categoryDoc.Questions || [];
      const solvedCount = questions.reduce((acc, q) => {
        const problemId = q.id || q.title;
        if (problemId && solvedProblemIds.has(problemId)) {
          return acc + 1;
        }
        return acc;
      }, 0);

      return {
        ...categoryDoc,
        name: categoryDoc.id,
        questionCount: questions.length,
        solved: solvedCount,
      };
    }).sort((a,b) => a.name.localeCompare(b.name));

  }, [categoriesData, userProfile]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">
              Practice Problems
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Hone your skills by solving a curated list of problems. Select a category to get started.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={category.name} category={category} index={index} />
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

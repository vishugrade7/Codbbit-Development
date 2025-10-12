
'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Question } from '@/lib/types';
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

  const problemsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'problems');
  }, [firestore]);

  const { data: categoriesData, isLoading } = useCollection<Category>(problemsCollectionRef);

  const categories: Category[] = useMemo(() => {
    if (!categoriesData) return [];
    
    return categoriesData.map(categoryDoc => ({
      ...categoryDoc,
      name: categoryDoc.id,
      questionCount: categoryDoc.Questions?.length || 0,
      solved: Math.floor(Math.random() * (categoryDoc.Questions?.length || 0)), // Placeholder for solved count
    })).sort((a,b) => a.name.localeCompare(b.name));

  }, [categoriesData]);

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

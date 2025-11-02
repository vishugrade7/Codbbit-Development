
'use client';

import { useMemo } from 'react';
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import type { UserProfile, Course } from '@/lib/types';
import { doc, collection } from 'firebase/firestore';
import { HashLoader } from 'react-spinners';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function CoursesPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const coursesCollectionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'courses');
    }, [firestore]);

    const { data: courses, isLoading: isLoadingCourses } = useCollection<Course>(coursesCollectionRef);

    const allCourses = useMemo(() => {
      const staticCourses = [
        { id: 'soql', title: 'SOQL', description: 'A comprehensive guide to mastering Salesforce Object Query Language.', problemIds: [], createdBy: 'system' }
      ];
      const dynamicCourses = (courses || []).map(course => {
          if (course.title.toLowerCase().includes('soql')) {
              return {...course, title: 'SOQL'};
          }
          return course;
      })
      return [...staticCourses, ...dynamicCourses.filter(c => !c.title.toLowerCase().includes('soql'))];
    }, [courses]);


    if (isUserLoading || isLoadingCourses) {
        return (
            <div className="flex h-screen items-center justify-center">
                <HashLoader color="#456eff" />
            </div>
        );
    }
    
    const getIconForCourse = (title: string) => {
        // In a real app, you might have a map of course titles to icons
        // For now, we'll just use the Search icon for SOQL
        if (title.toLowerCase().includes('soql')) {
            return <Search className="h-12 w-12 text-foreground/80" />;
        }
        return <Search className="h-12 w-12 text-foreground/80" />;
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <AppSidebar />
            </Sidebar>
            <SidebarInset>
                 <main className="p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-screen">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold font-headline tracking-tight">Courses</h1>
                        <p className="text-muted-foreground mt-1">
                            Browse courses to improve your Apex skills.
                        </p>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {allCourses.map(course => (
                            <Link key={course.id} href={`/courses/${course.id}`} className="block">
                                <Card className={cn("h-64 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 bg-green-200/50 dark:bg-green-800/20 border-green-500/30",
                                )}>
                                <CardContent className="flex flex-col items-center justify-center text-center p-6 h-full">
                                    {getIconForCourse(course.title)}
                                    <h2 className="text-4xl font-bold font-headline mt-4">{course.title}</h2>
                                    <Badge className="mt-2 -rotate-6 bg-green-600 text-white hover:bg-green-700">Crash Course</Badge>
                                </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                 </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

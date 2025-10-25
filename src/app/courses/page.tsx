
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
        { id: 'soql', title: 'SOQL Tutorial', description: 'A comprehensive guide to mastering Salesforce Object Query Language.', problemIds: [], createdBy: 'system' }
      ];
      return [...staticCourses, ...(courses || [])];
    }, [courses]);


    if (isUserLoading || isLoadingCourses) {
        return (
            <div className="flex h-screen items-center justify-center">
                <HashLoader color="#456eff" />
            </div>
        );
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allCourses.map(course => (
                            <Link key={course.id} href={`/courses/${course.id}`} className="block hover:shadow-lg transition-shadow rounded-lg">
                                <Card className="h-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50">
                                <CardHeader className="flex flex-row items-center justify-between p-4">
                                    <CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> {course.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">{course.description}</p>
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


'use client';

import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';

export default function CoursesPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
    
    // The conditional check is now only for presentation and doesn't violate hook rules.
    const showSoqlCard = !isUserLoading && !isProfileLoading && user && !userProfile?.isAdmin;

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
                        {showSoqlCard && (
                             <Link href="/courses/soql" className="block hover:shadow-lg transition-shadow rounded-lg">
                                <Card className="h-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50">
                                <CardHeader className="flex flex-row items-center justify-between p-4">
                                    <CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> SOQL Tutorial</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">A comprehensive guide to mastering Salesforce Object Query Language.</p>
                                </CardContent>
                                </Card>
                            </Link>
                        )}
                        {/* Dynamically generated courses would be mapped here */}
                    </div>
                 </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

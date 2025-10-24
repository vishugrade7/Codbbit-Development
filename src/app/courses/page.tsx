
'use client';

import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useUser } from '@/firebase';

export default function CoursesPage() {
    const { user, isUserLoading } = useUser();
    
    // Assuming you have a way to check if the user is an admin.
    // For now, let's just show it if they are not loading and are logged in.
    const showSoqlCard = !isUserLoading && user;

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
                                <Card className="h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> SOQL Tutorial</CardTitle>
                                </CardHeader>
                                <CardContent>
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


'use client';

import { useState, useMemo } from 'react';
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { List, Search, PlusCircle, Star } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { ProblemSheetCard } from '@/components/ProblemSheetCard';
import type { ProblemSheet, UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';

export default function ProblemSheetsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'following'>('all');
  const firestore = useFirestore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);


  const sheetsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'sheets');
  }, [firestore]);

  const { data: sheets, isLoading } = useCollection<ProblemSheet>(sheetsCollectionRef);
  
  const followedSheets = useMemo(() => {
    if (!sheets || !userProfile?.followedSheets) return [];
    const followedSheetIds = new Set(userProfile.followedSheets);
    return sheets.filter(sheet => followedSheetIds.has(sheet.id));
  }, [sheets, userProfile?.followedSheets]);

  const { mySheets, discoverSheets } = useMemo(() => {
    if (!sheets) return { mySheets: [], discoverSheets: [] };

    const followedSheetIds = new Set(userProfile?.followedSheets || []);
    
    let allFilteredSheets = sheets.filter(sheet => sheet.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const my = allFilteredSheets.filter(sheet => sheet.createdBy === user?.uid);
    
    const discover = allFilteredSheets.filter(sheet => sheet.isPublic && !followedSheetIds.has(sheet.id) && sheet.createdBy !== user?.uid);

    return { mySheets: my, discoverSheets: discover };

  }, [sheets, searchQuery, userProfile, user?.uid]);
  
  const displayedSheets = useMemo(() => {
      switch (activeTab) {
          case 'following':
              return followedSheets;
          case 'my':
              return mySheets;
          case 'all':
          default:
              return discoverSheets;
      }
  }, [activeTab, followedSheets, mySheets, discoverSheets]);

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-screen">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight">Problem Sheets</h1>
              <p className="text-muted-foreground mt-1">
                Browse community-created problem sheets or create your own for targeted practice.
              </p>
            </div>
            <Button asChild>
                <Link href="/sheets/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Sheet
                </Link>
            </Button>
          </header>
          
           <div className="mb-8 flex items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'my' | 'following')}>
                <TabsList>
                    <TabsTrigger value="all">Discover</TabsTrigger>
                    <TabsTrigger value="my">My Sheets</TabsTrigger>
                    <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search sheets..." 
                    className="pl-9 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
            </div>
          </div>
          
          {activeTab === 'all' && followedSheets.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><Star className="text-yellow-400 fill-yellow-400"/> Followed Sheets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {followedSheets.map((sheet, index) => (
                  <ProblemSheetCard key={sheet.id} sheet={sheet} index={index} />
                ))}
              </div>
            </div>
          )}


          <div>
              <h2 className="text-2xl font-bold font-headline mb-4">
                  {activeTab === 'all' ? 'Discover Sheets' : activeTab === 'my' ? 'My Sheets' : 'Following'}
              </h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner />
                </div>
              ) : (
                <>
                {displayedSheets.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <List className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">No sheets found</h3>
                        <p className="text-sm">
                            {activeTab === 'all' ? 'There are no new sheets to discover right now.' : 
                             activeTab === 'my' ? "You haven't created any sheets yet." :
                             "You are not following any sheets yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedSheets.map((sheet, index) => (
                            <ProblemSheetCard key={sheet.id} sheet={sheet} index={index + followedSheets.length} />
                        ))}
                    </div>
                )}
                </>
              )}
            </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    
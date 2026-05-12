'use client';

import { AppSidebar, Sidebar, SidebarProvider, SidebarInset, StatCard } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDoc, useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import type { UserProfile, Question, ProblemSheet } from '@/lib/types';
import { doc, collection, query, limit, where, orderBy } from 'firebase/firestore';
import { Award, BarChart, Flame, BookOpen, List, Calendar, Star, AlertTriangle, TrendingUp, ArrowDown, Folder, ChevronRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn, getCategoryColorClasses } from '@/lib/utils';
import { LandingPage } from '@/components/LandingPage';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { initiateSalesforceOAuth } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [showReconnectDialog, setShowReconnectDialog] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const sheetsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'sheets'), limit(3));
  }, [firestore, user]);
  const { data: sheets } = useCollection<ProblemSheet>(sheetsCollectionRef);
  
  const problemsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'problems');
  }, [firestore, user]);
  const { data: categoriesData } = useCollection<{id: string; Questions: Partial<Question>[]}>(problemsCollectionRef);

  const unsolvedProblems = useMemo(() => {
    if (!categoriesData || !userProfile) return [];
    const allProblems = categoriesData.flatMap(cat => 
        (cat.Questions || []).map(q => ({...q, category: cat.id, id: q.id || q.title }))
    );
    const solvedProblemIds = new Set(Object.keys(userProfile.solvedProblems || {}));
    return allProblems.filter(problem => !solvedProblemIds.has(problem.id!)).slice(0, 5);
  }, [categoriesData, userProfile]);

  useEffect(() => {
    if (!isProfileLoading && userProfile?.isAdmin) {
      router.replace('/admin');
    }
  }, [userProfile, isProfileLoading, router]);

  useEffect(() => {
    if (userProfile?.sfdcAuth && !userProfile.sfdcAuth.connected && userProfile.sfdcAuth.refreshToken) {
      setShowReconnectDialog(true);
    }
  }, [userProfile]);
  

  const handleAuthWithSalesforce = async () => {
    const verifier = btoa(String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(32))));
    sessionStorage.setItem('salesforce_code_verifier', verifier);
    const result = await initiateSalesforceOAuth(user!.uid, verifier);
    if (result.success && result.url) window.location.href = result.url;
    else toast({ title: "Error", description: "OAuth failed.", variant: "destructive" });
  };

  if (isUserLoading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  if (!user) return <LandingPage />;
  if (isProfileLoading || !userProfile) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  
  const getDifficultyDotClass = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="hidden md:block"><AppSidebar /></Sidebar>
      <SidebarInset>
        <main className="flex-1 min-h-screen bg-gradient-to-br from-background to-muted/30">
          <Dialog open={showReconnectDialog} onOpenChange={setShowReconnectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-yellow-500" />Salesforce Connection Expired</DialogTitle>
                <DialogDescription>Please reconnect to continue executing code and submitting solutions.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReconnectDialog(false)}>Later</Button>
                <Button onClick={handleAuthWithSalesforce}>Reconnect Now</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <header className="px-4 py-8 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-bold font-handwritten tracking-tight">{`Welcome back, ${userProfile?.name || 'Coder'}!`}</h1>
              <p className="text-muted-foreground mt-1">Ready to tackle your next challenge? Let's get started.</p>
            </div>
             <div className="grid grid-cols-4 gap-4">
              <StatCard title="Total Points" value={userProfile?.points || 0} icon={BarChart} changeText="Keep solving" changeType="neutral" />
              <StatCard title="Current Streak" value={`${userProfile?.currentStreak || 0} days`} icon={Flame} changeText="Daily progress" changeType="neutral" />
              <StatCard title="Max Streak" value={`${userProfile?.maxStreak || 0} days`} icon={TrendingUp} changeText="All time high" changeType="neutral" />
              <StatCard title="Problems Solved" value={Object.keys(userProfile.solvedProblems || {}).length} icon={Award} changeText="Your achievements" changeType="neutral" />
            </div>
          </header>

          <div className="px-4 pb-8 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="animate-fade-in-up flex-grow flex flex-col" style={{ animationDelay: '0.7s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Featured Sheets</CardTitle>
                  <CardDescription>Curated lists to sharpen your skills.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sheets && sheets.map((sheet, index) => {
                        const colorClasses = getCategoryColorClasses(index);
                        return (
                          <Link href={`/sheets/${sheet.id}`} key={sheet.id} className="block group">
                             <div className={cn('relative p-4 rounded-lg transition-all transform group-hover:shadow-lg bg-muted/30 border border-border')}>
                              <div className={cn("absolute top-0 left-4 h-1 w-16 rounded-b-md", colorClasses.progress)} />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={cn("p-1.5 rounded-md", colorClasses.button)}><Folder className="h-5 w-5" /></div>
                                  <div><p className="font-semibold">{sheet.name}</p><p className="text-xs opacity-70">{sheet.questionIds.length} problems</p></div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                          </Link>
                        )
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card className="animate-fade-in-up flex flex-col" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary"><BookOpen className="h-5 w-5"/> Continue Solving</CardTitle>
                  <CardDescription>Pick up where you left off with these unsolved problems.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ScrollArea className="h-auto">
                    <div className="pr-4">
                      {unsolvedProblems.map((problem, index) => (
                        <Fragment key={problem.id || problem.title}>
                          <Link href={`/problems/${problem.category}/${problem.id || problem.title}`}>
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                              <p className="font-semibold truncate flex-1">{problem.title}</p>
                              <div className="flex items-center gap-4 ml-4">
                                <Badge variant="outline" className="gap-1.5 w-20 justify-center">
                                  <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(problem.difficulty))} />
                                  {problem.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </Link>
                          {index < unsolvedProblems.length - 1 && <Separator />}
                        </Fragment>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

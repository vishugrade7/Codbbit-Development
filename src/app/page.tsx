
'use client';

import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDoc, useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import type { UserProfile, Question, ProblemSheet } from '@/lib/types';
import { doc, collection, query, limit } from 'firebase/firestore';
import { Award, BarChart, Flame, Loader2, BookOpen, FileText, ChevronRight, List, Calendar, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ProblemSheetCard } from '@/components/ProblemSheetCard';
import { cn, getCategoryColorClasses } from '@/lib/utils';
import { LandingPage } from '@/components/LandingPage';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { initiateSalesforceOAuth } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { getUserRank } from '@/ai/flows/get-user-rank';


export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [showReconnectDialog, setShowReconnectDialog] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const sheetsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sheets'), limit(3));
  }, [firestore]);
  const { data: sheets, isLoading: isLoadingSheets } = useCollection<ProblemSheet>(sheetsCollectionRef);
  
  const problemsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'problems');
  }, [firestore]);
  const { data: categoriesData, isLoading: isLoadingProblems } = useCollection<{id: string; Questions: Partial<Question>[]}>(problemsCollectionRef);

  const unsolvedProblems = useMemo(() => {
    if (!categoriesData || !userProfile) return [];

    const allProblems = categoriesData.flatMap(cat => 
        (cat.Questions || []).map(q => ({...q, category: cat.id, id: q.id || q.title }))
    );
    
    const solvedProblemIds = new Set(Object.keys(userProfile.solvedProblems || {}));

    return allProblems.filter(problem => !solvedProblemIds.has(problem.id!)).slice(0, 3);
  }, [categoriesData, userProfile]);

  const problemOfTheDay = useMemo(() => {
    if (!categoriesData) return null;
    const apexBasics = categoriesData.find(c => c.id === 'Apex Basics');
    return apexBasics?.Questions?.[3] || null;
  }, [categoriesData]);

  const problemOfTheWeek = useMemo(() => {
    if (!categoriesData) return null;
    const apexBasics = categoriesData.find(c => c.id === 'Apex Basics');
    return apexBasics?.Questions?.[4] || null;
  }, [categoriesData]);


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
  
  useEffect(() => {
    if (userProfile?.points != null) {
      getUserRank({ points: userProfile.points }).then(result => {
        setUserRank(result.rank);
      });
    }
  }, [userProfile?.points]);

  const handleAuthWithSalesforce = async () => {
    // 1. Generate code verifier
    const verifier = btoa(String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(32))));
    sessionStorage.setItem('salesforce_code_verifier', verifier);

    // 2. Generate code challenge
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    // 3. Call server action with the challenge
    const result = await initiateSalesforceOAuth(challenge);
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      toast({
        title: "Authentication Error",
        description: result.error || "Could not initiate Salesforce authentication.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isUserLoading || isProfileLoading || isLoadingSheets || isLoadingProblems || userRank === null;

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <LandingPage />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (userProfile?.isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="mt-4 text-muted-foreground">Redirecting to Admin Portal...</p>
      </div>
    );
  }
  
  const getDifficultyDotClass = (difficulty: string | undefined) => {
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

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-screen">
          <Dialog open={showReconnectDialog} onOpenChange={setShowReconnectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" />
                  Salesforce Connection Expired
                </DialogTitle>
                <DialogDescription>
                  Your connection to Salesforce has expired. Please reconnect to continue executing code and submitting solutions.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReconnectDialog(false)}>Later</Button>
                <Button onClick={handleAuthWithSalesforce}>Reconnect Now</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <header className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Welcome back, {userProfile?.name || 'Coder'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to tackle your next challenge? Let's get started.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="animate-fade-in-up bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rank</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{userRank || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">Your position on the leaderboard</p>
              </CardContent>
            </Card>
            <Card className="animate-fade-in-up bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfile?.points || 0}</div>
                <p className="text-xs text-muted-foreground">Keep solving to earn more</p>
              </CardContent>
            </Card>
            <Card className="animate-fade-in-up bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                 <Flame className={cn("h-4 w-4 text-muted-foreground", (userProfile?.currentStreak || 0) > 0 && "text-orange-400 animate-pulse")} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfile?.currentStreak || 0} days</div>
                <p className="text-xs text-muted-foreground">Keep the flame alive!</p>
              </CardContent>
            </Card>
          </div>
          
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {problemOfTheDay && (
                <Card className="bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary"/> Problem of the Day</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold text-lg">{problemOfTheDay.title}</p>
                    <p className="text-muted-foreground text-sm mt-1 mb-4">A new challenge, every single day. Can you solve it?</p>
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="gap-1.5 w-24 justify-center">
                          <span className={cn("size-1.5 rounded-full", getDifficultyDotClass(problemOfTheDay.difficulty))} aria-hidden="true"></span>
                          {problemOfTheDay.difficulty}
                        </Badge>
                         <Button asChild>
                            <Link href={`/problems/${problemOfTheDay.category}/${problemOfTheDay.id || problemOfTheDay.title}`}>Solve Now</Link>
                         </Button>
                    </div>
                </CardContent>
                </Card>
            )}
             {problemOfTheWeek && (
                <Card className="bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/50 dark:to-pink-900/50 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-purple-500"/> Problem of the Week</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold text-lg">{problemOfTheWeek.title}</p>
                    <p className="text-muted-foreground text-sm mt-1 mb-4">A hand-picked problem to test your skills this week.</p>
                     <div className="flex items-center justify-between">
                        <Badge variant="outline" className="gap-1.5 w-24 justify-center">
                          <span className={cn("size-1.5 rounded-full", getDifficultyDotClass(problemOfTheWeek.difficulty))} aria-hidden="true"></span>
                          {problemOfTheWeek.difficulty}
                        </Badge>
                         <Button asChild>
                            <Link href={`/problems/${problemOfTheWeek.category}/${problemOfTheWeek.id || problemOfTheWeek.title}`}>Take the Challenge</Link>
                         </Button>
                    </div>
                </CardContent>
                </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5"/> Continue Solving</CardTitle>
                <CardDescription>Pick up where you left off with these unsolved problems.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unsolvedProblems.map(problem => (
                     <Link href={`/problems/${problem.category}/${problem.id || problem.title}`} key={problem.id || problem.title}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                           <p className="font-semibold">{problem.title}</p>
                           <div className="flex items-center gap-4">
                              <Badge variant="outline" className="gap-1.5 w-24 justify-center">
                                <span className={cn("size-1.5 rounded-full", getDifficultyDotClass(problem.difficulty))} aria-hidden="true"></span>
                                {problem.difficulty}
                              </Badge>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                           </div>
                        </div>
                     </Link>
                  ))}
                  <Button variant="outline" className="w-full !mt-4" asChild>
                     <Link href="/problems">View All Problems</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Featured Sheets</CardTitle>
                <CardDescription>Curated lists to sharpen your skills.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sheets && sheets.map((sheet, index) => {
                      const colorClasses = getCategoryColorClasses(index);
                      return (
                        <Link href={`/sheets/${sheet.id}`} key={sheet.id} className={cn(
                          'flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5',
                          colorClasses.card
                        )}>
                            <div className="flex items-center gap-3">
                               <div className={cn("p-2 rounded-md", colorClasses.button)}>
                                 <FileText className="h-5 w-5" />
                               </div>
                               <div>
                                  <p className="font-semibold">{sheet.name}</p>
                                  <p className="text-xs opacity-70">{sheet.questionIds.length} problems</p>
                               </div>
                            </div>
                            <ChevronRight className="h-5 w-5 opacity-70" />
                        </Link>
                      )
                  })}
                  <Button variant="outline" className="w-full !mt-4" asChild>
                     <Link href="/sheets">View All Sheets</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

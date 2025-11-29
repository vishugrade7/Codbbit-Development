
'use client';

import { AppSidebar, Sidebar, SidebarProvider, SidebarInset, StatCard } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDoc, useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import type { UserProfile, Question, ProblemSheet } from '@/lib/types';
import { doc, collection, query, limit } from 'firebase/firestore';
import { Award, BarChart, Flame, BookOpen, FileText, List, Calendar, Star, AlertTriangle, Menu, TrendingUp, TrendingDown, ArrowDown, ArrowRight } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useMemo, useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { ProblemSheetCard } from '@/components/ProblemSheetCard';
import { cn, getCategoryColorClasses } from '@/lib/utils';
import { LandingPage } from '@/components/LandingPage';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { initiateSalesforceOAuth } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [showReconnectDialog, setShowReconnectDialog] = useState(false);
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
  const [userRank, setUserRank] = useState<number | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const allUsersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: allUsers, isLoading: isLoadingAllUsers } = useCollection<UserProfile>(allUsersCollectionRef);

  useEffect(() => {
    if (userProfile?.points != null && allUsers) {
      const rank = allUsers.filter(u => u.points > (userProfile.points || 0)).length + 1;
      setUserRank(rank);
    }
  }, [userProfile, allUsers]);

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

    return allProblems.filter(problem => !solvedProblemIds.has(problem.id!)).slice(0, 5);
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

  const isLoading = isUserLoading || isProfileLoading || isLoadingSheets || isLoadingProblems || isLoadingAllUsers;

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  if (!user) {
    return <LandingPage />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (userProfile?.isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader />
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
      <Sidebar collapsible="icon" className="hidden md:block">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="p-2 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 pt-4 md:pt-8">
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
            <h1 className="text-3xl font-bold font-handwritten tracking-tight">
                {`Welcome back, ${userProfile?.name || 'Coder'}!`}
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to tackle your next challenge? Let's get started.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-6 flex flex-col">
              <div className="w-full">
                 <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <StatCard
                    title="Rank"
                    value={`#${userRank || 'N/A'}`}
                    icon={Award}
                    changeText="Your position"
                    variant="primary"
                    changeType="neutral"
                  />
                  <StatCard
                    title="Total Points"
                    value={userProfile?.points || 0}
                    icon={BarChart}
                    changeText="Keep solving"
                    changeType="neutral"
                  />
                   <StatCard
                    title="Current Streak"
                    value={`${userProfile?.currentStreak || 0} days`}
                    icon={Flame}
                    changeText="vs last month"
                    changeValue={userProfile?.currentStreak || 0 > (userProfile?.maxStreak || 0) ? 5 : -2}
                    changeType={(userProfile?.currentStreak || 0) > 0 ? "positive" : "negative"}
                  />
                  <StatCard
                    title="Max Streak"
                    value={`${userProfile?.maxStreak || 0} days`}
                    icon={TrendingUp}
                    changeText="All time high"
                    changeType="neutral"
                  />
                </div>
              </div>
              <Card className="animate-fade-in-up flex-grow flex flex-col" style={{ animationDelay: '0.7s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Featured Sheets</CardTitle>
                  <CardDescription>Curated lists to sharpen your skills.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-col h-full">
                    <div className="space-y-2 flex-grow">
                      {sheets && sheets.map((sheet, index) => {
                          const colorClasses = getCategoryColorClasses(index);
                          return (
                            <Link href={`/sheets/${sheet.id}`} key={sheet.id} className={cn(
                              'flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5',
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
                                
                            </Link>
                          )
                      })}
                    </div>
                    {sheets && sheets.length > 0 && (
                      <div className="flex justify-center pt-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button asChild variant="outline" size="icon" className="rounded-full h-10 w-10 flex-shrink-0">
                                <Link href="/sheets">
                                  <ArrowDown className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View All Sheets</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3 space-y-6">
              <Card className="animate-fade-in-up flex flex-col" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary"><BookOpen className="h-5 w-5"/> Continue Solving</CardTitle>
                  <CardDescription>Pick up where you left off with these unsolved problems.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-col h-full">
                    <ScrollArea className="h-auto flex-grow">
                      <div className="pr-4">
                        {unsolvedProblems.map((problem, index) => (
                          <Fragment key={problem.id || problem.title}>
                            <Link href={`/problems/${problem.category}/${problem.id || problem.title}`}>
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                                <p className="font-semibold">{problem.title}</p>
                                <div className="flex items-center gap-4">
                                  <Badge variant="outline" className="gap-1.5 w-20 justify-center">
                                    <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(problem.difficulty))} aria-hidden="true"></span>
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
                    {unsolvedProblems && unsolvedProblems.length > 0 && (
                      <div className="flex justify-center pt-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button asChild variant="outline" className="gap-2">
                                <Link href="/problems">
                                  <ArrowDown className="h-4 w-4" />
                                  View More
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View All Problems</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </CardContent>
                <div className="grid grid-cols-1 gap-6 p-6 pt-0">
                    {problemOfTheDay && (
                        <Card className="bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary"/> Problem of the Day</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-lg">{problemOfTheDay.title}</p>
                            <p className="text-muted-foreground text-sm mt-1 mb-4">A new challenge, every single day. Can you solve it?</p>
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="gap-1.5 w-20 justify-center">
                                  <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(problemOfTheDay.difficulty))} aria-hidden="true"></span>
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
                                <Badge variant="outline" className="gap-1.5 w-20 justify-center">
                                  <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(problemOfTheWeek.difficulty))} aria-hidden="true"></span>
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
              </Card>
            </div>
          </div>

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

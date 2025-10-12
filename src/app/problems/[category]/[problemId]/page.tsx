
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import type { Question, UserProfile } from '@/lib/types';
import { Loader2, ArrowLeft, PanelLeftClose, Menu, Search, Filter, CheckCircle, Circle, Github, XCircle } from 'lucide-react';
import { AppSidebar, Sidebar, SidebarProvider, Confetti, SidebarInset } from '@/components';
import { QuestionPanel } from '@/components/QuestionPanel';
import { CodingPanel } from '@/components/CodingPanel';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { getSolutionFromGitHub } from '@/lib/github-actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { HeaderBar } from '@/components/HeaderBar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const DEFAULT_FONT_SIZE = 14;
const DEFAULT_EDITOR_THEME = 'vs-dark';

export default function ProblemSolvingPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const categoryUrlParam = params.category as string;
  const problemId = params.problemId as string;
  const [problem, setProblem] = useState<Question | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  const [code, setCode] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isQuestionPanelVisible, setIsQuestionPanelVisible] = useState(true);

  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [editorTheme, setEditorTheme] = useState(DEFAULT_EDITOR_THEME);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);


  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const problemsCollectionRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'problems');
  }, [firestore]);

  const { data: categoriesData, isLoading: isLoadingProblems } = useCollection<{id: string; Questions: Partial<Question>[]}>(problemsCollectionRef);


  const groupedProblems = useMemo(() => {
    if (!categoriesData) return [];
    
    const solvedProblemIds = new Set(userProfile?.solvedProblems ? Object.keys(userProfile.solvedProblems) : []);

    return categoriesData.map(cat => ({
      category: cat.id,
      questions: (cat.Questions || [])
        .map(q => ({
          ...q,
          id: q.id || q.title,
          category: cat.id,
          isSolved: solvedProblemIds.has(q.id!) || solvedProblemIds.has(q.title!)
        }))
        .filter(q => {
          const matchesSearch = !searchTerm || q.title?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
          return matchesSearch && matchesDifficulty;
        })
    })).filter(group => group.questions.length > 0);

  }, [categoriesData, searchTerm, difficultyFilter, userProfile]);
  
  // Effect to load editor settings from localStorage
  useEffect(() => {
    try {
      const storedFontSize = localStorage.getItem('editor_font_size');
      const storedTheme = localStorage.getItem('editor_theme');
      
      if (storedFontSize) setFontSize(Number(storedFontSize));
      if (storedTheme) setEditorTheme(storedTheme);
      
    } catch (error) {
      console.warn("Could not access localStorage for editor settings.");
    }
  }, []);


  useEffect(() => {
    if (!firestore || !categoryUrlParam || !problemId) return;

    const fetchProblem = async () => {
      setIsLoading(true);
      try {
        const categoryDocRef = doc(firestore, 'problems', categoryUrlParam);
        const categorySnap = await getDoc(categoryDocRef);

        if (!categorySnap.exists()) {
          setProblem(null);
          return;
        }

        const categoryData = categorySnap.data();
        const questions = categoryData.Questions || [];
        const foundProblem: Question | undefined = questions.find((q: any) => (q.id || q.title) === problemId);

        if (foundProblem) {
          setProblem(foundProblem);

          const isSolved = userProfile?.solvedProblems && (userProfile.solvedProblems[foundProblem.id] || userProfile.solvedProblems[foundProblem.title]);
          const githubConnected = userProfile?.githubSync?.connected;

          if (isSolved && githubConnected && user?.uid) {
            const result = await getSolutionFromGitHub(user.uid, foundProblem.title);
            if (result.success && result.content) {
              setCode(result.content);
            } else {
              setCode(foundProblem.starterCode || '');
              if (result.error) {
                  toast({ title: "Could Not Load Solution", description: `Falling back to starter code. Reason: ${result.error}`, variant: 'destructive' });
              }
            }
          } else {
            setCode(foundProblem.starterCode || '');
          }
        } else {
          setProblem(null);
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
        setProblem(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [firestore, categoryUrlParam, problemId, userProfile, user?.uid, toast]);

  
  useEffect(() => {
    if (!isLoading && !problem) {
      notFound();
    }
  }, [isLoading, problem]);

  
  if (isLoading || !problem || isLoadingProblems) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }
  
  const handleTestPass = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000); // Hide confetti after 5 seconds
  };
  

  const handleResetCode = () => {
    if (problem?.starterCode) {
      setCode(problem.starterCode);
      toast({
        title: "Code Reset",
        description: "The code has been reset to the original starter template.",
      });
    }
  };

  const handleSyncToGitHub = async () => {
    if (!user?.uid || !problem?.title) {
        toast({ title: "Error", description: "Cannot sync without user and problem information.", variant: "destructive" });
        return;
    }

    setIsSyncing(true);
    setSyncStatus([]);
    setSyncError(null);
    setIsSyncDialogOpen(true);

    const updateStatus = (message: string) => setSyncStatus(prev => [...prev, message]);

    try {
        updateStatus("Connecting to GitHub...");
        // This function is now called from within the `executeSalesforceCode` server action
        // const result = await pushSolutionToGitHub(user.uid, problem.title, code);
        // if (result.success) {
        //     updateStatus("Sync Successful!");
        //     updateStatus(result.message);
        // } else {
        //     throw new Error(result.error);
        // }
    } catch (error: any) {
        setSyncError(error.message);
    } finally {
        setIsSyncing(false);
    }
  }


  const DifficultyFilterRadioGroup = ({ title, options, value, onValueChange }: { title: string, options: string[], value: string, onValueChange: (value: any) => void }) => (
    <div className="grid gap-2">
      <p className="font-medium text-sm">{title}</p>
      {options.map(option => (
        <button key={option} onClick={() => onValueChange(option)} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <div className="w-5 h-5 mr-2 flex items-center justify-center">
            {value === option && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
          {option}
        </button>
      ))}
    </div>
  );
  
  const isProblemActive = (p: Partial<Question>) => problemId === (p.id || p.title);


  return (
    <SidebarProvider>
      {showConfetti && <Confetti />}
       <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Github /> Syncing to GitHub
            </DialogTitle>
            <DialogDescription>
              Your code is being pushed to your repository.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 font-mono text-sm space-y-2">
            {syncStatus.map((status, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{status}</span>
              </div>
            ))}
            {isSyncing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                </div>
            )}
            {syncError && (
                 <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="h-4 w-4" />
                    <span>Error: {syncError}</span>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSyncDialogOpen(false)} disabled={isSyncing}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background text-foreground glass:bg-background/80 glass:backdrop-blur-xl">
             <HeaderBar
                onReset={handleResetCode}
                onSyncToGitHub={handleSyncToGitHub}
                fontSize={fontSize}
                setFontSize={setFontSize}
                editorTheme={editorTheme}
                setEditorTheme={setEditorTheme}
                leftControls={
                    <>
                        <Sheet>
                          <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Menu className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="left" className="w-[450px] sm:w-[540px] p-0">
                                <SheetHeader className="p-4 border-b">
                                  <SheetTitle>Problem List</SheetTitle>
                                  <SheetDescription className="sr-only">Browse and filter coding problems.</SheetDescription>
                                </SheetHeader>
                                  <div className="p-4 border-b">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="relative flex-grow">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input 
                                                placeholder="Search problems..."
                                                className="pl-9 h-10"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon" className="h-9 w-9">
                                              <Filter className="h-4 w-4" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-60 p-4" align="end">
                                            <div className="grid gap-4">
                                              <DifficultyFilterRadioGroup 
                                                  title="Difficulty"
                                                  options={['All', 'Easy', 'Medium', 'Hard']}
                                                  value={difficultyFilter}
                                                  onValueChange={(val: 'All' | 'Easy' | 'Medium' | 'Hard') => setDifficultyFilter(val)}
                                              />
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                    </div>
                                  </div>
                                <ScrollArea className="h-full">
                                <div className="py-4">
                                  {groupedProblems.map((group) => (
                                    <div key={group.category} className="mb-6">
                                      <h3 className="px-6 text-sm font-semibold text-gray-400 mb-2 flex items-center">
                                        {group.category}
                                      </h3>
                                      <ul className="space-y-1">
                                        {group.questions.map(q => (
                                          <li key={q.id || q.title}>
                                            <Link href={`/problems/${group.category}/${q.id || q.title}`} className={cn(
                                                "flex items-center py-2 px-6 text-gray-500 dark:text-gray-300 hover:bg-muted transition-colors",
                                                isProblemActive(q) && "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-white"
                                            )}>
                                                <span className="ml-2 truncate">{q.title}</span>
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                  </div>
                                </ScrollArea>
                          </SheetContent>
                        </Sheet>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Your current code will not be saved. Please submit your solution if you want to save it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => router.back()}>Leave</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </>
                }
             >
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsQuestionPanelVisible(!isQuestionPanelVisible)}>
                    <PanelLeftClose className="h-4 w-4" />
                </Button>
             </HeaderBar>
            <main className="flex-grow overflow-hidden">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    {isQuestionPanelVisible && (
                        <>
                            <ResizablePanel defaultSize={40} minSize={30}>
                                <QuestionPanel question={problem} />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                        </>
                    )}
                    <ResizablePanel defaultSize={isQuestionPanelVisible ? 60: 100} minSize={40}>
                        <CodingPanel 
                            question={problem} 
                            code={code}
                            setCode={setCode}
                            onTestPass={handleTestPass}
                            fontSize={fontSize}
                            editorTheme={editorTheme}
                        />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

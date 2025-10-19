

'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import type { Question, UserProfile } from '@/lib/types';
import { Loader2, ArrowLeft, PanelLeftClose, Menu, Search, Filter, CheckCircle, Circle, XCircle, Sparkles, ChevronRight, BarChartHorizontal } from 'lucide-react';
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
  SheetDescription,
  SheetTrigger,
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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { HeaderBar } from '@/components/HeaderBar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTheme } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const DEFAULT_FONT_SIZE = 14;

export default function ProblemSolvingPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { theme } = useTheme();
  
  const categoryUrlParam = params.category as string;
  const problemId = params.problemId as string;
  const [problem, setProblem] = useState<Question | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  const [code, setCode] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isQuestionPanelVisible, setIsQuestionPanelVisible] = useState(true);

  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [editorTheme, setEditorTheme] = useState(theme === 'dark' ? 'vs-dark' : 'light');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  
  const [output, setOutput] = useState<{ success: boolean; logs: string; error?: string; } | null>(null);


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


  const categoryProblems = useMemo(() => {
    if (!categoriesData) return [];
    
    const solvedProblemIds = new Set(userProfile?.solvedProblems ? Object.keys(userProfile.solvedProblems) : []);
    const category = categoriesData.find(cat => cat.id === categoryUrlParam);

    if (!category) return [];

    return (category.Questions || [])
      .map((q, index) => ({
        ...q,
        id: q.id || q.title,
        category: category.id,
        isSolved: solvedProblemIds.has(q.id!) || solvedProblemIds.has(q.title!),
        number: index + 1
      }))
      .filter(q => {
        const matchesSearch = !searchTerm || q.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
      })

  }, [categoriesData, searchTerm, difficultyFilter, userProfile, categoryUrlParam]);
  
  const solvedInCategory = useMemo(() => categoryProblems.filter(p => p.isSolved).length, [categoryProblems]);
  
  // Effect to load editor settings from localStorage
  useEffect(() => {
    try {
      const storedFontSize = localStorage.getItem('editor_font_size');
      if (storedFontSize) setFontSize(Number(storedFontSize));

      const storedTheme = localStorage.getItem('editor_theme');
      if (storedTheme) {
        setEditorTheme(storedTheme)
      } else {
        setEditorTheme(theme === 'dark' ? 'vs-dark' : 'light')
      }
      
    } catch (error) {
      console.warn("Could not access localStorage for editor settings.");
      setEditorTheme(theme === 'dark' ? 'vs-dark' : 'light');
    }
  }, [theme]);


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
          
          setCode(foundProblem.starterCode || '');

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
  
  const isProblemActive = (p: Partial<Question>) => problemId === (p.id || p.title);

  const getDifficultyClass = (difficulty?: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
        case 'Easy': return 'text-green-500';
        case 'Medium': return 'text-yellow-500';
        case 'Hard': return 'text-red-500';
        default: return 'text-muted-foreground';
    }
  };

  return (
    <SidebarProvider>
      {showConfetti && <Confetti />}
       <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                Syncing to GitHub
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
        <div className="flex flex-col h-screen bg-background text-foreground">
             <HeaderBar
                onReset={handleResetCode}
                fontSize={fontSize}
                setFontSize={setFontSize}
                editorTheme={editorTheme}
                setEditorTheme={setEditorTheme}
                leftControls={
                    <>
                        <Sheet>
                          <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Menu className="h-4 w-4"/>
                              </Button>
                          </SheetTrigger>
                           <SheetContent side="left" className="p-0 sm:max-w-md">
                             <SheetHeader className="sr-only">
                                <SheetTitle>Problem List</SheetTitle>
                                <SheetDescription>Navigate to other problems.</SheetDescription>
                              </SheetHeader>
                             <div className="p-4 border-b space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg flex items-center">
                                      Problem List <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </h3>
                                    <Badge variant="outline">{solvedInCategory}/{categoryProblems.length} Solved</Badge>
                                  </div>
                                  <div className="relative flex-grow">
                                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                     <Input
                                         placeholder="Search questions"
                                         value={searchTerm}
                                         onChange={(e) => setSearchTerm(e.target.value)}
                                         className="pl-9"
                                     />
                                  </div>
                                  <RadioGroup value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value as any)} className="flex items-center gap-2">
                                     <Label className="text-sm">Difficulty:</Label>
                                    {['All', 'Easy', 'Medium', 'Hard'].map(option => (
                                        <div key={option} className="flex items-center space-x-2">
                                            <RadioGroupItem value={option} id={`diff-${option}`} />
                                            <Label htmlFor={`diff-${option}`} className="text-sm font-normal">{option}</Label>
                                        </div>
                                    ))}
                                  </RadioGroup>
                              </div>
                              <ScrollArea className="h-[calc(100vh-80px)]">
                                <div className="p-2">
                                   {categoryProblems.map(p => (
                                       <Link key={p.id} href={`/problems/${p.category}/${p.id || p.title}`}>
                                          <div className={cn(
                                                "flex items-start justify-between p-3 rounded-md hover:bg-muted text-sm",
                                                isProblemActive(p) && "bg-muted"
                                            )}>
                                                <div className="flex items-start gap-3 overflow-hidden">
                                                    {p.isSolved ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> : <div className="w-4 h-4 flex-shrink-0" />}
                                                    <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis group-hover:whitespace-normal">
                                                        {p.number}. {p.title.length > 35 ? `${p.title.substring(0, 35)}...` : p.title}
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className={cn("text-xs w-20 justify-center flex-shrink-0", getDifficultyClass(p.difficulty))}>
                                                    {p.difficulty}
                                                </Badge>
                                            </div>
                                       </Link>
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
                <Badge variant="secondary">Problems Test</Badge>
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
                            output={output}
                            setOutput={setOutput}
                        />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


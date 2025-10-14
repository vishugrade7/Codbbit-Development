

'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import type { Question, UserProfile } from '@/lib/types';
import { Loader2, ArrowLeft, PanelLeftClose, Menu, Search, Filter, CheckCircle, Circle, Github, XCircle, Sparkles } from 'lucide-react';
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
import { useDebounce } from '@/hooks/use-debounce';

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
  
  const [output, setOutput] = useState<{ success: boolean; logs: string; error?: string; } | null>(null);
  const debouncedCode = useDebounce(code, 10000);


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
                           <SheetContent side="left" className="p-0">
                             <SheetHeader className="sr-only">
                                <SheetTitle>Problem List</SheetTitle>
                                <SheetDescription>Navigate to other problems.</SheetDescription>
                              </SheetHeader>
                             <div className="p-4 border-b">
                                  <div className="flex items-center justify-between">
                                      <h3 className="font-semibold">Problems</h3>
                                      <Popover>
                                          <PopoverTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                                  <Filter className="h-4 w-4" />
                                              </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-60">
                                              <DifficultyFilterRadioGroup title="Difficulty" options={['All', 'Easy', 'Medium', 'Hard']} value={difficultyFilter} onValueChange={setDifficultyFilter} />
                                          </PopoverContent>
                                      </Popover>
                                  </div>
                                  <Input
                                      placeholder="Search..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className="mt-2"
                                  />
                              </div>
                              <ScrollArea className="h-[calc(100vh-80px)]">
                                <div className="p-2">
                                  {groupedProblems.map(group => (
                                    <div key={group.category} className="mb-2">
                                      <h4 className="font-semibold text-sm px-2 py-1">{group.category}</h4>
                                      <div className="flex flex-col gap-1">
                                        {group.questions.map(p => (
                                           <Link key={p.id} href={`/problems/${p.category}/${p.id}`}>
                                              <Button
                                                variant={isProblemActive(p) ? "secondary" : "ghost"}
                                                className="w-full justify-start h-auto py-2"
                                              >
                                                <div className="flex items-center gap-2">
                                                  {p.isSolved ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground/50" />}
                                                  <span className="truncate">{p.title}</span>
                                                </div>
                                              </Button>
                                          </Link>
                                        ))}
                                      </div>
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

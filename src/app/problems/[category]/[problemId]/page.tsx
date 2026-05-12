'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import type { Question, UserProfile } from '@/lib/types';
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, List, Search, Filter } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { HeaderBar } from '@/components/HeaderBar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTheme } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { syncSolutionToGithub } from '@/lib/actions';

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
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  
  const [output, setOutput] = useState<{ success: boolean; logs: string; error?: string; runtime?: number; } | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!firestore || !categoryUrlParam || !problemId) return;

    const fetchProblem = async () => {
      setIsLoading(true);
      try {
        const categoryDocRef = doc(firestore, 'problems', categoryUrlParam);
        const categorySnap = await getDoc(categoryDocRef);

        if (categorySnap.exists()) {
          const categoryData = categorySnap.data();
          const foundProblem = (categoryData.Questions || []).find((q: any) => (q.id || q.title) === problemId);

          if (foundProblem) {
            setProblem(foundProblem);
            const savedCode = localStorage.getItem(`codbbit-code-${foundProblem.id || foundProblem.title}`);
            setCode(savedCode || foundProblem.starterCode || '');
          } else {
            setProblem(null);
          }
        }
      } catch (error) {
        setProblem(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [firestore, categoryUrlParam, problemId]);

  useEffect(() => {
    if (problem && code) {
      localStorage.setItem(`codbbit-code-${problem.id || problem.title}`, code);
    }
  }, [code, problem]);

  const handleTestPass = () => {
    setShowConfetti(true);
    if (problem) localStorage.removeItem(`codbbit-code-${problem.id || problem.title}`);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleResetCode = () => {
    if (problem?.starterCode) {
      setCode(problem.starterCode);
      toast({ title: "Code Reset", description: "Starter template restored." });
    }
  };

  const handleSyncGithub = async () => {
    if (!user || !userProfile?.githubAuth?.connected) {
      toast({ title: 'GitHub not connected', description: 'Connect your GitHub account in settings.', variant: 'destructive' });
      return;
    }
    if (!problem) return;

    setIsSyncing(true);
    setIsSyncDialogOpen(true);
    setSyncStatus(['Verifying repository...']);
    setSyncError(null);

    try {
      const res = await syncSolutionToGithub(user.uid, {
        title: problem.title,
        category: problem.category,
        code: code
      });
      if (res.success) {
        setSyncStatus(prev => [...prev, 'Repository ready.', 'Pushing solution...', 'Success!']);
        toast({ title: 'Synced!', description: 'Pushed to Codbbit-Solutions repo.' });
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      setSyncError(e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading || !problem) {
    return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  }

  return (
    <SidebarProvider>
      {showConfetti && <Confetti />}
      <Sidebar><AppSidebar /></Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
          <HeaderBar
            onReset={handleResetCode}
            onSyncGithub={handleSyncGithub}
            isSyncing={isSyncing}
            fontSize={fontSize}
            setFontSize={setFontSize}
            editorTheme={editorTheme}
            setEditorTheme={setEditorTheme}
            leftControls={
              <div className="flex items-center gap-2 text-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
                <Link href={`/problems/${problem.category}`} className="text-muted-foreground hover:text-foreground">{problem.category}</Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{problem.title}</span>
              </div>
            }
          >
            <Button variant="ghost" size="icon" onClick={() => setIsQuestionPanelVisible(!isQuestionPanelVisible)}>
              <List className="h-4 w-4" />
            </Button>
          </HeaderBar>
          
          <main className="flex-grow">
            <ResizablePanelGroup direction="horizontal">
              {isQuestionPanelVisible && (
                <>
                  <ResizablePanel defaultSize={40} minSize={25}>
                    <QuestionPanel question={problem} />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                </>
              )}
              <ResizablePanel defaultSize={isQuestionPanelVisible ? 60 : 100}>
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

          <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sync to GitHub</DialogTitle>
                <DialogDescription>Pushing solution to Codbbit-Solutions repository.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                {syncStatus.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500" />{s}</div>
                ))}
                {isSyncing && <div className="flex items-center gap-2 text-sm"><Spinner size="sm" /><span>Processing...</span></div>}
                {syncError && <div className="flex items-center gap-2 text-sm text-red-500"><XCircle className="h-4 w-4" />{syncError}</div>}
              </div>
              <DialogFooter><Button onClick={() => setIsSyncDialogOpen(false)} disabled={isSyncing}>Close</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
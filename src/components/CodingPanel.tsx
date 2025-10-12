
"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import type { Question, UserProfile, SfdcAuth, PriceConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { executeSalesforceCode, deleteSalesforceMetadata } from "@/lib/actions";
import { useDoc, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from 'firebase/firestore';
import { CodeEditor } from "./CodeEditor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  type PanelGroup,
} from "@/components/ui/resizable";
import { Play, Loader2, Bot, User as UserIcon, ChevronDown, ChevronUp, CheckCircle, Circle, Trash2, ShieldQuestion, Award, XCircle, FileText } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
} from "@/components/ui/alert-dialog"
import { Input } from "./ui/input";
import { askQuestion } from "@/ai/flows/ask-question";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { Badge } from "./ui/badge";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";


interface CodingPanelProps {
  question: Question;
  code: string;
  setCode: (code: string) => void;
  onTestPass: () => void;
  fontSize: number;
  editorTheme: string;
  onPrettify: () => Promise<void>;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

const TestResultDisplay = ({ output }: { output: { success: boolean; logs: string; error?: string; }}) => {
    if (output.success) {
        return (
            <Alert variant="success" className="h-full">
                 <CheckCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold">All Tests Passed!</AlertTitle>
                <AlertDescription>
                    Congratulations! Your solution passed all the test cases.
                </AlertDescription>
            </Alert>
        )
    }

    const errorParts = output.error?.split('\n') || [];
    const testFailureLine = errorParts.find(line => line.includes('Test Failed:')) || 'Unknown Test Failure';
    const errorMessage = errorParts.find(line => line.includes('System.AssertException:'))?.replace('System.AssertException: ', '') || 'No assertion message.';
    
    // Updated to handle both "Class.TriggerName: line X" and "Class.ClassName.MethodName: line X"
    const lineInfoMatch = output.error?.match(/Class\.([^:]+): line (\d+)/);
    
    const className = lineInfoMatch ? lineInfoMatch[1].split('.')[0] : null;
    const lineNumber = lineInfoMatch ? lineInfoMatch[2] : null;

    let finalErrorMessage = errorMessage;
    // For compile errors
    if (output.error?.includes('(Line:')) {
        finalErrorMessage = output.error;
    }
    
    return (
        <Alert variant="destructive" className="h-full">
            <XCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">{testFailureLine}</AlertTitle>
            <AlertDescription className="flex items-center gap-2 flex-wrap">
                {finalErrorMessage} 
                {lineNumber && <Badge variant="secondary" className="font-mono">Line: {lineNumber}</Badge>}
                {className && <Badge variant="secondary" className="font-mono">Class: {className}</Badge>}
            </AlertDescription>
        </Alert>
    )
}


export function CodingPanel({ question, code, setCode, onTestPass, fontSize, editorTheme, onPrettify }: CodingPanelProps) {
  const [isPending, startTransition] = useTransition();
  
  const firestore = useFirestore();
  const { user } = useUser();
  const panelGroupRef = useRef<PanelGroup>(null);
  const [resultsPanelSize, setResultsPanelSize] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const [output, setOutput] = useState<{ success: boolean; logs: string; error?: string; } | null>(null);

  const userDocRef = useMemoFirebase(() => {
      if (!firestore || !user?.uid) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const priceDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'pricing');
  }, [firestore]);
  
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  const { data: priceConfig } = useDoc<PriceConfig>(priceDocRef);

  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);


  useEffect(() => {
    // Reset output when question changes
    setOutput(null);
  }, [question.id]);

  const handleSubmitCode = () => {
    startTransition(async () => {
        const isMinimized = resultsPanelSize < 10;
        if (isMinimized && panelGroupRef.current) {
            panelGroupRef.current.setLayout([65, 35]);
        }
        
        setOutput(null);
        
        try {
            if (!user || !userProfile?.sfdcAuth?.connected) {
                throw new Error("Salesforce connection details not configured. Please set them in Settings.");
            }
            if (!question.testcases) {
                throw new Error("There are no test cases defined for this problem.");
            }
            
            const result = await executeSalesforceCode(userProfile.sfdcAuth, code, "test class", question.testcases, user.uid, question);
            
            // The main result processing is now inside the if/else blocks.
            // But we still set the raw output for the panel to use.
            setOutput(result);
            
            if (result.success) {
                onTestPass();
                // --- User Progress Update Logic ---
                if (userDocRef && userProfile) {
                    const problemId = question.id;
                    const solvedQuestions = userProfile.solvedQuestions || [];

                    if (!solvedQuestions.includes(problemId)) {
                        const pointsMap = { 'Easy': 10, 'Medium': 20, 'Hard': 50 };
                        const pointsGained = pointsMap[question.difficulty] || 0;
                        
                        const today = new Date();
                        const todayStr = today.toISOString().split('T')[0];
                        const yesterday = new Date();
                        yesterday.setDate(today.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split('T')[0];
                        
                        const lastSolvedDate = userProfile.lastSolvedDate;
                        let newCurrentStreak = userProfile.currentStreak || 0;

                        if (lastSolvedDate === yesterdayStr) {
                            newCurrentStreak++;
                        } else if (lastSolvedDate !== todayStr) {
                            newCurrentStreak = 1;
                        }
                        
                        const newSubmissionHeatmap = {
                            ...userProfile.submissionHeatmap,
                            [todayStr]: (userProfile.submissionHeatmap[todayStr] || 0) + 1,
                        };
                        
                        const newDsaStats = { ...userProfile.dsaStats };
                        newDsaStats[question.difficulty] = (newDsaStats[question.difficulty] || 0) + 1;
                        
                        const updatedProfile = {
                            points: (userProfile.points || 0) + pointsGained,
                            dsaStats: newDsaStats,
                            lastSolvedDate: todayStr,
                            currentStreak: newCurrentStreak,
                            maxStreak: Math.max(userProfile.maxStreak || 0, newCurrentStreak),
                            submissionHeatmap: newSubmissionHeatmap,
                            solvedQuestions: [...solvedQuestions, problemId],
                            solvedProblems: {
                                ...userProfile.solvedProblems,
                                [problemId]: {
                                    difficulty: question.difficulty,
                                    points: pointsGained,
                                    solvedAt: new Date().toISOString(),
                                    title: question.title,
                                }
                            }
                        };

                        setDocumentNonBlocking(userDocRef, updatedProfile, { merge: true });
                    }
                }
            } else {
                 // No need to throw an error here, just let the UI display the failure.
            }
             if (result.githubSyncMessage) {
                toast({
                    title: "GitHub Sync",
                    description: result.githubSyncMessage,
                });
            }


        } catch (e: any) {
            const errorMessage = e.message || "An unknown error occurred.";
            setOutput({ success: false, logs: "", error: errorMessage });
        }
    });
  };

  const getSObjectName = (code: string): { name: string | undefined, type: 'Class' | 'Trigger' | undefined } => {
    // Look for 'class MyClassName'
    const classMatch = code.match(/(?:public|global)\s+(?:virtual\s+|abstract\s+|with\s+sharing\s+|without\s+sharing\s+)*class\s+([a-zA-Z0-9_]+)/);
    if (classMatch && classMatch[1]) {
        return { name: classMatch[1], type: 'Class' };
    }
    // Look for 'trigger MyTriggerName on ObjectName'
    const triggerMatch = code.match(/trigger\s+([a-zA-Z0-9_]+)\s+on\s+([a-zA-Z0-9_]+)/);
    if (triggerMatch && triggerMatch[1]) {
        return { name: triggerMatch[1], type: 'Trigger' };
    }
    return { name: undefined, type: undefined };
  }

  const handleDeleteMetadata = () => {
    startTransition(async () => {
      setIsDeleting(true);
       if (!user || !userProfile?.sfdcAuth?.connected) {
        // toast({ title: "Not Connected", description: "Please connect to Salesforce first.", variant: "destructive"});
        setIsDeleting(false);
        return;
      }

      if (!question.testcases) {
        // toast({ title: "No Metadata", description: "No test cases are defined, so no metadata to delete.", variant: "destructive"});
        setIsDeleting(false);
        return;
      }
      
      try {
        const result = await deleteSalesforceMetadata(userProfile.sfdcAuth, code, question.testcases);
        if (result.success) {
        //   toast({ title: "Success", description: "Apex metadata has been deleted from your org."});
        } else {
          throw new Error(result.error);
        }
      } catch (e: any) {
        // toast({ title: "Deletion Failed", description: e.message, variant: "destructive"});
      } finally {
        setIsDeleting(false);
      }
    });
  }

  const handleAskAi = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!aiQuestion.trim()) return;

    const userMessage: ChatMessage = { sender: 'user', text: aiQuestion };
    setChatHistory(prev => [...prev, userMessage]);
    setAiQuestion('');
    setIsAiThinking(true);

    try {
        const result = await askQuestion({
            question: aiQuestion,
            problemContext: {
                title: question.title,
                description: question.description,
                starterCode: question.starterCode,
                userCode: code,
            }
        });
        const aiMessage: ChatMessage = { sender: 'ai', text: result.answer };
        setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
        console.error("AI question failed:", error);
        const errorMessage: ChatMessage = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
        setChatHistory(prev => [...prev, errorMessage]);
        // toast({
        //     title: "AI Assistant Error",
        //     description: "Could not get a response from the AI assistant.",
        //     variant: "destructive",
        // });
    } finally {
        setIsAiThinking(false);
    }
  };
  
  const toggleResultsPanel = () => {
    const isMinimized = resultsPanelSize < 10;
    const newSize = isMinimized ? 35 : 5;
    
    // Imperatively resize the panels
    const layout = panelGroupRef.current?.getLayout();
    if (layout) {
      panelGroupRef.current?.setLayout([100 - newSize, newSize]);
    }
  }
  
  const aiPlaceholders = [
    "How do I access related records?",
    "Explain SOQL to me like I'm five.",
    "What is the difference between a class and a trigger?",
    "How can I write a test class for this?",
    "Why am I getting a NullPointerException?",
  ];

  const isExecuting = isPending;
  const isMinimized = resultsPanelSize < 10;

  return (
    <div className="h-full w-full flex flex-col">
        <ResizablePanelGroup 
            direction="vertical" 
            className="flex-grow"
            ref={panelGroupRef}
            onLayout={(sizes: number[]) => {
                setResultsPanelSize(sizes[1]);
            }}
        >
            <ResizablePanel defaultSize={95} minSize={20}>
                <div className="h-full w-full">
                    <CodeEditor
                        value={code}
                        onChange={(v) => setCode(v || '')}
                        language="apex"
                        theme={editorTheme}
                        options={{ fontSize }}
                    />
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel 
                defaultSize={5} 
                minSize={5}
                collapsible={true}
                collapsedSize={5}
                onCollapse={() => setResultsPanelSize(0)}
                onExpand={() => setResultsPanelSize(35)}
            >
                <div className="h-full flex flex-col">
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-1 border-b">
                        <div className="flex items-center gap-2">
                           <FileText className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm">Test Results</h3>
                        </div>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleResultsPanel}>
                            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                         </Button>
                    </div>
                    {!isMinimized && (
                      <ScrollArea className="flex-grow bg-muted/30">
                          <div className="p-4 h-full">
                           {isExecuting ? (
                              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                  <Loader2 className="animate-spin h-8 w-8" />
                                  <span>Executing code...</span>
                              </div>
                            ) : output ? (
                                <TestResultDisplay output={output} />
                            ) : (
                              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                      <Play className="h-6 w-6 text-foreground ml-1" />
                                  </div>
                                  <h3 className="text-lg font-medium text-foreground">Ready to Run</h3>
                                  <p className="text-sm text-center max-w-xs">Submit your solution to run tests against the problem's criteria.</p>
                              </div>
                            )}
                          </div>
                      </ScrollArea>
                    )}
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
        <div className="flex-shrink-0 flex items-center justify-end p-2 border-t gap-2">
            {userProfile?.isPremium && priceConfig?.isPaymentsEnabled !== false ? (
                 <Sheet open={isAiSheetOpen} onOpenChange={setIsAiSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-md mr-auto">
                            <Bot className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                            Codbee AI
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-lg w-full flex flex-col p-0 rounded-l-lg">
                        <SheetHeader className="p-6 border-b">
                            <SheetTitle>Codbee AI</SheetTitle>
                            <SheetDescription>
                                Ask a question about the problem. The AI will guide you without giving the solution.
                            </SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="flex-grow">
                            <div className="space-y-4 p-6">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                        {msg.sender === 'ai' && (
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={`rounded-lg p-3 max-w-md ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                        {msg.sender === 'user' && (
                                            <Avatar className="h-8 w-8 border">
                                            <AvatarFallback><UserIcon className="h-5 w-5"/></AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                {isAiThinking && (
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                                        </Avatar>
                                        <div className="rounded-lg p-3 max-w-lg bg-muted rounded-bl-none flex items-center">
                                            <Loader2 className="h-5 w-5 animate-spin"/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-6 border-t">
                            <PlaceholdersAndVanishInput
                                placeholders={aiPlaceholders}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                onSubmit={handleAskAi}
                                value={aiQuestion}
                                disabled={isAiThinking}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            ) : priceConfig?.isPaymentsEnabled !== false ? (
                <Button variant="outline" size="sm" className="rounded-md mr-auto" disabled>
                    <Bot className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                    Upgrade to Pro for AI
                </Button>
            ): null}

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="rounded-md hidden" disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Metadata
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete the Apex class/trigger and the test class for this problem from your connected Salesforce org. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteMetadata} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleSubmitCode} size="sm" disabled={isExecuting} className="bg-green-500 hover:bg-green-600 text-white rounded-md">
                {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="-ms-1 opacity-60" size={16} aria-hidden="true" />}
                Submit
            </Button>
        </div>
    </div>
  );
}

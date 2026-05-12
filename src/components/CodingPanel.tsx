"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import type { Question, UserProfile, SfdcAuth, PriceConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { executeSalesforceCode, initiateSalesforceOAuth } from "@/lib/actions";
import { useDoc, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from 'firebase/firestore';
import { CodeEditor } from "./CodeEditor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  type PanelGroup,
} from "@/components/ui/resizable";
import { Play, Loader2, Bot, ChevronDown, ChevronUp, FileText, AlertTriangle, Lock } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { askQuestion } from "@/ai/flows/ask-question";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { Badge } from "./ui/badge";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

interface CodingPanelProps {
  question: Question;
  code: string;
  setCode: (code: string) => void;
  onTestPass: () => void;
  fontSize: number;
  editorTheme: string;
  output: { success: boolean; logs: string; error?: string; runtime?: number; } | null;
  setOutput: (output: { success: boolean; logs: string; error?: string; runtime?: number; } | null) => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

const TestResultDisplay = ({ output, onAuth }: { output: { success: boolean; logs: string; error?: string; runtime?: number; }, onAuth: () => void }) => {
    if (output.error?.includes('Bad_OAuth_Token') || output.error === 'Session expired or invalid' || output.error?.includes('Failed to refresh Salesforce token') || output.error?.includes('Session expired') || output.error?.includes('insufficient access rights')) {
        return (
            <Alert variant="destructive" className="h-full flex flex-col items-center justify-center text-center">
                 <AlertTriangle className="h-8 w-8 mb-4" />
                <AlertTitle className="text-lg font-bold">Connection or Permission Issue</AlertTitle>
                <AlertDescription className="mb-6">
                    {output.error?.includes('insufficient access rights') 
                      ? "The Tooling API encountered a permission error. This often happens if the record is locked or if the connection needs to be refreshed."
                      : "Your Salesforce session has expired or is invalid."}
                </AlertDescription>
                <Button onClick={onAuth}>Reconnect with Salesforce</Button>
            </Alert>
        )
    }

    if (output.success) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-green-500">Accepted</h2>
                {output.runtime !== undefined && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Runtime: {output.runtime} ms
                  </p>
                )}
                <p className="mt-4 text-muted-foreground">Congratulations! Your solution passed all test cases.</p>
            </div>
        )
    }

    let errorMessage = output.error || 'An unknown error occurred.';
    
    return (
        <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-red-500">Test Failed</h2>
            <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-3 rounded-md mt-4 font-code text-sm text-left w-full max-w-md">
                <pre className="whitespace-pre-wrap">{errorMessage}</pre>
            </div>
        </div>
    )
}


export function CodingPanel({ question, code, setCode, onTestPass, fontSize, editorTheme, output, setOutput }: CodingPanelProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const firestore = useFirestore();
  const { user } = useUser();
  const panelGroupRef = useRef<PanelGroup>(null);
  const [resultsPanelSize, setResultsPanelSize] = useState(5);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

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
    setOutput(null);
  }, [question.id, setOutput]);

  const toggleResultsPanel = (expand?: boolean) => {
    const isMinimized = resultsPanelSize < 10;
    let shouldExpand = typeof expand === 'boolean' ? expand : isMinimized;

    if (shouldExpand) {
        panelGroupRef.current?.setLayout([65, 35]);
    } else {
        panelGroupRef.current?.setLayout([95, 5]);
    }
  }

  useEffect(() => {
      if (output && !output.success) {
          if (output.error?.includes('Session expired') || output.error?.includes('Bad_OAuth_Token') || output.error?.includes('insufficient access rights')) {
            setSessionExpired(true);
          } else {
            if (resultsPanelSize < 10) toggleResultsPanel(true);
          }
      }
      if (output && output.success) setSessionExpired(false);
  }, [output, resultsPanelSize]);

  const handleAuthWithSalesforce = async () => {
    if (!user) return;
    const challenge = btoa(String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(32))));
    const result = await initiateSalesforceOAuth(user.uid, challenge);
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

  const handleSubmitCode = () => {
    startTransition(async () => {
        if (!user || !userProfile?.sfdcAuth?.connected) {
            setShowAuthDialog(true);
            return;
        }

        toggleResultsPanel(true);
        setOutput(null);
        
        try {
            if (!question.testcases) throw new Error("No test cases defined.");
            
            const result = await executeSalesforceCode(userProfile.sfdcAuth, code, "test class", question.testcases, user.uid, question);
            
            if (result.error?.includes('Session expired') || result.error?.includes('Bad_OAuth_Token') || result.error?.includes('insufficient access rights')) {
                setSessionExpired(true);
                setOutput({ success: false, logs: "", error: result.error || "A connection or permission issue occurred. Please reconnect." });
                return;
            }

            setOutput(result);
            
            if (result.success) {
                onTestPass();
                if (userDocRef && userProfile) {
                    const problemId = question.id;
                    const solvedProblems = userProfile.solvedProblems || {};

                    if (!solvedProblems[problemId]) {
                        const pointsMap = { 'Easy': 10, 'Medium': 20, 'Hard': 50 };
                        const pointsGained = pointsMap[question.difficulty] || 0;
                        const todayStr = new Date().toISOString().split('T')[0];
                        
                        const newDsaStats = { ...userProfile.dsaStats };
                        newDsaStats[question.difficulty] = (newDsaStats[question.difficulty] || 0) + 1;
                        
                        setDocumentNonBlocking(userDocRef, {
                            points: (userProfile.points || 0) + pointsGained,
                            dsaStats: newDsaStats,
                            lastSolvedDate: todayStr,
                            solvedProblems: {
                                ...userProfile.solvedProblems,
                                [problemId]: {
                                    difficulty: question.difficulty,
                                    points: pointsGained,
                                    solvedAt: new Date().toISOString(),
                                    title: question.title,
                                    category: question.category,
                                }
                            }
                        }, { merge: true });
                    }
                }
            }
        } catch (e: any) {
            setOutput({ success: false, logs: "", error: e.message || "An unknown error occurred." });
        }
    });
  };

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
        setChatHistory(prev => [...prev, { sender: 'ai', text: result.answer }]);
    } catch (error) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
        setIsAiThinking(false);
    }
  };
  
  const aiPlaceholders = [
    "How do I access related records?",
    "Explain SOQL to me like I'm five.",
    "What is the difference between a class and a trigger?",
  ];

  return (
    <div className="h-full w-full flex flex-col min-h-0 bg-background overflow-hidden relative">
       <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" />
                  Salesforce Connection Required
                </DialogTitle>
                <DialogDescription>
                  You must connect your Salesforce account to submit solutions and run tests.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAuthDialog(false)}>Cancel</Button>
                <Button onClick={handleAuthWithSalesforce}>Connect</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        <ResizablePanelGroup 
            direction="vertical" 
            className="flex-grow min-h-0"
            ref={panelGroupRef}
            onLayout={(sizes) => setResultsPanelSize(sizes[1])}
        >
            <ResizablePanel defaultSize={95} minSize={20}>
                <div className="h-full w-full relative">
                    {sessionExpired && (
                      <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                        <Lock className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-xl font-semibold">Connection Issue</h3>
                        <p className="text-muted-foreground text-center max-w-xs">Your Salesforce session has expired or permissions need refreshing.</p>
                        <Button onClick={handleAuthWithSalesforce}>Reconnect with Salesforce</Button>
                      </div>
                    )}
                    <CodeEditor
                        value={code}
                        onChange={(v) => setCode(v || '')}
                        language="apex"
                        theme={editorTheme}
                        options={{ fontSize, readOnly: sessionExpired }}
                    />
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel 
                defaultSize={5} 
                minSize={5}
                collapsible={true}
                collapsedSize={5}
            >
                <div className="h-full flex flex-col">
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-1 border-b">
                        <div className="flex items-center gap-2">
                           <FileText className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm">Test Results</h3>
                        </div>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleResultsPanel()}>
                            {resultsPanelSize < 10 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                         </Button>
                    </div>
                    {resultsPanelSize >= 10 && (
                      <ScrollArea className="flex-grow bg-muted/30">
                          <div className="p-4 h-full">
                           {isPending ? (
                              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                  <Loader2 className="animate-spin h-8 w-8" />
                                  <span>Executing code...</span>
                              </div>
                            ) : output ? (
                                <TestResultDisplay output={output} onAuth={handleAuthWithSalesforce} />
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
        <div className="flex-shrink-0 flex items-center justify-end p-2 border-t gap-2 bg-background z-20 w-full shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
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
                            <SheetDescription>Ask for hints without spoiling the solution.</SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="flex-grow">
                            <div className="space-y-4 p-6">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                        {msg.sender === 'ai' && (
                                            <Avatar className="h-8 w-8 border"><AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback></Avatar>
                                        )}
                                        <div className={`rounded-lg p-3 max-w-md ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isAiThinking && (
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 border"><AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback></Avatar>
                                        <div className="rounded-lg p-3 max-w-lg bg-muted rounded-bl-none flex items-center"><Loader2 className="h-5 w-5 animate-spin"/></div>
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
                    Upgrade for AI
                </Button>
            ): null}
            <Button onClick={handleSubmitCode} size="sm" disabled={isPending} className="bg-green-500 hover:bg-green-600 text-white rounded-md font-bold px-4">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="-ms-1 opacity-60" size={16} aria-hidden="true" />}
                Submit
            </Button>
        </div>
    </div>
  );
}


'use client';

import { useState, useTransition } from "react";
import { CodeEditor } from "./CodeEditor";
import { Button } from "./ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Play, Loader2, Code, FileText } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { UserProfile } from "@/lib/types";
import { executeSalesforceCode } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export function AnonymousCodeRunner() {
    const [code, setCode] = useState("System.debug('Hello from Anonymous Apex!');");
    const [output, setOutput] = useState<{ success: boolean; logs: string; error?: string; } | null>(null);
    const [status, setStatus] = useState<string>('Ready');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const [activeView, setActiveView] = useState<'code' | 'result'>('code');

    const userDocRef = useMemoFirebase(() => {
      if (!firestore || !user?.uid) return null;
      return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);
    
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    const handleRun = () => {
        startTransition(async () => {
            setOutput(null);

            if (!user || !userProfile?.sfdcAuth?.connected) {
                toast({
                    title: "Configuration Error",
                    description: "Salesforce connection details not configured. Please set them in Settings.",
                    variant: "destructive",
                });
                setOutput({success: false, logs: "", error: "Salesforce connection details not configured. Please set them in Settings."});
                return;
            }
            
            setStatus('Connecting to Salesforce...');
            setActiveView('result');
            const authCreds = userProfile.sfdcAuth;
            
            setStatus('Executing...');
            const result = await executeSalesforceCode(authCreds, code, "anonymous");
            setStatus('Ready');
            
            if (!result.success) {
                toast({
                    title: "Execution Error",
                    description: result.error,
                    variant: "destructive",
                });
            }
            setOutput(result);
        });
    }

    const isExecuting = isPending || status !== 'Ready';


    return (
        <>
            <DialogHeader className="p-4 border-b flex-row justify-between items-center">
                <div>
                    <DialogTitle>Anonymous Apex Runner</DialogTitle>
                    <DialogDescription>
                        Quickly execute a block of Apex code without saving it to your org.
                    </DialogDescription>
                </div>
                 <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'code' | 'result')} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="code"><Code className="mr-2 h-4 w-4" />Code</TabsTrigger>
                    <TabsTrigger value="result"><FileText className="mr-2 h-4 w-4" />Result</TabsTrigger>
                  </TabsList>
                </Tabs>
            </DialogHeader>
            <div className="flex-grow flex flex-col overflow-hidden">
                <div className={cn("flex-grow", activeView === 'code' ? 'block' : 'hidden')}>
                    <CodeEditor value={code} onChange={(v) => setCode(v || '')} language="apex" />
                </div>
                 <div className={cn("flex-grow bg-muted/30", activeView === 'result' ? 'block' : 'hidden')}>
                     <ScrollArea className="h-full">
                        <div className="p-4 h-full font-code text-sm">
                            {isExecuting ? (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <Loader2 className="animate-spin h-8 w-8" />
                                    <span>{status}...</span>
                                </div>
                            ) : output ? (
                                <pre className={`whitespace-pre-wrap ${output.success ? 'text-foreground' : 'text-red-400'}`}>
                                    {output.success ? `✅ Success!\n\n--- Logs ---\n${output.logs}` : `❌ Error!\n\n${output.error}\n\n--- Logs ---\n${output.logs}`}
                                </pre>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                    <div className="text-lg">Run Results</div>
                                    <p className="text-sm">Output and logs will appear here.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <div className="flex-shrink-0 p-2 border-t flex justify-end">
                    <Button onClick={handleRun} disabled={isExecuting}>
                        {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                        Run
                    </Button>
                </div>
            </div>
        </>
    )
}

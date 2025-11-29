
'use client';

import { useState, useTransition, useEffect } from "react";
import { CodeEditor } from "./CodeEditor";
import { Button } from "./ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Play, CheckCircle, XCircle } from "lucide-react";
import { Loader } from "./ui/loader";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { UserProfile } from "@/lib/types";
import { executeSalesforceCode } from "@/lib/actions";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Badge } from "./ui/badge";

const LOCAL_STORAGE_KEY = 'anonymous-apex-code';
const DEFAULT_CODE = "System.debug('Hello from Anonymous Apex!');";

export function AnonymousCodeRunner() {
    const [code, setCode] = useState("");
    const [output, setOutput] = useState<{ success: boolean; logs: string; error?: string; } | null>(null);
    const [status, setStatus] = useState<string>('Ready');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        const savedCode = localStorage.getItem(LOCAL_STORAGE_KEY);
        setCode(savedCode || DEFAULT_CODE);
    }, []);

    useEffect(() => {
        if (code) {
            localStorage.setItem(LOCAL_STORAGE_KEY, code);
        }
    }, [code]);

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
            <DialogHeader className="p-4 border-b">
                <DialogTitle>Anonymous Apex Runner</DialogTitle>
                <DialogDescription>
                    Quickly execute a block of Apex code without saving it to your org.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-grow flex flex-col overflow-hidden">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={60}>
                         <CodeEditor value={code} onChange={(v) => setCode(v || '')} language="apex" />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40}>
                        <div className="h-full bg-muted/30 flex flex-col">
                            <div className="p-2 border-b">
                                <h3 className="font-semibold text-sm">Output</h3>
                            </div>
                            <ScrollArea className="flex-grow">
                                <div className="p-4 h-full font-code text-sm">
                                    {isExecuting ? (
                                        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <Loader />
                                            <span>{status}...</span>
                                        </div>
                                    ) : output ? (
                                        <div className="flex flex-col gap-2">
                                            {output.success ? (
                                                <Badge variant="secondary" className="bg-green-100 border-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300 w-fit">
                                                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                                    Success
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="w-fit">
                                                    <XCircle className="mr-1 h-3.5 w-3.5" />
                                                    Error
                                                </Badge>
                                            )}
                                            
                                            {!output.success && output.error && (
                                                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-2 rounded-md mt-1">
                                                    <pre className="whitespace-pre-wrap font-code text-xs">
                                                        {output.error}
                                                    </pre>
                                                </div>
                                            )}
                                            
                                            <h3 className="font-semibold text-xs text-muted-foreground mt-2">Logs</h3>
                                            <pre className="whitespace-pre-wrap text-muted-foreground text-xs p-2 bg-background/50 rounded-md">
                                                {output.logs || "No logs available."}
                                            </pre>
                                        </div>
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                            <div className="text-lg">Run Results</div>
                                            <p className="text-sm">Output and logs will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
             <div className="flex-shrink-0 p-2 border-t flex justify-end">
                <Button onClick={handleRun} disabled={isExecuting}>
                    {isExecuting ? <Loader /> : <Play className="mr-2 h-4 w-4" />}
                    Run
                </Button>
            </div>
        </>
    )
}

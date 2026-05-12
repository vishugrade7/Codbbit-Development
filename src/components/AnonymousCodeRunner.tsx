'use client';

import { useState, useTransition, useEffect } from "react";
import { CodeEditor } from "./CodeEditor";
import { Button } from "./ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Play, CheckCircle, XCircle, AlertTriangle, Terminal, Filter } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { UserProfile } from "@/lib/types";
import { executeSalesforceCode, initiateSalesforceOAuth } from "@/lib/actions";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Spinner } from "./ui/spinner";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

const LOCAL_STORAGE_KEY = 'anonymous-apex-code';
const DEFAULT_CODE = "System.debug('Hello from Anonymous Apex!');";

export function AnonymousCodeRunner() {
    const [code, setCode] = useState("");
    const [output, setOutput] = useState<{ success: boolean; logs: string; error?: string; } | null>(null);
    const [status, setStatus] = useState<string>('Ready');
    const [isPending, startTransition] = useTransition();
    const [filterLogs, setFilterLogs] = useState(true);
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
    
    const handleAuthWithSalesforce = async () => {
        if (!user) return;
        const verifier = btoa(String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(32))));
        sessionStorage.setItem('salesforce_code_verifier', verifier);
        
        const result = await initiateSalesforceOAuth(user.uid, verifier);
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
            const result = await executeSalesforceCode(authCreds, code, "anonymous", undefined, user.uid);
            setStatus('Ready');
            
            if (!result.success && result.error && !result.error.includes("Bad_OAuth_Token") && !result.error.includes("Session expired")) {
                toast({
                    title: "Execution Error",
                    description: result.error,
                    variant: "destructive",
                });
            }
            setOutput(result as any);
        });
    }
    
    const isExecuting = isPending || status !== 'Ready';
    
    const sessionExpired = !output?.success && (output?.error?.includes("Bad_OAuth_Token") || output?.error?.includes("Session expired"));

    const displayedLogs = output?.logs ? (
        filterLogs 
            ? output.logs.split('\n').filter(line => line.includes('|USER_DEBUG|')).join('\n')
            : output.logs
    ) : "";

    return (
        <>
            <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div>
                    <DialogTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" /> Anonymous Apex Runner</DialogTitle>
                    <DialogDescription>
                        Quickly execute a block of Apex code without saving it to your org.
                    </DialogDescription>
                </div>
                <div className="flex items-center gap-2 mr-8">
                    <Switch id="filter-logs" checked={filterLogs} onCheckedChange={setFilterLogs} />
                    <Label htmlFor="filter-logs" className="text-xs cursor-pointer flex items-center gap-1">
                        <Filter className="h-3 w-3" /> Filter Debug
                    </Label>
                </div>
            </DialogHeader>
            <div className="flex-grow flex flex-col overflow-hidden">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={60}>
                         <CodeEditor value={code} onChange={(v) => setCode(v || '')} language="apex" />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40}>
                        <div className="h-full bg-muted/30 flex flex-col">
                            <div className="p-2 border-b flex items-center justify-between">
                                <h3 className="font-semibold text-sm">Output</h3>
                                {output && (
                                    <Badge variant={output.success ? "secondary" : "destructive"} className="text-[10px] h-5">
                                        {output.success ? "Success" : "Error"}
                                    </Badge>
                                )}
                            </div>
                            <ScrollArea className="flex-grow">
                                <div className="p-4 h-full font-code text-sm">
                                    {isExecuting ? (
                                        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <Spinner />
                                            <span>{status}...</span>
                                        </div>
                                    ) : sessionExpired ? (
                                         <Alert variant="destructive" className="h-full flex flex-col items-center justify-center text-center">
                                             <AlertTriangle className="h-8 w-8 mb-4" />
                                            <AlertTitle className="text-lg font-bold">Session Expired</AlertTitle>
                                            <AlertDescription className="mb-6">
                                                Your Salesforce session has expired. Please authenticate again to continue.
                                            </AlertDescription>
                                            <Button onClick={handleAuthWithSalesforce}>Authenticate with Salesforce</Button>
                                        </Alert>
                                    ) : output ? (
                                        <div className="flex flex-col gap-2">
                                            {!output.success && output.error && (
                                                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md mb-2">
                                                    <p className="font-bold mb-1">Execution Error:</p>
                                                    <pre className="whitespace-pre-wrap font-code text-xs">
                                                        {output.error}
                                                    </pre>
                                                </div>
                                            )}
                                            
                                            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Debug Logs</h3>
                                            <div className="bg-background/80 border rounded-md p-3 min-h-[100px]">
                                                <pre className="whitespace-pre-wrap text-foreground font-code text-xs leading-relaxed">
                                                    {displayedLogs || (output.logs ? "No matching debug lines found with current filter." : "Executed successfully, but no debug logs were returned.")}
                                                </pre>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-center">
                                            <Play className="h-10 w-10 mb-2 opacity-20" />
                                            <div className="text-lg">Run Results</div>
                                            <p className="text-sm">Output and logs will appear here after you click "Run".</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
             <DialogFooter className="flex-shrink-0 p-2 border-t">
                <Button onClick={handleRun} disabled={isExecuting}>
                    {isExecuting ? <Spinner /> : <Play className="mr-2 h-4 w-4" />}
                    Run
                </Button>
            </DialogFooter>
        </>
    )
}

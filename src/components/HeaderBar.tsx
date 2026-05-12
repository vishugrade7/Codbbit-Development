'use client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, Code, RefreshCw, SlidersHorizontal, Github, Loader2 } from 'lucide-react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AnonymousCodeRunner } from './AnonymousCodeRunner';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { initiateSalesforceOAuth } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import React from 'react';


export function HeaderBar({ 
    leftControls, 
    onReset, 
    onSyncGithub,
    isSyncing,
    children, 
    fontSize, 
    setFontSize, 
    editorTheme, 
    setEditorTheme 
}: { 
    leftControls: React.ReactNode; 
    onReset?: () => void; 
    onSyncGithub?: () => void;
    isSyncing?: boolean;
    children: React.ReactNode; 
    fontSize: number, 
    setFontSize: (size: number) => void; 
    editorTheme: string; 
    setEditorTheme: (theme: string) => void; 
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  
  const editorThemes = ["vs-dark", "light", "hc-black", "vs", "hc-light", "monokai"];
  
  const handleAuthWithSalesforce = async () => {
    if (!user) return;
    const verifier = btoa(String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(32))));
    sessionStorage.setItem('salesforce_code_verifier', verifier);

    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    // Fixed initiateSalesforceOAuth call to include the challenge as the second argument
    const result = await initiateSalesforceOAuth(user.uid, challenge);
    if (result.success && result.url) window.location.href = result.url;
    else toast({ title: "Error", description: result.error || "OAuth failed.", variant: "destructive" });
  };

  return (
    <header className="flex-shrink-0 flex items-center justify-between gap-4 p-1 border-b bg-muted/20">
        <div className="flex items-center gap-1">
             {leftControls}
        </div>
        <div className="flex items-center gap-1">
             {children}
             
             {userProfile?.githubAuth?.connected && onSyncGithub && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-foreground"
                                onClick={onSyncGithub}
                                disabled={isSyncing}
                            >
                                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sync to GitHub</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             )}

             <Popover>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editor Settings</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <PopoverContent className="w-80 p-4">
                    <div className="grid gap-4">
                        <div className="space-y-1.5">
                            <h4 className="font-medium leading-none">Editor Settings</h4>
                            <p className="text-sm text-muted-foreground">Adjust your coding environment.</p>
                        </div>
                        <div className="grid gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="editor-theme">Theme</Label>
                                <Select value={editorTheme} onValueChange={setEditorTheme}>
                                  <SelectTrigger id="editor-theme"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {editorThemes.map(theme => (
                                       <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="font-size">Font Size</Label>
                                    <span className="text-sm font-medium text-muted-foreground">{fontSize}px</span>
                                </div>
                                <Slider id="font-size" min={12} max={20} step={1} value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
             <Dialog>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Code className="h-4 w-4" /></Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>Anonymous Apex</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DialogContent className="max-w-6xl w-[70%] h-[80vh] flex flex-col p-0"><AnonymousCodeRunner /></DialogContent>
            </Dialog>
            <Dialog>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4"/></Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>Settings</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Salesforce Connection</DialogTitle>
                        <DialogDescription>Status: {userProfile?.sfdcAuth?.connected ? 'Connected' : 'Disconnected'}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4"><Button onClick={handleAuthWithSalesforce} className="w-full">Connect with Salesforce</Button></div>
                </DialogContent>
            </Dialog>
            {onReset && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReset}><RefreshCw className="h-4 w-4"/></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Reset Code</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    </header>
  )
}


'use client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, Code, Info, RefreshCw, SlidersHorizontal, Award, Github, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AnonymousCodeRunner } from './AnonymousCodeRunner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { initiateSalesforceOAuth } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import CountUp from './ui/CountUp';
import React from 'react';


export function HeaderBar({ leftControls, onReset, children, onSyncToGitHub, fontSize, setFontSize, editorTheme, setEditorTheme }: { leftControls: React.ReactNode; onReset?: () => void; children: React.ReactNode, onSyncToGitHub?: () => void; fontSize: number, setFontSize: (size: number) => void; editorTheme: string; setEditorTheme: (theme: string) => void; }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  const prevPoints = React.useRef(userProfile?.points);

  React.useEffect(() => {
    prevPoints.current = userProfile?.points;
  }, [userProfile?.points]);
  
  const editorThemes = ["vs-dark", "light", "hc-black", "vs", "hc-light", "monokai"];
  
  const handleAuthWithSalesforce = async () => {
    // 1. Generate code verifier
    const verifier = btoa(String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(32))));
    sessionStorage.setItem('salesforce_code_verifier', verifier);

    // 2. Generate code challenge
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    // 3. Call server action with the challenge
    const result = await initiateSalesforceOAuth(challenge);
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

  return (
    <header className="flex-shrink-0 flex items-center justify-between gap-4 p-1 border-b">
        <div className="flex items-center gap-1">
             {leftControls}
        </div>
        <div className="flex items-center gap-1">
             {children}
             {userProfile?.githubSync?.connected && onSyncToGitHub && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSyncToGitHub}>
                        <Github className="h-4 w-4" />
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
                            <p className="text-sm text-muted-foreground">
                                Adjust your coding environment.
                            </p>
                        </div>
                        <div className="grid gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="editor-theme">Theme</Label>
                                <Select value={editorTheme} onValueChange={setEditorTheme}>
                                  <SelectTrigger id="editor-theme">
                                    <SelectValue placeholder="Select theme" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {editorThemes.map(theme => (
                                       <SelectItem key={theme} value={theme}>
                                        {theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')}
                                       </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="font-size">Font Size</Label>
                                    <span className="text-sm font-medium text-muted-foreground">{fontSize}px</span>
                                </div>
                                <Slider
                                    id="font-size"
                                    min={12}
                                    max={20}
                                    step={1}
                                    value={[fontSize]}
                                    onValueChange={(value) => setFontSize(value[0])}
                                    className="my-2"
                                    showTicks
                                />
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
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Code className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Run Anonymous Code</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DialogContent className="max-w-6xl w-[70%] h-[80vh] flex flex-col p-0">
                    <AnonymousCodeRunner />
                </DialogContent>
            </Dialog>
            {!userProfile?.sfdcAuth?.connected && (
              <Dialog>
                  <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><Info className="h-4 w-4"/></Button>
                              </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Salesforce Connection</p>
                          </TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Salesforce Connection</DialogTitle>
                          <DialogDescription>
                              Connect your Salesforce org to run code in a real environment.
                          </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                          <Button variant={userProfile?.sfdcAuth?.connected ? 'secondary' : 'default'} onClick={handleAuthWithSalesforce} className="w-full">
                              {userProfile?.sfdcAuth?.connected ? 'Reconnect with Salesforce' : 'Connect with Salesforce'}
                          </Button>
                          {userProfile?.sfdcAuth?.connected && <p className="text-sm text-green-600 text-center">Connected</p>}
                      </div>
                  </DialogContent>
              </Dialog>
            )}
            <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReset}><RefreshCw className="h-4 w-4"/></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Reset Code</p>
                    </TooltipContent>
                 </Tooltip>
            </TooltipProvider>
        </div>
    </header>
  )
}

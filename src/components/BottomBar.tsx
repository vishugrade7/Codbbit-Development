
'use client';

import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";
import { Check, Cloud, Code, GitBranch, Sparkles, X, Package, Loader2, Bug } from "lucide-react";
import { AnonymousCodeRunner } from "./AnonymousCodeRunner";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Tooltip, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import type { UserProfile } from "@/lib/types";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { installSalesforcePackage } from "@/lib/actions";
import { Badge } from "./ui/badge";
import { FeedbackForm } from "./FeedbackForm";


type ManagedPackage = {
  url: string;
};

export function BottomBar() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [isInstalling, setIsInstalling] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const packageDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'packages', 'URL');
  }, [firestore]);

  const { data: managedPackage } = useDoc<ManagedPackage>(packageDocRef);

  const handleInstallPackage = async () => {
    if (isInstalling) return;

    if (!managedPackage?.url) {
      console.error("No package URL is configured in the system.");
      return;
    }
     if (!userProfile?.sfdcAuth || !userProfile.uid) {
      console.error("Salesforce account not connected or user not found.");
      return;
    }

    try {
        const url = new URL(managedPackage.url);
        const packageVersionKey = url.searchParams.get('p0');

        if (!packageVersionKey) {
            throw new Error("Invalid package URL. Could not find package key (p0).");
        }
        
        setIsInstalling(true);
        
        const result = await installSalesforcePackage(userProfile.sfdcAuth, packageVersionKey, userProfile.uid);

        if (result.success) {
            console.log("Package installation complete.");
        } else {
            throw new Error(result.error || "An unknown error occurred during installation.");
        }

    } catch (error: any) {
         console.error("Installation Failed", error.message);
    } finally {
        setIsInstalling(false);
    }
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 flex h-8 items-center justify-between border-t bg-background/95 px-4 text-sm text-muted-foreground backdrop-blur-sm md:left-[60px]">
      <div className="flex items-center gap-4">
        {/* Placeholder for future left-aligned items */}
      </div>
      <div className="flex items-center gap-4">
        <Dialog>
          <DialogTrigger asChild>
             <Badge variant="destructive" className="cursor-pointer hover:bg-destructive/80">
              <Bug className="mr-1 h-3 w-3" />
              Report a bug
            </Badge>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Report a Bug</DialogTitle>
                <DialogDescription>
                    Describe the issue you're encountering. Your feedback is valuable in helping us improve the platform.
                </DialogDescription>
            </DialogHeader>
            <FeedbackForm />
          </DialogContent>
        </Dialog>
        <Dialog>
            <DialogTrigger asChild>
                 <button className="flex items-center gap-1.5 hover:text-foreground">
                    <Code size={16} />
                    <span>Run Anonymous Apex</span>
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl w-[70%] h-[80vh] flex flex-col p-0">
                <AnonymousCodeRunner />
            </DialogContent>
        </Dialog>
        <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleInstallPackage} disabled={isInstalling}>
                  {isInstalling ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get new questions</p>
              </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}

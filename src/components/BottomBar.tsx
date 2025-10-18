
'use client';

import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";
import { Check, Cloud, Code, GitBranch, Sparkles, X } from "lucide-react";
import { AnonymousCodeRunner } from "./AnonymousCodeRunner";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Tooltip, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import type { UserProfile } from "@/lib/types";

export function BottomBar() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const isSalesforceConnected = userProfile?.sfdcAuth?.connected || false;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 flex h-8 items-center justify-between border-t bg-background/95 px-4 text-sm text-muted-foreground backdrop-blur-sm md:left-[60px]">
      <div className="flex items-center gap-4">
        {/* Removed Salesforce and main branch indicators */}
      </div>
      <div className="flex items-center gap-4">
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
        <button className="flex items-center gap-1.5 hover:text-foreground">
            <Sparkles size={16} className="text-purple-500" />
            <span>AI</span>
        </button>
      </div>
    </footer>
  );
}

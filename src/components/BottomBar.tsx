
'use client';

import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";
import { Check, Cloud, Code, GitBranch, Sparkles, X, Package, Loader2 } from "lucide-react";
import { AnonymousCodeRunner } from "./AnonymousCodeRunner";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Tooltip, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import type { UserProfile } from "@/lib/types";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { installSalesforcePackage } from "@/lib/actions";

type ManagedPackage = {
  url: string;
};

export function BottomBar() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [packageUrl, setPackageUrl] = useState('');
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

  useEffect(() => {
    if (managedPackage?.url) {
      setPackageUrl(managedPackage.url);
    }
  }, [managedPackage]);

  const isSalesforceConnected = userProfile?.sfdcAuth?.connected || false;

  const handleInstallPackage = async () => {
    if (!packageUrl) {
      toast({ title: "Error", description: "Please enter a package URL.", variant: "destructive" });
      return;
    }
     if (!userProfile?.sfdcAuth) {
      toast({ title: "Error", description: "Salesforce account not connected.", variant: "destructive" });
      return;
    }

    try {
        const url = new URL(packageUrl);
        const packageVersionKey = url.searchParams.get('p0');

        if (!packageVersionKey) {
            throw new Error("Invalid package URL. Could not find package key (p0).");
        }
        
        setIsInstalling(true);
        toast({ title: "Installation Started", description: "Package installation is in progress. This may take several minutes." });
        setIsInstallDialogOpen(false);

        const result = await installSalesforcePackage(userProfile.sfdcAuth, packageVersionKey);

        if (result.success) {
            toast({ title: "Installation Complete", description: "The package has been successfully installed in your org.", variant: "success" });
        } else {
            throw new Error(result.error || "An unknown error occurred during installation.");
        }

    } catch (error: any) {
         toast({ title: "Installation Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsInstalling(false);
        // Do not clear packageUrl on close
    }
  }

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
        <Dialog open={isInstallDialogOpen} onOpenChange={setIsInstallDialogOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 hover:text-foreground">
                    <Package size={16} className={isInstalling ? "animate-pulse" : ""} />
                    <span>Install Package</span>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Install a Managed Package</DialogTitle>
                    <DialogDescription>
                        Enter the installation URL for a managed package to install it in your connected Salesforce org.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="package-url" className="text-right">
                        URL
                        </Label>
                        <Input
                        id="package-url"
                        value={packageUrl}
                        onChange={(e) => setPackageUrl(e.target.value)}
                        className="col-span-3"
                        placeholder="https://login.salesforce.com/packaging/installPackage.apexp?p0=..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInstallDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleInstallPackage} disabled={isInstalling}>
                        {isInstalling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Install
                    </Button>
                </DialogFooter>
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

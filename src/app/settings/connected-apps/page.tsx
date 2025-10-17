
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useUser, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, Link as LinkIcon, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initiateSalesforceOAuth } from '@/lib/actions';
import Image from 'next/image';
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
import Link from 'next/link';


export default function ConnectedAppsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading, refetch } = useDoc<UserProfile>(userDocRef);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnectingSalesforce, setIsDisconnectingSalesforce] = useState(false);
  

  const handleAuthWithSalesforce = async () => {
    setIsConnecting(true);
    try {
      const verifier = btoa(String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(32))));
      sessionStorage.setItem('salesforce_code_verifier', verifier);

      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      const result = await initiateSalesforceOAuth(challenge);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || "Could not initiate Salesforce authentication.");
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnectSalesforce = async () => {
    if (!userDocRef) return;
    setIsDisconnectingSalesforce(true);
    try {
      await setDocumentNonBlocking(userDocRef, {
        sfdcAuth: {
          connected: false,
          instanceUrl: '',
          accessToken: '',
          // Keep refresh token to allow easy reconnection
          refreshToken: userProfile?.sfdcAuth.refreshToken || '', 
          issuedAt: 0,
        }
      }, { merge: true });
      await refetch();
      toast({ title: "Salesforce Disconnected", description: "Your Salesforce account has been disconnected."});
    } catch(error: any) {
       toast({ title: "Error", description: "Could not disconnect Salesforce account.", variant: "destructive"});
    } finally {
        setIsDisconnectingSalesforce(false);
    }
  }


  const isSalesforceConnected = userProfile?.sfdcAuth?.connected || false;

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Apps</CardTitle>
        <CardDescription>Manage your third-party application connections for Salesforce.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {/* Salesforce Connection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-md bg-muted">
                <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Salesforce</p>
              <p className="text-sm text-muted-foreground">
                {isSalesforceConnected ? `Connected to ${userProfile?.sfdcAuth?.instanceUrl}` : 'Execute code and run tests.'}
              </p>
            </div>
          </div>
          {isSalesforceConnected ? (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDisconnectingSalesforce} className="w-full sm:w-auto">
                        {isDisconnectingSalesforce && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Disconnect
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Disconnecting your Salesforce account will prevent you from executing code and submitting solutions. Your authentication tokens will be cleared, but you can reconnect at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisconnectSalesforce}>Disconnect</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={handleAuthWithSalesforce} disabled={isConnecting} className="w-full sm:w-auto">
              {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

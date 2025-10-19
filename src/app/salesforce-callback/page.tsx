
'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { HashLoader } from 'react-spinners';
import { useToast } from '@/hooks/use-toast';

function SalesforceCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const processAuth = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        toast({
          title: "Salesforce Authentication Failed",
          description: errorDescription || "An unknown error occurred.",
          variant: "destructive",
        });
        router.replace('/settings');
        return;
      }

      const codeVerifier = sessionStorage.getItem('salesforce_code_verifier');

      if (!code) {
        toast({
          title: "Authentication Incomplete",
          description: "Authorization code not found in the URL.",
          variant: "destructive",
        });
        router.replace('/settings');
        return;
      }

      if (!codeVerifier) {
        toast({
          title: "Authentication Error",
          description: "Code verifier not found. Please try the connection process again.",
          variant: "destructive",
        });
        router.replace('/settings');
        return;
      }
      
      if (user) {
        try {
          const response = await fetch('/api/salesforce/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, codeVerifier, userId: user.uid }),
          });

          sessionStorage.removeItem('salesforce_code_verifier');
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to connect Salesforce account.');
          }

          toast({
            title: "Success!",
            description: "Your Salesforce account has been connected.",
          });
        } catch (e: any) {
          toast({
            title: "Connection Failed",
            description: e.message || "An unknown error occurred during token exchange.",
            variant: "destructive",
          });
        } finally {
            router.replace('/settings');
        }
      }
    };

    if (!isUserLoading) {
        if (user) {
            processAuth();
        } else {
            toast({ title: 'Authentication Error', description: 'You must be logged in to connect a Salesforce account.', variant: 'destructive' });
            router.replace('/login');
        }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <HashLoader color="#456eff" />
      <p className="text-muted-foreground">Connecting to Salesforce, please wait...</p>
    </div>
  );
}

export default function SalesforceCallbackPage() {
    return (
        <Suspense>
            <SalesforceCallback />
        </Suspense>
    )
}

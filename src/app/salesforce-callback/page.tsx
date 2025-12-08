
'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

function SalesforceCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    // The logic is now handled server-side in the API route.
    // This page just shows a loading indicator.
    // The API route will redirect back to settings.
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const success = searchParams.get('success');

    if (error) {
      toast({
        title: "Salesforce Authentication Failed",
        description: errorDescription || "An unknown error occurred.",
        variant: "destructive",
      });
      router.replace('/settings/connected-apps');
    } else if (success) {
      toast({
        title: "Success!",
        description: "Your Salesforce account has been connected.",
      });
       router.replace('/settings/connected-apps');
    }
  }, [searchParams, router, toast]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
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

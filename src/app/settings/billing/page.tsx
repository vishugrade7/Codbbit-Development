
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, PriceConfig } from '@/lib/types';
import { HashLoader } from 'react-spinners';
import { CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const priceDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'pricing');
  }, [firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  const { data: priceConfig, isLoading: isPriceLoading } = useDoc<PriceConfig>(priceDocRef);

  const currentPlan = userProfile?.isPremium ? 'Pro' : 'Free';
  const paymentsEnabled = priceConfig?.isPaymentsEnabled !== false;

  if (isProfileLoading || isPriceLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <HashLoader color="#456eff" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your subscription and payment methods.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-lg font-semibold">{currentPlan}</p>
          </div>
          {paymentsEnabled && (
            <Button asChild variant={currentPlan === 'Pro' ? 'outline' : 'default'}>
              <Link href="/pricing">{currentPlan === 'Pro' ? 'Manage Plan' : 'Upgrade'}</Link>
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          For any billing inquiries, please contact support.
        </p>
      </CardFooter>
    </Card>
  );
}

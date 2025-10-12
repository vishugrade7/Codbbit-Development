
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useUser, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, Copy, Linkedin, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export default function VerificationPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  // For this example, we'll simulate the referred user count.
  const [referredUsers, setReferredUsers] = useState(0); 
  const referralsNeeded = 3;

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading, refetch } = useDoc<UserProfile>(userDocRef);

  // Generate referral code if it doesn't exist
  useEffect(() => {
    if (userDocRef && userProfile && !userProfile.referralCode) {
      const newReferralCode = uuidv4().split('-')[0];
      setDocumentNonBlocking(userDocRef, { referralCode: newReferralCode }, { merge: true });
      refetch();
    }
  }, [userProfile, userDocRef, refetch]);

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/signup?ref=${userProfile?.referralCode}`;
  const progress = (referredUsers / referralsNeeded) * 100;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard.' });
  };
  
  const handleVerifyWithLinkedIn = () => {
    toast({ title: 'Coming Soon!', description: 'LinkedIn verification is not yet implemented.' });
  }

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Invite 3 Users</CardTitle>
          <CardDescription>Share your unique referral link with others. Once three users sign up, you can proceed to the next step.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input value={referralLink} readOnly />
            <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{referredUsers} of {referralsNeeded} referrals completed.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Verify with LinkedIn</CardTitle>
          <CardDescription>Verify your identity using your LinkedIn account to get the verified badge on your profile.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button onClick={handleVerifyWithLinkedIn} disabled={referredUsers < referralsNeeded}>
            <Linkedin className="mr-2 h-4 w-4" />
            Verify with LinkedIn
          </Button>
           {referredUsers < referralsNeeded && (
             <p className="text-sm text-muted-foreground mt-2">
                You must complete the referral step before verifying with LinkedIn.
             </p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

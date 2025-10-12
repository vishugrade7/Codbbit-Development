
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useUser, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, Copy, Linkedin, CheckCircle, Share2, Twitter, Facebook } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { initiateLinkedInOAuth } from '@/lib/actions';

export default function VerificationPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const referralsNeeded = 3;

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading, refetch } = useDoc<UserProfile>(userDocRef);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isVerifyingLinkedIn, setIsVerifyingLinkedIn] = useState(false);

  // Generate referral code if it doesn't exist
  useEffect(() => {
    if (userDocRef && userProfile && !userProfile.referralCode) {
      const newReferralCode = uuidv4().split('-')[0];
      setDocumentNonBlocking(userDocRef, { referralCode: newReferralCode }, { merge: true });
      refetch();
    }
  }, [userProfile, userDocRef, refetch]);

  const referredUsers = userProfile?.referredUsersCount || 0;
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/signup?ref=${userProfile?.referralCode}`;
  const progress = (referredUsers / referralsNeeded) * 100;
  const shareText = `Join me on Codbbit and sharpen your Salesforce coding skills. Use my referral link!`;


  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard.' });
  };
  
  const handleVerifyWithLinkedIn = async () => {
    if (!user) {
        toast({title: 'Error', description: 'You must be logged in.', variant: 'destructive'});
        return;
    }
    setIsVerifyingLinkedIn(true);
    try {
        const result = await initiateLinkedInOAuth(user.uid);
        if (result.success && result.url) {
            window.location.href = result.url;
        } else {
            throw new Error(result.error || 'Could not initiate LinkedIn verification.');
        }
    } catch(error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive'});
        setIsVerifyingLinkedIn(false);
    }
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Codbbit!',
        text: shareText,
        url: referralLink,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => toast({
        title: 'Share Failed',
        description: 'There was an error trying to share your link.',
        variant: 'destructive',
      }));
    } else {
      setIsShareDialogOpen(true);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <>
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
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
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
            <Button onClick={handleVerifyWithLinkedIn} disabled={isVerifyingLinkedIn}>
              {isVerifyingLinkedIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Linkedin className="mr-2 h-4 w-4" />}
              Verify with LinkedIn
            </Button>
          </CardContent>
        </Card>
      </div>

       <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your referral link</DialogTitle>
            <DialogDescription>
              Copy your link and share it on your favorite social platforms.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <Input value={referralLink} readOnly className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"/>
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center gap-4">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                    <Twitter />
                  </Button>
                </a>
                 <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent('Join me on Codbbit!')}&summary=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                    <Linkedin />
                  </Button>
                </a>
                 <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                    <Facebook />
                  </Button>
                </a>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}



'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, ShieldAlert, CheckIcon, XIcon, Link as LinkIcon } from 'lucide-react';
import { useDoc, useFirestore, useUser, setDocumentNonBlocking, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { sendEmailVerification } from 'firebase/auth';
import { useDebounce } from '@/hooks/use-debounce';
import { isUsernameUnique } from '@/ai/flows/is-username-unique';

type UsernameStatus = 'idle' | 'checking' | 'unique' | 'taken';

export default function SettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const userDocRef = useMemoFirebase(() => {
      if (!firestore || !user?.uid) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: userProfile, isLoading: isProfileLoading, refetch } = useDoc<UserProfile>(userDocRef);

  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const debouncedUsername = useDebounce(username, 500);

  const checkUsername = useCallback(async (name: string) => {
    if (name === userProfile?.username) {
        setUsernameStatus('idle');
        return;
    }
    if (name.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const { isUnique } = await isUsernameUnique({ username: name });
      setUsernameStatus(isUnique ? 'unique' : 'taken');
    } catch (error) {
      setUsernameStatus('idle'); // Reset on error
    }
  }, [userProfile?.username]);

  useEffect(() => {
    if (debouncedUsername) {
      checkUsername(debouncedUsername);
    } else {
      setUsernameStatus('idle');
    }
  }, [debouncedUsername, checkUsername]);

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);
  
  const handleSendVerificationEmail = async () => {
    if (user) {
        try {
            await sendEmailVerification(user);
            toast({ title: 'Verification Email Sent', description: 'Please check your inbox to verify your email address.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to send verification email.', variant: 'destructive' });
        }
    }
  }

  const handleSave = async () => {
    if (!userDocRef) {
      toast({ title: "Error", description: "Could not save settings. User not found.", variant: "destructive" });
      return;
    }
     if (usernameStatus === 'taken') {
        toast({ title: "Username Taken", description: "Please choose a different username.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        await setDocumentNonBlocking(userDocRef, { username }, { merge: true });
        await refetch();
        toast({ title: "Settings Saved", description: "Your changes have been saved." });
    } catch (e) {
        toast({ title: "Error", description: "Could not save settings.", variant: "destructive"});
    } finally {
        setIsSaving(false);
    }
  };
  
  const isUsernameChanged = userProfile?.username !== username;
  const canSave = !isSaving && (!isUsernameChanged || usernameStatus === 'unique');


  if (isUserLoading || isProfileLoading) {
    return <div className="flex min-h-[400px] flex-col items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  return (
    <div className="divide-y divide-border rounded-md border">
        <div className="p-6">
             <h3 className="text-lg font-semibold leading-tight">Username</h3>
             <p className="text-sm text-muted-foreground mt-1">This is your URL namespace within Codbbit.</p>
             <div className="mt-4">
                 <div className="relative max-w-sm">
                    <Input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                        className="pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {usernameStatus === 'unique' && isUsernameChanged && <CheckIcon className="h-4 w-4 text-green-500" />}
                        {usernameStatus === 'taken' && <XIcon className="h-4 w-4 text-red-500" />}
                    </div>
                </div>
                {usernameStatus === 'taken' && <p className="text-sm text-red-500 mt-1">This username is already taken.</p>}
             </div>
        </div>
        <div className="p-6">
            <h3 className="text-lg font-semibold leading-tight">Verification</h3>
            <p className="text-sm text-muted-foreground mt-1">Verify your identity to unlock all features.</p>
            <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                        <Label htmlFor="email" className="font-medium">Email Address</Label>
                        <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                    </div>
                    {userProfile?.emailVerified ? (
                        <Badge variant="secondary" className="text-green-600 border-green-200">
                            <CheckCircle className="mr-2 h-4 w-4"/>
                            Verified
                        </Badge>
                    ) : (
                         <Button variant="outline" size="sm" onClick={handleSendVerificationEmail}>Verify</Button>
                    )}
                </div>
            </div>
        </div>
        <div className="p-6 flex justify-end bg-muted/30">
            <Button onClick={handleSave} disabled={!canSave}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
            </Button>
        </div>
    </div>
  );
}

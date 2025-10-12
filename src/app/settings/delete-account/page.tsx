
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { deleteUserAccount } from '@/lib/actions';

export default function DeleteAccountPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmation !== 'DELETE' || !user) return;

    setIsDeleting(true);
    const result = await deleteUserAccount(user.uid);

    if (result.success) {
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted. You will be redirected shortly.',
        variant: 'success',
      });
      // It might take a moment for onAuthStateChanged to fire, so we can sign out client-side too.
      await auth.signOut(); 
      router.push('/');
    } else {
      toast({
        title: 'Deletion Failed',
        description: result.error,
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>Permanently remove your account and all associated data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Warning: This action is irreversible.</AlertTitle>
          <AlertDescription>
            Deleting your account will permanently erase all of your data, including your profile,
            solved problems, points, and leaderboard rankings. This cannot be undone.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <Label htmlFor="confirmation">
            To confirm, please type <strong className="text-foreground">DELETE</strong> below:
          </Label>
          <Input
            id="confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="DELETE"
            disabled={isDeleting}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={confirmation !== 'DELETE' || isDeleting}
        >
          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
        </Button>
      </CardFooter>
    </Card>
  );
}

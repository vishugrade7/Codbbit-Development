
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, Mail } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const handleEmailRequest = () => {
    if (!user || !user.email) return;

    const subject = `Account Deletion Request for user: ${user.uid}`;
    const body = `
Please process the account deletion for the following user:

User ID: ${user.uid}
User Email: ${user.email}

I understand that this action is irreversible and will permanently delete all my data.
    `;
    const mailtoLink = `mailto:support@codbbit.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
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
            solved problems, points, and leaderboard rankings. This cannot be undone. Clicking the button below will open an email to request deletion.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          variant="destructive"
          onClick={handleEmailRequest}
        >
          <Mail className="mr-2 h-4 w-4" />
          Request Account Deletion via Email
        </Button>
      </CardFooter>
    </Card>
  );
}

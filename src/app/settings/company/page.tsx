
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDoc, useFirestore, useUser, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader } from '@/components/ui/loader';
import { CompanyAutocomplete } from '@/components/CompanyAutocomplete';

const companySchema = z.object({
  company: z.string().min(1, 'Company name is required.'),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading, refetch } = useDoc<UserProfile>(userDocRef);

  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        company: userProfile.company || '',
      });
    }
  }, [userProfile, reset]);
  
  const onSubmit = async (data: CompanyFormData) => {
    if (!userDocRef) {
      toast({ title: "Error", description: "Could not save settings. User not found.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await setDocumentNonBlocking(userDocRef, { 
          company: data.company,
      }, { merge: true });
      await refetch();
      toast({
        title: "Company Updated",
        description: "Your company information has been saved.",
      });
    } catch (error) {
      console.error("Failed to save company settings", error);
      toast({
        title: "Error",
        description: "Something went wrong while saving.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>Manage your company information. Start typing to see suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <CompanyAutocomplete
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

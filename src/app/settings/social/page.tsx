
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
import { Loader2, Github, Twitter, Linkedin, Link as LinkIcon, Mountain } from 'lucide-react';
import { useRouter } from 'next/navigation';

const socialLinksSchema = z.object({
  website: z.string().url().or(z.literal('')).optional(),
  github: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  trailhead: z.string().optional(),
});

type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

const getPathFromUrl = (url: string | undefined, prefix: string) => {
    if (!url) return '';
    try {
        const urlObject = new URL(url);
        if (urlObject.hostname + urlObject.pathname === prefix.replace(/^https?:\/\//, '')) {
             return url.substring(prefix.length);
        }
        if (url.startsWith(prefix)) {
            return url.substring(prefix.length);
        }
    } catch (e) {
        // Not a full URL, maybe just the path was saved
        if (!url.includes('/')) return url;
    }
    return '';
}

export default function SocialProfilesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading, refetch } = useDoc<UserProfile>(userDocRef);

  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      website: '',
      github: '',
      twitter: '',
      linkedin: '',
      trailhead: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        website: userProfile.website || '',
        github: getPathFromUrl(userProfile.githubUrl, 'https://github.com/'),
        twitter: getPathFromUrl(userProfile.twitterUrl, 'https://twitter.com/'),
        linkedin: getPathFromUrl(userProfile.linkedinUrl, 'https://linkedin.com/in/'),
        trailhead: getPathFromUrl(userProfile.trailheadUrl, 'https://www.salesforce.com/trailblazer/'),
      });
    }
  }, [userProfile, reset]);

  const onSubmit = async (data: SocialLinksFormData) => {
    if (!userDocRef) {
      toast({ title: "Error", description: "Could not save profile. User not found.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
        const updateData = {
            website: data.website,
            githubUrl: data.github ? `https://github.com/${data.github}` : '',
            twitterUrl: data.twitter ? `https://twitter.com/${data.twitter}` : '',
            linkedinUrl: data.linkedin ? `https://linkedin.com/in/${data.linkedin}` : '',
            trailheadUrl: data.trailhead ? `https://www.salesforce.com/trailblazer/${data.trailhead}` : '',
        };
      await setDocumentNonBlocking(userDocRef, updateData, { merge: true });
      await refetch();
      toast({
        title: "Social Profiles Updated",
        description: "Your social links have been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to save social profiles", error);
      toast({
        title: "Error",
        description: "Something went wrong while saving your profiles.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Social Profiles</CardTitle>
          <CardDescription>Add links to your social media profiles. These will be displayed on your public profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
                 <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                        <Input id="website" {...field} placeholder="https://your-website.com" className="pl-9"/>
                    )}
                />
            </div>
            {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
             <div className="flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="pl-3 pr-2 text-muted-foreground">https://github.com/</span>
                <Controller
                    name="github"
                    control={control}
                    render={({ field }) => (
                        <Input id="github" {...field} placeholder="your-username" className="border-0 h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                    )}
                />
            </div>
            {errors.github && <p className="text-sm text-red-500">{errors.github.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter / X</Label>
             <div className="flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                 <span className="pl-3 pr-2 text-muted-foreground">https://twitter.com/</span>
                <Controller
                    name="twitter"
                    control={control}
                    render={({ field }) => (
                        <Input id="twitter" {...field} placeholder="your-username" className="border-0 h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                    )}
                />
            </div>
            {errors.twitter && <p className="text-sm text-red-500">{errors.twitter.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
             <div className="flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                 <span className="pl-3 pr-2 text-muted-foreground">https://linkedin.com/in/</span>
                <Controller
                    name="linkedin"
                    control={control}
                    render={({ field }) => (
                        <Input id="linkedin" {...field} placeholder="your-profile" className="border-0 h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                    )}
                />
            </div>
            {errors.linkedin && <p className="text-sm text-red-500">{errors.linkedin.message}</p>}
          </div>

           <div className="space-y-2">
            <Label htmlFor="trailhead">Trailhead</Label>
             <div className="flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                 <span className="pl-3 pr-2 text-muted-foreground">https://www.salesforce.com/trailblazer/</span>
                <Controller
                    name="trailhead"
                    control={control}
                    render={({ field }) => (
                        <Input id="trailhead" {...field} placeholder="your-profile" className="border-0 h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                    )}
                />
            </div>
            {errors.trailhead && <p className="text-sm text-red-500">{errors.trailhead.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

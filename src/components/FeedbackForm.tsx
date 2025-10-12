
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const feedbackSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  subject: z.string().min(1, 'Please select a subject.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(() => 
    firestore && user ? doc(firestore, 'users', user.uid) : null
  , [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile.name || '',
        email: userProfile.email || '',
        subject: '',
        message: '',
      });
    }
  }, [userProfile, reset]);

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    // Here you would typically send the feedback to your backend or a service like Formspree
    console.log(data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Feedback Sent!',
      description: "Thanks for your feedback. We'll get back to you soon.",
      variant: 'success',
    });
    reset({
        ...data,
        subject: '',
        message: ''
    });
    setIsSubmitting(false);
  };

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Feedback</h1>
        <p className="text-muted-foreground mt-2">
          We value your feedback and are here to assist you. Please use the form below to
          drop your reviews, suggestions, or to ask for support.
        </p>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  {...register('email')}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profile-tracker">Profile Tracker</SelectItem>
                      <SelectItem value="bug-report">Bug Report</SelectItem>
                      <SelectItem value="feature-request">Feature Request</SelectItem>
                      <SelectItem value="general-question">General Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                {...register('message')}
                placeholder="Type your message here..."
                rows={6}
                disabled={isSubmitting}
              />
              {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

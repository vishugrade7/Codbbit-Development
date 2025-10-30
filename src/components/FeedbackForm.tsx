
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
import { Loader2, Paperclip, Activity, Bug, Lightbulb, HelpCircle, MoreHorizontal } from 'lucide-react';
import { sendFeedbackEmail } from '@/lib/mail';
import { Confetti } from './Confetti';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const feedbackSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  subject: z.string().min(1, 'Please select a subject.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
  attachments: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
      `Each file must be 5MB or less.`
    ),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
    onFormSubmit?: () => void;
}

export function FeedbackForm({ onFormSubmit }: FeedbackFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(() => 
    firestore && user ? doc(firestore, 'users', user.uid) : null
  , [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      attachments: undefined,
    },
  });

  const attachments = watch("attachments");

  useEffect(() => {
    if (attachments && attachments.length > 0) {
      if (attachments.length === 1) {
        setAttachmentName(attachments[0].name);
      } else {
        setAttachmentName(`${attachments.length} files selected`);
      }
    } else {
      setAttachmentName(null);
    }
  }, [attachments]);

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
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('subject', data.subject);
    formData.append('message', data.message);

    if (data.attachments) {
      Array.from(data.attachments).forEach(file => {
        formData.append('attachments', file);
      });
    }

    try {
      const result = await sendFeedbackEmail(formData);
      if (result.success) {
        toast({
          title: 'Feedback Sent!',
          description: "Thank you for your feedback. We'll get back to you soon.",
          variant: 'success',
        });
        reset();
        setShowConfetti(true);
        setTimeout(() => {
            setShowConfetti(false);
            if (onFormSubmit) {
                onFormSubmit();
            }
        }, 3000);
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (error: any) {
        toast({
            title: 'Error Sending Feedback',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
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
      <form onSubmit={handleSubmit(onSubmit)}>
        {showConfetti && <Confetti />}
        <div className="space-y-6">
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
                    <SelectItem value="profile-tracker"><Activity className="mr-2 h-4 w-4" />Profile Tracker</SelectItem>
                    <SelectItem value="bug-report"><Bug className="mr-2 h-4 w-4" />Bug Report</SelectItem>
                    <SelectItem value="feature-request"><Lightbulb className="mr-2 h-4 w-4" />Feature Request</SelectItem>
                    <SelectItem value="general-question"><HelpCircle className="mr-2 h-4 w-4" />General Question</SelectItem>
                    <SelectItem value="other"><MoreHorizontal className="mr-2 h-4 w-4" />Other</SelectItem>
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
           <div className="space-y-2">
              <Label htmlFor="attachments" className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments (Optional)
              </Label>
               <Input id="attachments" type="file" {...register("attachments")} multiple />
              {errors.attachments && <p className="text-sm text-red-500">{errors.attachments.message as string}</p>}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </form>
  );
}

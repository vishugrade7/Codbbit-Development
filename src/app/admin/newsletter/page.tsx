
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

const newsletterSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function NewsletterPage() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSending(true);
    // Here you would implement the logic to send the newsletter to all users
    // For now, we'll just simulate it.
    console.log('Sending newsletter:', data);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Newsletter Sent!',
      description: 'Your newsletter has been queued for delivery to all subscribers.',
    });
    
    reset();
    setIsSending(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Send Newsletter</h1>
        <p className="text-muted-foreground mt-1">Compose and send an email to all your users.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>The message will be sent to all registered users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...register('subject')} placeholder="e.g., New Feature Announcement!" />
              {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message Body</Label>
              <Textarea
                id="message"
                {...register('message')}
                placeholder="Write your newsletter content here... Supports Markdown."
                rows={15}
              />
              {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSending}>
              {isSending ? (
                <Spinner />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSending ? 'Sending...' : 'Send Newsletter'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

    
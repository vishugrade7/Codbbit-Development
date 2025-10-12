
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function NotificationsPage() {

  const notificationSettings = [
    { id: 'new-problem', label: 'New Problem Added', description: 'Get notified when a new problem is available in a category you follow.' },
    { id: 'weekly-digest', label: 'Weekly Digest', description: 'Receive a weekly summary of popular problems and top performers.' },
    { id: 'product-updates', label: 'Product Updates', description: 'Get emails about new features and updates to the platform.' },
    { id: 'leaderboard-changes', label: 'Leaderboard Changes', description: 'Be informed when you enter the top 10 in a leaderboard.' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>Manage how you receive email notifications.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {notificationSettings.map(setting => (
          <div key={setting.id} className="py-4 flex items-center justify-between">
            <div>
              <Label htmlFor={setting.id} className="font-medium">{setting.label}</Label>
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            </div>
            <Switch id={setting.id} />
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}

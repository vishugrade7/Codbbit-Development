
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { NavigationSettings } from '@/lib/types';
import { Loader } from '@/components/ui/loader';
import { Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', description: 'The main landing page for logged-in users.' },
  { id: 'problems', label: 'Problems', description: 'The list of all coding problems.' },
  { id: 'courses', label: 'Courses', description: 'Curated learning paths and tutorials.' },
  { id: 'lwc-playground', label: 'LWC Playground', description: 'A sandbox for building Lightning Web Components.' },
  { id: 'leaderboard', label: 'Leaderboard', description: 'Global and company-wide user rankings.' },
  { id: 'sheets', label: 'Sheets', description: 'User-created problem lists for targeted practice.' },
];

export default function NavigationSettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [settings, setSettings] = useState<Partial<NavigationSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  const navDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'navigation');
  }, [firestore]);

  const { data: navSettings, isLoading, refetch } = useDoc<NavigationSettings>(navDocRef);
  
  useEffect(() => {
    if (navSettings) {
        // Ensure all keys have a default value if not present in Firestore
        const completeSettings: Partial<NavigationSettings> = {};
        navItems.forEach(item => {
            completeSettings[item.id as keyof NavigationSettings] = navSettings[item.id as keyof NavigationSettings] !== false;
        });
        setSettings(completeSettings);
    } else if (!isLoading) {
        // If no settings are found, default all to true
        const defaultSettings: Partial<NavigationSettings> = {};
        navItems.forEach(item => {
            defaultSettings[item.id as keyof NavigationSettings] = true;
        });
        setSettings(defaultSettings);
    }
  }, [navSettings, isLoading]);

  const handleToggle = (id: keyof NavigationSettings) => {
    setSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSave = async () => {
    if (!navDocRef) return;
    setIsSaving(true);
    try {
        await setDocumentNonBlocking(navDocRef, settings, { merge: true });
        toast({ title: 'Settings Saved', description: 'Navigation visibility has been updated.' });
        refetch();
    } catch (error) {
        toast({ title: 'Error', description: 'Could not save navigation settings.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Navigation Settings</h1>
          <p className="text-muted-foreground mt-1">Control which sidebar tabs are visible to regular users.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">
            <Users className="mr-2 h-4 w-4" />
            Manage Individual Users
          </Link>
        </Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Global Sidebar Visibility</CardTitle>
          <CardDescription>
            Enable or disable sidebar items for all non-admin users. Changes will take effect on next page load for them.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {navItems.map(item => (
            <div key={item.id} className="py-4 flex items-center justify-between">
              <div>
                <Label htmlFor={item.id} className="font-medium">{item.label}</Label>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                id={item.id}
                checked={settings[item.id as keyof NavigationSettings] === true}
                onCheckedChange={() => handleToggle(item.id as keyof NavigationSettings)}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader />}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

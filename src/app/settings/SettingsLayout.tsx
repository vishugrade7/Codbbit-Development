
'use client';

import { useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { PriceConfig, UserProfile } from '@/lib/types';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';
import { Settings, User, KeyRound, Share2, Briefcase, Mail, CreditCard, Trash2, Link as LinkIcon, Star, Github, ShieldCheck } from 'lucide-react';

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
};

const settingsNav = [
  { name: 'General', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/settings/profile', icon: User },
  { name: 'Password', href: '/settings/password', icon: KeyRound },
  { name: 'Social Profiles', href: '/settings/social', icon: Share2 },
  { name: 'Connected Apps', href: '/settings/connected-apps', icon: LinkIcon },
  { name: 'Company', href: '/settings/company', icon: Briefcase },
  { name: 'Email Notifications', href: '/settings/notifications', icon: Mail },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard },
  { name: 'Verification', href: '/settings/verification', icon: ShieldCheck, required: (user: UserProfile | null) => !user?.emailVerified },
];

export function SettingsLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const priceDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'pricing');
  }, [firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  const { data: priceConfig, isLoading: isPriceLoading } = useDoc<PriceConfig>(priceDocRef);
  
  const activeSection = useMemo(() => {
      const current = settingsNav.find(item => item.href === pathname);
      return current ? current.name : 'General';
  }, [pathname]);

  const paymentsEnabled = priceConfig?.isPaymentsEnabled !== false;

  if (isUserLoading || isProfileLoading || isPriceLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const filteredSettingsNav = settingsNav.filter(item => {
    if (item.name === 'Billing' && !paymentsEnabled) return false;
    if (item.required) return item.required(userProfile);
    return true;
  });


  return (
    <div className="container mx-auto max-w-6xl py-10 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userProfile?.avatarUrl} />
            <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold font-headline tracking-tight flex items-center gap-2">
              {userProfile?.name}
              <span className="text-muted-foreground font-normal">/</span>
              <span className="text-muted-foreground font-normal">{activeSection}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Update your username and manage your account
            </p>
          </div>
        </div>
        {paymentsEnabled && (
        <Card className="p-1 border-2 border-primary/20 shadow-lg">
           <CardContent className="p-2 flex items-center justify-between gap-4">
            <h3 className="font-bold text-sm ml-2">Go Pro</h3>
            <Button size="sm" asChild>
                <Link href="/pricing"><Star className="mr-2 h-4 w-4" />Upgrade</Link>
            </Button>
           </CardContent>
        </Card>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <aside className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            {filteredSettingsNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium flex items-center gap-3',
                  pathname === item.href
                    ? 'bg-muted font-semibold text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
             <div className="pt-4 mt-4 border-t">
                 <Link href="/settings/delete-account" className="rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-3">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                </Link>
             </div>
          </nav>
        </aside>

        <main className="md:col-span-3">
            <div className="space-y-8">
             {children}
            </div>
        </main>
      </div>
    </div>
  );
}

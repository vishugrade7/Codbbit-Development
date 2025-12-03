
'use client';

import {
  AdminSidebar,
  Sidebar,
  SidebarProvider,
} from '@/components';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { HeaderBar } from '@/components/HeaderBar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    } else if (!isProfileLoading && userProfile && !userProfile.isAdmin) {
      router.replace('/');
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  if (isUserLoading || isProfileLoading || !userProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!userProfile.isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Spinner />
        <p className="mt-4 text-muted-foreground">
          Access Denied. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
             <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10">
                <Menu className="h-5 w-5" />
             </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
             <SheetHeader className="sr-only">
                <SheetTitle>Admin Menu</SheetTitle>
                <SheetDescription>Navigation links for the admin dashboard.</SheetDescription>
              </SheetHeader>
            <Sidebar>
                <AdminSidebar />
            </Sidebar>
          </SheetContent>
        </Sheet>
      </div>
      <Sidebar collapsible="icon" className="hidden md:block">
        <AdminSidebar />
      </Sidebar>
      <div className="flex-1">{children}</div>
    </SidebarProvider>
  );
}

    
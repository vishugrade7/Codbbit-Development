
'use client';

import { useMemo } from 'react';
import { notFound } from 'next/navigation';
import { ProfilePageClient } from '@/components/ProfilePageClient';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { HashLoader } from 'react-spinners';
import { AppSidebar, Sidebar, SidebarInset, SidebarProvider } from '@/components';

export default function ProfilePage() {
  const { user: currentUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !currentUser?.uid) return null;
    return doc(firestore, 'users', currentUser.uid);
  }, [firestore, currentUser?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userDocRef);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <HashLoader color="#456eff" />
      </div>
    );
  }

  if (!userProfile) {
    // This could happen if the user is logged in but their profile doc doesn't exist yet
    // Or if the user navigated here while not being logged in. The AuthGuard should prevent the latter.
    return (
       <div className="flex min-h-screen flex-col items-center justify-center">
        <HashLoader color="#456eff" />
        <p>Loading your profile...</p>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <ProfilePageClient profile={userProfile} />
      </SidebarInset>
    </SidebarProvider>
  );
}

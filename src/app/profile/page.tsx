
'use client';

import { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { ProfilePageClient } from '@/components/ProfilePageClient';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { AppSidebar, Sidebar, SidebarInset, SidebarProvider } from '@/components';


export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
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
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  // If there's a username in the URL, it's someone else's profile.
  // We're simplifying to only show the logged-in user's profile for now.
  if (username) {
     return (
        <SidebarProvider>
            <Sidebar>
                <AppSidebar />
            </Sidebar>
            <SidebarInset>
                <div className="p-4 sm:p-6 lg:p-8">
                    <p>Viewing other user profiles is not supported yet.</p>
                </div>
            </SidebarInset>
        </SidebarProvider>
     )
  }

  if (!userProfile) {
    // This could happen if the user is logged in but their profile doc doesn't exist yet
    return (
       <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p>Creating your profile...</p>
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

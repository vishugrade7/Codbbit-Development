
import { getUserProfileByUsername } from '@/ai/flows/get-user-profile-by-username';
import { AppSidebar } from '@/components/AppSidebar';
import { ProfilePageClient } from '@/components/ProfilePageClient';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { notFound } from 'next/navigation';
import React from 'react';

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

  const userProfile = await getUserProfileByUsername({ username });

  if (!userProfile) {
    notFound();
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


import { getUserProfileByUsername } from '@/ai/flows/get-user-profile-by-username';
import { AppSidebar } from '@/components/AppSidebar';
import { Sidebar, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { notFound } from 'next/navigation';
import { ProfilePageClient } from '@/components/ProfilePageClient';
import React from 'react';

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const resolvedParams = React.use(params);
  const { username } = resolvedParams;

  // Since this is now a server component that uses a hook, we can't make it async.
  // We will call the async function inside and pass the data to the client component.
  // This is a common pattern for fetching data in server components.
  const userProfile = React.use(getUserProfileByUsername({ username }));

  if (!userProfile) {
    notFound();
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <ProfilePageClient />
      </SidebarInset>
    </SidebarProvider>
  );
}


'use client';

import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { LeaderboardClient } from '@/components/LeaderboardClient';

export default function LeaderboardPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <LeaderboardClient />
      </SidebarInset>
    </SidebarProvider>
  );
}

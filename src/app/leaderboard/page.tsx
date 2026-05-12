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
        <main className="flex-1 bg-background min-h-screen">
          <LeaderboardClient />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

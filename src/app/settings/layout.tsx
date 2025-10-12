
'use client';

import { ReactNode, Suspense } from 'react';
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { Loader2 } from 'lucide-react';
import { SettingsLayout } from './SettingsLayout';

function SettingsLoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin" />
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Suspense fallback={<SettingsLoadingFallback />}>
          <SettingsLayout>{children}</SettingsLayout>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}

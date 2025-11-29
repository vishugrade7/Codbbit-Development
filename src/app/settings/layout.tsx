
'use client';

import { ReactNode, Suspense } from 'react';
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { Loader } from '@/components/ui/loader';
import { SettingsLayout } from './SettingsLayout';

function SettingsLoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader />
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

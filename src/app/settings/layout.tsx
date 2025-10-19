
'use client';

import { ReactNode, Suspense } from 'react';
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { HashLoader } from 'react-spinners';
import { SettingsLayout } from './SettingsLayout';

function SettingsLoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <HashLoader color="#456eff" />
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

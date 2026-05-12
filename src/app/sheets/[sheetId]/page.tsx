'use client';

import { AppSidebar, Sidebar, SidebarProvider, SheetDisplayPage, SidebarInset } from '@/components';
import React from 'react';
import { useParams } from 'next/navigation';

export default function SheetDetailPage() {
  const params = useParams() as any;
  const sheetId = params.sheetId;

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <SheetDisplayPage sheetId={sheetId} />
      </SidebarInset>
    </SidebarProvider>
  );
}

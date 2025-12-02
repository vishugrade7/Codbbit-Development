
'use client';

import { AppSidebar, Sidebar, SidebarProvider, SheetDisplayPage, SidebarInset } from '@/components';
import React from 'react';
import { useParams } from 'next/navigation';


export default function SheetDetailPage() {
  const params = useParams();
  const sheetId = params.sheetId as string;

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

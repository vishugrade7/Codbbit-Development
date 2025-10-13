
'use client';

import { AppSidebar, Sidebar, SidebarProvider, SheetDisplayPage, SidebarInset } from '@/components';
import React from 'react';


export default function SheetDetailPage({ params }: { params: { sheetId: string } }) {
  const { sheetId } = params;

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


'use client';

import { AppSidebar, Sidebar, SidebarProvider, SheetDisplayPage, SidebarInset } from '@/components';
import React from 'react';


export default function SheetDetailPage({ params: { sheetId } }: { params: { sheetId: string } }) {

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

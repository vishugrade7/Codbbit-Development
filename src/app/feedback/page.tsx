'use client';

import {
  AppSidebar,
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components';
import { FeedbackForm } from '@/components/FeedbackForm';

export default function FeedbackPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <FeedbackForm />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

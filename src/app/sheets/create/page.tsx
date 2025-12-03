
'use client';

import { AppSidebar, Sidebar, SidebarInset, SidebarProvider } from '@/components';
import { ProblemSheetForm } from '@/components/ProblemSheetForm';

export default function CreateProblemSheetPage() {
    return (
        <SidebarProvider>
            <Sidebar>
                <AppSidebar />
            </Sidebar>
            <SidebarInset>
                <ProblemSheetForm />
            </SidebarInset>
        </SidebarProvider>
    );
}

    
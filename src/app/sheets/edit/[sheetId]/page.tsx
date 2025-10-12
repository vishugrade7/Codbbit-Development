
'use client';

import { AppSidebar, Sidebar, SidebarInset, SidebarProvider } from '@/components';
import { ProblemSheetForm } from '@/components/ProblemSheetForm';
import { useParams } from 'next/navigation';

export default function EditProblemSheetPage() {
    const params = useParams();
    const sheetId = params.sheetId as string;

    return (
        <SidebarProvider>
            <Sidebar>
                <AppSidebar />
            </Sidebar>
            <SidebarInset>
                <ProblemSheetForm sheetId={sheetId} />
            </SidebarInset>
        </SidebarProvider>
    );
}

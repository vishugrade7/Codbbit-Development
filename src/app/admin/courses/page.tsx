'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Manage Courses</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and organize your course content.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
          <CardDescription>A list of all available courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold">No Courses Yet</h3>
            <p className="text-sm">Click "Create Course" to add your first course.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

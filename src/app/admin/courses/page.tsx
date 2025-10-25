
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Trash2, BookOpen, Search } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AddCourseForm } from '@/components/AddCourseForm';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Course } from '@/lib/types';
import { HashLoader } from 'react-spinners';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function AdminCoursesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const coursesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'courses');
  }, [firestore]);

  const { data: courses, isLoading, refetch } = useCollection<Course>(coursesCollectionRef);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setIsSheetOpen(true);
  };

  const handleEditCourse = (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCourse(course);
    setIsSheetOpen(true);
  };
  
  const handleDeleteCourse = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firestore) return;
    const courseDocRef = doc(firestore, 'courses', courseId);
    await deleteDocumentNonBlocking(courseDocRef);
    toast({
        title: 'Course Deleted',
        description: 'The course has been successfully deleted.',
    });
    refetch();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Manage Courses</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and organize your course content.</p>
        </div>
        <Button onClick={handleCreateCourse}>
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
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <HashLoader color="#456eff" />
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses && courses.map(course => (
                <Link key={course.id} href={`/admin/courses/${course.id}`} className="block hover:shadow-lg transition-shadow rounded-lg">
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleEditCourse(e, course)}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleDeleteCourse(e, course.id)} className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 h-10">{course.description}</p>
                    </CardContent>
                    </Card>
                </Link>
              ))}
              
              {(!courses || courses.length === 0) && (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground border-2 border-dashed rounded-lg md:col-span-2 lg:col-span-3">
                    <h3 className="text-lg font-semibold">No Dynamic Courses Yet</h3>
                    <p className="text-sm">Click "Create Course" to add your first course.</p>
                  </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl w-full p-0 flex flex-col">
            <AddCourseForm 
                course={editingCourse}
                onFormSubmit={() => {
                    setIsSheetOpen(false);
                    refetch();
                }}
            />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AdminCoursesPage;

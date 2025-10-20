'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Course, Question } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { collection } from 'firebase/firestore';

const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  problemIds: z.array(z.string()).min(1, 'Please select at least one problem.'),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface AddCourseFormProps {
  course?: Course | null;
  onFormSubmit: () => void;
}

export function AddCourseForm({ course, onFormSubmit }: AddCourseFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<Partial<Question>[]>([]);

  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      problemIds: [],
    }
  });

  const problemsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'problems');
  }, [firestore]);

  const { data: categoriesData, isLoading: isLoadingProblems } = useCollection<{id: string, Questions: Partial<Question>[]}>(problemsCollectionRef);

  const allProblems = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.flatMap(cat =>
      (cat.Questions || []).map(q => ({
        ...q,
        category: cat.id,
        id: q.id || `${cat.id}-${q.title}`,
      }))
    );
  }, [categoriesData]);

  useEffect(() => {
    if (course) {
        const problemIds = course.problemIds || [];
        setValue('title', course.title);
        setValue('description', course.description || '');
        setValue('problemIds', problemIds);
        
        const preselected = allProblems.filter(p => problemIds.includes(p.id!));
        setSelectedProblems(preselected);
    } else {
        reset();
        setSelectedProblems([]);
    }
  }, [course, reset, setValue, allProblems]);
  
  useEffect(() => {
      setValue('problemIds', selectedProblems.map(p => p.id!));
  }, [selectedProblems, setValue]);

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    if (!firestore || !user) {
      toast({ title: 'Error', description: 'Database not initialized or user not logged in.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    try {
      const courseId = course?.id || uuidv4();
      const courseRef = doc(firestore, 'courses', courseId);
      
      const courseData: Course = {
        id: courseId,
        title: data.title,
        description: data.description,
        problemIds: data.problemIds,
        createdBy: course?.createdBy || user.uid,
      };

      await setDoc(courseRef, courseData, { merge: true });

      toast({
        title: course ? 'Course Updated' : 'Course Created',
        description: `The course "${data.title}" has been saved.`,
      });
      onFormSubmit();
    } catch (error) {
      console.error('Failed to save course:', error);
      toast({ title: 'Save Failed', description: 'An error occurred while saving the course.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSelectProblem = (problem: Partial<Question>) => {
    setSelectedProblems(prev => {
      if (prev.find(p => p.id === problem.id)) {
        return prev.filter(p => p.id !== problem.id);
      }
      return [...prev, problem];
    });
  };
  
  const getDifficultyDotClass = (difficulty: 'Easy' | 'Medium' | 'Hard' | undefined) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <>
      <SheetHeader className="p-6 border-b flex-row justify-between items-center">
        <div>
          <SheetTitle>{course ? 'Edit Course' : 'Create New Course'}</SheetTitle>
          <SheetDescription>
            {course ? 'Update the details of this course.' : 'Fill in the details to create a new course.'}
          </SheetDescription>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onFormSubmit}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {course ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </SheetHeader>
      <ScrollArea className="flex-grow">
        <form className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={4} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Select Problems</Label>
            <div className="border rounded-md h-96">
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingProblems ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <Loader2 className="animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      allProblems.map(problem => (
                        <TableRow
                          key={problem.id}
                          className="cursor-pointer"
                          onClick={() => handleSelectProblem(problem)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedProblems.some(p => p.id === problem.id)}
                              onCheckedChange={() => handleSelectProblem(problem)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{problem.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{problem.category}</Badge>
                          </TableCell>
                          <TableCell>
                             <Badge variant="outline" className="gap-1.5 w-20 justify-center">
                              <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(problem.difficulty))} aria-hidden="true"></span>
                              {problem.difficulty}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
            {errors.problemIds && <p className="text-sm text-red-500">{errors.problemIds.message}</p>}
          </div>
        </form>
      </ScrollArea>
    </>
  );
}

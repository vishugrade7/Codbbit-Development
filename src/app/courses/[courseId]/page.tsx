
'use client';

import { useMemo, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { Course, Question } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const firestore = useFirestore();

  const courseDocRef = useMemoFirebase(() => {
    if (!firestore || !courseId) return null;
    if (courseId === 'soql') return null; // Handle static page separately
    return doc(firestore, 'courses', courseId);
  }, [firestore, courseId]);

  const { data: course, isLoading: isLoadingCourse } = useDoc<Course>(courseDocRef);

  const problemsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'problems');
  }, [firestore]);

  const { data: categoriesData, isLoading: isLoadingProblems } = useCollection<{id: string, Questions: Partial<Question>[]}>(problemsCollectionRef);

  const courseDetails = useMemo(() => {
    if (courseId === 'soql') {
      return {
        title: 'SOQL Tutorial',
        description: 'A comprehensive guide to mastering Salesforce Object Query Language.',
        problems: [], // Static page has its own navigation
      };
    }
    if (!course || !categoriesData) return null;

    const allProblems = categoriesData.flatMap(cat => 
        (cat.Questions || []).map((q, index) => ({...q, category: cat.id, id: q.id || `${cat.id}-${q.title}-${index}` }))
    );

    const courseProblems = course.problemIds.map(id => allProblems.find(p => p.id === id)).filter(Boolean) as (Partial<Question> & { category: string, id: string })[];

    return {
      title: course.title,
      description: course.description,
      problems: courseProblems,
    };
  }, [course, categoriesData, courseId]);

  useEffect(() => {
    if (courseId === 'soql') {
      router.replace('/courses/soql');
    }
    // Redirect away from the old, removed apex page
    if (courseId === 'apex') {
      router.replace('/courses');
    }
  }, [courseId, router]);
  
  const getDifficultyDotClass = (difficulty: string | undefined) => {
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

  if (isLoadingCourse || isLoadingProblems) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!courseDetails) {
    return notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
         <Button variant="ghost" onClick={() => router.push('/courses')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <h1 className="text-3xl font-bold font-headline tracking-tight mt-4">{courseDetails.title}</h1>
        <p className="text-muted-foreground mt-1">{courseDetails.description}</p>
      </header>

      {courseDetails.problems.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Problems in this Course</CardTitle>
                <CardDescription>A list of all problems included in the "{courseDetails.title}" course.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {courseDetails.problems.map((problem, index) => (
                    <TableRow key={`${problem.id}-${index}`}>
                    <TableCell className="font-medium">
                        <Link href={`/problems/${problem.category}/${problem.id}`} className="hover:underline">
                            {problem.title}
                        </Link>
                    </TableCell>
                    <TableCell>{problem.category}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className="gap-1.5 w-20 justify-center">
                        <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(problem.difficulty))} aria-hidden="true"></span>
                        {problem.difficulty}
                        </Badge>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

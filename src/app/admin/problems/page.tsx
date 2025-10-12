
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2, Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Question } from '@/lib/types';
import { collection, doc, writeBatch } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { AddProblemForm } from '@/components/AddProblemForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { seedData } from '@/lib/seed-data';

export default function ManageProblemsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Question | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<Question | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const questionsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'questions');
  }, [firestore]);

  const { data: problems, isLoading, refetch } = useCollection<Question>(questionsCollectionRef);

  const handleAddNewProblem = () => {
    setEditingProblem(null);
    setIsSheetOpen(true);
  };
  
  const handleEditProblem = (problem: Question) => {
    setEditingProblem(problem);
    setIsSheetOpen(true);
  };
  
  const handleDeleteProblem = async () => {
    if (!problemToDelete || !firestore) return;

    const batch = writeBatch(firestore);
    const docRef = doc(firestore, 'questions', problemToDelete.id);
    batch.delete(docRef);
    
    await batch.commit();

    setIsDeleteDialogOpen(false);
    setProblemToDelete(null);
    refetch();
    toast({ title: 'Problem Deleted', description: `"${problemToDelete.title}" has been removed.`});
  };
  
  const confirmDelete = (problem: Question) => {
    setProblemToDelete(problem);
    setIsDeleteDialogOpen(true);
  };

  const handleSeedData = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(firestore);
      const questionsRef = collection(firestore, 'questions');
      seedData.forEach(problem => {
        const docRef = doc(questionsRef);
        batch.set(docRef, problem);
      });
      await batch.commit();
      toast({ title: 'Success', description: 'Sample problems have been added.' });
      refetch();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not seed data.', variant: 'destructive' });
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Problem Management</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove problems.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleAddNewProblem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Problem
          </Button>
           <Button variant="outline" onClick={handleSeedData} disabled={isSeeding}>
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Seed Problems
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Problem List</CardTitle>
          <CardDescription>A list of all problems in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems?.map((problem) => (
                  <TableRow key={problem.id}>
                    <TableCell className="font-medium">{problem.title}</TableCell>
                    <TableCell>{problem.category}</TableCell>
                    <TableCell>{problem.difficulty}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditProblem(problem)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmDelete(problem)} className="text-red-500">
                             <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-4xl w-full p-0">
          <SheetHeader className="p-6">
            <SheetTitle>{editingProblem ? 'Edit Problem' : 'Add New Problem'}</SheetTitle>
            <SheetDescription>
              {editingProblem ? 'Update the details of this problem.' : 'Fill in the details to create a new problem.'}
            </SheetDescription>
          </SheetHeader>
          <AddProblemForm 
            problem={editingProblem} 
            onFormSubmit={() => {
              setIsSheetOpen(false);
              refetch();
            }}
          />
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this problem?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the problem
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProblem} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

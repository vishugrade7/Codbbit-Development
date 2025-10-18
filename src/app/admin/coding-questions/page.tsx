
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Plus, Pencil, Loader2, Trash2, MoreHorizontal, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import type { Question } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddProblemForm } from '@/components/AddProblemForm';
import Link from 'next/link';
import { ProblemFilter } from '@/components/ProblemFilter';
import type { FilterState } from '@/components/ProblemFilter';
import { cn } from '@/lib/utils';


interface Category {
  id: string;
  imageUrl?: string;
  Questions?: Partial<Question>[];
}

export default function CodingQuestionsPage() {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false);
  const [sampleJson, setSampleJson] = useState('');
  const [isSavingSample, setIsSavingSample] = useState(false);
  const [selectedCategoryForJson, setSelectedCategoryForJson] = useState<string | null>(null);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Partial<Question> | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    status: 'All',
    difficulty: 'All',
    search: '',
  });


  const categoriesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'problems');
  }, [firestore]);

  const { data: categories, isLoading: isLoadingCategories, refetch: refetchCategories } = useCollection<Category>(categoriesCollectionRef);

  const allProblems = useMemo(() => {
    if (!categories) return [];
    return categories.flatMap(cat => 
        (cat.Questions || []).map(q => ({...q, category: cat.id, id: q.id || (q.title! + cat.id) })) // Add category and a unique-ish ID
    );
  }, [categories]);

  const filteredProblems = useMemo(() => {
    // Placeholder for solved problems logic
    const solvedProblemIds = new Set<string>();
    
    return allProblems.filter(problem => {
      const searchMatch = !filters.search || problem.title?.toLowerCase().includes(filters.search.toLowerCase());
      const difficultyMatch = filters.difficulty === 'All' || problem.difficulty === filters.difficulty;
      const statusMatch = filters.status === 'All' ||
        (filters.status === 'Solved' && solvedProblemIds.has(problem.id!)) ||
        (filters.status === 'Unsolved' && !solvedProblemIds.has(problem.id!));
        
      return searchMatch && difficultyMatch && statusMatch;
    });
  }, [allProblems, filters]);


  const handleAddNewProblem = () => {
    setEditingProblem(null);
    setIsSheetOpen(true);
  };

  const handleEditProblem = (problem: Partial<Question>) => {
    setEditingProblem(problem);
    setIsSheetOpen(true);
  };
  
  const handleAddNewCategory = () => {
    setCurrentCategory(null);
    setCategoryName('');
    setCategoryImageUrl('');
    setIsEditingCategory(true);
  };
  
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.id);
    setCategoryImageUrl(category.imageUrl || '');
    setIsEditingCategory(true);
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    if (!firestore) return;
    const categoryDocRef = doc(firestore, 'problems', categoryId);
    deleteDocumentNonBlocking(categoryDocRef);
    toast({ title: 'Category Deleted', description: `Category "${categoryId}" has been deleted.`});
    refetchCategories();
  }

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: 'Error',
        description: 'Category name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!firestore) {
      toast({ title: 'Error', description: 'Database not available.', variant: 'destructive' });
      return;
    }

    setIsSavingCategory(true);
    try {
      const categoryDocRef = doc(firestore, 'problems', categoryName.trim());
      
      const categoryData = {
          imageUrl: categoryImageUrl.trim(),
          createdAt: new Date().toISOString(),
          Questions: currentCategory?.Questions || [],
      };

      setDocumentNonBlocking(categoryDocRef, categoryData, {merge: true});

      if (currentCategory && currentCategory.id !== categoryName.trim()) {
        const oldCategoryDocRef = doc(firestore, 'problems', currentCategory.id);
        deleteDocumentNonBlocking(oldCategoryDocRef);
      }

      toast({
        title: `Category ${currentCategory ? 'Updated' : 'Saved'}`,
        description: `The category "${categoryName}" has been ${currentCategory ? 'updated' : 'created'}.`,
      });

      setIsEditingCategory(false);
      setCurrentCategory(null);
      setCategoryName('');
      setCategoryImageUrl('');
      refetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast({
        title: 'Error',
        description: 'Could not save the category.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleAddProblemFromJson = async () => {
    if (!selectedCategoryForJson) {
      toast({ title: 'Error', description: 'Please select a category.', variant: 'destructive' });
      return;
    }
    if (!sampleJson.trim()) {
      toast({ title: 'Error', description: 'JSON cannot be empty.', variant: 'destructive' });
      return;
    }
    if (!firestore) {
      toast({ title: 'Error', description: 'Database not available.', variant: 'destructive' });
      return;
    }

    setIsSavingSample(true);
    try {
      const problemData = JSON.parse(sampleJson) as Partial<Question>;

      if (!problemData.title) {
        throw new Error("JSON must contain a 'title' field.");
      }
      
      const categoryDocRef = doc(firestore, 'problems', selectedCategoryForJson);
      
      await updateDoc(categoryDocRef, {
        Questions: arrayUnion(problemData)
      });


      toast({
        title: 'Problem Added',
        description: `The problem "${problemData.title}" has been added to the "${selectedCategoryForJson}" category.`,
      });
      setSampleJson('');
      setIsSampleDialogOpen(false);
      setSelectedCategoryForJson(null);
      refetchCategories();
    } catch (error: any) {
      console.error('Failed to add problem from JSON:', error);
      toast({
        title: 'Error Adding Problem',
        description: error.message || 'Could not parse or save the problem from JSON.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingSample(false);
    }
  };
  
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

  const handleDeleteProblem = async (problem: Partial<Question>) => {
    if (!firestore || !problem.category || !problem.title) return;

    try {
      const categoryDocRef = doc(firestore, 'problems', problem.category);
      const docSnap = await getDoc(categoryDocRef);
      if (docSnap.exists()) {
        const categoryData = docSnap.data() as Category;
        const problemToDelete = categoryData.Questions?.find(q => q.title === problem.title);
        
        if (problemToDelete) {
          await updateDoc(categoryDocRef, {
            Questions: arrayRemove(problemToDelete)
          });
          toast({ title: 'Problem Deleted', description: `"${problem.title}" has been removed.`});
          refetchCategories();
        }
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not delete problem.', variant: 'destructive'});
    }
  }

  const handleDownloadSample = () => {
    const sampleProblem = {
      title: "Your Problem Title",
      description: "A clear and detailed description of what the user needs to do.",
      difficulty: "Easy", // Can be "Easy", "Medium", or "Hard"
      category: "The category this problem belongs to (e.g., SOQL, Apex Basics)",
      starterCode: "public class Solution {\n    // Your starter code here\n}",
      testcases: "@isTest\nprivate class SolutionTest {\n    // Your test cases here\n}",
      examples: [
        {
          input: "Example input",
          output: "Expected output",
          explanation: "Optional explanation of the example."
        }
      ],
      hints: [
        { value: "A helpful hint to guide the user." },
        { value: "Another hint if they need more help." }
      ],
      tags: ["Array", "Hash Table"],
      isPremium: false
    };

    const jsonString = JSON.stringify(sampleProblem, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'sample-problem.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Problem Management</h1>
          <p className="text-muted-foreground mt-1">View, edit, or add new Apex coding challenges to the platform.</p>
        </div>
        <Button onClick={() => toast({ title: 'Action Triggered', description: 'Adding managed package...' })}>
          <Plus />
          Add Managed Package
        </Button>
      </header>
      
      <div className="flex items-center justify-between mb-4">
        <Dialog open={isCategoryDialogOpen} onOpenChange={(isOpen) => { setIsCategoryDialogOpen(isOpen); setIsEditingCategory(false); }}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Pencil />
              Manage Categories
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
              <DialogDescription>
                Add, edit, or remove problem categories.
              </DialogDescription>
            </DialogHeader>

            {isEditingCategory ? (
                 <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="category-name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., SOQL"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image-url" className="text-right">
                      Image URL
                    </Label>
                    <Input
                      id="image-url"
                      value={categoryImageUrl}
                      onChange={(e) => setCategoryImageUrl(e.target.value)}
                      className="col-span-3"
                      placeholder="Optional: URL for category image"
                    />
                  </div>
                   <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditingCategory(false)}>Cancel</Button>
                      <Button onClick={handleSaveCategory} disabled={isSavingCategory}>
                        {isSavingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                    </DialogFooter>
                </div>
            ) : (
              <>
              <ScrollArea className="max-h-96">
                <div className="space-y-2 pr-6">
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  categories?.map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-md border p-3">
                      <span className="font-medium">{category.id} ({category.Questions?.length || 0})</span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCategory(category)}>
                          <Pencil />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
                <Button onClick={handleAddNewCategory} className="w-full">
                  <Plus />
                  Add New Category
                </Button>
              </DialogFooter>
            </>
            )}
          </DialogContent>
        </Dialog>
        
        <div className="flex items-center gap-2">
           <Dialog open={isSampleDialogOpen} onOpenChange={setIsSampleDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download />
                    Add From JSON
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Add Problem from JSON</DialogTitle>
                    <DialogDescription>
                        Select a category and paste the JSON structure of a problem below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="json-category">Category</Label>
                      <Select onValueChange={setSelectedCategoryForJson} value={selectedCategoryForJson || undefined}>
                        <SelectTrigger id="json-category">
                          <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            categories?.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.id}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                        value={sampleJson}
                        onChange={(e) => setSampleJson(e.target.value)}
                        placeholder='{
  "title": "Your Problem Title",
  "difficulty": "Easy",
  "description": "Problem description here...",
  ...
}'
                        className="h-64 font-code text-xs"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleAddProblemFromJson} disabled={isSavingSample}>
                        {isSavingSample && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Problem
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleDownloadSample}>
            <Download />
            Download Sample
          </Button>
          <Button onClick={handleAddNewProblem}>
            <Plus />
            Add Problem
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <ProblemFilter onFilterChange={setFilters} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem List</CardTitle>
          <CardDescription>A comprehensive list of all coding challenges.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCategories ? (
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
                {filteredProblems.map((problem) => (
                  <TableRow key={problem.id}>
                    <TableCell className="font-medium">{problem.title}</TableCell>
                    <TableCell>{problem.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1.5 w-20 justify-center">
                        <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(problem.difficulty))} aria-hidden="true"></span>
                        {problem.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditProblem(problem)}>
                            Edit
                          </DropdownMenuItem>
                           <DropdownMenuItem asChild>
                            <Link href={`/problems/${problem.category}/${problem.id}`}>
                              Solve
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteProblem(problem)} className="text-red-500">
                             <Trash2 />
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
        <SheetContent className="sm:max-w-4xl w-full p-0 flex flex-col">
          <AddProblemForm 
            problem={editingProblem} 
            onFormSubmit={() => {
              setIsSheetOpen(false);
              refetchCategories();
            }}
             categories={categories?.map(c => c.id) || []}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

    
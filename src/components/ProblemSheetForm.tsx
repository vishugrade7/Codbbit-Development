
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Question, ProblemSheet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FilePlus2, Search, X, Check, Filter, BarChartHorizontal, CheckCircle, Trash2 } from 'lucide-react';
import { HashLoader } from 'react-spinners';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';

type Category = {
  id: string;
  name: string;
  Questions?: Partial<Question>[];
};

interface ProblemSheetFormProps {
    sheetId?: string;
}


export function ProblemSheetForm({ sheetId }: ProblemSheetFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [sheetName, setSheetName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedProblems, setSelectedProblems] = useState<Partial<Question>[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const isEditMode = useMemo(() => !!sheetId, [sheetId]);

  // Fetch existing sheet if in edit mode
  const sheetDocRef = useMemoFirebase(() => {
    if (!firestore || !sheetId) return null;
    return doc(firestore, 'sheets', sheetId);
  }, [firestore, sheetId]);

  const { data: existingSheet, isLoading: isLoadingSheet } = useDoc<ProblemSheet>(sheetDocRef);

  const problemsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'problems');
  }, [firestore]);

  const { data: categoriesData, isLoading: isLoadingProblems } = useCollection<Category>(problemsCollectionRef);

  const allProblems = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.flatMap(cat =>
      (cat.Questions || []).map(q => ({
        ...q,
        category: cat.id,
        id: q.id || `${cat.id}-${q.title}`, // Ensure a unique ID
      }))
    );
  }, [categoriesData]);
  
  
  useEffect(() => {
    if (isEditMode && existingSheet && allProblems.length > 0) {
        setSheetName(existingSheet.name);
        const preselectedProblems = existingSheet.questionIds.map(id => 
            allProblems.find(p => (p.id || p.title) === id)
        ).filter((p): p is Partial<Question> => !!p);
        setSelectedProblems(preselectedProblems);
    }
  }, [isEditMode, existingSheet, allProblems]);

  const filteredProblems = useMemo(() => {
    return allProblems.filter(problem => {
      const searchMatch = !searchQuery || problem.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const difficultyMatch = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
      return searchMatch && difficultyMatch;
    });
  }, [allProblems, searchQuery, difficultyFilter]);

  const handleSelectProblem = (problem: Partial<Question>) => {
    setSelectedProblems(prev => {
      if (prev.find(p => p.id === problem.id)) {
        return prev.filter(p => p.id !== problem.id);
      }
      return [...prev, problem];
    });
  };
  
  const handleRemoveProblem = (problemId: string) => {
    setSelectedProblems(prev => prev.filter(p => p.id !== problemId));
  }

  const handleSaveSheet = async () => {
    if (!sheetName.trim()) {
      toast({ title: 'Error', description: 'Please enter a name for your sheet.', variant: 'destructive' });
      return;
    }
    if (selectedProblems.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one problem.', variant: 'destructive' });
      return;
    }
    if (!firestore || !user) {
        toast({ title: 'Error', description: 'You must be logged in to create a sheet.', variant: 'destructive' });
        return;
    }
    
    setSaveState('saving');
    try {
        if (isEditMode && sheetDocRef && existingSheet) {
            const updatedSheet = {
                ...existingSheet,
                name: sheetName,
                questionIds: selectedProblems.map(p => p.id as string),
            };
            setDocumentNonBlocking(sheetDocRef, updatedSheet, {});
        } else {
            const sheetsCollection = collection(firestore, 'sheets');
            const newSheetId = uuidv4();
            const newSheet: ProblemSheet = {
                id: newSheetId,
                name: sheetName,
                questionIds: selectedProblems.map(p => p.id as string),
                createdBy: user.uid,
                followers: 0,
            };
            const newDocRef = doc(sheetsCollection, newSheetId);
            await setDocumentNonBlocking(newDocRef, newSheet, {});
        }

        setSaveState('saved');
        toast({ title: 'Success!', description: `Problem sheet "${sheetName}" has been ${isEditMode ? 'updated' : 'created'}.` });
        
        setTimeout(() => {
            router.push('/sheets');
        }, 1500);

    } catch(e) {
        console.error("Failed to save sheet:", e);
        toast({ title: 'Error', description: `Could not ${isEditMode ? 'update' : 'create'} the problem sheet.`, variant: 'destructive'});
        setSaveState('idle');
    }
  };

  const handleDeleteSheet = async () => {
    if (!sheetDocRef || !isEditMode) return;
    try {
      await deleteDocumentNonBlocking(sheetDocRef);
      toast({
        title: "Sheet Deleted",
        description: `The sheet "${sheetName}" has been permanently deleted.`,
      });
      router.push('/sheets');
    } catch (error) {
       toast({
        title: "Error",
        description: `Could not delete the sheet.`,
        variant: "destructive",
      });
    }
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

   const FilterRadioGroup = ({ title, icon, options, value, onValueChange }: { title: string, icon: React.ReactNode, options: string[], value: string, onValueChange: (value: any) => void }) => (
    <div className="grid gap-2">
      <p className="font-medium text-sm flex items-center gap-2 text-muted-foreground">
        {icon}
        {title}
      </p>
      {options.map(option => (
        <button key={option} onClick={() => onValueChange(option)} className="flex items-center text-sm text-foreground hover:text-primary">
          <div className="w-5 h-5 mr-2 flex items-center justify-center">
            {value === option && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
          {option}
        </button>
      ))}
    </div>
  );
  
  const isLoading = isLoadingProblems || (isEditMode && isLoadingSheet);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" onClick={() => router.push('/sheets')}>
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to All Sheets
            </Button>
            <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search problems..."
                    className="pl-9 h-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="w-10 h-10">
                        <Filter className="h-4 w-4" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-4" align="end">
                        <div className="grid gap-4">
                            <FilterRadioGroup 
                                title="Difficulty"
                                icon={<BarChartHorizontal className="h-4 w-4" />}
                                options={['All', 'Easy', 'Medium', 'Hard']}
                                value={difficultyFilter}
                                onValueChange={setDifficultyFilter}
                            />
                        </div>
                    </PopoverContent>
                </Popover>
                 {isEditMode && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="w-10 h-10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this sheet?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the problem sheet.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteSheet}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
              </div>
        </div>
        <Input
            placeholder="Enter sheet name..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-4xl font-bold font-headline tracking-tight p-0 h-auto"
            value={sheetName}
            onChange={e => setSheetName(e.target.value)}
        />
        <p className="text-muted-foreground mt-1">
          {isEditMode ? 'Modify your custom problem sheet.' : 'Build a custom problem sheet to share with friends, for interviews, or for targeted practice.'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <HashLoader color="#456eff" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProblems.map(problem => (
                        <TableRow
                          key={problem.id || `${problem.title}-${problem.category}`}
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
             <CardContent className="p-6">
                <div className="mb-4">
                   <p className="text-lg font-semibold">
                    Sheet Summary
                  </p>
                   <p className="text-sm text-muted-foreground">
                    Review your selections before saving the sheet.
                  </p>
                </div>
                
                <h4 className="font-medium text-sm mb-2">Selected Problems ({selectedProblems.length})</h4>

                <div className="border rounded-md min-h-[200px]">
                  <ScrollArea className="h-80">
                    <div className="p-4">
                      {selectedProblems.length === 0 ? (
                          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-8">
                              <FilePlus2 className="h-10 w-10 mb-2" />
                              <p className="font-medium">Your sheet is empty</p>
                              <p className="text-xs">Check problems on the left to add them.</p>
                          </div>
                      ) : (
                          <div className="space-y-2">
                            {selectedProblems.map(problem => (
                                  <div key={problem.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                                      <span className="text-sm font-medium">{problem.title}</span>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveProblem(problem.id as string)}>
                                          <X className="h-4 w-4"/>
                                      </Button>
                                  </div>
                            ))}
                          </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
                <Button 
                  className={cn("w-full mt-6", saveState === 'saved' ? 'bg-green-500 hover:bg-green-600' : '')} 
                  onClick={handleSaveSheet} 
                  disabled={saveState !== 'idle'}
                >
                  {saveState === 'saving' && <HashLoader color="#456eff" size={20} />}
                  {saveState === 'saved' && <Check className="mr-2 h-4 w-4"/>}
                  {saveState === 'idle' && (isEditMode ? 'Update Sheet' : 'Save Sheet')}
                  {saveState === 'saving' && 'Saving...'}
                  {saveState === 'saved' && 'Saved!'}
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

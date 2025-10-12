
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { ProblemSheet, Question, UserProfile } from '@/lib/types';
import { Loader2, ArrowLeft, Users, Copy, Search, CheckCircle2, Circle, Tag, Filter, Check, Bookmark, FileText, BarChartHorizontal, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';

type SheetQuestion = Question & {
  isSolved: boolean;
};

const ProgressChart = ({ percentage, easy, medium, hard, total }: { percentage: number, easy: any, medium: any, hard: any, total: any }) => (
  <div className="flex items-center gap-6">
    <div className="relative">
      <svg className="h-32 w-32 -rotate-90">
        <circle cx="64" cy="64" r="54" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-gray-200 dark:text-gray-700" />
        <circle cx="64" cy="64" r="54" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-sky-500" strokeDasharray="339.292" strokeDashoffset={339.292 - (percentage / 100) * 339.292} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{Math.round(percentage)}%</span>
      </div>
    </div>
    <div className="text-sm">
      <p className="font-semibold mb-2">Total Solved: <span className="font-normal">{total.solved}/{total.count}</span></p>
      <ul className="space-y-1">
        <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500"></span>Easy</span> <span>{easy.solved}/{easy.count}</span></li>
        <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-500"></span>Medium</span> <span>{medium.solved}/{medium.count}</span></li>
        <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500"></span>Hard</span> <span>{hard.solved}/{hard.count}</span></li>
      </ul>
    </div>
  </div>
);


export function SheetDisplayPage({ sheetId }: { sheetId: string }) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFollowing, setIsFollowing] = useState(false);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);


  // 1. Fetch the Problem Sheet document
  const sheetDocRef = useMemoFirebase(() => {
    if (!firestore || !sheetId) return null;
    return doc(firestore, 'sheets', sheetId);
  }, [firestore, sheetId]);

  const { data: sheet, isLoading: isLoadingSheet } = useDoc<ProblemSheet>(sheetDocRef);

  // 2. Fetch the creator's profile
  const creatorDocRef = useMemoFirebase(() => {
    if (!firestore || !sheet?.createdBy) return null;
    return doc(firestore, 'users', sheet.createdBy);
  }, [firestore, sheet?.createdBy]);
  
  const { data: creator } = useDoc<UserProfile>(creatorDocRef);

  // 3. Fetch all problems from all categories
  const problemsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'problems');
  }, [firestore]);

  const { data: categoriesData, isLoading: isLoadingProblems } = useCollection<{id: string, Questions: Partial<Question>[]}>(problemsCollectionRef);
  
  useEffect(() => {
    if (userProfile && sheet) {
        setIsFollowing(userProfile.followedSheets?.includes(sheet.id) || false);
    }
  }, [userProfile, sheet]);

  // 4. Combine and filter the questions for the sheet
  const sheetQuestions = useMemo((): SheetQuestion[] => {
    if (!sheet || !categoriesData) return [];

    const allProblems = categoriesData.flatMap(cat =>
      (cat.Questions || []).map(q => ({
        ...q,
        category: cat.id,
      }))
    );

    const solvedIds = new Set(userProfile?.solvedProblems ? Object.keys(userProfile.solvedProblems) : []);

    return sheet.questionIds
      .map(id => {
        const problem = allProblems.find(p => (p.id || p.title) === id);
        if (!problem) return null;

        return {
          ...problem,
          isSolved: solvedIds.has(problem.id!) || solvedIds.has(problem.title!),
        } as SheetQuestion;
      })
      .filter((p): p is SheetQuestion => p !== null);

  }, [sheet, categoriesData, userProfile]);
  
  const filteredSheetQuestions = useMemo(() => {
      let questions = sheetQuestions;
      if (activeCategory !== 'All Topics') {
        questions = questions.filter(q => q.category === activeCategory);
      }
      if (searchQuery) {
        questions = questions.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));
      }
       if (difficultyFilter !== 'All') {
        questions = questions.filter(q => q.difficulty === difficultyFilter);
      }
      if (statusFilter !== 'All') {
        questions = questions.filter(q => (statusFilter === 'Solved' ? q.isSolved : !q.isSolved));
      }
      return questions;
  }, [sheetQuestions, searchQuery, activeCategory, difficultyFilter, statusFilter])
  
  const topics = useMemo(() => {
    if (!sheetQuestions) return [];
    const categories = new Set(sheetQuestions.map(q => q.category));
    return ['All Topics', ...Array.from(categories)];
  }, [sheetQuestions]);


  // 5. Calculate progress stats
  const progressStats = useMemo(() => {
    const total = sheetQuestions.length;
    const solved = sheetQuestions.filter(q => q.isSolved).length;
    const easy = sheetQuestions.filter(q => q.difficulty === 'Easy');
    const medium = sheetQuestions.filter(q => q.difficulty === 'Medium');
    const hard = sheetQuestions.filter(q => q.difficulty === 'Hard');

    return {
      total: { count: total, solved: solved },
      percentage: total > 0 ? (solved / total) * 100 : 0,
      easy: { count: easy.length, solved: easy.filter(q => q.isSolved).length },
      medium: { count: medium.length, solved: medium.filter(q => q.isSolved).length },
      hard: { count: hard.length, solved: hard.filter(q => q.isSolved).length },
    };
  }, [sheetQuestions]);


  if (isLoadingSheet || isLoadingProblems) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (!sheet) {
    notFound();
  }
  
  const handleFollow = () => {
    if (!user || !userDocRef) {
        toast({ title: 'Not Logged In', description: 'You must be logged in to follow a sheet.', variant: 'destructive'});
        return;
    }

    const currentlyFollowing = !isFollowing;
    setIsFollowing(currentlyFollowing);

    if (currentlyFollowing) {
        updateDocumentNonBlocking(userDocRef, { followedSheets: arrayUnion(sheet.id) });
    } else {
        updateDocumentNonBlocking(userDocRef, { followedSheets: arrayRemove(sheet.id) });
    }

    toast({
        title: currentlyFollowing ? "Following" : "Unfollowed",
        description: `You are now ${currentlyFollowing ? 'following' : 'no longer following'} the "${sheet.name}" sheet.`,
    });
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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
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
  
  const isOwner = user?.uid === sheet.createdBy;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => router.push('/sheets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sheets
        </Button>
         <div className="flex flex-1 items-center justify-end gap-2">
            <div className="relative w-64 focus-within:w-80 transition-all duration-300">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search problems..."
                className="pl-9 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="w-10 h-10">
                    <Filter className="h-4 w-4" />
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-4 glass:backdrop-blur-xl" align="end">
                  <div className="grid gap-4">
                      <FilterRadioGroup
                        title="Status"
                        icon={<CheckCircle className="h-4 w-4" />}
                        options={['All', 'Solved', 'Unsolved']}
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      />
                      <Separator />
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
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
           <div className="space-y-4">
              <h1 className="text-4xl font-bold font-headline">{sheet.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={creator?.avatarUrl} />
                        <AvatarFallback>{getInitials(creator?.name)}</AvatarFallback>
                    </Avatar>
                    <span>By {creator?.name || '...'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                    <Users />
                    <span>{sheet.followers} followers</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 {!isOwner && (
                    <Button onClick={handleFollow} size="sm" className={cn("rounded-full", isFollowing ? 'bg-muted text-muted-foreground' : 'bg-blue-600 hover:bg-blue-700 text-white')}>
                        <Bookmark className={cn("mr-2 h-4 w-4", isFollowing && "fill-current")} /> 
                        {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                 )}
              </div>
          </div>
          <Card>
            <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
            <CardContent>
                <ProgressChart {...progressStats} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Topics Covered</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {topics.map(topic => (
                    <Badge 
                        key={topic} 
                        variant={activeCategory === topic ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => setActiveCategory(topic)}
                    >
                        <Tag />
                        {topic}
                    </Badge>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Problems ({sheetQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-16 text-center">#</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSheetQuestions.map((q, index) => (
                                <TableRow key={q.id || q.title}>
                                    <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell>
                                        <Link href={`/problems/${q.category}/${q.id || q.title}`} className="font-medium hover:underline">
                                            {q.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{q.category}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="gap-1.5 w-24 justify-center">
                                          <span className={cn("size-1.5 rounded-full", getDifficultyDotClass(q.difficulty))} aria-hidden="true"></span>
                                          {q.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {q.isSolved ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

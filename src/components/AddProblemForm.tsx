
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { doc, updateDoc, arrayUnion, getDoc, arrayRemove } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Question } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { generateProblem } from '@/ai/flows/generate-problem';
import { Switch } from './ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';

const problemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  starterCode: z.string().optional(),
  testcases: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPremium: z.boolean().optional(),
  metadataType: z.string().optional(),
  object: z.string().optional(),
  youtubeSolutionUrl: z.string().url().or(z.literal('')).optional(),
  examples: z.string().optional().transform((val, ctx) => {
    if (!val) return [];
    try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Examples must be a valid JSON array."});
            return z.NEVER;
        }
        return parsed;
    } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON for examples."});
        return z.NEVER;
    }
  }),
  hints: z.string().optional().transform((val, ctx) => {
      if (!val) return [];
      try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Hints must be a valid JSON array."});
            return z.NEVER;
        }
        return parsed;
      } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON for hints."});
          return z.NEVER;
      }
  }),
}).refine(data => {
    if (data.metadataType === 'Trigger') {
        return !!data.object && data.object.length > 0;
    }
    return true;
}, {
    message: 'Object is required for Trigger metadata type.',
    path: ['object'],
});

type ProblemFormData = z.infer<typeof problemSchema>;

interface AddProblemFormProps {
  problem?: Partial<Question> | null;
  onFormSubmit: () => void;
  categories: string[];
}

export function AddProblemForm({ problem, onFormSubmit, categories }: AddProblemFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { control, register, handleSubmit, reset, setValue, getValues, watch, formState: { errors } } = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      category: '',
      difficulty: 'Easy',
      description: '',
      starterCode: '',
      testcases: '',
      tags: [],
      isPremium: false,
      metadataType: 'Class',
      object: '',
      youtubeSolutionUrl: '',
      examples: '[]',
      hints: '[]',
    }
  });

  const metadataType = watch('metadataType');
  
  useEffect(() => {
    if (problem) {
      reset({
        id: problem.id || uuidv4(),
        title: problem.title,
        category: problem.category,
        difficulty: problem.difficulty,
        description: problem.description,
        starterCode: problem.starterCode,
        testcases: problem.testcases,
        tags: problem.tags,
        isPremium: problem.isPremium || false,
        metadataType: problem.metadataType || 'Class',
        object: problem.object || '',
        youtubeSolutionUrl: problem.youtubeSolutionUrl || '',
        examples: problem.examples ? JSON.stringify(problem.examples, null, 2) : '[]',
        hints: problem.hints ? JSON.stringify(problem.hints, null, 2) : '[]',
      });
    } else {
        reset({
            id: uuidv4(),
            title: '',
            category: '',
            difficulty: 'Easy',
            description: '',
            starterCode: '',
            testcases: '',
            tags: [],
            isPremium: false,
            metadataType: 'Class',
            object: '',
            youtubeSolutionUrl: '',
            examples: '[]',
            hints: '[]',
        });
    }
  }, [problem, reset]);

  const handleGenerateWithAI = async () => {
    const { title, category, difficulty, metadataType, object } = getValues();
    if (!title || !category || !difficulty || !metadataType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out Title, Category, Difficulty, and Metadata Type before generating with AI.',
        variant: 'destructive',
      });
      return;
    }
     if (metadataType === 'Trigger' && !object) {
      toast({
        title: 'Missing Information',
        description: 'Please provide the Salesforce Object for the trigger.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProblem({ title, category, difficulty, metadataType, object });
      setValue('description', result.description);
      setValue('starterCode', result.starterCode);
      setValue('testcases', result.testcases);
      setValue('examples', JSON.stringify(result.examples, null, 2));
      setValue('hints', JSON.stringify(result.hints, null, 2));
      toast({
        title: 'AI Generation Complete',
        description: 'Problem details have been generated.',
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      toast({
        title: 'AI Generation Failed',
        description: 'Could not generate problem details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: ProblemFormData) => {
    setIsSubmitting(true);
    if (!firestore) {
      toast({ title: 'Error', description: 'Database not initialized.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    try {
      const newProblemData = {
        ...data,
        id: data.id || uuidv4(),
      };
      
      // If we are editing an existing problem
      if (problem && problem.title && problem.category) {
          const oldCategoryDocRef = doc(firestore, 'problems', problem.category);
          const oldDocSnap = await getDoc(oldCategoryDocRef);
          
          if (oldDocSnap.exists()) {
              const oldCategoryData = oldDocSnap.data();
              const problemToRemove = oldCategoryData.Questions.find((q: Partial<Question>) => q.title === problem.title);
              
              if (problemToRemove) {
                // If category changed, remove from old and add to new
                if (problem.category !== newProblemData.category) {
                    await updateDoc(oldCategoryDocRef, { Questions: arrayRemove(problemToRemove) });
                    const newCategoryDocRef = doc(firestore, 'problems', newProblemData.category);
                    await updateDoc(newCategoryDocRef, { Questions: arrayUnion(newProblemData) });
                } else {
                // If category is same, update the item in place
                   const updatedQuestions = oldCategoryData.Questions.map((q: Partial<Question>) => 
                    q.title === problem.title ? newProblemData : q
                   );
                   await updateDoc(oldCategoryDocRef, { Questions: updatedQuestions });
                }
              } else { // Fallback if title changed, try to find by ID
                 const problemToRemoveById = oldCategoryData.Questions.find((q: Partial<Question>) => q.id === problem.id);
                 if (problemToRemoveById) {
                    await updateDoc(oldCategoryDocRef, { Questions: arrayRemove(problemToRemoveById) });
                    const newCategoryDocRef = doc(firestore, 'problems', newProblemData.category);
                    await updateDoc(newCategoryDocRef, { Questions: arrayUnion(newProblemData) });
                 }
              }
          }
      } else { // Adding a new problem
        const categoryDocRef = doc(firestore, 'problems', data.category);
        await updateDoc(categoryDocRef, {
            Questions: arrayUnion(newProblemData)
        }, { merge: true });
      }
      
      toast({
          title: problem ? 'Problem Updated' : 'Problem Added',
          description: `The problem "${data.title}" has been saved.`,
      });
      onFormSubmit();
    } catch (error) {
      console.error('Failed to save problem:', error);
      toast({ title: 'Save Failed', description: 'An error occurred while saving the problem.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
};

  return (
    <>
      <SheetHeader className="p-6 border-b flex-row justify-between items-center">
        <div>
          <SheetTitle>{problem ? 'Edit Problem' : 'Add New Problem'}</SheetTitle>
          <SheetDescription>
            {problem ? 'Update the details of this problem.' : 'Fill in the details to create a new problem.'}
          </SheetDescription>
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onFormSubmit}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {problem ? 'Update Problem' : 'Add Problem'}
            </Button>
        </div>
      </SheetHeader>
      <ScrollArea className="flex-grow">
        <div className="space-y-6 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Problem Details</CardTitle>
              <CardDescription>Provide the core information for this coding challenge.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Problem Title</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Controller
                      name="difficulty"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} rows={6} />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Code & Tests</CardTitle>
                  <CardDescription>Provide the starter code and test cases.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate with AI
                </Button>
            </CardHeader>
             <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="starterCode">Starter Code</Label>
                  <Textarea id="starterCode" {...register('starterCode')} rows={10} className="font-code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testcases">Test Cases</Label>
                  <Textarea id="testcases" {...register('testcases')} rows={15} className="font-code" />
                </div>
             </CardContent>
           </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata & Examples</CardTitle>
              <CardDescription>Add extra information and examples for the problem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="metadataType">Metadata Type</Label>
                      <Controller
                        name="metadataType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="metadataType">
                              <SelectValue placeholder="Select metadata type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Class">Class</SelectItem>
                              <SelectItem value="Trigger">Trigger</SelectItem>
                              <SelectItem value="Test Class">Test Class</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                  </div>
                  {metadataType === 'Trigger' && (
                    <div className="space-y-2">
                        <Label htmlFor="object">Salesforce Object</Label>
                        <Input id="object" {...register('object')} placeholder="e.g. Account" />
                        {errors.object && <p className="text-sm text-red-500">{errors.object.message}</p>}
                    </div>
                  )}
                  <div className="space-y-2 flex flex-col justify-center">
                        <Label htmlFor="isPremium">Premium Problem</Label>
                        <Controller
                          name="isPremium"
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2 pt-2">
                                  <Switch
                                      id="isPremium"
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                  />
                                  <Label htmlFor="isPremium" className="cursor-pointer">{field.value ? 'This is a premium problem' : 'This is a free problem'}</Label>
                              </div>
                          )}
                          />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="youtubeSolutionUrl">YouTube Solution URL</Label>
                    <Input id="youtubeSolutionUrl" {...register('youtubeSolutionUrl')} placeholder="https://www.youtube.com/watch?v=..." />
                    {errors.youtubeSolutionUrl && <p className="text-sm text-red-500">{errors.youtubeSolutionUrl.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="examples">Examples (JSON format)</Label>
                  <Textarea id="examples" {...register('examples')} rows={8} className="font-code" />
                  {errors.examples && <p className="text-sm text-red-500">{errors.examples.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hints">Hints (JSON format)</Label>
                  <Textarea id="hints" {...register('hints')} rows={5} className="font-code" />
                  {errors.hints && <p className="text-sm text-red-500">{errors.hints.message as string}</p>}
                </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  );
}

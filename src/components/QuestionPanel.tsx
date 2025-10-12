
'use client';

import { useState, useEffect } from 'react';
import type { Question, QuestionHint } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Lightbulb, CheckCircle, Bot, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface QuestionPanelProps {
  question: Question;
}

export function QuestionPanel({ question }: QuestionPanelProps) {
  const [revealedHints, setRevealedHints] = useState<QuestionHint[]>([]);
  const [nextHintIndex, setNextHintIndex] = useState(0);

  // Reset hints when the question changes
  useEffect(() => {
    setRevealedHints([]);
    setNextHintIndex(0);
  }, [question.id]);

  const handleShowHint = () => {
    if (question.hints && nextHintIndex < question.hints.length) {
      setRevealedHints(prev => [...prev, question.hints![nextHintIndex]]);
      setNextHintIndex(prev => prev + 1);
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
  }

  const isSolved = false; // Mock data
  const hasHints = question.hints && question.hints.length > 0;
  const allHintsRevealed = hasHints && nextHintIndex >= question.hints!.length;

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
         <h1 className="text-2xl font-bold mb-4 font-headline tracking-tight">
            {question.title}
        </h1>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant="outline" className="gap-1.5 w-20 justify-center">
            <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(question.difficulty))} aria-hidden="true"></span>
            {question.difficulty}
          </Badge>
          <Badge variant="secondary">
            <Tag />
            {question.category}
          </Badge>
          {(question.tags || []).map(tag => (
            <Badge key={tag} variant="secondary">
              <Tag />
              {tag}
            </Badge>
          ))}
          { isSolved && 
            <Badge variant="outline" className="border-transparent bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 font-medium">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5"/>
                Solved
            </Badge>
          }
        </div>
        
        <div className="text-sm text-foreground/90 space-y-6 prose prose-sm dark:prose-invert max-w-none">
            <p>{question.description}</p>
            
            {question.examples && question.examples.length > 0 && (
                <div className="space-y-4">
                    {question.examples.map((ex, index) => (
                        <div key={index}>
                            <h3 className="font-semibold text-base">Example {index + 1}:</h3>
                            <div className="bg-muted/50 p-4 rounded-md mt-2">
                            <pre className="font-code text-xs whitespace-pre-wrap leading-relaxed">
                                <div><strong className="font-semibold select-none">Input:</strong> {typeof ex.input === 'string' ? ex.input : JSON.stringify(ex.input)}</div>
                                <div><strong className="font-semibold select-none">Output:</strong> {typeof ex.output === 'string' ? ex.output : JSON.stringify(ex.output)}</div>
                                {ex.explanation && <div><strong className="font-semibold select-none">Explanation:</strong> {ex.explanation}</div>}
                            </pre>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {hasHints && (
              <div className="space-y-4">
                {revealedHints.map((hint, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none">
                      <p className="font-semibold text-xs text-foreground mb-1">Codbbit Assistant</p>
                      <p className="text-sm">{hint.value}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={handleShowHint} disabled={allHintsRevealed}>
                  <Lightbulb className="mr-2 h-4 w-4 text-yellow-400" /> 
                  {allHintsRevealed ? "All Hints Shown" : "Get a Hint"}
                </Button>
              </div>
            )}
        </div>
      </div>
    </ScrollArea>
  );
}


'use client';

import { useState, useEffect } from 'react';
import type { Question, QuestionHint } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Lightbulb, CheckCircle, Bot, Tag, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';

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
  
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  
  const videoId = question.youtubeSolutionUrl ? getYouTubeVideoId(question.youtubeSolutionUrl) : null;


  return (
    <div className='h-full flex flex-col'>
      <div className="flex-shrink-0 border-b p-4">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <h4 className="text-xl font-semibold flex items-center gap-2">
                {question.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge variant="outline" className="gap-1.5 w-24 justify-center">
                  <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(question.difficulty))} aria-hidden="true"></span>
                  {question.difficulty}
              </Badge>
              <Badge variant="secondary" className="w-24 justify-center">
                  <Tag />
                  {question.category}
              </Badge>
          </div>
      </div>

      <ScrollArea className="flex-grow">
        <div className="p-6">
          <div className="text-sm text-foreground/90 space-y-6 prose prose-sm dark:prose-invert max-w-none">
              <p>{question.description}</p>
              
              {question.examples && question.examples.length > 0 && (
                  <div className="space-y-4">
                      {question.examples.map((ex, index) => (
                          <div key={index}>
                              <h3 className="font-semibold text-base">Example {index + 1}:</h3>
                              <div className="bg-muted p-4 rounded-lg mt-2 space-y-4">
                                <div>
                                    <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Input</p>
                                    <pre className="font-code text-xs whitespace-pre-wrap leading-relaxed text-foreground">
                                        {typeof ex.input === 'string' ? ex.input : JSON.stringify(ex.input)}
                                    </pre>
                                </div>
                                 <div>
                                    <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Output</p>
                                    <pre className="font-code text-xs whitespace-pre-wrap leading-relaxed text-foreground">
                                       {typeof ex.output === 'string' ? ex.output : JSON.stringify(ex.output)}
                                    </pre>
                                </div>
                                {ex.explanation && (
                                    <div>
                                        <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Explanation</p>
                                        <p className="text-xs">{ex.explanation}</p>
                                    </div>
                                )}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
              
               {videoId && (
                <div>
                  <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" /> Video Solution
                  </h3>
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
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
    </div>
  );
}

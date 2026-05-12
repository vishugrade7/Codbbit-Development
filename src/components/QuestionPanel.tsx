'use client';

import { useState, useEffect } from 'react';
import type { Question, QuestionHint } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Lightbulb, Bot, Tag, Youtube, FileText, Code2, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';

interface QuestionPanelProps {
  question: Question;
}

export function QuestionPanel({ question }: QuestionPanelProps) {
  const [revealedHints, setRevealedHints] = useState<QuestionHint[]>([]);
  const [nextHintIndex, setNextHintIndex] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setRevealedHints([]);
    setNextHintIndex(0);
    const savedNotes = localStorage.getItem(`notes-${question.id}`);
    setNotes(savedNotes || '');
  }, [question.id]);

  const handleShowHint = () => {
    if (question.hints && nextHintIndex < question.hints.length) {
      setRevealedHints(prev => [...prev, question.hints![nextHintIndex]]);
      setNextHintIndex(prev => prev + 1);
    }
  };

  const handleNotesChange = (val: string) => {
      setNotes(val);
      localStorage.setItem(`notes-${question.id}`, val);
  }

  const getDifficultyDotClass = (difficulty: 'Easy' | 'Medium' | 'Hard' | undefined) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  
  const videoId = question.youtubeSolutionUrl ? getYouTubeVideoId(question.youtubeSolutionUrl) : null;

  return (
    <div className='h-full flex flex-col bg-background'>
      <Tabs defaultValue="description" className="flex-grow flex flex-col">
        <div className="flex-shrink-0 border-b px-4 py-2">
            <TabsList className="bg-transparent gap-4">
                <TabsTrigger value="description" className="data-[state=active]:bg-muted"><FileText className="h-4 w-4 mr-2" />Description</TabsTrigger>
                <TabsTrigger value="solutions" className="data-[state=active]:bg-muted"><Code2 className="h-4 w-4 mr-2" />Solutions</TabsTrigger>
                <TabsTrigger value="scratchpad" className="data-[state=active]:bg-muted"><Edit3 className="h-4 w-4 mr-2" />Scratchpad</TabsTrigger>
            </TabsList>
        </div>

        <ScrollArea className="flex-grow">
          <TabsContent value="description" className="p-6 m-0 outline-none">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
                <div className="flex items-center gap-2 mb-6">
                    <Badge variant="outline" className="gap-1.5 h-7">
                        <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(question.difficulty))} />
                        {question.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="h-7"><Tag className="h-3 w-3 mr-1" />{question.category}</Badge>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{question.description}</p>
                </div>
              </div>

              {question.examples && question.examples.length > 0 && (
                  <div className="space-y-6 mb-8">
                      {question.examples.map((ex, index) => (
                          <div key={index} className="space-y-2">
                              <h3 className="font-semibold text-sm">Example {index + 1}:</h3>
                              <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Input:</span>
                                        <code className="block mt-1 text-xs">{typeof ex.input === 'string' ? ex.input : JSON.stringify(ex.input)}</code>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Output:</span>
                                        <code className="block mt-1 text-xs">{typeof ex.output === 'string' ? ex.output : JSON.stringify(ex.output)}</code>
                                    </div>
                                    {ex.explanation && (
                                        <div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase">Explanation:</span>
                                            <p className="text-xs mt-1 text-muted-foreground">{ex.explanation}</p>
                                        </div>
                                    )}
                                </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {question.hints && question.hints.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  {revealedHints.map((hint, index) => (
                    <div key={index} className="flex items-start gap-3 animate-in fade-in">
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary/10"><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/40 p-3 rounded-lg rounded-tl-none border">
                        <p className="text-sm leading-relaxed">{hint.value}</p>
                      </div>
                    </div>
                  ))}
                  {nextHintIndex < question.hints.length && (
                    <Button variant="outline" size="sm" onClick={handleShowHint} className="w-full sm:w-auto">
                        <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                        Get a Hint ({nextHintIndex + 1}/{question.hints.length})
                    </Button>
                  )}
                </div>
              )}
          </TabsContent>

          <TabsContent value="solutions" className="p-6 m-0 outline-none">
             {videoId ? (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Youtube className="text-red-500" /> Video Explanation</h3>
                  <div className="aspect-video rounded-lg overflow-hidden border shadow-sm">
                    <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} title="Solution" allowFullScreen />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Code2 className="h-12 w-12 mb-4 opacity-20" />
                    <p>No video solution available yet.</p>
                </div>
              )}
          </TabsContent>

          <TabsContent value="scratchpad" className="p-6 m-0 outline-none h-full">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Edit3 className="h-4 w-4" /> Personal Notes</h3>
            <Textarea placeholder="Write your notes here..." value={notes} onChange={(e) => handleNotesChange(e.target.value)} className="min-h-[400px] font-mono text-sm" />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
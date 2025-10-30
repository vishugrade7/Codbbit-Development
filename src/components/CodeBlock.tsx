
'use client';

import { Check, Copy, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ReactNode } from 'react';


interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
  tooltipContent?: ReactNode;
}

export function CodeBlock({ code, language, className, tooltipContent }: CodeBlockProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    // Strip HTML tags for clipboard
    const plainTextCode = code.replace(/<[^>]*>?/gm, '');
    navigator.clipboard.writeText(plainTextCode).then(() => {
      setHasCopied(true);
      toast({ title: 'Copied!', description: 'Code copied to clipboard.' });
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const CodeBlockContent = (
    <div className={cn('relative group my-4 inline-block', className)}>
      <div
        className={cn(
          'rounded-xl bg-muted/50 p-4 font-code text-sm'
        )}
      >
        <pre><code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: code }} /></pre>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={copyToClipboard}
      >
        {hasCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="sr-only">Copy code</span>
      </Button>
    </div>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            {CodeBlockContent}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5"/>
                <div>{tooltipContent}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return CodeBlockContent;
}

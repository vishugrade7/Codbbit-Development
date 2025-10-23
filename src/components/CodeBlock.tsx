
'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true);
      toast({ title: 'Copied!', description: 'Code copied to clipboard.' });
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  return (
    <div className={cn('relative my-4 rounded-lg bg-muted/50 p-4 font-code text-sm', className)}>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 h-6 w-6"
        onClick={copyToClipboard}
      >
        {hasCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <pre><code className={`language-${language}`}>{code}</code></pre>
    </div>
  );
}

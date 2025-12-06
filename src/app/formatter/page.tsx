
'use client';

import { useState, useRef } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { CodeEditor } from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, CheckCircle, XCircle, FileDown, Wand2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/components';
import Link from 'next/link';

export default function FormatterPage() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [indentation, setIndentation] = useState('2');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'idle'>('idle');
  const { theme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputCode(content);
        setValidationStatus('idle');
      };
      reader.readAsText(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFormat = (minify = false) => {
    if (!inputCode.trim()) {
      toast({ title: "Input is empty", description: "Please enter some JSON or XML to format.", variant: 'destructive' });
      return;
    }
    
    setIsProcessing(true);
    setValidationStatus('idle');
    try {
      // It's a bit of a guess, but this is a common way to differentiate.
      const isJson = inputCode.trim().startsWith('{') || inputCode.trim().startsWith('[');

      if (isJson) {
        const parsed = JSON.parse(inputCode);
        const formatted = JSON.stringify(parsed, null, minify ? 0 : parseInt(indentation));
        setOutputCode(formatted);
        setValidationStatus('valid');
      } else {
         // Basic XML formatting
         setOutputCode(formatXml(inputCode, minify, parseInt(indentation)));
         setValidationStatus('valid');
      }
    } catch (e: any) {
      setOutputCode(`Error: ${e.message}`);
      setValidationStatus('invalid');
      toast({ title: 'Invalid Format', description: 'The input is not valid JSON or XML.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatXml = (xml: string, minify: boolean, indent: number): string => {
      if (minify) {
        return xml.replace(/>\s*</g, '><').trim();
      }
      let formatted = '';
      const reg = /(>)(<)(\/*)/g;
      xml = xml.replace(reg, '$1\r\n$2$3');
      let pad = 0;
      xml.split('\r\n').forEach((node) => {
        let indentLevel = 0;
        const trimNode = node.trim();
        if (trimNode.match( /.+<\/\w[^>]*>$/ )) {
          indentLevel = 0;
        } else if (trimNode.match( /^<\/\w/ )) {
          if (pad !== 0) {
            pad -= 1;
          }
        } else if (trimNode.match( /^<\w[^>]*[^\/]>.*$/ )) {
          indentLevel = 1;
        } else {
          indentLevel = 0;
        }

        const padding = ' '.repeat(pad * indent);
        formatted += padding + trimNode + '\r\n';
        pad += indentLevel;
      });
      return formatted.trim();
  }


  const handleValidate = () => {
      if (!inputCode.trim()) {
        toast({ title: 'Input is empty', description: 'Please enter some JSON or XML to validate.', variant: 'destructive' });
        setValidationStatus('idle');
        return;
      }
      try {
          JSON.parse(inputCode);
          setValidationStatus('valid');
          toast({ title: 'Valid JSON', description: 'The input is a well-formed JSON object.', variant: 'success' });
      } catch (e) {
          setValidationStatus('invalid');
          toast({ title: 'Invalid JSON', description: 'The input is not a valid JSON object.', variant: 'destructive' });
      }
  }
  
  const handleDownload = () => {
    if (!outputCode.trim()) {
        toast({ title: 'Output is empty', description: 'There is nothing to download.', variant: 'destructive' });
        return;
    }
    const blob = new Blob([outputCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted-output.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleClear = () => {
      setInputCode('');
      setOutputCode('');
      setValidationStatus('idle');
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 formatter-page">
      <header className="flex-shrink-0 bg-[#2C3E50] text-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/formatter">
            <h1 className="text-xl font-bold font-sans">JSON Formatter</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/formatter" className="hover:text-teal-300">JSON Beautifier</Link>
            <Link href="/formatter" className="hover:text-teal-300">JSON Parser</Link>
            <Link href="/formatter" className="hover:text-teal-300">XML Formatter</Link>
            <Link href="/formatter" className="hover:text-teal-300">JS Beautifier</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={45} minSize={20}>
            <CodeEditor
              language="json"
              value={inputCode}
              onChange={(value) => setInputCode(value || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={10} minSize={10} maxSize={20} className="bg-[#1ABC9C] p-4 flex flex-col gap-3">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json,.xml,.txt" />
             <Button onClick={triggerFileUpload} className="w-full justify-center bg-white/20 hover:bg-white/30 text-white">
                <Upload className="mr-2 h-4 w-4"/> Upload Data
             </Button>
             <Button onClick={handleValidate} className="w-full justify-center bg-white/20 hover:bg-white/30 text-white">
                {validationStatus === 'valid' ? <CheckCircle className="mr-2 h-4 w-4"/> : validationStatus === 'invalid' ? <XCircle className="mr-2 h-4 w-4"/> : null}
                Validate
             </Button>
             <Select value={indentation} onValueChange={setIndentation}>
                <SelectTrigger className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="2">2 Tab Space</SelectItem>
                    <SelectItem value="4">4 Tab Space</SelectItem>
                </SelectContent>
             </Select>
             <Button onClick={() => handleFormat(false)} className="w-full justify-center bg-white/20 hover:bg-white/30 text-white font-bold">
                <Wand2 className="mr-2 h-4 w-4"/> Format / Beautify
             </Button>
             <Card className="my-2 bg-transparent border-none shadow-none">
                 <CardContent className="p-0">
                     <Image src="https://picsum.photos/seed/expedia/300/200" alt="Ad" width={300} height={200} className="rounded-lg w-full" data-ai-hint="travel background" />
                 </CardContent>
             </Card>
             <Button onClick={() => handleFormat(true)} className="w-full justify-center bg-white/20 hover:bg-white/30 text-white">
                Minify / Compact
             </Button>
             <Button className="w-full justify-center bg-white/20 hover:bg-white/30 text-white">
                Convert JSON to <ArrowRight className="ml-2 h-4 w-4"/>
             </Button>
             <Button onClick={handleDownload} className="w-full justify-center bg-white/20 hover:bg-white/30 text-white">
                <FileDown className="mr-2 h-4 w-4"/> Download
             </Button>
             <Button onClick={handleClear} variant="ghost" className="w-full justify-center text-white hover:bg-white/10 hover:text-white">
                <Trash2 className="mr-2 h-4 w-4"/> Clear
             </Button>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={45} minSize={20}>
             <CodeEditor
              language="json"
              value={outputCode}
              onChange={(value) => setOutputCode(value || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              readOnly={isProcessing}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

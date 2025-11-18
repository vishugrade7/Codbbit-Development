
'use client';

import Editor, { type Monaco, type OnChange } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useEffect, useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: OnChange;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  options?: editor.IStandaloneEditorConstructionOptions;
}

export function CodeEditor({ value, onChange, language = 'apex', theme = 'vs-dark', readOnly = false, options = {} }: CodeEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  // This ensures the component only renders on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={value}
        onChange={onChange}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto'
          },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          padding: { top: 16 },
          readOnly: readOnly,
          contextmenu: !readOnly,
          ...options,
        }}
      />
    </div>
  );
}

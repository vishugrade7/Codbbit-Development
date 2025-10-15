
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

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    // Disable pasting
    editor.addAction({
      id: 'disable-paste',
      label: 'Disable Paste',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV],
      run: () => {},
    });

    // Also disable the context menu paste
    // The context menu paste command is 'editor.action.clipboardPasteAction'
    // We can't easily remove it, but we can override it with a no-op
    // This is a bit of a hack, but it's a common way to disable built-in actions.
    const pasteAction = editor.getAction('editor.action.clipboardPasteAction');
    if (pasteAction) {
      const originalRun = pasteAction.run;
      pasteAction.run = () => {
        // Do nothing, effectively disabling paste.
        console.log("Paste disabled");
      };
    }
  }

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
        onMount={handleEditorDidMount}
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
          contextmenu: !readOnly, // disable context menu when readOnly
          ...options,
        }}
      />
    </div>
  );
}

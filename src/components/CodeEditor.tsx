
'use client';

import Editor, { type Monaco, type OnChange, loader } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useEffect, useState } from 'react';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs'
  }
});


interface CodeEditorProps {
  value: string;
  onChange: OnChange;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  options?: editor.IStandaloneEditorConstructionOptions;
}

// Define the custom Apex language configuration
const apexLanguageConfig: any = {
  id: 'apex',
  extensions: ['.cls', '.trigger'],
  aliases: ['Apex'],
  loader: () => import('monaco-editor/esm/vs/basic-languages/apex/apex.js'),
};

export function CodeEditor({ value, onChange, language = 'apex', theme = 'vs-dark', readOnly = false, options = {} }: CodeEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  // This ensures the component only renders on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleEditorWillMount(monaco: Monaco) {
    // Register the Apex language if it doesn't already exist
    const languages = monaco.languages.getLanguages();
    if (!languages.some(({ id }) => id === 'apex')) {
      monaco.languages.register(apexLanguageConfig);
      monaco.languages.onLanguage(apexLanguageConfig.id, () => {
         apexLanguageConfig.loader().then((module: any) => {
             monaco.languages.setMonarchTokensProvider(apexLanguageConfig.id, module.language);
             monaco.languages.setLanguageConfiguration(apexLanguageConfig.id, module.conf);
         })
      });
    }
  }

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
        beforeMount={handleEditorWillMount}
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

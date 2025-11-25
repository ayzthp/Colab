
'use client';

import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Play, Terminal } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { runCode } from '@/app/actions/code';

interface CodeEditorProps {
  ydoc: Y.Doc | null;
  provider: any | null; // WebrtcProvider type
}

const languages = ['javascript', 'python', 'text'];

export function CodeEditor({ ydoc, provider }: CodeEditorProps) {
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<any>(null);

  // Sync language selection
  useEffect(() => {
    if (!ydoc) return;
    const yMeta = ydoc.getMap('meta');
    
    // Initial value
    if (yMeta.get('language')) {
      setLanguage(yMeta.get('language') as string);
    }

    const observer = () => {
      const remoteLang = yMeta.get('language') as string;
      if (remoteLang && remoteLang !== language) {
        setLanguage(remoteLang);
      }
    };

    yMeta.observe(observer);
    return () => yMeta.unobserve(observer);
  }, [ydoc, language]);

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    if (ydoc) {
      ydoc.getMap('meta').set('language', val);
    }
  };

  const handleEditorMount = async (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    if (ydoc && provider) {
      // Dynamic import to avoid SSR 'window is not defined' error
      const { MonacoBinding } = await import('y-monaco');
      
      const yText = ydoc.getText('monaco');
      // Bind Yjs text to Monaco editor
      new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor]),
        provider.awareness
      );
    }
  };

  const handleRunCode = async () => {
    if (!editorRef.current) return;
    setIsRunning(true);
    setOutput('');
    
    const code = editorRef.current.getValue();
    const result = await runCode(code, input);
    const newOutput = result.error ? `Error: ${result.error}` : result.output;
    setOutput(newOutput);
    setIsRunning(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-2">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleRunCode} disabled={isRunning}>
          {isRunning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Run
        </Button>
      </div>
      <div className="grid flex-1 flex-col overflow-hidden p-2 md:grid-cols-2 md:gap-4">
        <div className="flex h-full flex-col">
          <label className="mb-2 text-sm font-medium">Code</label>
          <div className="h-full flex-1 overflow-hidden rounded-md border bg-muted/30">
             <Editor
               height="100%"
               defaultLanguage="javascript"
               language={language}
               onMount={handleEditorMount}
               options={{
                 minimap: { enabled: false },
                 fontSize: 14,
                 automaticLayout: true,
               }}
             />
          </div>
        </div>
        <div className="mt-4 flex flex-col space-y-4 overflow-auto md:mt-0">
          <div className="flex h-1/2 flex-col">
            <label htmlFor="input" className="mb-2 text-sm font-medium">
              Input
            </label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Provide input for your code..."
              className="font-code flex-1 resize-none"
            />
          </div>
          <div className="flex h-1/2 flex-col">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Terminal className="h-4 w-4" /> Output
            </label>
            <ScrollArea className="h-full rounded-md border bg-muted/30 p-4">
              <pre className="font-code whitespace-pre-wrap text-sm">
                {output || 'Code output will appear here.'}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

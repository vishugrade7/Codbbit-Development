
'use client';

import { useState } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { CodeEditor } from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { Play, Deploy, FileCode, MonitorPlay } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const initialHtml = `
<template>
    <lightning-card title="My LWC Component" icon-name="custom:custom14">
        <div class="slds-m-around_medium">
            <p>Hello, {greeting}!</p>
            <lightning-input label="Name" value={greeting} onchange={handleGreetingChange}></lightning-input>
        </div>
    </lightning-card>
</template>
`.trim();

const initialJs = `
import { LightningElement, track } from 'lwc';

export default class MyComponent extends LightningElement {
    @track greeting = 'World';

    handleGreetingChange(event) {
        this.greeting = event.target.value;
    }
}
`.trim();

const initialCss = `
:host {
    display: block;
}
`.trim();

export default function LwcPlaygroundPage() {
  const [htmlCode, setHtmlCode] = useState(initialHtml);
  const [jsCode, setJsCode] = useState(initialJs);
  const [cssCode, setCssCode] = useState(initialCss);
  
  const [isServerRunning, setIsServerRunning] = useState(false);

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background text-foreground">
          <header className="flex-shrink-0 flex items-center justify-between p-2 border-b">
             <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-bold font-headline">LWC Playground</h1>
             </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                    <MonitorPlay className="mr-2 h-4 w-4" />
                    Start Server
                </Button>
                 <Button size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Deploy
                </Button>
             </div>
          </header>
          <main className="flex-grow overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={60} minSize={30}>
                    <Tabs defaultValue="html" className="h-full flex flex-col">
                        <div className="flex-shrink-0 px-4 py-2 border-b">
                            <TabsList>
                                <TabsTrigger value="html">HTML</TabsTrigger>
                                <TabsTrigger value="js">JavaScript</TabsTrigger>
                                <TabsTrigger value="css">CSS</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="html" className="flex-grow">
                             <CodeEditor
                                language="html"
                                value={htmlCode}
                                onChange={(value) => setHtmlCode(value || '')}
                            />
                        </TabsContent>
                         <TabsContent value="js" className="flex-grow">
                             <CodeEditor
                                language="javascript"
                                value={jsCode}
                                onChange={(value) => setJsCode(value || '')}
                            />
                        </TabsContent>
                         <TabsContent value="css" className="flex-grow">
                             <CodeEditor
                                language="css"
                                value={cssCode}
                                onChange={(value) => setCssCode(value || '')}
                            />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                     <div className="h-full bg-muted/20 flex flex-col">
                        <div className="p-2 border-b">
                            <h3 className="font-semibold text-sm">Preview</h3>
                        </div>
                        <div className="flex-grow p-4">
                            {isServerRunning ? (
                                <iframe
                                    src="http://localhost:3001" // This will be the proxied URL
                                    className="w-full h-full border-none"
                                    title="LWC Preview"
                                ></iframe>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                    <MonitorPlay className="h-12 w-12 mb-4" />
                                    <h3 className="text-lg font-semibold">Server not running</h3>
                                    <p className="text-sm">Click "Start Server" to see a live preview of your component.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

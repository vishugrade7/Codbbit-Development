
'use client';

import { useState, useEffect } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { CodeEditor } from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { Play, UploadCloud, FileCode, MonitorPlay, PowerOff, Loader2, CheckCircle, Code as CodeIcon, Braces, Paintbrush } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
  const { toast } = useToast();
  
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState('html');

  const handleToggleServer = () => {
    setIsServerRunning(prev => !prev);
  }

  const handleDeploy = async () => {
    setIsDeployDialogOpen(true);
    setIsDeploying(true);
    setDeploymentStatus([]);

    const steps = [
        "Connecting to organization...",
        "Deploying LWC component metadata...",
        "Running local tests...",
        "Deployment successful!",
    ];

    for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDeploymentStatus(prev => [...prev, step]);
    }
    
    setIsDeploying(false);
  };

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
                <Button variant="outline" size="sm" onClick={handleToggleServer}>
                    {isServerRunning ? (
                      <>
                        <PowerOff className="mr-2 h-4 w-4 text-red-500"/>
                        Stop Server
                      </>
                    ) : (
                      <>
                        <MonitorPlay className="mr-2 h-4 w-4" />
                        Start Server
                      </>
                    )}
                </Button>
                 <Button size="sm" onClick={handleDeploy}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Deploy
                </Button>
             </div>
          </header>
          <main className="flex-grow overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={60} minSize={30}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col bg-[#1e1e1e]">
                        <div className="flex-shrink-0 border-b border-zinc-700">
                            <TabsList className="bg-transparent p-0 gap-0">
                                <TabsTrigger value="html" className={cn("text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-zinc-800 rounded-none border-t-2 border-transparent data-[state=active]:border-primary px-4 py-2 text-sm", activeTab === "html" && "border-primary")}>
                                  <CodeIcon className="w-4 h-4 mr-2" /> myComponent.html
                                </TabsTrigger>
                                <TabsTrigger value="js" className={cn("text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-zinc-800 rounded-none border-t-2 border-transparent data-[state=active]:border-primary px-4 py-2 text-sm", activeTab === "js" && "border-primary")}>
                                  <Braces className="w-4 h-4 mr-2" /> myComponent.js
                                </TabsTrigger>
                                <TabsTrigger value="css" className={cn("text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-zinc-800 rounded-none border-t-2 border-transparent data-[state=active]:border-primary px-4 py-2 text-sm", activeTab === "css" && "border-primary")}>
                                  <Paintbrush className="w-4 h-4 mr-2" /> myComponent.css
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="html" className="flex-grow">
                             <CodeEditor
                                language="html"
                                value={htmlCode}
                                onChange={(value) => setHtmlCode(value || '')}
                                theme="vs-dark"
                            />
                        </TabsContent>
                         <TabsContent value="js" className="flex-grow">
                             <CodeEditor
                                language="javascript"
                                value={jsCode}
                                onChange={(value) => setJsCode(value || '')}
                                theme="vs-dark"
                            />
                        </TabsContent>
                         <TabsContent value="css" className="flex-grow">
                             <CodeEditor
                                language="css"
                                value={cssCode}
                                onChange={(value) => setCssCode(value || '')}
                                theme="vs-dark"
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
        <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Deployment Progress</DialogTitle>
                    <DialogDescription>
                        Your LWC component is being deployed. This may take a moment.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 font-mono text-sm space-y-2">
                    {deploymentStatus.map((status, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index === deploymentStatus.length - 1 && isDeploying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span>{status}</span>
                        </div>
                    ))}
                    {isDeploying && deploymentStatus.length < 4 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsDeployDialogOpen(false)} disabled={isDeploying}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}

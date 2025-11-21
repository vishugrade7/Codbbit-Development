
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { CodeEditor } from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { Play, UploadCloud, FileCode, MonitorPlay, PowerOff, Loader2, CheckCircle, Code as CodeIcon, Braces, Paintbrush, Download, FilePlus, Search, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLwcBundles, getLwcBundleFiles } from '@/lib/actions';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppSidebar, Sidebar, SidebarInset, SidebarProvider } from '@/components';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { CreateLwcForm } from '@/components/CreateLwcForm';

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
  const { user } = useUser();
  const firestore = useFirestore();

  const [activeTab, setActiveTab] = useState('html');
  const [fetchedComponents, setFetchedComponents] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);


  const handleFetchComponents = async () => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to fetch components.", variant: "destructive" });
        return;
    }
    if (!userProfile?.sfdcAuth?.connected) {
      toast({ title: "Authentication Required", description: "Please connect your Salesforce org via settings.", variant: "destructive" });
      return;
    }

    setIsFetching(true);
    const result = await getLwcBundles(user.uid);
    if (result.success) {
      setFetchedComponents(result.data);
    } else {
      toast({ title: "Error Fetching Components", description: result.error, variant: "destructive" });
    }
    setIsFetching(false);
  }
  
  useEffect(() => {
    if (userProfile?.sfdcAuth?.connected) {
      handleFetchComponents();
    }
  }, [userProfile]);


  const handleFetchComponent = async (bundleId: string, componentName: string) => {
    if (!user) return;
    setIsFetchingFiles(true);
    
    const result = await getLwcBundleFiles(bundleId, user.uid);
    
    if (result.success && result.data) {
        const files = result.data;
        const htmlFile = files.find(f => f.FilePath.endsWith('.html'));
        const jsFile = files.find(f => f.FilePath.endsWith('.js'));
        const cssFile = files.find(f => f.FilePath.endsWith('.css'));
        
        setHtmlCode(htmlFile?.Source || initialHtml);
        setJsCode(jsFile?.Source || initialJs);
        setCssCode(cssFile?.Source || initialCss);

        toast({
          title: 'Component Loaded',
          description: `"${componentName}" has been loaded into the playground.`,
        });
    } else {
        toast({
          title: 'Error Fetching Files',
          description: result.error || 'Could not load component source files.',
          variant: 'destructive',
        });
    }

    setIsFetchingFiles(false);
  };
  
  const handleNewComponent = () => {
    setIsCreateDrawerOpen(true);
  }
  
  const handleFormSubmit = (data: any) => {
    // In a real app, you would use this data to generate and deploy the new component.
    console.log("New component data:", data);
    setHtmlCode(initialHtml.replace('My LWC Component', data.masterLabel || data.componentName));
    setJsCode(initialJs.replace('MyComponent', data.componentName));
    setCssCode(initialCss);
    setIsCreateDrawerOpen(false);
    toast({
      title: 'Component Ready',
      description: `New component "${data.componentName}" has been scaffolded in the editor.`,
    });
  }

  const filteredComponents = fetchedComponents.filter(comp =>
    comp.DeveloperName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Drawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
          <div className="flex flex-col h-screen bg-[#0d1117] text-foreground">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-zinc-800">
               <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                    <FilePlus className="mr-2 h-4 w-4" />
                    New Component
                </Button>
               </DrawerTrigger>
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleFetchComponents} disabled={isFetching}>
                      {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Fetch from Org
                  </Button>
                  <Button variant="outline" size="sm">
                      <MonitorPlay className="mr-2 h-4 w-4" />
                      Start Server
                  </Button>
                  <Button size="sm">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Deploy
                  </Button>
              </div>
            </header>
            <main className="flex-grow overflow-hidden">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={25} minSize={20} className="bg-[#0d1117] p-2">
                      <div className="flex flex-col h-full">
                          <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                              <Input 
                                  placeholder="Search component or items..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="bg-zinc-900 border-zinc-700 pl-8 h-9"
                              />
                          </div>
                          <ScrollArea className="flex-grow">
                              <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                                  <AccordionItem value="item-1" className="border-none">
                                      <AccordionTrigger className="text-xs font-bold text-zinc-400 uppercase py-2 hover:no-underline">
                                          <div className="flex items-center gap-2">
                                              <FileCode className="h-4 w-4" />
                                              Lightning Web Component
                                          </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="pl-2">
                                          {isFetching ? (
                                              <div className="flex items-center justify-center p-4">
                                                  <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                                              </div>
                                          ) : (
                                              filteredComponents.map(comp => (
                                                  <button 
                                                      key={comp.Id} 
                                                      className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-zinc-800 text-zinc-300 text-sm"
                                                      onClick={() => handleFetchComponent(comp.Id, comp.DeveloperName)}
                                                  >
                                                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                                                    {comp.DeveloperName}
                                                  </button>
                                              ))
                                          )}
                                      </AccordionContent>
                                  </AccordionItem>
                              </Accordion>
                          </ScrollArea>
                      </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle className="bg-zinc-800" />
                  <ResizablePanel defaultSize={75} minSize={30}>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col bg-[#1e1e1e] rounded-lg overflow-hidden">
                          <div className="flex-shrink-0 border-b border-zinc-700 bg-[#3c3c3c]">
                              <TabsList className="bg-transparent p-0 gap-0">
                                  <TabsTrigger value="html" className="text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-[#1e1e1e] rounded-none px-4 py-2 text-sm h-auto">
                                    <CodeIcon className="w-4 h-4 mr-2" /> myComponent.html
                                  </TabsTrigger>
                                  <TabsTrigger value="js" className="text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-[#1e1e1e] rounded-none px-4 py-2 text-sm h-auto">
                                    <Braces className="w-4 h-4 mr-2" /> myComponent.js
                                  </TabsTrigger>
                                  <TabsTrigger value="css" className="text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-[#1e1e1e] rounded-none px-4 py-2 text-sm h-auto">
                                    <Paintbrush className="w-4 h-4 mr-2" /> myComponent.css
                                  </TabsTrigger>
                              </TabsList>
                          </div>
                          <TabsContent value="html" className="flex-grow m-0">
                              <CodeEditor
                                  language="html"
                                  value={htmlCode}
                                  onChange={(value) => setHtmlCode(value || '')}
                                  theme="vs-dark"
                              />
                          </TabsContent>
                          <TabsContent value="js" className="flex-grow m-0">
                              <CodeEditor
                                  language="javascript"
                                  value={jsCode}
                                  onChange={(value) => setJsCode(value || '')}
                                  theme="vs-dark"
                              />
                          </TabsContent>
                          <TabsContent value="css" className="flex-grow m-0">
                              <CodeEditor
                                  language="css"
                                  value={cssCode}
                                  onChange={(value) => setCssCode(value || '')}
                                  theme="vs-dark"
                              />
                          </TabsContent>
                      </Tabs>
                  </ResizablePanel>
              </ResizablePanelGroup>
            </main>
          </div>
           <DrawerContent className="max-h-[90vh]">
             <CreateLwcForm onFormSubmit={handleFormSubmit} onCancel={() => setIsCreateDrawerOpen(false)} />
          </DrawerContent>
        </Drawer>
      </SidebarInset>
    </SidebarProvider>
  );
}

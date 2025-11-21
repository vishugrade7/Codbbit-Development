
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { CodeEditor } from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { Play, UploadCloud, FileCode, MonitorPlay, PowerOff, Loader2, CheckCircle, Code as CodeIcon, Braces, Paintbrush, FilePlus, Search, ChevronRight, Link as LinkIcon, FileJson } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLwcBundles, getLwcBundleFiles, deployLwc } from '@/lib/actions';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AppSidebar, Sidebar, SidebarInset, SidebarProvider } from '@/components';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { CreateLwcForm } from '@/components/CreateLwcForm';
import { useTheme } from '@/components';

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

const initialXml = `
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <isExposed>false</isExposed>
</LightningComponentBundle>
`.trim();


export default function LwcPlaygroundPage() {
  const [htmlCode, setHtmlCode] = useState(initialHtml);
  const [jsCode, setJsCode] = useState(initialJs);
  const [cssCode, setCssCode] = useState(initialCss);
  const [xmlCode, setXmlCode] = useState(initialXml);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const { theme } = useTheme();

  const [componentName, setComponentName] = useState('myComponent');
  const [activeTab, setActiveTab] = useState('html');
  const [fetchedComponents, setFetchedComponents] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);

  const [sessionId, setSessionId] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('');
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const storedSessionId = localStorage.getItem('lwc_sessionId');
      const storedInstanceUrl = localStorage.getItem('lwc_instanceUrl');
      if (storedSessionId) setSessionId(storedSessionId);
      if (storedInstanceUrl) setInstanceUrl(storedInstanceUrl);
    } catch (error) {
      console.warn("Could not access localStorage for LWC credentials.");
    }
  }, []);

  const handleSaveCredentials = () => {
    try {
      localStorage.setItem('lwc_sessionId', sessionId);
      localStorage.setItem('lwc_instanceUrl', instanceUrl);
      toast({ title: 'Credentials Saved', description: 'Session ID and Instance URL have been saved locally.' });
      setIsCredentialDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not save credentials to local storage.', variant: 'destructive' });
    }
  };


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
    if (!sessionId || !instanceUrl) {
      toast({ title: "Authentication Required", description: "Please provide your Salesforce Session ID and Instance URL.", variant: "destructive" });
      setIsCredentialDialogOpen(true);
      return;
    }

    setIsFetching(true);
    const auth = { accessToken: sessionId, instanceUrl, connected: true, refreshToken: '', issuedAt: 0 };
    const result = await getLwcBundles(user.uid, auth);
    if (result.success) {
      setFetchedComponents(result.data);
    } else {
      toast({ title: "Error Fetching Components", description: result.error, variant: "destructive" });
    }
    setIsFetching(false);
  }
  
  useEffect(() => {
    if (sessionId && instanceUrl) {
      handleFetchComponents();
    }
  }, [sessionId, instanceUrl]);


  const handleFetchComponent = async (bundleId: string, newComponentName: string) => {
    if (!user) return;
     if (!sessionId || !instanceUrl) {
      toast({ title: "Authentication Required", description: "Please provide your Salesforce Session ID and Instance URL.", variant: "destructive" });
      return;
    }
    setIsFetchingFiles(true);
    
    const auth = { accessToken: sessionId, instanceUrl, connected: true, refreshToken: '', issuedAt: 0 };
    const result = await getLwcBundleFiles(bundleId, user.uid, auth);
    
    if (result.success && result.data) {
        const files = result.data;
        const htmlFile = files.find(f => f.FilePath.endsWith('.html'));
        const jsFile = files.find(f => f.FilePath.endsWith('.js'));
        const cssFile = files.find(f => f.FilePath.endsWith('.css'));
        const xmlFile = files.find(f => f.FilePath.endsWith('.js-meta.xml'));
        
        setHtmlCode(htmlFile?.Source || initialHtml);
        setJsCode(jsFile?.Source || initialJs);
        setCssCode(cssFile?.Source || initialCss);
        setXmlCode(xmlFile?.Source || initialXml);
        setComponentName(newComponentName);

        toast({
          title: 'Component Loaded',
          description: `"${newComponentName}" has been loaded into the playground.`,
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
    console.log("New component data:", data);
    setHtmlCode(initialHtml.replace('My LWC Component', data.masterLabel || data.componentName));
    setJsCode(initialJs.replace('MyComponent', data.componentName));
    setCssCode(initialCss);
    setXmlCode(initialXml.replace('<apiVersion>57.0</apiVersion>', `<apiVersion>${data.apiVersion}</apiVersion>`).replace('<isExposed>false</isExposed>', `<isExposed>${data.isExposed}</isExposed>`));
    setComponentName(data.componentName);
    setIsCreateDrawerOpen(false);
    toast({
      title: 'Component Ready',
      description: `New component "${data.componentName}" has been scaffolded in the editor.`,
    });
  }

  const filteredComponents = fetchedComponents.filter(comp =>
    comp.DeveloperName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function createSandboxHtml(html: string, js: string, css: string) {
    const cleanHtml = html
      .replace(/<template[^>]*>/i, '')
      .replace(/<\/template>/i, '')
      .replace(/<lightning-input[^>]*label="([^"]*)"[^>]*value=\{greeting\}[^>]*onchange=\{handleGreetingChange\}[^>]*><\/lightning-input>/i,
        `<label>$1</label><input id="__sandbox_input__" value="{greeting}" />`)
      .replace(/\{greeting\}/g, '<span data-binding="greeting">{greeting}</span>');

    const runtime = `
      (function(){
        const root = document.getElementById('root');
        const model = { greeting: 'World' };
        function refresh() {
          const els = root.querySelectorAll('[data-binding="greeting"]');
          els.forEach(e => e.textContent = model.greeting);
          const input = document.getElementById('__sandbox_input__');
          if (input) input.value = model.greeting;
        }
        document.addEventListener('input', (ev) => {
          if (ev.target && ev.target.id === '__sandbox_input__') {
            model.greeting = ev.target.value;
            refresh();
          }
        }, true);
        try {
          const userJs = \`${js.replace(/`/g, '\\`')}\`;
          const trackedAssign = userJs.match(/@track\\s+greeting\\s*=\\s*['"]([^'"]+)['"]/);
          if (trackedAssign) {
            model.greeting = trackedAssign[1];
          }
        } catch (e) {
          console.warn('Could not execute user JS in sandbox:', e);
        }
        refresh();
      })();
    `;

    const final = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width,initial-scale=1"/>
          <style>${css}</style>
        </head>
        <body>
          <div id="root">${cleanHtml}</div>
          <script>${runtime}</script>
        </body>
      </html>
    `;
    return final;
  }

  const handlePreview = () => {
    setPreviewOpen(true);
    setTimeout(() => {
      if (!previewIframeRef.current) return;
      const doc = previewIframeRef.current.contentDocument || previewIframeRef.current.contentWindow?.document;
      if (!doc) return;
      doc.open();
      doc.write(createSandboxHtml(htmlCode, jsCode, cssCode));
      doc.close();
    }, 50);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  const handleDeploy = async () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please sign in before deploying.', variant: 'destructive' });
      return;
    }
     if (!sessionId || !instanceUrl) {
      toast({ title: "Authentication Required", description: "Please provide your Salesforce Session ID and Instance URL.", variant: "destructive" });
      return;
    }
    setIsDeploying(true);

    const lwcData = {
      componentName: componentName,
      apiVersion: '57.0',
      isExposed: false,
      masterLabel: componentName,
      description: `Deployed from Playground by ${user.uid}`,
      targets: [],
      html: htmlCode,
      js: jsCode,
      css: cssCode,
    };
    
    const auth = { accessToken: sessionId, instanceUrl, connected: true, refreshToken: '', issuedAt: 0 };

    try {
      const res = await deployLwc(user.uid, lwcData, auth);
      if (res.success) {
        toast({ title: 'Deployed', description: `Component ${lwcData.componentName} deployed successfully.` });
        await handleFetchComponents();
      } else {
        toast({ title: 'Deploy Error', description: res.error || 'Failed to deploy', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Deploy Error', description: e.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Drawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
          <div className="flex flex-col h-screen bg-background text-foreground">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b">
               <div className="flex items-center gap-2">
                 <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleNewComponent}>
                      <FilePlus className="mr-2 h-4 w-4" />
                      New Component
                  </Button>
                 </DrawerTrigger>
                 <Button variant="outline" size="sm" onClick={handleFetchComponents} disabled={isFetching}>
                      {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Fetch from Org
                  </Button>
                 <Button variant="outline" size="sm" onClick={handlePreview}>
                      <MonitorPlay className="mr-2 h-4 w-4" />
                      Start Server
                  </Button>
                 <Button size="sm" onClick={handleDeploy} disabled={isDeploying}>
                      {isDeploying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                      Deploy
                  </Button>
               </div>
               <div className="flex items-center gap-2">
                 <Dialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Connect
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Salesforce Credentials</DialogTitle>
                            <DialogDescription>
                                Enter your session ID and instance URL to connect to your Salesforce org. This information is saved locally in your browser.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="instanceUrl" className="text-right">Instance URL</Label>
                                <Input id="instanceUrl" value={instanceUrl} onChange={e => setInstanceUrl(e.target.value)} className="col-span-3" placeholder="https://your-domain.my.salesforce.com" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sessionId" className="text-right">Session ID</Label>
                                <Input id="sessionId" value={sessionId} onChange={e => setSessionId(e.target.value)} className="col-span-3" placeholder="Paste your session ID here" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveCredentials}>Save Credentials</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
               </div>
            </header>
            <main className="flex-grow overflow-hidden">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={25} minSize={20} className="bg-background p-2">
                      <div className="flex flex-col h-full">
                          <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                  placeholder="Search component or items..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="bg-muted/30 border-border pl-8 h-9"
                              />
                          </div>
                          <ScrollArea className="flex-grow">
                              <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                                  <AccordionItem value="item-1" className="border-none">
                                      <AccordionTrigger className="text-xs font-bold text-muted-foreground uppercase py-2 hover:no-underline">
                                          <div className="flex items-center gap-2">
                                              <FileCode className="h-4 w-4" />
                                              Lightning Web Component
                                          </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="pl-2">
                                          {isFetching ? (
                                              <div className="flex items-center justify-center p-4">
                                                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                              </div>
                                          ) : (
                                              filteredComponents.map(comp => (
                                                  <button 
                                                      key={comp.Id} 
                                                      className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted text-sm"
                                                      onClick={() => handleFetchComponent(comp.Id, comp.DeveloperName)}
                                                  >
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={75} minSize={30}>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col rounded-lg overflow-hidden">
                          <div className="flex-shrink-0 border-b bg-muted/30">
                              <TabsList className="bg-transparent p-0 gap-0">
                                  <TabsTrigger value="html" className="data-[state=active]:text-foreground data-[state=active]:bg-background rounded-none px-4 py-2 text-sm h-auto">
                                    <CodeIcon className="w-4 h-4 mr-2" /> {componentName}.html
                                  </TabsTrigger>
                                  <TabsTrigger value="js" className="data-[state=active]:text-foreground data-[state=active]:bg-background rounded-none px-4 py-2 text-sm h-auto">
                                    <Braces className="w-4 h-4 mr-2" /> {componentName}.js
                                  </TabsTrigger>
                                  <TabsTrigger value="css" className="data-[state=active]:text-foreground data-[state=active]:bg-background rounded-none px-4 py-2 text-sm h-auto">
                                    <Paintbrush className="w-4 h-4 mr-2" /> {componentName}.css
                                  </TabsTrigger>
                                  <TabsTrigger value="xml" className="data-[state=active]:text-foreground data-[state=active]:bg-background rounded-none px-4 py-2 text-sm h-auto">
                                    <FileJson className="w-4 h-4 mr-2" /> {componentName}.js-meta.xml
                                  </TabsTrigger>
                              </TabsList>
                          </div>
                          <TabsContent value="html" className="flex-grow m-0">
                              <CodeEditor
                                  language="html"
                                  value={htmlCode}
                                  onChange={(value) => setHtmlCode(value || '')}
                                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                              />
                          </TabsContent>
                          <TabsContent value="js" className="flex-grow m-0">
                              <CodeEditor
                                  language="javascript"
                                  value={jsCode}
                                  onChange={(value) => setJsCode(value || '')}
                                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                              />
                          </TabsContent>
                          <TabsContent value="css" className="flex-grow m-0">
                              <CodeEditor
                                  language="css"
                                  value={cssCode}
                                  onChange={(value) => setCssCode(value || '')}
                                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                              />
                          </TabsContent>
                          <TabsContent value="xml" className="flex-grow m-0">
                              <CodeEditor
                                  language="xml"
                                  value={xmlCode}
                                  onChange={(value) => setXmlCode(value || '')}
                                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
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

        {/* Preview Modal */}
        {previewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden border">
              <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2">
                  <MonitorPlay className="h-4 w-4" />
                  <span className="font-medium">Sandbox Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => {
                    if (!previewIframeRef.current) return;
                    const doc = previewIframeRef.current.contentDocument || previewIframeRef.current.contentWindow?.document;
                    if (!doc) return;
                    doc.open();
                    doc.write(createSandboxHtml(htmlCode, jsCode, cssCode));
                    doc.close();
                    toast({ title: 'Preview refreshed' });
                  }}>
                    Refresh
                  </Button>
                  <Button size="sm" onClick={closePreview}><PowerOff /></Button>
                </div>
              </div>
              <iframe ref={previewIframeRef} title="lwc-sandbox-preview" className="w-full h-full border-0" />
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

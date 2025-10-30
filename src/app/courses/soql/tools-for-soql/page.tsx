
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Monitor, Globe, Code, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ToolsForSOQLPage() {
  const tools = [
    {
      icon: <Monitor className="h-6 w-6 text-blue-500" />,
      title: "Developer Console",
      description: "Salesforce's built-in, web-based IDE that includes a Query Editor for writing and executing SOQL and SOSL queries.",
      badge: "Built-in",
      steps: [
        "Log in to your Salesforce org.",
        "Click the gear icon in the top right corner.",
        "Select 'Developer Console'.",
        "Navigate to the 'Query Editor' tab at the bottom of the console.",
        "Write your SOQL query and click 'Execute'."
      ]
    },
    {
      icon: <Globe className="h-6 w-6 text-green-500" />,
      title: "Workbench",
      description: "A powerful, web-based suite of tools for administrators and developers to interact with Salesforce APIs, including a robust SOQL query builder.",
      badge: "Web-based",
      link: "https://workbench.developerforce.com/login.php",
      steps: [
        "Navigate to the Workbench website.",
        "Choose your environment (Production or Sandbox) and API version.",
        "Log in with your Salesforce credentials.",
        "Go to 'Queries' > 'SOQL Query'.",
        "Build your query using the object and field selectors or write it directly."
      ]
    },
    {
      icon: <Code className="h-6 w-6 text-purple-500" />,
      title: "VS Code with Salesforce Extensions",
      description: "The modern development environment for Salesforce. Use the Salesforce Extension Pack to write and execute SOQL queries directly in your editor.",
      badge: "Local Dev",
      link: "https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode",
      steps: [
        "Install Visual Studio Code on your machine.",
        "Install the 'Salesforce Extension Pack' from the Extensions Marketplace.",
        "Authorize your org using the command palette (Ctrl+Shift+P > 'SFDX: Authorize an Org').",
        "Open a `.soql` file or use the command 'SFDX: Execute SOQL Query with Currently Selected Text'.",
        "View results directly in the VS Code output panel."
      ]
    },
  ];

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
        <BookOpen /> Tools for SOQL
      </h2>

      <p className="text-lg text-muted-foreground">
        Several tools are available to help you write, test, and optimize your SOQL queries. Choosing the right tool often depends on your workflow and the complexity of your task.
      </p>

      <Carousel className="w-full max-w-2xl mx-auto">
        <CarouselContent>
          {tools.map((tool, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           {tool.icon}
                           <CardTitle>{tool.title}</CardTitle>
                        </div>
                        <Badge variant="outline">{tool.badge}</Badge>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h4 className="font-semibold">How to use:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        {tool.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ol>
                    {tool.link && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={tool.link} target="_blank" rel="noopener noreferrer">
                                Visit Tool <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-12" />
        <CarouselNext className="-right-12" />
      </Carousel>
    </section>
  );
}

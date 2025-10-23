'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Monitor, Globe, Code } from 'lucide-react';

export default function ToolsForSOQLPage() {
  const tools = [
    {
      icon: <Monitor className="h-6 w-6 text-blue-500" />,
      title: "Developer Console",
      description: "Salesforce's built-in, web-based IDE that includes a Query Editor for writing and executing SOQL and SOSL queries.",
    },
    {
      icon: <Globe className="h-6 w-6 text-green-500" />,
      title: "Workbench",
      description: "A powerful, web-based suite of tools for administrators and developers to interact with Salesforce APIs, including a robust SOQL query builder.",
    },
    {
      icon: <Code className="h-6 w-6 text-purple-500" />,
      title: "VS Code with Salesforce Extensions",
      description: "The modern development environment for Salesforce. Use the Salesforce Extension Pack to write, execute, and analyze SOQL queries directly in your editor.",
    },
  ];

  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <BookOpen /> Tools for SOQL
        </h2>

        <p className="text-lg text-muted-foreground">
          Several tools are available to help you write, test, and optimize your SOQL queries. Choosing the right tool depends on your workflow and the complexity of your task.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center gap-4">
                {tool.icon}
                <CardTitle>{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SelectClausePage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> SELECT Clause
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>SELECT</code> clause is the cornerstone of any SOQL query. It specifies the list of fields you want to retrieve from the specified object.
        </p>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Limitation</AlertTitle>
          <AlertDescription>
            Unlike standard SQL, you <strong>cannot</strong> use <code>SELECT *</code> in SOQL. You must explicitly name each field you want to retrieve.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Basic Field Selection</CardTitle>
            <CardDescription>Retrieve the Name and Industry fields from all Account records.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              language="sql" 
              code={`<span class="bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-1">SELECT</span> Name, Industry FROM Account`}
              tooltipContent="The SELECT clause specifies the fields (columns) you want to retrieve from the database."
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Querying Custom Fields</CardTitle>
            <CardDescription>Custom fields are identified by a <code>__c</code> suffix in their API name.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This example retrieves a standard field (`Name`) and a custom field (`Region__c`) from the Account object.</p>
            <CodeBlock 
              language="sql" 
              code={`<span class="bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-1">SELECT</span> Name, Region__c FROM Account`}
              tooltipContent="You must explicitly name each field you want to retrieve, including custom fields."
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

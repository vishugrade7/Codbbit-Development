'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function FromClausePage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> FROM Clause
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>FROM</code> clause is straightforward but crucial: it specifies the primary Salesforce object you are querying. You can only specify one object in the <code>FROM</code> clause.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Querying a Standard Object</CardTitle>
            <CardDescription>
              Standard objects are those included with Salesforce, like Account, Contact, or Opportunity. You refer to them by their standard API name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query retrieves the first and last names from the standard <code>Contact</code> object.</p>
            <CodeBlock 
              language="sql" 
              code={`SELECT FirstName, LastName <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>FROM</span> Contact`}
              tooltipContent="The FROM clause specifies the primary object you are querying."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Querying a Custom Object</CardTitle>
            <CardDescription>
              Custom objects are ones you create in your org. To query a custom object, use its API name, which always ends in <code>__c</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query retrieves the Name and Status from a custom object named <code>My_Custom_Object__c</code>.</p>
            <CodeBlock 
              language="sql" 
              code={`SELECT Name, Status__c <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>FROM</span> My_Custom_Object__c`}
              tooltipContent="The FROM clause specifies the primary object you are querying."
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}


'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function ParentToChildPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-cyan-700 dark:text-cyan-400">
          <GitBranch /> Parent-to-Child Queries
        </h2>

        <p className="text-lg text-muted-foreground">
          Parent-to-child queries (also known as subqueries or nested queries) allow you to retrieve related child records for each parent record in a single, efficient query. This is a powerful feature for fetching hierarchical data.
        </p>
        
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Key Concept</AlertTitle>
          <AlertDescription>
            The subquery uses the <strong>plural name</strong> of the child relationship (e.g., `Contacts`, `Opportunities`). For custom relationships, this is the `Child Relationship Name` defined in the lookup field, typically ending in `__r`.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Standard Relationship Example</CardTitle>
            <CardDescription>Retrieve all Accounts and, for each account, list the Name and Email of all its related Contacts.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="sql" code="SELECT Name, (SELECT Name, Email FROM Contacts) FROM Account" />
            <h4 className="font-semibold my-4">How it works:</h4>
            <p className="text-muted-foreground">The result of this query is a list of `Account` sObjects. Each `Account` object will have a nested `Contacts` property which is a `List&lt;Contact&gt;` containing the related contacts.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Custom Relationship Example</CardTitle>
            <CardDescription>Imagine a custom object `Project__c` with a lookup to `Account`. The child relationship name is `Projects__r`.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query finds all accounts and their related projects that are not yet completed.</p>
            <CodeBlock language="sql" code="SELECT Name, (SELECT Name, Status__c FROM Projects__r WHERE Status__c != 'Completed') FROM Account" />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

'use client';

import { Zap, AlertTriangle } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function DynamicSoqlPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-fuchsia-700 dark:text-fuchsia-400">
          <Zap /> Dynamic SOQL
        </h2>

        <p className="text-lg text-muted-foreground">
          Dynamic SOQL allows you to create a SOQL query string at runtime. This is useful when the fields or conditions of your query need to change based on user input or other logic.
        </p>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Warning: SOQL Injection</AlertTitle>
          <AlertDescription>
            Dynamic SOQL can be vulnerable to SOQL Injection if you directly include untrusted user input in the query string. Always use `String.escapeSingleQuotes()` on user-provided variables to prevent this.
          </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle>Using `Database.query()`</CardTitle>
                <CardDescription>Dynamic SOQL is executed using the `Database.query(queryString)` method.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="apex" code={`String objectName = 'Account';
String fieldName = 'Name';
String filterValue = 'Acme';

// Sanitize user input to prevent SOQL Injection
String sanitizedFilter = String.escapeSingleQuotes(filterValue);

// Build the query string at runtime
String queryString = 'SELECT Id, ' + fieldName + 
                   ' FROM ' + objectName + 
                   ' WHERE ' + fieldName + ' = \\'' + sanitizedFilter + '\\'';

// Execute the query
<span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>List<sObject> records = Database.query(queryString);</span>

for (sObject rec : records) {
    System.debug('Found record with Id: ' + rec.Id);
}`} 
                tooltipContent="The Database.query() method executes a SOQL query string that is built at runtime."
                />
            </CardContent>
        </Card>
      </section>
    </>
  );
}

'use client';

import { BarChart, Lightbulb } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeBlock } from '@/components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const accountData = [
  { Name: 'Acme Corp', Contacts: 5 },
  { Name: 'Global Media', Contacts: 8 },
];

export default function HavingPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <BarChart /> HAVING Clause
        </h2>
        
        <p className="text-lg text-muted-foreground">
          The <code>HAVING</code> clause is used to filter the results of a query based on an aggregate function. It's like a <code>WHERE</code> clause, but for the results of aggregate functions after they have been calculated.
        </p>

        <Alert variant="default">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>WHERE vs. HAVING</AlertTitle>
          <AlertDescription>
            - <code>WHERE</code> filters rows <strong>before</strong> they are grouped.
            <br/>
            - <code>HAVING</code> filters groups <strong>after</strong> they have been created by the <code>GROUP BY</code> clause.
          </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle>Example: Finding Accounts with Multiple Contacts</CardTitle>
                <CardDescription>Retrieve a list of accounts that have more than 3 contacts.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock 
                  language="sql" 
                  code={`SELECT AccountId, COUNT(Id) FROM Contact GROUP BY AccountId <span class="bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1">HAVING</span> COUNT(Id) > 3`}
                  tooltipContent="The HAVING clause filters the results of aggregate functions."
                />
                <h4 className="font-semibold my-4">How it works:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li><code>GROUP BY AccountId</code> first groups all contacts by their parent account.</li>
                    <li><code>COUNT(Id)</code> then counts how many contacts are in each group.</li>
                    <li><code>HAVING COUNT(Id) > 3</code> filters these groups, returning only those with a count greater than 3.</li>
                </ol>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Example: High-Value Opportunity Stages</CardTitle>
                <CardDescription>Find opportunity stages where the total amount is greater than $1,000,000.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock 
                  language="sql" 
                  code={`SELECT StageName, SUM(Amount) FROM Opportunity GROUP BY StageName <span class="bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1">HAVING</span> SUM(Amount) > 1000000`}
                  tooltipContent="HAVING is used to filter on the result of an aggregate function like SUM(), COUNT(), etc."
                />
            </CardContent>
        </Card>
      </section>
    </>
  );
}

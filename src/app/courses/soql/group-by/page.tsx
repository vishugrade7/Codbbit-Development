'use client';

import { BarChart, Lightbulb } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeBlock } from '@/components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const opportunityData = [
  { Stage: 'Prospecting', Count: 5 },
  { Stage: 'Qualification', Count: 3 },
  { Stage: 'Needs Analysis', Count: 8 },
  { Stage: 'Closed Won', Count: 12 },
  { Stage: 'Closed Lost', Count: 4 },
];

export default function GroupByPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <BarChart /> GROUP BY Clause
        </h2>
        
        <p className="text-lg text-muted-foreground">
          The <code>GROUP BY</code> clause is used with aggregate functions (like <code>COUNT()</code>, <code>SUM()</code>, <code>AVG()</code>) to group rows that have the same values in specified fields into a summary row.
        </p>

        <Alert variant="default">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Important Rule</AlertTitle>
          <AlertDescription>
            When using <code>GROUP BY</code>, any field in the <code>SELECT</code> list that is not an aggregate function <strong>must</strong> also be in the <code>GROUP BY</code> clause.
          </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle>Example: Counting Opportunities by Stage</CardTitle>
                <CardDescription>Get a count of how many opportunities are in each stage.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="sql" code="SELECT StageName, COUNT(Id) FROM Opportunity GROUP BY StageName" />
                <h4 className="font-semibold my-4">Expected Result:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>StageName</TableHead>
                      <TableHead>COUNT(Id)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunityData.map(o => (
                      <TableRow key={o.Stage}>
                        <TableCell>{o.Stage}</TableCell>
                        <TableCell>{o.Count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Example: Total Amount by Lead Source</CardTitle>
                <CardDescription>Calculate the total value of won opportunities, grouped by how they were sourced.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="sql" code="SELECT LeadSource, SUM(Amount) FROM Opportunity WHERE StageName = 'Closed Won' GROUP BY LeadSource" />
                <p className="text-muted-foreground mt-4">This query first filters for only 'Closed Won' opportunities and then groups the results by the `LeadSource` field, calculating the sum of the `Amount` for each source.</p>
            </CardContent>
        </Card>
      </section>
    </>
  );
}

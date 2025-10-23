'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const sampleAccounts = [
  { Id: '001...', Name: 'Apex Solutions', Industry: 'Technology' },
  { Id: '002...', Name: 'Global Finance', Industry: 'Finance' },
  { Id: '003...', Name: 'Innovate LLC', Industry: 'Technology' },
  { Id: '004...', Name: 'SF Web Design', Industry: 'Consulting' },
  { Id: '005...', Name: 'United Health', Industry: 'Healthcare' },
];

export default function InOperatorsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> IN and NOT IN Operators
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>IN</code> and <code>NOT IN</code> operators allow you to specify a list of values to include or exclude in your query results. This is much more efficient and readable than using multiple <code>OR</code> conditions.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>IN Operator Example</CardTitle>
            <CardDescription>Retrieves records where a field value matches any value in a specified list. Let's find all Accounts in the 'Technology' or 'Finance' industries.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="sql" code="SELECT Name, Industry FROM Account WHERE Industry IN ('Technology', 'Finance')" />
             <h4 className="font-semibold my-4">Expected Result:</h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Industry</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sampleAccounts.filter(acc => ['Technology', 'Finance'].includes(acc.Industry)).map(acc => (
                        <TableRow key={acc.Id}>
                            <TableCell>{acc.Name}</TableCell>
                            <TableCell>{acc.Industry}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>NOT IN Operator Example</CardTitle>
            <CardDescription>Retrieves records where a field value does not match any value in a specified list. Let's find all Opportunities that are not yet closed.</CardDescription>
          </CardHeader>
           <CardContent>
            <CodeBlock language="sql" code="SELECT Name, StageName FROM Opportunity WHERE StageName NOT IN ('Closed Won', 'Closed Lost')" />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const sampleAccounts = [
    { Id: '001...', Name: 'Tech Innovators', Industry: 'Technology', AnnualRevenue: 5000000 },
    { Id: '002...', Name: 'Global Finance', Industry: 'Finance', AnnualRevenue: 12000000 },
    { Id: '003...', Name: 'SF Web Design', Industry: 'Technology', AnnualRevenue: 800000 },
];

export default function WhereClausePage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> WHERE Clause
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>WHERE</code> clause is used to filter the records returned by a SOQL query. It specifies the conditions that records must meet to be included in the result set, allowing you to narrow down your data to only what's relevant.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Basic Filtering</CardTitle>
            <CardDescription>Retrieve only the Accounts that are in the 'Technology' industry.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              language="sql" 
              code={`SELECT Name, Industry FROM Account <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>WHERE</span> Industry = 'Technology'`}
              tooltipContent="The WHERE clause filters records based on specified conditions."
            />
            <h4 className="font-semibold my-4">Expected Result from Sample Data:</h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Industry</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sampleAccounts.filter(acc => acc.Industry === 'Technology').map(acc => (
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
            <CardTitle>Combining Conditions with AND</CardTitle>
            <CardDescription>You can use logical operators like <code>AND</code> to require multiple conditions to be true.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query finds accounts that are in the 'Technology' industry AND have revenue over $1,000,000.</p>
            <CodeBlock 
              language="sql" 
              code={`SELECT Name, AnnualRevenue FROM Account <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>WHERE</span> Industry = 'Technology' AND AnnualRevenue > 1000000`}
              tooltipContent="The WHERE clause filters records based on specified conditions."
            />
             <h4 className="font-semibold my-4">Expected Result from Sample Data:</h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>AnnualRevenue</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sampleAccounts.filter(acc => acc.Industry === 'Technology' && acc.AnnualRevenue > 1000000).map(acc => (
                        <TableRow key={acc.Id}>
                            <TableCell>{acc.Name}</TableCell>
                            <TableCell>${acc.AnnualRevenue.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

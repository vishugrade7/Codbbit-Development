'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code, ArrowDownZA, ArrowUpAZ, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const sampleAccounts = [
  { Name: 'Innovate LLC', AnnualRevenue: 8000000 },
  { Name: 'Apex Solutions', AnnualRevenue: null },
  { Name: 'Cloudy Inc.', AnnualRevenue: 12000000 },
  { Name: 'Acme Corp', AnnualRevenue: 5000000 },
];

export default function OrderByPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> ORDER BY Clause
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>ORDER BY</code> clause is used to sort the results of your query based on one or more fields. By default, records are returned in an unpredictable order.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Ascending and Descending Order</CardTitle>
            <CardDescription>
              You can sort in ascending order using <code>ASC</code> (which is the default, so it's optional) or in descending order using <code>DESC</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query gets the 10 most recently created accounts.</p>
            <CodeBlock language="sql" code="-- Get the 10 most recently created accounts\nSELECT Name, CreatedDate FROM Account ORDER BY CreatedDate DESC LIMIT 10" />
            <p className="text-muted-foreground my-4">This query gets accounts sorted alphabetically by name.</p>
            <CodeBlock language="sql" code="-- Sort by name from A to Z\nSELECT Name FROM Account ORDER BY Name ASC" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sorting with NULLS</CardTitle>
            <CardDescription>
              You can control how <code>NULL</code> (empty) values are sorted using <code>NULLS FIRST</code> or <code>NULLS LAST</code>.
            </CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-muted-foreground mb-4">This query orders accounts by revenue from highest to lowest, but places accounts with no revenue at the very end of the list.</p>
            <CodeBlock language="sql" code="SELECT Name, AnnualRevenue FROM Account ORDER BY AnnualRevenue DESC NULLS LAST" />
            <h4 className="font-semibold my-4">Expected Result:</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="flex items-center gap-1">Name <ArrowUpAZ className="h-4 w-4" /></TableHead>
                  <TableHead className="flex items-center gap-1">AnnualRevenue <ArrowDown className="h-4 w-4" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...sampleAccounts].sort((a,b) => (b.AnnualRevenue || -1) - (a.AnnualRevenue || -1)).map(acc => (
                  <TableRow key={acc.Name}>
                    <TableCell>{acc.Name}</TableCell>
                    <TableCell>{acc.AnnualRevenue ? `$${acc.AnnualRevenue.toLocaleString()}` : 'NULL'}</TableCell>
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

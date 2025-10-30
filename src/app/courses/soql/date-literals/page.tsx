'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const dateLiterals = [
  { literal: 'YESTERDAY', description: 'Starts 12:00:00 AM yesterday, ends 11:59:59 PM yesterday.' },
  { literal: 'TODAY', description: 'Starts 12:00:00 AM today, ends 11:59:59 PM today.' },
  { literal: 'TOMORROW', description: 'Starts 12:00:00 AM tomorrow, ends 11:59:59 PM tomorrow.' },
  { literal: 'LAST_WEEK', description: 'Starts Sunday before last, ends Saturday of last week.' },
  { literal: 'THIS_WEEK', description: 'Starts Sunday of this week, ends Saturday of this week.' },
  { literal: 'NEXT_WEEK', description: 'Starts Sunday of next week, ends Saturday of next week.' },
  { literal: 'LAST_MONTH', description: 'Starts first day of last month, ends last day of last month.' },
  { literal: 'THIS_MONTH', description: 'Starts first day of this month, ends last day of this month.' },
  { literal: 'NEXT_MONTH', description: 'Starts first day of next month, ends last day of next month.' },
  { literal: 'THIS_QUARTER', description: 'Starts first day of current quarter, ends last day of current quarter.' },
  { literal: 'LAST_YEAR', description: 'Starts January 1 of last year, ends December 31 of last year.' },
  { literal: 'THIS_YEAR', description: 'Starts January 1 of this year, ends December 31 of this year.' },
];

const nLiterals = [
  { literal: 'N_DAYS_AGO:n', description: 'From n days ago up to today.' },
  { literal: 'NEXT_N_DAYS:n', description: 'From today for the next n days.' },
  { literal: 'LAST_N_WEEKS:n', description: 'From n weeks ago up to today.' },
  { literal: 'NEXT_N_MONTHS:n', description: 'From today for the next n months.' },
];

export default function DateLiteralsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Calendar /> Date Literals
        </h2>

        <p className="text-lg text-muted-foreground">
          SOQL provides a set of powerful date literals to filter records based on relative date ranges, like "yesterday", "this month", or "last 90 days". This avoids hard-coding specific dates and makes your queries reusable.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Common Date Literals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Literal</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dateLiterals.map(d => (
                  <TableRow key={d.literal}>
                    <TableCell className="font-mono">{d.literal}</TableCell>
                    <TableCell>{d.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-2">Example: Current Quarter Opportunities</h3>
          <p className="text-muted-foreground mb-4">
            Find all opportunities created in the current calendar quarter. This query automatically adjusts based on when it's run.
          </p>
          <CodeBlock 
            language="sql" 
            code={`SELECT Name, CreatedDate FROM Opportunity WHERE CreatedDate = <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>THIS_QUARTER</span>`}
            tooltipContent="Date literals like THIS_QUARTER are keywords that represent a specific date range."
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>"Last/Next N Units" Literals</CardTitle>
            <CardDescription>For rolling date ranges, you can use these literals where `n` is an integer.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Literal</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nLiterals.map(d => (
                  <TableRow key={d.literal}>
                    <TableCell className="font-mono">{d.literal}</TableCell>
                    <TableCell>{d.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-2">Example: Recently Modified Accounts</h3>
          <p className="text-muted-foreground mb-4">
            Find all accounts modified in the last 7 days.
          </p>
          <CodeBlock 
            language="sql" 
            code={`SELECT Name, LastModifiedDate FROM Account WHERE LastModifiedDate > <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>N_DAYS_AGO:7</span>`}
            tooltipContent="Literals like N_DAYS_AGO:n allow for dynamic, rolling date ranges where 'n' is an integer."
          />
        </div>
      </section>
    </>
  );
}

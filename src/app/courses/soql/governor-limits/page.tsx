'use client';

import { Zap } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function GovernorLimitsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-fuchsia-700 dark:text-fuchsia-400">
          <Zap /> SOQL Governor Limits
        </h2>

        <p className="text-lg text-muted-foreground">
          Because Salesforce is a multi-tenant platform, Apex has strict "governor limits" to ensure that no single transaction monopolizes shared resources. Understanding these limits is critical to writing scalable code.
        </p>

        <Card>
            <CardHeader>
                <CardTitle>Key SOQL Limits (per Synchronous Transaction)</CardTitle>
                <CardDescription>These are the most common limits you will encounter.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Limit</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Common Cause of Hitting Limit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold">Total SOQL Queries</TableCell>
                      <TableCell>100</TableCell>
                      <TableCell>Placing a SOQL query inside a `for` loop.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Total Records Retrieved</TableCell>
                      <TableCell>50,000</TableCell>
                      <TableCell>Querying for a large number of records without a specific `WHERE` clause or `LIMIT`.</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground mt-4">Note: Asynchronous transactions (like Batch Apex) have higher limits. These are the limits for synchronous code like triggers and standard Apex controllers.</p>
            </CardContent>
        </Card>
      </section>
    </>
  );
}

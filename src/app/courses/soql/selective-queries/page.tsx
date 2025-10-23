'use client';

import { Goal, Lightbulb } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SelectiveQueriesPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-lime-700 dark:text-lime-400">
          <Goal /> Selective Queries
        </h2>

        <p className="text-lg text-muted-foreground">
          A "selective" SOQL query is one that is highly optimized and efficient. For a query to be selective, its `WHERE` clause must filter on an indexed field, and the filter must reduce the resulting number of records significantly.
        </p>

        <Alert variant="default">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Why are selective queries important?</AlertTitle>
          <AlertDescription>
            They are crucial for performance, especially when working with large data volumes (LDV). Non-selective queries can lead to slow performance, timeouts, and hitting governor limits.
          </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle>Indexed Fields</CardTitle>
                <CardDescription>Salesforce automatically indexes certain fields. You can also create custom indexes on custom fields.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Type</TableHead>
                      <TableHead>Indexed by Default?</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow><TableCell>Primary Keys (Id, Name)</TableCell><TableCell>Yes</TableCell></TableRow>
                    <TableRow><TableCell>Foreign Keys (Lookup & Master-Detail relationships, e.g., AccountId)</TableCell><TableCell>Yes</TableCell></TableRow>
                    <TableRow><TableCell>Audit Dates (CreatedDate, LastModifiedDate)</TableCell><TableCell>Yes</TableCell></TableRow>
                    <TableRow><TableCell>External ID Fields</TableCell><TableCell>Yes (You must mark the field as an External ID)</TableCell></TableRow>
                    <TableRow><TableCell>Most other standard and custom fields</TableCell><TableCell>No (but can be requested via Salesforce Support for custom indexes)</TableCell></TableRow>
                  </TableBody>
                </Table>
            </CardContent>
        </Card>
      </section>
    </>
  );
}

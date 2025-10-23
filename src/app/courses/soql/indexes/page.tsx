'use client';

import { Goal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function IndexesPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-lime-700 dark:text-lime-400">
          <Goal /> Indexes
        </h2>

        <p className="text-lg text-muted-foreground">
          Think of a Salesforce index like an index in the back of a book. Instead of scanning every page (every record), the database can look at the index to quickly find the records that match your query criteria. This makes queries much faster, especially with large amounts of data.
        </p>

        <Card>
            <CardHeader>
                <CardTitle>How Indexes Work</CardTitle>
                <CardDescription>When you filter a query on an indexed field, Salesforce's query optimizer can use the index to narrow down the search, drastically reducing the number of records it needs to scan.</CardDescription>
            </CardHeader>
        </Card>
      </section>
    </>
  );
}

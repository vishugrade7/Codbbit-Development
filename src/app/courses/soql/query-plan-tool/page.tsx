'use client';

import { Goal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function QueryPlanToolPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-lime-700 dark:text-lime-400">
          <Goal /> Query Plan Tool
        </h2>

        <p className="text-lg text-muted-foreground">
          The Query Plan Tool in the Developer Console is a powerful feature that shows you how Salesforce will execute your SOQL query. It helps you identify if a query is selective and whether it's using an index.
        </p>

        <Card>
            <CardHeader>
                <CardTitle>How to Use It</CardTitle>
            </CardHeader>
            <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Open the Developer Console.</li>
                    <li>Go to the "Query Editor" tab.</li>
                    <li>Enter your SOQL query.</li>
                    <li>Click the "Query Plan" button.</li>
                </ol>
                <p className="text-muted-foreground mt-4">The tool will show you the "cost" of the query. A lower cost is better. It will also tell you which index, if any, is being used.</p>
            </CardContent>
        </Card>
      </section>
    </>
  );
}

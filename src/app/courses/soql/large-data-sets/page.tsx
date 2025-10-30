'use client';

import { Goal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';

export default function LargeDataSetsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-lime-700 dark:text-lime-400">
          <Goal /> Handling Large Datasets
        </h2>

        <p className="text-lg text-muted-foreground">
          When dealing with hundreds of thousands or millions of records (Large Data Volumes or LDV), you cannot simply query all records into a list. You must use specific strategies to process them in manageable chunks.
        </p>

        <Card>
            <CardHeader>
                <CardTitle>SOQL For Loops</CardTitle>
                <CardDescription>A SOQL `for` loop is the most common way to process large datasets. It retrieves records in batches of 200, allowing you to process up to 50,000 records without hitting heap size limits.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="apex" code={`Integer totalRecords = 0;

<span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>for (List<Account> accountBatch : [SELECT Id FROM Account]) {</span>
    for (Account acc : accountBatch) {
        // Process each record
        totalRecords++;
    }
}

System.debug('Processed ' + totalRecords + ' accounts.');`}
                tooltipContent="A SOQL For Loop iterates over the records returned by a SOQL query, retrieving them in batches to conserve memory."
                 />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Batch Apex</CardTitle>
                <CardDescription>For processing more than 50,000 records or for long-running jobs, Batch Apex is the solution. It allows you to process millions of records asynchronously.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Batch Apex involves a class that implements the `Database.Batchable` interface, with `start`, `execute`, and `finish` methods. The `start` method typically returns a `Database.QueryLocator` for your SOQL query.</p>
            </CardContent>
        </Card>
      </section>
    </>
  );
}

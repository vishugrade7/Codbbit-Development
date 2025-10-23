'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function LimitOffsetPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> LIMIT and OFFSET
        </h2>

        <p className="text-lg text-muted-foreground">
          <code>LIMIT</code> and <code>OFFSET</code> are used for pagination, allowing you to retrieve a specific subset of records from a larger result set without fetching the entire collection at once.
        </p>

        <Card>
            <CardHeader>
                <CardTitle>LIMIT Clause</CardTitle>
                <CardDescription>
                    <code>LIMIT</code> restricts the maximum number of records returned by the query. This is essential for performance and for staying within Salesforce's governor limits (SOQL queries can return a max of 50,000 records).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">This query retrieves only the 10 most recently created accounts.</p>
                <CodeBlock language="sql" code="SELECT Name FROM Account ORDER BY CreatedDate DESC LIMIT 10" />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>OFFSET Clause</CardTitle>
                <CardDescription>
                    <code>OFFSET</code> skips a specified number of rows before beginning to return rows. It's typically used with <code>LIMIT</code> to build paginated interfaces (e.g., showing pages 2, 3, etc.).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">This query retrieves the third page of accounts, assuming a page size of 10.</p>
                <CodeBlock language="sql" code="-- To get page 3, we offset by (3 - 1) * 10 = 20 records\nSELECT Name FROM Account ORDER BY CreatedDate DESC LIMIT 10 OFFSET 20" />
                <Alert variant="warning" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Performance Warning</AlertTitle>
                    <AlertDescription>
                        Using a large <code>OFFSET</code> value can be very inefficient on large datasets, as the database still has to scan through all the skipped rows. For deep pagination, consider using keyset pagination (filtering based on the last seen value) instead.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      </section>
    </>
  );
}

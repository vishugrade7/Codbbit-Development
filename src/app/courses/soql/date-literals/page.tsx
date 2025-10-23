'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter } from 'lucide-react';

export default function DateLiteralsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> Date Literals
        </h2>

        <p className="text-lg text-muted-foreground">
          SOQL provides a set of powerful date literals to filter records based on relative date ranges, like "yesterday", "this month", or "last 90 days".
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">Using Date Literals</h3>
          <p className="text-muted-foreground mb-4">
            Find all opportunities created in the current calendar quarter.
          </p>
          <CodeBlock language="sql" code="SELECT Name, CreatedDate FROM Opportunity WHERE CreatedDate = THIS_QUARTER" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Using N_DAYS_AGO</h3>
          <p className="text-muted-foreground mb-4">
            Find all accounts modified in the last 7 days.
          </p>
          <CodeBlock language="sql" code="SELECT Name, LastModifiedDate FROM Account WHERE LastModifiedDate > N_DAYS_AGO:7" />
        </div>
      </section>
    </>
  );
}

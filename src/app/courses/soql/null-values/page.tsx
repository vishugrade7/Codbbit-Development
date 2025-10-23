'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter } from 'lucide-react';

export default function NullValuesPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> Handling NULL Values
        </h2>

        <p className="text-lg text-muted-foreground">
          You can filter records based on whether a field is empty (<code>NULL</code>) or not.
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">Filtering for Empty Fields</h3>
          <p className="text-muted-foreground mb-4">
            Use <code>= null</code> to find records where a specific field has no value.
          </p>
          <CodeBlock language="sql" code="-- Find all contacts that do not have an assigned account\nSELECT Name FROM Contact WHERE AccountId = null" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Filtering for Non-Empty Fields</h3>
          <p className="text-muted-foreground mb-4">
            Use <code>!= null</code> to find records where a field has any value.
          </p>
          <CodeBlock language="sql" code="-- Find all opportunities that have a Next Step defined\nSELECT Name, NextStep FROM Opportunity WHERE NextStep != null" />
        </div>
      </section>
    </>
  );
}

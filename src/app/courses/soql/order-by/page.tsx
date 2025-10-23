'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code } from 'lucide-react';

export default function OrderByPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> ORDER BY Clause
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>ORDER BY</code> clause is used to sort the results of your query based on one or more fields.
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">Ascending and Descending Order</h3>
          <p className="text-muted-foreground mb-4">
            You can sort in ascending (<code>ASC</code>, the default) or descending (<code>DESC</code>) order.
          </p>
          <CodeBlock language="sql" code="-- Get the 10 most recently created accounts\nSELECT Name, CreatedDate FROM Account ORDER BY CreatedDate DESC LIMIT 10" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Sorting with NULLS</h3>
          <p className="text-muted-foreground mb-4">
            You can specify where <code>NULL</code> values should appear in the sorted results using <code>NULLS FIRST</code> or <code>NULLS LAST</code>.
          </p>
          <CodeBlock language="sql" code="-- Order by revenue, putting accounts without revenue at the end\nSELECT Name, AnnualRevenue FROM Account ORDER BY AnnualRevenue DESC NULLS LAST" />
        </div>
      </section>
    </>
  );
}

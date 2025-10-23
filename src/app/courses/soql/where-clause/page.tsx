'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code } from 'lucide-react';

export default function WhereClausePage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> WHERE Clause
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>WHERE</code> clause is used to filter the records returned by a SOQL query. It specifies the conditions that records must meet to be included in the result set.
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">Basic Filtering</h3>
          <p className="text-muted-foreground mb-4">
            Retrieve only the Accounts that are in the 'Technology' industry.
          </p>
          <CodeBlock language="sql" code="SELECT Name, Industry FROM Account WHERE Industry = 'Technology'" />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Combining Conditions with AND</h3>
          <p className="text-muted-foreground mb-4">
            You can use the <code>AND</code> operator to require multiple conditions to be true.
          </p>
          <CodeBlock language="sql" code="SELECT Name, AnnualRevenue FROM Account WHERE Industry = 'Technology' AND AnnualRevenue > 1000000" />
        </div>
      </section>
    </>
  );
}

'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code } from 'lucide-react';

export default function LimitOffsetPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> LIMIT and OFFSET
        </h2>

        <p className="text-lg text-muted-foreground">
          <code>LIMIT</code> and <code>OFFSET</code> are used for pagination, allowing you to retrieve a specific subset of records from a larger result set.
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">LIMIT Clause</h3>
          <p className="text-muted-foreground mb-4">
            <code>LIMIT</code> restricts the number of records returned. This is essential for avoiding governor limits.
          </p>
          <CodeBlock language="sql" code="SELECT Name FROM Account LIMIT 10" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">OFFSET Clause</h3>
          <p className="text-muted-foreground mb-4">
            <code>OFFSET</code> skips a specified number of rows before beginning to return rows. It's useful for building paginated interfaces. Note: <code>OFFSET</code> can have performance implications on large data sets.
          </p>
          <CodeBlock language="sql" code="-- Retrieve the 3rd page of 10 accounts\nSELECT Name FROM Account ORDER BY CreatedDate DESC LIMIT 10 OFFSET 20" />
        </div>
      </section>
    </>
  );
}

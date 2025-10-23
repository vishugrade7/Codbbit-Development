'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter } from 'lucide-react';

export default function InOperatorsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> IN and NOT IN Operators
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>IN</code> and <code>NOT IN</code> operators allow you to specify a list of values to include or exclude in your query results, which is more efficient than using multiple <code>OR</code> conditions.
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">IN Operator</h3>
          <p className="text-muted-foreground mb-4">
            Retrieves records where a field value matches any value in a specified list.
          </p>
          <CodeBlock language="sql" code="SELECT Name, Industry FROM Account WHERE Industry IN ('Technology', 'Finance', 'Healthcare')" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">NOT IN Operator</h3>
          <p className="text-muted-foreground mb-4">
            Retrieves records where a field value does not match any value in a specified list.
          </p>
          <CodeBlock language="sql" code="SELECT Name, StageName FROM Opportunity WHERE StageName NOT IN ('Closed Won', 'Closed Lost')" />
        </div>
      </section>
    </>
  );
}

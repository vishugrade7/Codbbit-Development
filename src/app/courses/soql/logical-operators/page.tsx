'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter } from 'lucide-react';

export default function LogicalOperatorsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> Logical Operators
        </h2>

        <p className="text-lg text-muted-foreground">
          Logical operators like <code>AND</code>, <code>OR</code>, and <code>NOT</code> are used to combine multiple conditions in a <code>WHERE</code> clause.
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">AND Operator</h3>
          <p className="text-muted-foreground mb-4">
            Returns records where both conditions are true.
          </p>
          <CodeBlock language="sql" code="SELECT Name FROM Account WHERE Industry = 'Technology' AND BillingState = 'CA'" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">OR Operator</h3>
          <p className="text-muted-foreground mb-4">
            Returns records where at least one of the conditions is true.
          </p>
          <CodeBlock language="sql" code="SELECT Name FROM Contact WHERE LeadSource = 'Web' OR LeadSource = 'Partner Referral'" />
        </div>
      </section>
    </>
  );
}

'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code } from 'lucide-react';

export default function FromClausePage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> FROM Clause
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>FROM</code> clause specifies the primary Salesforce object you are querying. You can only specify one object in the <code>FROM</code> clause.
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">Querying a Standard Object</h3>
          <p className="text-muted-foreground mb-4">
            This query retrieves data from the standard <code>Contact</code> object.
          </p>
          <CodeBlock language="sql" code="SELECT FirstName, LastName FROM Contact" />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Querying a Custom Object</h3>
          <p className="text-muted-foreground mb-4">
            To query a custom object, use its API name, which ends in <code>__c</code>.
          </p>
          <CodeBlock language="sql" code="SELECT Name, Status__c FROM My_Custom_Object__c" />
        </div>
      </section>
    </>
  );
}

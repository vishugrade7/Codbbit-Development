'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Code } from 'lucide-react';

export default function SelectClausePage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <Code /> SELECT Clause
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>SELECT</code> clause is the cornerstone of any SOQL query. It specifies the list of fields you want to retrieve from the specified object. Unlike SQL, you cannot use <code>SELECT *</code>. You must explicitly name each field.
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">Basic Field Selection</h3>
          <p className="text-muted-foreground mb-4">
            Retrieve the Name and Industry fields from all Account records.
          </p>
          <CodeBlock language="sql" code="SELECT Name, Industry FROM Account" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Querying Custom Fields</h3>
          <p className="text-muted-foreground mb-4">
            Custom fields are identified by a <code>__c</code> suffix.
          </p>
          <CodeBlock language="sql" code="SELECT Name, Region__c FROM Account" />
        </div>
      </section>
    </>
  );
}

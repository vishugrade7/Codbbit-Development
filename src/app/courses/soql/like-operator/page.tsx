'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter } from 'lucide-react';

export default function LikeOperatorPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> LIKE Operator
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>LIKE</code> operator is used for wildcard string searches. It's useful for finding records that match a certain pattern.
        </p>

        <div>
          <h3 className="text-xl font-semibold mb-2">Using the '%' Wildcard</h3>
          <p className="text-muted-foreground mb-4">
            The <code>%</code> wildcard matches zero or more characters.
          </p>
          <CodeBlock language="sql" code="-- Finds all accounts whose name starts with 'United'\nSELECT Name FROM Account WHERE Name LIKE 'United%'" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Using the '_' Wildcard</h3>
          <p className="text-muted-foreground mb-4">
            The <code>_</code> wildcard matches exactly one character.
          </p>
          <CodeBlock language="sql" code="-- Finds contacts with a 5-digit postal code starting with '941__'\nSELECT Name FROM Contact WHERE MailingPostalCode LIKE '941__'" />
        </div>
      </section>
    </>
  );
}

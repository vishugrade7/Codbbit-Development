'use client';

import { Telescope } from 'lucide-react';

export default function WorkbenchPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-sky-700 dark:text-sky-400">
        <Telescope /> Workbench
      </h2>
      <p className="text-lg text-muted-foreground">
        Workbench is a powerful, web-based suite of tools for administrators and developers to interact with Salesforce APIs. Its SOQL Query builder is excellent for constructing complex queries and viewing results.
      </p>
    </section>
  );
}

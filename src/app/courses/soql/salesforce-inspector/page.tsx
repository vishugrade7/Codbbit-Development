'use client';

import { Telescope } from 'lucide-react';

export default function SalesforceInspectorPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-sky-700 dark:text-sky-400">
        <Telescope /> Salesforce Inspector
      </h2>
      <p className="text-lg text-muted-foreground">
        A popular Chrome and Firefox extension that adds a metadata layout on top of the standard Salesforce UI. It provides quick access to data and metadata, including a handy Data Export feature that allows you to write and run SOQL queries.
      </p>
    </section>
  );
}

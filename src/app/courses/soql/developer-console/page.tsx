'use client';

import { Telescope } from 'lucide-react';

export default function DeveloperConsolePage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-sky-700 dark:text-sky-400">
        <Telescope /> Developer Console
      </h2>
      <p className="text-lg text-muted-foreground">
        The Developer Console is a built-in set of tools for developing, debugging, and testing applications in your Salesforce org. It includes a powerful Query Editor for running SOQL and SOSL queries.
      </p>
    </section>
  );
}

'use client';

import { Telescope } from 'lucide-react';

export default function VsCodeExtensionsPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-sky-700 dark:text-sky-400">
        <Telescope /> VS Code Extensions
      </h2>
      <p className="text-lg text-muted-foreground">
        The official Salesforce Extension Pack for VS Code is the standard for modern Salesforce development. It allows you to execute SOQL queries directly within your editor and view the results.
      </p>
    </section>
  );
}

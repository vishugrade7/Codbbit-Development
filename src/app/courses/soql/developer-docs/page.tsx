'use client';

import { Book } from 'lucide-react';

export default function DeveloperDocsPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-rose-700 dark:text-rose-400">
        <Book /> Developer Docs
      </h2>
      <p className="text-lg text-muted-foreground">
        The official Salesforce SOQL and SOSL Reference Guide is the definitive source for syntax and advanced features. It's a must-read for any serious developer.
      </p>
    </section>
  );
}

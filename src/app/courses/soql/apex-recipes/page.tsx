'use client';

import { Book } from 'lucide-react';

export default function ApexRecipesPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-rose-700 dark:text-rose-400">
        <Book /> Apex Recipes
      </h2>
      <p className="text-lg text-muted-foreground">
        The Apex Recipes GitHub repository is a collection of easy-to-digest, runnable examples of Apex code for common use cases. It contains many excellent examples of well-written, bulk-safe SOQL queries.
      </p>
    </section>
  );
}

'use client';

import { Award } from 'lucide-react';

export default function PDIAndPDIIExamsPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-amber-700 dark:text-amber-400">
        <Award /> Platform Developer I & II
      </h2>
      <p className="text-lg text-muted-foreground">
        A deep understanding of SOQL is absolutely essential for both the Platform Developer I (PDI) and Platform Developer II (PDII) exams. You will be tested on syntax, relationship queries, aggregate functions, governor limits, and writing bulk-safe queries.
      </p>
    </section>
  );
}

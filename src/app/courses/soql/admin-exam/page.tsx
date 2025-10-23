'use client';

import { Award } from 'lucide-react';

export default function AdminExamPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-amber-700 dark:text-amber-400">
        <Award /> Administrator Exam
      </h2>
      <p className="text-lg text-muted-foreground">
        While the Administrator exam doesn't require writing SOQL, understanding data relationships and how reports are built is related. A conceptual grasp of SOQL can help you understand how the reporting engine fetches data.
      </p>
    </section>
  );
}

'use client';

import { Book } from 'lucide-react';

export default function TrailheadPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-rose-700 dark:text-rose-400">
        <Book /> Trailhead
      </h2>
      <p className="text-lg text-muted-foreground">
        Salesforce's free online learning platform, Trailhead, is the best place to start. Check out the "Apex Basics & Database" module for interactive SOQL exercises.
      </p>
    </section>
  );
}

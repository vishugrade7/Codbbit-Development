'use client';

import { Book } from 'lucide-react';

export default function GithubReposPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-rose-700 dark:text-rose-400">
        <Book /> GitHub Repos
      </h2>
      <p className="text-lg text-muted-foreground">
        Explore open-source Salesforce projects on GitHub to see how experienced developers write SOQL in real-world applications. The `salesforce-ux` and `trailheadapps` organizations are great places to start.
      </p>
    </section>
  );
}

'use client';

import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PracticeQuestionsPage() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-amber-700 dark:text-amber-400">
        <Award /> Practice Questions
      </h2>
      <p className="text-lg text-muted-foreground">
        The best way to prepare for certification is to practice. Our platform has a dedicated "SOQL" category with numerous problems to test your skills.
      </p>
      <Button asChild>
        <Link href="/problems/SOQL">Go to SOQL Problems</Link>
      </Button>
    </section>
  );
}


'use client';

import {
  BookOpen
} from 'lucide-react';
import { InteractiveSoqlQuery } from '@/components/InteractiveSoqlQuery';

export default function SOQLTutorialPage() {
  return (
    <>
      <header className="text-center space-y-4 mb-16">
        <h1 className="text-5xl font-bold font-headline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          The Complete Guide to SOQL
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
          Learn Salesforce Object Query Language from the ground up. Use the sidebar to navigate topics or interact with the query below to understand its structure.
        </p>
      </header>
      
      <InteractiveSoqlQuery />
    </>
  );
}

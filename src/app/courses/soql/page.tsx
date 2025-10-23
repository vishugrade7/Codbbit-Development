'use client';

import {
  BookOpen
} from 'lucide-react';

export default function SOQLTutorialPage() {
  return (
    <>
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-bold font-headline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          The Complete Guide to SOQL
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Learn Salesforce Object Query Language (SOQL) from the ground up —
          from basic syntax to advanced optimization, all with hands-on examples,
          tables, and code demonstrations.
        </p>
      </header>

      <section id="introduction" className="space-y-8 scroll-mt-20">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <BookOpen /> Introduction to SOQL
        </h2>

        <p className="text-muted-foreground">
          Welcome to the comprehensive guide to SOQL! This course is designed to take you from a complete beginner to a confident SOQL user. You'll learn how to retrieve, filter, and manipulate data within your Salesforce org.
        </p>
        <p className="text-muted-foreground">
          Use the navigation on the left to jump between topics. Each section builds on the previous one, so it's recommended to go in order if you're just starting out.
        </p>
      </section>
    </>
  );
}


'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import {
  BookOpen, Code, Filter, SlidersHorizontal, GitBranch, Puzzle, Zap,
  Shield, Telescope, Goal, TestTube2, Award, Book, Search, BarChart
} from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const soqlTopics = [
  { id: 'introduction', title: 'Introduction to SOQL', Icon: BookOpen, subtopics: ['What is SOQL?', 'SOQL vs SQL', 'SOQL vs SOSL', 'Tools for SOQL'] },
  { id: 'basic-syntax', title: 'Basic SOQL Syntax', Icon: Code, subtopics: ['SELECT', 'FROM', 'WHERE', 'LIMIT', 'ORDER BY', 'OFFSET'] },
  { id: 'filtering', title: 'Filtering Records', Icon: Filter, subtopics: ['Comparison Operators', 'Logical Operators', 'LIKE', 'IN / NOT IN', 'NULLs', 'Date Literals'] },
  { id: 'relationships', title: 'Relationships in SOQL', Icon: GitBranch, subtopics: ['Parent-to-Child', 'Child-to-Parent', 'Custom Objects'] },
  { id: 'aggregate-functions', title: 'Aggregate Functions', Icon: BarChart, subtopics: ['COUNT()', 'MIN(), MAX()', 'SUM(), AVG()', 'GROUP BY', 'HAVING'] },
  { id: 'soql-in-apex', title: 'SOQL in Apex', Icon: Zap, subtopics: ['Embedding SOQL', 'Querying Lists & Maps', 'Bulk-safe Queries', 'Governor Limits', 'Dynamic SOQL'] },
  { id: 'optimization', title: 'Best Practices & Optimization', Icon: Goal, subtopics: ['Avoiding SELECT *', 'Indexes', 'Query Plan', 'Reducing API Calls', 'Large Datasets'] },
  { id: 'tools-debugging', title: 'Tools & Debugging', Icon: Telescope, subtopics: ['Developer Console', 'Query Plan Tool', 'Workbench', 'Salesforce Inspector', 'VS Code Extensions'] },
  { id: 'certification', title: 'Certification Relevance', Icon: Award, subtopics: ['Administrator Exam', 'Platform Developer I & II', 'Practice Questions'] },
  { id: 'resources', title: 'Resources', Icon: Book, subtopics: ['Trailhead', 'Developer Docs', 'GitHub Repos', 'Apex Recipes'] },
];

export default function SOQLTutorialPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-200 bg-background p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 font-headline flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Search className="h-5 w-5 text-blue-500" />
          SOQL Course Index
        </h2>
        <Accordion type="multiple" defaultValue={soqlTopics.map(t => t.id)} className="w-full">
          {soqlTopics.map(({ id, title, Icon, subtopics }) => (
            <AccordionItem key={id} value={id}>
              <AccordionTrigger className="text-sm font-semibold py-2 hover:text-blue-600 dark:hover:text-blue-400">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {title}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6 border-l ml-4 border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                  {subtopics.map(sub => (
                    <Link
                      key={sub}
                      href={`#${sub.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}`}
                      className="py-1.5 text-muted-foreground hover:text-primary text-xs font-medium"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Header */}
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

          {/* INTRODUCTION */}
          <section id="introduction" className="space-y-8 scroll-mt-20">
            <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
              <BookOpen /> Introduction to SOQL
            </h2>

            <div id="what-is-soql">
              <h3 className="text-xl font-semibold mb-2">What is SOQL?</h3>
              <p className="text-muted-foreground">
                SOQL stands for <strong>Salesforce Object Query Language</strong>. It allows developers to query
                Salesforce’s database using a SQL-like syntax to retrieve data from standard and custom objects.
              </p>
            </div>

            <div id="soql-vs-sql">
              <h3 className="text-xl font-semibold mb-2">SOQL vs SQL</h3>
              <p className="text-muted-foreground mb-4">
                Although similar to SQL, SOQL has unique constraints and optimizations specific to the Salesforce platform.
              </p>

              <Table className="border border-slate-200">
                <TableHeader className="bg-blue-100 dark:bg-blue-950/40">
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>SOQL</TableHead>
                    <TableHead>SQL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Primary Use</TableCell>
                    <TableCell>Querying data from one Salesforce object</TableCell>
                    <TableCell>Querying data from multiple tables</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>SELECT *</TableCell>
                    <TableCell><Badge variant="destructive">Not Supported</Badge></TableCell>
                    <TableCell><Badge variant="secondary">Supported</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>JOINs</TableCell>
                    <TableCell>Uses relationship queries via subqueries or dot notation</TableCell>
                    <TableCell>Uses explicit JOIN clauses (INNER, LEFT, RIGHT)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Data Source</TableCell>
                    <TableCell>Salesforce Objects (e.g., Account, Contact)</TableCell>
                    <TableCell>Database Tables</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div id="soql-vs-sosl">
              <h3 className="text-xl font-semibold mb-2">SOQL vs SOSL</h3>
              <p className="text-muted-foreground">
                Use <Badge variant="outline">SOQL</Badge> when you know which object contains your data.  
                Use <Badge variant="secondary">SOSL</Badge> (Salesforce Object Search Language)
                when you want to search across multiple objects and fields.
              </p>
            </div>

            <div id="tools-for-soql">
              <h3 className="text-xl font-semibold mb-2">Tools for Writing and Testing SOQL</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Developer Console:</strong> Salesforce’s built-in SOQL query editor.</li>
                <li><strong>Workbench:</strong> A web-based suite of admin tools for advanced queries.</li>
                <li><strong>VS Code + Salesforce CLI:</strong> The modern way to run, test, and debug SOQL queries.</li>
              </ul>
            </div>
          </section>

          {/* BASIC SYNTAX */}
          <section id="basic-syntax" className="space-y-8 scroll-mt-20">
            <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-purple-700 dark:text-purple-400">
              <Code /> Basic SOQL Syntax
            </h2>

            <div>
              <h3 className="text-xl font-semibold mb-2">SELECT Statement</h3>
              <p className="text-muted-foreground">All SOQL queries begin with a <code>SELECT</code> statement.</p>
              <CodeBlock language="sql" code="SELECT Name, Industry FROM Account" />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">WHERE Clause</h3>
              <p className="text-muted-foreground">
                Filters the results based on conditions. Example:
              </p>
              <CodeBlock language="sql" code="SELECT Name FROM Account WHERE Industry = 'Technology'" />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">ORDER BY & LIMIT</h3>
              <CodeBlock language="sql" code="SELECT Name, AnnualRevenue FROM Account ORDER BY AnnualRevenue DESC LIMIT 10" />
            </div>
          </section>

          {/* AGGREGATES */}
          <section id="aggregate-functions" className="space-y-8 scroll-mt-20">
            <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
              <BarChart /> Aggregate Functions
            </h2>
            <p className="text-muted-foreground">
              Aggregate functions return summarized data such as totals, averages, or counts.
            </p>

            <Table className="border border-slate-200">
              <TableHeader className="bg-emerald-100 dark:bg-emerald-950/40">
                <TableRow>
                  <TableHead>Function</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Example</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>COUNT()</TableCell>
                  <TableCell>Returns total number of rows</TableCell>
                  <TableCell><code>SELECT COUNT(Id) FROM Account</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AVG()</TableCell>
                  <TableCell>Average of a numeric field</TableCell>
                  <TableCell><code>SELECT AVG(Amount) FROM Opportunity</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>GROUP BY</TableCell>
                  <TableCell>Groups rows into summarized results</TableCell>
                  <TableCell><code>SELECT AccountId, COUNT(Id) FROM Contact GROUP BY AccountId</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>
        </div>
      </main>
    </div>
  );
}


'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen, Code, Filter, GitBranch, Search, BarChart, Zap, Goal, Telescope, Award, Book
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AppSidebar, Sidebar, SidebarInset, SidebarProvider } from '@/components';

const soqlTopics = [
  { 
    id: 'introduction', 
    title: 'Introduction to SOQL', 
    Icon: BookOpen, 
    subtopics: [
      { slug: 'what-is-soql', title: 'What is SOQL?' },
      { slug: 'soql-vs-sql', title: 'SOQL vs SQL' },
      { slug: 'soql-vs-sosl', title: 'SOQL vs SOSL' },
      { slug: 'tools-for-soql', title: 'Tools for SOQL' }
    ] 
  },
  { 
    id: 'basic-syntax', 
    title: 'Basic SOQL Syntax', 
    Icon: Code, 
    subtopics: [
      { slug: 'select-clause', title: 'SELECT Clause' },
      { slug: 'from-clause', title: 'FROM Clause' },
      { slug: 'where-clause', title: 'WHERE Clause' },
      { slug: 'limit-offset', title: 'LIMIT and OFFSET' },
      { slug: 'order-by', title: 'ORDER BY' }
    ] 
  },
  { 
    id: 'filtering', 
    title: 'Filtering Records', 
    Icon: Filter, 
    subtopics: [
      { slug: 'comparison-operators', title: 'Comparison Operators' },
      { slug: 'logical-operators', title: 'Logical Operators' },
      { slug: 'like-operator', title: 'LIKE Operator' },
      { slug: 'in-operators', title: 'IN / NOT IN' },
      { slug: 'null-values', title: 'Handling NULLs' },
      { slug: 'date-literals', title: 'Date Literals' }
    ] 
  },
  { 
    id: 'relationships', 
    title: 'Relationships in SOQL', 
    Icon: GitBranch, 
    subtopics: [
      { slug: 'parent-to-child', title: 'Parent-to-Child' },
      { slug: 'child-to-parent', title: 'Child-to-Parent' },
      { slug: 'custom-objects', title: 'Custom Objects' }
    ] 
  },
  { 
    id: 'aggregate-functions', 
    title: 'Aggregate Functions', 
    Icon: BarChart, 
    subtopics: [
      { slug: 'count', title: 'COUNT()' },
      { slug: 'min-max-sum-avg', title: 'MIN(), MAX(), SUM(), AVG()' },
      { slug: 'group-by', title: 'GROUP BY' },
      { slug: 'having', title: 'HAVING' }
    ] 
  },
  { 
    id: 'soql-in-apex', 
    title: 'SOQL in Apex', 
    Icon: Zap, 
    subtopics: [
      { slug: 'embedding-soql', title: 'Embedding SOQL' },
      { slug: 'querying-collections', title: 'Querying Lists & Maps' },
      { slug: 'bulk-safe-queries', title: 'Bulk-safe Queries' },
      { slug: 'governor-limits', title: 'Governor Limits' },
      { slug: 'dynamic-soql', title: 'Dynamic SOQL' }
    ] 
  },
  { 
    id: 'optimization', 
    title: 'Best Practices & Optimization', 
    Icon: Goal, 
    subtopics: [
      { slug: 'selective-queries', title: 'Selective Queries' },
      { slug: 'indexes', title: 'Indexes' },
      { slug: 'query-plan-tool', title: 'Query Plan Tool' },
      { slug: 'reducing-api-calls', title: 'Reducing API Calls' },
      { slug: 'large-data-sets', title: 'Large Datasets' }
    ] 
  },
  { 
    id: 'tools-debugging', 
    title: 'Tools & Debugging', 
    Icon: Telescope, 
    subtopics: [
      { slug: 'developer-console', title: 'Developer Console' },
      { slug: 'workbench', title: 'Workbench' },
      { slug: 'salesforce-inspector', title: 'Salesforce Inspector' },
      { slug: 'vs-code-extensions', title: 'VS Code Extensions' }
    ] 
  }
];


export default function SOQLLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <aside className="w-80 border-r border-slate-200 bg-background p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 font-headline flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Link href="/courses/soql" className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                SOQL Course Index
              </Link>
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
                          key={sub.slug}
                          href={`/courses/soql/${sub.slug}`}
                          className={cn(
                            "py-1.5 hover:text-primary text-xs font-medium",
                            pathname === `/courses/soql/${sub.slug}` ? 'text-primary font-bold' : 'text-muted-foreground'
                          )}
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </aside>

          <main className="flex-1 p-8 md:p-12 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-16">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

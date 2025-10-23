
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
    BookOpen, Code, Filter, SlidersHorizontal, GitCommit, Puzzle, Zap, FileJson, Shield, Telescope, Goal, TestTube2, Award, Book, Search, Link as LinkIcon, Database, Terminal, GitBranch, Key, CheckSquare, BarChart, Lightbulb, User, Clock, FileText
} from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const soqlTopics = [
    { id: 'introduction', title: 'Introduction to SOQL', Icon: BookOpen, subtopics: ['What is SOQL?', 'SOQL vs SQL', 'SOQL vs SOSL', 'Tools for SOQL'] },
    { id: 'basic-syntax', title: 'Basic SOQL Syntax', Icon: Code, subtopics: ['SELECT', 'FROM', 'WHERE', 'LIMIT', 'ORDER BY', 'OFFSET'] },
    { id: 'filtering', title: 'Filtering Records', Icon: Filter, subtopics: ['Comparison Operators', 'Logical Operators', 'LIKE', 'IN / NOT IN', 'NULLs', 'Date Literals'] },
    { id: 'sorting-pagination', title: 'Sorting & Pagination', Icon: SlidersHorizontal, subtopics: ['ORDER BY', 'LIMIT', 'OFFSET', 'Pagination Best Practices'] },
    { id: 'relationships', title: 'Relationships in SOQL', Icon: GitBranch, subtopics: ['Parent-to-Child', 'Child-to-Parent', 'Custom Objects'] },
    { id: 'aggregate-functions', title: 'Aggregate Functions', Icon: BarChart, subtopics: ['COUNT()', 'MIN(), MAX()', 'SUM(), AVG()', 'GROUP BY', 'HAVING'] },
    { id: 'advanced-soql', title: 'Advanced SOQL', Icon: Puzzle, subtopics: ['Semi-joins & Anti-joins', 'Nested Queries', 'Polymorphic Fields', 'SOQL For Loops'] },
    { id: 'soql-in-apex', title: 'SOQL in Apex', Icon: Zap, subtopics: ['Embedding SOQL', 'Querying Lists & Maps', 'Bulk-safe Queries', 'Governor Limits', 'Dynamic SOQL'] },
    { id: 'security', title: 'Security & Permissions', Icon: Shield, subtopics: ['Field-Level Security', 'Sharing Context', 'Enforcing Sharing Rules'] },
    { id: 'tools-debugging', title: 'Tools & Debugging', Icon: Telescope, subtopics: ['Developer Console', 'Query Plan Tool', 'Workbench', 'Salesforce Inspector', 'VS Code Extensions'] },
    { id: 'optimization', title: 'Best Practices & Optimization', Icon: Goal, subtopics: ['Avoiding SELECT *', 'Indexes', 'Query Plan', 'Reducing API Calls', 'Large Datasets'] },
    { id: 'exercises', title: 'Exercises & Scenarios', Icon: TestTube2, subtopics: ['Sample Data Models', 'Interview Questions', 'Use Cases', 'Error Handling'] },
    { id: 'certification', title: 'Certification Relevance', Icon: Award, subtopics: ['Administrator Exam', 'Platform Developer I & II', 'Practice Questions'] },
    { id: 'resources', title: 'Resources', Icon: Book, subtopics: ['Trailhead', 'Developer Docs', 'GitHub Repos', 'Apex Recipes'] },
];

export default function SOQLTutorialPage() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-80 border-r bg-background p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 font-headline flex items-center gap-2">
            <Search className="h-5 w-5" />
            SOQL Course Index
        </h2>
        <Accordion type="multiple" defaultValue={soqlTopics.map(t => t.id)} className="w-full">
          {soqlTopics.map(({ id, title, Icon, subtopics }) => {
              const CurrentIcon = Icon;
              return (
              <AccordionItem key={id} value={id}>
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-2">
                  <div className="flex items-center gap-3">
                      <CurrentIcon className="h-4 w-4 text-muted-foreground" />
                      {title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-6 border-l ml-4 flex flex-col gap-1">
                      {subtopics.map(sub => (
                          <Link key={sub} href={`#${sub.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}`} className="py-1.5 text-muted-foreground hover:text-primary text-xs font-medium">
                              {sub}
                          </Link>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              )
            })}
        </Accordion>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-16">
            <header>
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                    The Complete Guide to SOQL
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Welcome to your comprehensive guide to the Salesforce Object Query Language (SOQL). This course will take you from the absolute basics to advanced querying techniques, preparing you for certification and real-world development challenges.
                </p>
            </header>
            
            <section id="introduction" className="space-y-8 scroll-mt-20">
                <h2 className="text-3xl font-bold font-headline border-b pb-3 flex items-center gap-3"><BookOpen /> Introduction to SOQL</h2>
                <div id="what-is-soql" className="prose dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold mb-2">What is SOQL?</h3>
                    <p className="text-muted-foreground">SOQL stands for Salesforce Object Query Language. It's a powerful language used to read information stored in your Salesforce org's database. Think of it as a specialized version of SQL, designed specifically to work with Salesforce's unique data structure of objects and relationships.</p>
                </div>
                 <div id="soql-vs-sql">
                     <h3 className="text-xl font-semibold mb-2">SOQL vs SQL</h3>
                    <p className="text-muted-foreground mb-4">While syntactically similar to SQL, SOQL has key differences tailored for the Salesforce platform.</p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Feature</TableHead>
                                <TableHead>SOQL</TableHead>
                                <TableHead>SQL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             <TableRow><TableCell>Primary Use</TableCell><TableCell>Querying data from a single sObject</TableCell><TableCell>Querying data from multiple tables</TableCell></TableRow>
                             <TableRow><TableCell>SELECT *</TableCell><TableCell><Badge variant="destructive">Not Supported</Badge></TableCell><TableCell><Badge variant="secondary">Supported</Badge></TableCell></TableRow>
                             <TableRow><TableCell>JOINs</TableCell><TableCell>Uses relationship queries (subqueries, dot notation)</TableCell><TableCell>Uses explicit JOIN clauses (INNER, LEFT, etc.)</TableCell></TableRow>
                             <TableRow><TableCell>Data Source</TableCell><TableCell>Salesforce objects (Accounts, Contacts, etc.)</TableCell><TableCell>Database tables</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
                 <div id="soql-vs-sosl">
                    <h3 className="text-xl font-semibold mb-2">When to use SOQL vs SOSL</h3>
                    <p className="text-muted-foreground">Use SOQL when you know which objects the data resides in. Use Salesforce Object Search Language (SOSL) when you don't know which object or field the data resides in and need to search across multiple objects.</p>
                </div>
                 <div id="tools-for-soql">
                    <h3 className="text-xl font-semibold mb-2">Tools to execute SOQL</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Developer Console:</strong> A built-in tool within Salesforce for quick queries.</li>
                        <li><strong>Workbench:</strong> A powerful, web-based suite of tools for administrators and developers.</li>
                        <li><strong>VS Code with Salesforce Extensions:</strong> The modern standard for Salesforce development, allowing you to run SOQL directly from your editor.</li>
                    </ul>
                </div>
            </section>
            
            <section id="basic-syntax" className="space-y-8 scroll-mt-20">
                <h2 className="text-3xl font-bold font-headline border-b pb-3 flex items-center gap-3"><Code /> Basic SOQL Syntax</h2>
                 <div id="select">
                    <h3 className="text-xl font-semibold mb-2">SELECT Statement Structure</h3>
                    <p className="text-muted-foreground">The basic structure of a SOQL query is `SELECT Fields FROM ObjectName`. It always starts with `SELECT`.</p>
                    <CodeBlock language="sql" code="SELECT Name, Industry FROM Account" />
                </div>
                 <div id="from">
                    <h3 className="text-xl font-semibold mb-2">FROM Clause</h3>
                    <p className="text-muted-foreground">The `FROM` clause specifies the primary Salesforce object you are querying, such as `Account`, `Contact`, or a custom object like `My_Custom_Object__c`.</p>
                </div>
                 <div id="where">
                    <h3 className="text-xl font-semibold mb-2">WHERE Clause Basics</h3>
                    <p className="text-muted-foreground">The `WHERE` clause filters the records returned by your query. For example, to find all accounts in the 'Technology' industry:</p>
                    <CodeBlock language="sql" code="SELECT Name FROM Account WHERE Industry = 'Technology'" />
                </div>
                <div id="limit">
                     <h3 className="text-xl font-semibold mb-2">LIMIT Clause</h3>
                    <p className="text-muted-foreground">`LIMIT` restricts the number of records returned. This is crucial for performance and staying within governor limits.</p>
                    <CodeBlock language="sql" code="SELECT Name FROM Account LIMIT 10" />
                </div>
                 <div id="order-by">
                     <h3 className="text-xl font-semibold mb-2">ORDER BY Clause</h3>
                    <p className="text-muted-foreground">`ORDER BY` sorts the returned records. You can sort in ascending (`ASC`) or descending (`DESC`) order.</p>
                    <CodeBlock language="sql" code="SELECT Name, AnnualRevenue FROM Account ORDER BY AnnualRevenue DESC" />
                </div>
                 <div id="offset">
                    <h3 className="text-xl font-semibold mb-2">OFFSET Clause</h3>
                    <p className="text-muted-foreground">`OFFSET` is used for pagination, allowing you to skip a specified number of rows before returning results. It's often used with `LIMIT`.</p>
                    <CodeBlock language="sql" code="-- Retrieve the third page of 10 accounts\nSELECT Name FROM Account ORDER BY Name LIMIT 10 OFFSET 20" />
                </div>
            </section>

             <section id="relationships" className="space-y-8 scroll-mt-20">
                <h2 className="text-3xl font-bold font-headline border-b pb-3 flex items-center gap-3"><GitBranch /> Relationships in SOQL</h2>
                <div id="parent-to-child">
                    <h3 className="text-xl font-semibold mb-2">Parent-to-Child (Subqueries)</h3>
                    <p className="text-muted-foreground">To query child records related to a parent, you use a subquery inside the `SELECT` statement. This is powerful for getting related lists in a single query.</p>
                    <CodeBlock language="sql" code="-- Get all contacts for each account\nSELECT Name, (SELECT FirstName, LastName FROM Contacts) FROM Account" />
                </div>
                <div id="child-to-parent">
                    <h3 className="text-xl font-semibold mb-2">Child-to-Parent (Dot Notation)</h3>
                    <p className="text-muted-foreground">To query fields from a parent record when you are querying a child, you use dot notation. This is efficient for retrieving parent details without a separate query.</p>
                    <CodeBlock language="sql" code="-- Get the Account Name for each Contact\nSELECT FirstName, LastName, Account.Name FROM Contact" />
                </div>
                <div id="custom-objects">
                    <h3 className="text-xl font-semibold mb-2">Custom Objects & Relationships</h3>
                    <p className="text-muted-foreground">For custom relationships, the syntax changes slightly. The relationship name ends in `__r` for relationship fields.</p>
                    <CodeBlock language="sql" code="-- Child-to-Parent on custom objects\nSELECT Name, Project_Manager__r.Name FROM Milestone__c\n\n-- Parent-to-Child on custom objects\nSELECT Name, (SELECT Name FROM Milestones__r) FROM Project__c" />
                </div>
            </section>
            
             <section id="filtering" className="space-y-8 scroll-mt-20">
              <h2 className="text-3xl font-bold font-headline border-b pb-3 flex items-center gap-3"><Filter /> Filtering Records</h2>
              <div id="comparison-operators">
                <h3 className="text-xl font-semibold mb-2">Comparison Operators</h3>
                <p className="text-muted-foreground">Use standard operators like `=`, `!=`, `<`, `>`, `<=`, `>=` to compare values.</p>
                <CodeBlock language="sql" code="SELECT Name FROM Account WHERE AnnualRevenue > 5000000" />
              </div>
              <div id="logical-operators">
                <h3 className="text-xl font-semibold mb-2">Logical Operators</h3>
                <p className="text-muted-foreground">Combine conditions with `AND`, `OR`, and use `NOT` for negation.</p>
                <CodeBlock language="sql" code="SELECT Name FROM Account WHERE (Industry = 'Technology' AND Rating = 'Hot') OR NumberOfEmployees > 1000" />
              </div>
              <div id="like-and-wildcards">
                <h3 className="text-xl font-semibold mb-2">LIKE and Wildcards</h3>
                <p className="text-muted-foreground">Perform pattern matching on strings using the `LIKE` operator with wildcards (`%` for multiple characters, `_` for a single character).</p>
                <CodeBlock language="sql" code="-- Find all accounts starting with 'United'\nSELECT Name FROM Account WHERE Name LIKE 'United%'" />
              </div>
              <div id="in-and-not-in">
                <h3 className="text-xl font-semibold mb-2">IN and NOT IN</h3>
                <p className="text-muted-foreground">Filter based on a collection of values.</p>
                <CodeBlock language="sql" code="SELECT Name FROM Account WHERE Industry IN ('Banking', 'Finance', 'Insurance')" />
              </div>
              <div id="null-checks">
                <h3 className="text-xl font-semibold mb-2">NULL Checks</h3>
                <p className="text-muted-foreground">Use `IS NULL` or `IS NOT NULL` to check for empty fields.</p>
                <CodeBlock language="sql" code="SELECT Name FROM Contact WHERE Phone IS NOT NULL" />
              </div>
              <div id="date-literals">
                <h3 className="text-xl font-semibold mb-2">Date Literals</h3>
                <p className="text-muted-foreground">SOQL provides convenient date literals to query date ranges without calculating specific dates.</p>
                <CodeBlock language="sql" code="-- Get all opportunities closed this month\nSELECT Name, Amount FROM Opportunity WHERE CloseDate = THIS_MONTH" />
                <p className="text-muted-foreground mt-2">Examples include: `YESTERDAY`, `TODAY`, `TOMORROW`, `LAST_WEEK`, `THIS_WEEK`, `NEXT_WEEK`, `LAST_MONTH`, `THIS_MONTH`, `NEXT_MONTH`, `LAST_90_DAYS`, `NEXT_90_DAYS`, `LAST_N_DAYS:n`, `NEXT_N_DAYS:n`, `THIS_QUARTER`, `LAST_QUARTER`, `NEXT_QUARTER`, `THIS_YEAR`, `LAST_YEAR`, `NEXT_YEAR`.</p>
              </div>
            </section>
            
             <section id="aggregate-functions" className="space-y-8 scroll-mt-20">
                <h2 className="text-3xl font-bold font-headline border-b pb-3 flex items-center gap-3"><BarChart /> Aggregate Functions</h2>
                 <p className="text-muted-foreground">Aggregate functions perform a calculation on a set of rows and return a single value. When using aggregate functions, the result is always an `AggregateResult` object.</p>
                <div id="count()">
                    <h3 className="text-xl font-semibold mb-2">COUNT() and COUNT_DISTINCT()</h3>
                    <p className="text-muted-foreground">`COUNT()` returns the number of rows matching the query criteria. `COUNT_DISTINCT()` returns the number of unique non-null values for a field.</p>
                    <CodeBlock language="sql" code="-- Get total number of accounts\nSELECT COUNT(Id) FROM Account\n\n-- Get number of distinct industries\nSELECT COUNT_DISTINCT(Industry) FROM Account" />
                </div>
                 <div id="min(),-max()">
                    <h3 className="text-xl font-semibold mb-2">MIN() and MAX()</h3>
                    <p className="text-muted-foreground">Find the minimum or maximum value of a field across the queried records.</p>
                    <CodeBlock language="sql" code="-- Find the highest and lowest employee count\nSELECT MIN(NumberOfEmployees), MAX(NumberOfEmployees) FROM Account" />
                </div>
                <div id="sum(),-avg()">
                    <h3 className="text-xl font-semibold mb-2">SUM() and AVG()</h3>
                    <p className="text-muted-foreground">Calculate the sum or average of a numeric field. Often used with `GROUP BY`.</p>
                    <CodeBlock language="sql" code="-- Get the total and average revenue for 'Technology' accounts\nSELECT SUM(AnnualRevenue), AVG(AnnualRevenue) FROM Account WHERE Industry = 'Technology'" />
                </div>
                <div id="group-by">
                    <h3 className="text-xl font-semibold mb-2">GROUP BY</h3>
                    <p className="text-muted-foreground">Groups rows that have the same values in specified fields into a single summary row. It's essential for reports and roll-up summaries.</p>
                    <CodeBlock language="sql" code="-- Count contacts per account\nSELECT AccountId, COUNT(Id) FROM Contact GROUP BY AccountId" />
                </div>
                <div id="having">
                    <h3 className="text-xl font-semibold mb-2">HAVING Clause</h3>
                    <p className="text-muted-foreground">Filters the results of a `GROUP BY` query based on the aggregated values, rather than individual row values (which is what `WHERE` does).</p>
                    <CodeBlock language="sql" code="-- Find accounts with more than 5 contacts\nSELECT AccountId, COUNT(Id) FROM Contact GROUP BY AccountId HAVING COUNT(Id) > 5" />
                </div>
            </section>
        </div>
      </main>
    </div>
  );
}


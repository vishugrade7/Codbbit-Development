
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BookOpen,
  Code,
  Filter,
  SlidersHorizontal,
  GitCommit,
  Puzzle,
  Zap,
  FileJson,
  Shield,
  Telescope,
  Goal,
  TestTube2,
  Award,
  Book,
  Search,
} from 'lucide-react';
import Link from 'next/link';

const soqlTopics = [
    { id: 'intro', title: '1. Introduction to SOQL', Icon: BookOpen },
    { id: 'syntax', title: '2. Basic SOQL Syntax', Icon: Code },
    { id: 'filtering', title: '3. Filtering Records', Icon: Filter },
    { id: 'sorting', title: '4. Sorting and Pagination', Icon: SlidersHorizontal },
    { id: 'relationships', title: '5. Relationships in SOQL', Icon: GitCommit },
    { id: 'aggregate', title: '6. Aggregate Functions', Icon: Puzzle },
    { id: 'advanced', title: '7. Advanced SOQL', Icon: Zap },
    { id: 'apex', title: '8. SOQL in Apex', Icon: FileJson },
    { id: 'security', title: '9. Security and Permissions', Icon: Shield },
    { id: 'tools', title: '10. Tools & Debugging', Icon: Telescope },
    { id: 'optimization', title: '11. Best Practices & Optimization', Icon: Goal },
    { id: 'exercises', title: '12. Exercises & Real-World Scenarios', Icon: TestTube2 },
    { id: 'certification', title: '13. Certification Relevance', Icon: Award },
    { id: 'resources', title: '14. Resources', Icon: Book },
];


export default function SOQLTutorialPage() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-80 border-r bg-background p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 font-headline flex items-center gap-2">
            <Search className="h-5 w-5" />
            SOQL Course Index
        </h2>
        <Accordion type="single" collapsible defaultValue="intro" className="w-full">
          {soqlTopics.map((topic) => (
            <AccordionItem key={topic.id} value={topic.id}>
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                <Link href={`#${topic.id}`} className="flex items-center gap-2">
                    <topic.Icon className="h-4 w-4 text-primary" />
                    {topic.title}
                </Link>
              </AccordionTrigger>
            </AccordionItem>
          ))}
        </Accordion>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-12">
            <header>
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                    The Complete Salesforce SOQL Tutorial
                </h1>
                <p className="text-lg text-muted-foreground">
                    From fundamentals to advanced techniques, this course covers everything you need to master Salesforce Object Query Language (SOQL) and excel in your developer career.
                </p>
            </header>

            <section id="intro">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary"/>1. Introduction to SOQL</CardTitle>
                        <CardDescription>Understanding the purpose and power of SOQL.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p><strong>What is SOQL?</strong> Salesforce Object Query Language (SOQL) is the language used to retrieve record data from your Salesforce organization's database. It's syntactically similar to SQL but is designed specifically for the multitenant Salesforce platform.</p>
                        <p><strong>Differences between SOQL and SQL:</strong> While both are query languages, SOQL does not support `SELECT *`, `JOIN`, or most data modification statements (`INSERT`, `UPDATE`, `DELETE`). SOQL is purely for reading data and querying relationships between objects.</p>
                        <p><strong>When to use SOQL vs SOSL:</strong> Use SOQL when you know which objects the data resides in and you want to retrieve a specific set of fields. Use Salesforce Object Search Language (SOSL) when you need to search for a term across multiple objects.</p>
                        <p><strong>Tools to execute SOQL:</strong> You can run SOQL queries in the Developer Console's Query Editor, Salesforce Inspector, Workbench, or directly within VS Code using the Salesforce Extension Pack.</p>
                    </CardContent>
                </Card>
            </section>

            <section id="syntax">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Code className="h-6 w-6 text-primary"/>2. Basic SOQL Syntax</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">The fundamental structure of a SOQL query consists of `SELECT`, `FROM`, and optional clauses like `WHERE`, `ORDER BY`, `LIMIT`, and `OFFSET`.</p>
                        <pre className="bg-muted p-4 rounded-md font-code text-sm">
                            <code className="text-foreground">
                                <span className="text-blue-500">SELECT</span> Name, Industry, AnnualRevenue<br/>
                                <span className="text-blue-500">FROM</span> Account<br/>
                                <span className="text-blue-500">WHERE</span> Industry = 'Technology'<br/>
                                <span className="text-blue-500">ORDER BY</span> AnnualRevenue DESC<br/>
                                <span className="text-blue-500">LIMIT</span> 10
                            </code>
                        </pre>
                    </CardContent>
                </Card>
            </section>
            
            <section id="filtering">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="h-6 w-6 text-primary"/>3. Filtering Records</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>Refine your queries to get precise results using the `WHERE` clause with various operators.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>Comparison:</strong> Use `=`, `!=`, `<`, `>`, `<=`, `>=` for exact matching.</li>
                           <li><strong>Logical:</strong> Combine conditions with `AND`, `OR`, `NOT`.</li>
                           <li><strong>Text Search:</strong> Use `LIKE` with wildcards (`%`, `_`) for pattern matching on strings.</li>
                           <li><strong>Set Inclusion:</strong> Use `IN` and `NOT IN` to filter based on a list of values.</li>
                           <li><strong>Nulls:</strong> Check for empty fields with `IS NULL` or `IS NOT NULL`.</li>
                           <li><strong>Dates:</strong> Use Date Literals like `YESTERDAY`, `LAST_N_DAYS:30` for dynamic date filtering.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>

             <section id="sorting">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-6 w-6 text-primary"/>4. Sorting and Pagination</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>Control the order and volume of records returned by your queries.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>ORDER BY:</strong> Sort records by one or more fields in ascending (`ASC`) or descending (`DESC`) order.</li>
                           <li><strong>LIMIT:</strong> Restrict the maximum number of records returned. Essential for avoiding governor limits.</li>
                           <li><strong>OFFSET:</strong> Skip a specified number of rows before returning results, used for building pagination.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="relationships">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><GitCommit className="h-6 w-6 text-primary"/>5. Relationships in SOQL</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                        <p>Query related data across objects, a powerful feature of SOQL.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>Child-to-Parent (Dot Notation):</strong> Access fields on a parent record. Example: `SELECT Contact.Account.Name FROM Contact`.</li>
                           <li><strong>Parent-to-Child (Subqueries):</strong> Retrieve child records within the main query. Example: `SELECT Name, (SELECT LastName FROM Contacts) FROM Account`.</li>
                           <li><strong>Custom Objects:</strong> Use `__r` for relationship fields and `__c` for custom fields/objects.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="aggregate">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Puzzle className="h-6 w-6 text-primary"/>6. Aggregate Functions</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>Summarize and group your data to derive insights.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>Functions:</strong> Use `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()` to perform calculations on your data.</li>
                           <li><strong>GROUP BY:</strong> Group results by one or more fields. Often used with aggregate functions.</li>
                           <li><strong>HAVING:</strong> Filter the results of a `GROUP BY` query based on an aggregate function's value.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>
            
            <section id="advanced">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-6 w-6 text-primary"/>7. Advanced SOQL</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>Dive into more complex query structures and scenarios.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>Semi-Joins & Anti-Joins:</strong> Use `IN` and `NOT IN` on ID fields from another query to filter records based on related data.</li>
                           <li><strong>Polymorphic Fields:</strong> Query on fields that can relate to multiple object types, like `WhatId` on Task, using `TYPEOF`.</li>
                           <li><strong>SOQL For Loops:</strong> The most efficient way to process large datasets in Apex by iterating over query results directly.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="apex">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><FileJson className="h-6 w-6 text-primary"/>8. SOQL in Apex</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>Leverage SOQL within your Apex classes and triggers to build powerful business logic.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>Embedding SOQL:</strong> Place queries directly in Apex using square brackets: `List<Account> accs = [SELECT Id FROM Account];`.</li>
                           <li><strong>Bulkification:</strong> Write queries that efficiently handle many records at once to avoid hitting governor limits. Never place SOQL inside a loop.</li>
                           <li><strong>Dynamic SOQL:</strong> Build query strings at runtime using `Database.query()` when you don't know the exact fields or conditions until your code executes.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="security">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/>9. Security and Permissions</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>Understand how Salesforce's security model impacts your queries.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>Field-Level Security (FLS):</strong> SOQL respects FLS. If a user doesn't have permission to see a field, it won't be returned, and a query on it will cause an error.</li>
                           <li><strong>Sharing Context:</strong> Apex classes run in system context by default (ignoring sharing rules) unless declared with `with sharing` or `inherited sharing`.</li>
                           <li><strong>Enforcing Rules:</strong> Use `WITH SECURITY_ENFORCED` in your SOQL queries to enforce FLS and object permissions directly in the query.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>
            
             <section id="tools">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Telescope className="h-6 w-6 text-primary"/>10. Tools & Debugging</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>Master the tools of the trade for writing and optimizing SOQL.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>Developer Console:</strong> The go-to for quickly writing and testing queries and viewing debug logs.</li>
                           <li><strong>Query Plan Tool:</strong> Analyze how Salesforce executes your query to identify performance bottlenecks.</li>
                           <li><strong>Workbench & Salesforce Inspector:</strong> Powerful web-based and browser extension tools for data inspection and advanced querying.</li>
                           <li><strong>VS Code Extensions:</strong> Write and execute SOQL directly from your editor for a seamless development workflow.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="optimization">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Goal className="h-6 w-6 text-primary"/>11. Best Practices & Optimization</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>Write efficient, scalable, and performant SOQL queries.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>Be Specific:</strong> Never use `SELECT *`. Always specify the exact fields you need.</li>
                           <li><strong>Use Selective Filters:</strong> Ensure your `WHERE` clauses use indexed fields to speed up queries.</li>
                           <li><strong>Analyze Performance:</strong> Regularly use the Query Plan Tool to ensure your queries are optimized.</li>
                           <li><strong>Handle Large Datasets:</strong> Use techniques like SOQL for loops and `queryMore()` to process large volumes of data without hitting limits.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>

             <section id="exercises">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TestTube2 className="h-6 w-6 text-primary"/>12. Exercises & Real-World Scenarios</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                       <p className="text-muted-foreground">Apply your knowledge with practical challenges.</p>
                       <Button asChild>
                           <Link href="/problems/soql">
                                Go to SOQL Practice Problems
                           </Link>
                       </Button>
                    </CardContent>
                </Card>
            </section>

             <section id="certification">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-6 w-6 text-primary"/>13. Certification Relevance</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>SOQL is a critical topic in several key Salesforce certifications.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><strong>Salesforce Administrator:</strong> Basic understanding is needed for reporting.</li>
                           <li><strong>Platform Developer I (PDI):</strong> Deep knowledge of SOQL syntax, relationship queries, and governor limits is essential.</li>
                           <li><strong>Platform Developer II (PDII):</strong> Requires advanced understanding of query optimization, dynamic SOQL, and handling large data volumes.</li>
                       </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="resources">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Book className="h-6 w-6 text-primary"/>14. Resources</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                       <p>Continue your learning journey with these official resources.</p>
                       <ul className="list-disc pl-5 space-y-1">
                           <li><a href="https://trailhead.salesforce.com/content/learn/modules/soql-for-admins" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Trailhead: SOQL for Admins</a></li>
                           <li><a href="https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql.htm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Official SOQL and SOSL Reference</a></li>
                           <li><a href="https://github.com/trailheadapps/apex-recipes" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub: Apex Recipes by Salesforce</a></li>
                       </ul>
                    </CardContent>
                </Card>
            </section>
        </div>
      </main>
    </div>
  );
}

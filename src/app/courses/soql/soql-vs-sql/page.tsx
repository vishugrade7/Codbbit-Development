'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import { BookOpen } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SOQLvsSQLPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <BookOpen /> SOQL vs. SQL
        </h2>

        <p className="text-lg text-muted-foreground">
          While SOQL (Salesforce Object Query Language) shares a similar syntax with SQL (Structured Query Language), they are fundamentally different. SQL is designed for traditional relational databases, whereas SOQL is specifically designed for querying the Salesforce multitenant database. Understanding these differences is crucial for any Salesforce developer.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Key Distinctions at a Glance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>SOQL</TableHead>
                        <TableHead>SQL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-semibold">Primary Use</TableCell>
                        <TableCell>Querying data from a single object (with related data).</TableCell>
                        <TableCell>Querying data from multiple tables and complex joins.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-semibold">SELECT *</TableCell>
                        <TableCell><Badge variant="destructive">Not Supported</Badge> You must specify each field name.</TableCell>
                        <TableCell><Badge variant="secondary">Supported</Badge> (Though often discouraged for performance).</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-semibold">JOINs</TableCell>
                        <TableCell>Uses relationship queries (dot notation) to traverse parent-to-child and child-to-parent relationships.</TableCell>
                        <TableCell>Uses explicit JOIN clauses like <code>INNER JOIN</code>, <code>LEFT JOIN</code>, <code>RIGHT JOIN</code>.</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-semibold">Data Source</TableCell>
                        <TableCell>Salesforce SObjects (e.g., Account, Contact__c)</TableCell>
                        <TableCell>Database Tables</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-semibold">Data Modification</TableCell>
                        <TableCell>Read-only. DML (Data Manipulation Language) is used in Apex for updates.</TableCell>
                        <TableCell>Supports <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> directly.</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-2">Querying Related Data: The SOQL Way</h3>
          <p className="text-muted-foreground mb-4">
            Instead of complex JOINs, SOQL uses dot notation to easily navigate relationships.
          </p>
          <h4 className="font-medium mb-2">Child-to-Parent Relationship</h4>
          <p className="text-sm text-muted-foreground mb-4">
            This query retrieves the Name from the Contact and the Name from its related Account.
          </p>
          <CodeBlock language="sql" code="SELECT Name, Account.Name FROM Contact" />

           <h4 className="font-medium mb-2 mt-6">Parent-to-Child Relationship</h4>
          <p className="text-sm text-muted-foreground mb-4">
            This query retrieves the Name from each Account and a sub-list of all related Contacts for each Account. Note the plural name for the child relationship (`Contacts`).
          </p>
          <CodeBlock language="sql" code="SELECT Name, (SELECT Name, Email FROM Contacts) FROM Account" />
        </div>
        
         <div>
          <h3 className="text-xl font-semibold mb-2">Querying Related Data: The SQL Way</h3>
          <p className="text-muted-foreground mb-4">
            SQL requires an explicit <code>JOIN</code> clause to connect the `contacts` and `accounts` tables.
          </p>
          <CodeBlock language="sql" code={`SELECT\n  c.name AS contact_name,\n  a.name AS account_name\nFROM\n  contacts c\nINNER JOIN\n  accounts a ON c.account_id = a.id;`} />
        </div>
      </section>
    </>
  );
}

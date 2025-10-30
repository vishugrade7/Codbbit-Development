'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const sampleAccounts = [
  { Id: '001...', Name: 'United Oil & Gas' },
  { Id: '002...', Name: 'United Technologies' },
  { Id: '003...', Name: 'Global Solutions' },
];

const sampleContacts = [
  { Id: '001...', Name: 'Jane Doe', PostalCode: '94105' },
  { Id: '002...', Name: 'John Smith', PostalCode: '94110' },
  { Id: '003...', Name: 'Sam Wilson', PostalCode: '90210' },
];

export default function LikeOperatorPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> LIKE Operator
        </h2>

        <p className="text-lg text-muted-foreground">
          The <code>LIKE</code> operator is used for wildcard string searches in a <code>WHERE</code> clause. It's useful for finding records that match a certain pattern, rather than an exact value.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Using the '%' Wildcard</CardTitle>
            <CardDescription>The <code>%</code> wildcard matches zero or more characters. It can be placed at the beginning, end, or both sides of a string.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query finds all accounts whose name starts with 'United'.</p>
            <CodeBlock 
              language="sql" 
              code={`SELECT Name FROM Account WHERE Name <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>LIKE</span> 'United%'`}
              tooltipContent="The LIKE operator performs a wildcard search. The '%' character matches zero or more characters."
            />
            <h4 className="font-semibold my-4">Expected Result from Sample Data:</h4>
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
                <TableBody>
                    {sampleAccounts.filter(acc => acc.Name.startsWith('United')).map(acc => (
                        <TableRow key={acc.Id}><TableCell>{acc.Name}</TableCell></TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Using the '_' Wildcard</CardTitle>
            <CardDescription>The <code>_</code> wildcard matches exactly one character.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query finds contacts with a 5-digit postal code starting with '941'.</p>
            <CodeBlock 
              language="sql" 
              code={`SELECT Name, MailingPostalCode FROM Contact WHERE MailingPostalCode <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>LIKE</span> '941__'`}
              tooltipContent="The '_' character matches exactly one character. Two underscores ('__') will match two characters."
            />
            <h4 className="font-semibold my-4">Expected Result from Sample Data:</h4>
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>PostalCode</TableHead></TableRow></TableHeader>
                <TableBody>
                    {sampleContacts.filter(c => c.PostalCode.startsWith('941') && c.PostalCode.length === 5).map(c => (
                        <TableRow key={c.Id}><TableCell>{c.Name}</TableCell><TableCell>{c.PostalCode}</TableCell></TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

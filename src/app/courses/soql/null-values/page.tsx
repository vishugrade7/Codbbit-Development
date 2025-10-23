'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const sampleContacts = [
  { Id: '001...', Name: 'John Doe', AccountId: '001A...' },
  { Id: '002...', Name: 'Jane Smith', AccountId: '001B...' },
  { Id: '003...', Name: 'Lead Leaderson', AccountId: null },
];

export default function NullValuesPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> Handling NULL Values
        </h2>

        <p className="text-lg text-muted-foreground">
          In SOQL, a <code>NULL</code> value represents an empty or non-existent value for a field. You can filter records based on whether a field is <code>NULL</code> or not.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Filtering for Empty (NULL) Fields</CardTitle>
            <CardDescription>Use <code>= null</code> to find records where a specific field has no value.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query finds all contacts that do not have an assigned account (i.e., they are private contacts or have not been associated with an Account record).</p>
            <CodeBlock language="sql" code="SELECT Name FROM Contact WHERE AccountId = null" />
            <h4 className="font-semibold my-4">Expected Result from Sample Data:</h4>
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
                <TableBody>
                    {sampleContacts.filter(c => c.AccountId === null).map(c => (
                        <TableRow key={c.Id}><TableCell>{c.Name}</TableCell></TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Filtering for Non-Empty (NOT NULL) Fields</CardTitle>
            <CardDescription>Use <code>!= null</code> to find records where a field has any value.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query finds all opportunities that have a "Next Step" defined, helping sales reps focus on actionable items.</p>
            <CodeBlock language="sql" code="SELECT Name, NextStep FROM Opportunity WHERE NextStep != null" />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

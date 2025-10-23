'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeBlock } from '@/components/CodeBlock';

export default function SOQLvsSOSLPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <BookOpen /> SOQL vs. SOSL
        </h2>

        <p className="text-lg text-muted-foreground">
          Salesforce provides two powerful query languages: SOQL and SOSL. While SOQL is used to retrieve records from a known object, SOSL (Salesforce Object Search Language) is used to perform text-based searches across multiple objects at once.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>When to Use Which</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Scenario</TableHead>
                        <TableHead>Use SOQL</TableHead>
                        <TableHead>Use SOSL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-semibold">Known Object</TableCell>
                        <TableCell>✅ You know which object contains the data.</TableCell>
                        <TableCell>❌</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-semibold">Multi-Object Search</TableCell>
                        <TableCell>❌</TableCell>
                        <TableCell>✅ You need to find a term across many objects.</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-semibold">Specific Fields</TableCell>
                        <TableCell>✅ You want to retrieve specific fields.</TableCell>
                        <TableCell>❌ (Returns a list of sObjects)</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-semibold">Text Search</TableCell>
                        <TableCell>Limited (LIKE operator)</TableCell>
                        <TableCell>✅ Optimized for full-text search.</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-2">SOSL Query Example</h3>
          <p className="text-muted-foreground mb-4">
            This query searches for the term 'SFDX' in the Name field of Account and the LastName field of Contact.
          </p>
          <CodeBlock language="apex" code={`List<List<SObject>> searchList = [FIND 'SFDX' IN ALL FIELDS RETURNING Account(Name), Contact(LastName)];`} />
        </div>
      </section>
    </>
  );
}

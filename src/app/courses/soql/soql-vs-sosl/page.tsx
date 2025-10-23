'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Search, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeBlock } from '@/components/CodeBlock';
import { Badge } from '@/components/ui/badge';

export default function SOQLvsSOSLPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Search /> SOQL vs. SOSL
        </h2>

        <p className="text-lg text-muted-foreground">
          Salesforce provides two powerful query languages: SOQL and SOSL. While SOQL is used to retrieve records from a known object based on specific criteria, SOSL (Salesforce Object Search Language) is a full-text search language used to perform text-based searches across multiple objects at once.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>When to Use Which</CardTitle>
            <CardDescription>Choosing the right language depends on your specific needs.</CardDescription>
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
                        <TableCell className="font-semibold">Retrieving Data from a Single Object</TableCell>
                        <TableCell><Badge className="bg-green-500 hover:bg-green-600"><Check className="mr-1 h-3 w-3" /> Yes</Badge></TableCell>
                        <TableCell><Badge variant="destructive"><X className="mr-1 h-3 w-3" /> No</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-semibold">Searching for a Term Across Multiple Objects</TableCell>
                        <TableCell><Badge variant="destructive"><X className="mr-1 h-3 w-3" /> No</Badge></TableCell>
                        <TableCell><Badge className="bg-green-500 hover:bg-green-600"><Check className="mr-1 h-3 w-3" /> Yes</Badge></TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-semibold">Retrieving Specific Fields</TableCell>
                        <TableCell><Badge className="bg-green-500 hover:bg-green-600"><Check className="mr-1 h-3 w-3" /> Yes</Badge></TableCell>
                        <TableCell>Limited (returns a list of sObjects)</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-semibold">Text Search in Unknown Fields</TableCell>
                        <TableCell>Limited (LIKE operator on known fields)</TableCell>
                        <TableCell><Badge className="bg-green-500 hover:bg-green-600"><Check className="mr-1 h-3 w-3" /> Yes</Badge> (Optimized for full-text search)</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-semibold">Querying on Number/Date/Checkbox Fields</TableCell>
                        <TableCell><Badge className="bg-green-500 hover:bg-green-600"><Check className="mr-1 h-3 w-3" /> Yes</Badge></TableCell>
                        <TableCell><Badge variant="destructive"><X className="mr-1 h-3 w-3" /> No</Badge></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-2">SOSL Query Example</h3>
          <p className="text-muted-foreground mb-4">
            This Apex code snippet demonstrates a SOSL query searching for the term 'SFDX' in all text fields across the Account and Contact objects.
          </p>
          <CodeBlock language="apex" code={`// The FIND clause is the core of SOSL\nList<List<SObject>> searchList = [FIND 'SFDX' IN ALL FIELDS RETURNING Account(Name), Contact(LastName)];\n\n// The result is a list of lists, one for each object searched\nList<Account> foundAccounts = (List<Account>)searchList[0];\nList<Contact> foundContacts = (List<Contact>)searchList[1];`} />
        </div>
      </section>
    </>
  );
}

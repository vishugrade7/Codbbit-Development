'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const sampleContacts = [
    { Name: 'John Doe', AccountName: 'Acme Corp' },
    { Name: 'Jane Smith', AccountName: 'Global Media' },
    { Name: 'Sam Wilson', AccountName: 'Acme Corp' },
];

export default function ChildToParentPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-cyan-700 dark:text-cyan-400">
          <GitBranch /> Child-to-Parent Queries
        </h2>

        <p className="text-lg text-muted-foreground">
          Child-to-parent queries are used to access data from a related parent object. This is done using "dot notation" to traverse up the relationship from the child (the object in the `FROM` clause) to the parent.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Standard Relationship Example</CardTitle>
            <CardDescription>Retrieve the Name of each Contact along with the Name of its associated Account.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              language="sql" 
              code="SELECT Name, <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-1'>Account.Name</span> FROM Contact" 
              tooltipContent={
                <p>
                  This query selects the <code className="font-bold">Name</code> field from the Contact object and uses dot notation (<code className="font-bold">Account.Name</code>) to access the <code className="font-bold">Name</code> field of the parent Account object.
                </p>
              }
            />
            <h4 className="font-semibold my-4">Expected Result:</h4>
            <Table>
                <TableHeader><TableRow><TableHead>Contact Name</TableHead><TableHead>Account Name</TableHead></TableRow></TableHeader>
                <TableBody>
                    {sampleContacts.map(c => (
                        <TableRow key={c.Name}><TableCell>{c.Name}</TableCell><TableCell>{c.AccountName}</TableCell></TableRow>
                    ))}
                </TableBody>
            </Table>
            <p className="text-muted-foreground mt-4">Here, `Account` is the name of the relationship from Contact to Account. You can then use the dot `.` to access any field on the Account object, like `Account.Industry` or `Account.BillingCity`.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Custom Relationship Example</CardTitle>
            <CardDescription>Imagine a custom `Invoice__c` object with a lookup to a custom `Project__c` object. The relationship name on the lookup field is `Project__r`.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-muted-foreground mb-4">This query retrieves invoice details and the name of the associated project.</p>
            <CodeBlock 
              language="sql" 
              code="SELECT Name, Amount__c, <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-1'>Project__r.Name</span> FROM Invoice__c" 
              tooltipContent={
                 <p>
                  The <code className="font-bold">__r</code> suffix denotes a custom relationship. This query traverses from the child <code className="font-bold">Invoice__c</code> object to the parent <code className="font-bold">Project__c</code> object to retrieve its name.
                </p>
              }
            />
            <p className="text-muted-foreground mt-4">Notice the `__r` suffix. This is the standard notation for custom relationships.</p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

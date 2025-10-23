'use client';

import { Goal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';

export default function ReducingApiCallsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-lime-700 dark:text-lime-400">
          <Goal /> Reducing API Calls
        </h2>

        <p className="text-lg text-muted-foreground">
          Efficiently written SOQL can significantly reduce the number of API calls your application makes, which is critical for performance and staying within platform limits.
        </p>

        <Card>
            <CardHeader>
                <CardTitle>Inefficient: Multiple Queries</CardTitle>
                <CardDescription>Making separate queries for related data is inefficient.</CardDescription>
            </CardHeader>
            <CardContent>
                 <CodeBlock language="apex" code={`List<Account> accounts = [SELECT Id FROM Account LIMIT 10];
for (Account acc : accounts) {
    // This makes a new API call inside the loop for each account!
    List<Contact> contacts = [SELECT Name FROM Contact WHERE AccountId = :acc.Id];
}`} />
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Efficient: Single Parent-to-Child Query</CardTitle>
                <CardDescription>Use a single parent-to-child subquery to fetch all the data at once.</CardDescription>
            </CardHeader>
            <CardContent>
                 <CodeBlock language="apex" code={`// One query fetches all accounts and their related contacts
List<Account> accountsWithContacts = [SELECT Name, (SELECT Name FROM Contacts) FROM Account LIMIT 10];

for (Account acc : accountsWithContacts) {
    System.debug('Account: ' + acc.Name);
    for (Contact c : acc.Contacts) {
        System.debug('  - Contact: ' + c.Name);
    }
}`} />
            </CardContent>
        </Card>
      </section>
    </>
  );
}

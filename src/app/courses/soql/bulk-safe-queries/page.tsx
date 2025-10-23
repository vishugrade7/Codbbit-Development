'use client';

import { Zap, ShieldCheck } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function BulkSafeQueriesPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-fuchsia-700 dark:text-fuchsia-400">
          <ShieldCheck /> Bulk-Safe SOQL Queries
        </h2>

        <p className="text-lg text-muted-foreground">
          Writing "bulk-safe" code is the most important concept in Apex development. It means ensuring your code can handle a large number of records at once without hitting governor limits. For SOQL, this means <strong>never placing a query inside a loop</strong>.
        </p>

        <Card>
            <CardHeader>
                <CardTitle className="text-red-500">Incorrect: SOQL Inside a Loop</CardTitle>
                <CardDescription>This code is not bulk-safe. If the `contacts` list has 101 items, it will fail because it exceeds the limit of 100 SOQL queries per transaction.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="apex" code={`List<Contact> contacts = [SELECT Id, AccountId FROM Contact LIMIT 200];
List<Account> parentAccounts = new List<Account>();

// BAD PRACTICE: Query inside a loop
for (Contact c : contacts) {
    Account acc = [SELECT Id, Name FROM Account WHERE Id = :c.AccountId];
    parentAccounts.add(acc);
}`} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-green-500">Correct: Bulk-Safe Pattern</CardTitle>
                <CardDescription>Collect all necessary IDs first, then perform a single query to retrieve all required records at once.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="apex" code={`List<Contact> contacts = [SELECT Id, AccountId FROM Contact WHERE AccountId != null LIMIT 200];

// 1. Collect all the parent Account IDs into a Set to ensure uniqueness
Set<Id> accountIds = new Set<Id>();
for (Contact c : contacts) {
    accountIds.add(c.AccountId);
}

// 2. Perform a SINGLE query to get all related accounts at once
Map<Id, Account> accountMap = new Map<Id, Account>([SELECT Id, Name FROM Account WHERE Id IN :accountIds]);

// 3. Process the results by looking up parent accounts in the map
for (Contact c : contacts) {
    Account parentAccount = accountMap.get(c.AccountId);
    if (parentAccount != null) {
        System.debug('Contact ' + c.Name + ' belongs to ' + parentAccount.Name);
    }
}`} />
            </CardContent>
        </Card>
      </section>
    </>
  );
}

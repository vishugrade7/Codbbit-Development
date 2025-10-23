'use client';

import { Zap } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EmbeddingSoqlPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-fuchsia-700 dark:text-fuchsia-400">
          <Zap /> Embedding SOQL in Apex
        </h2>

        <p className="text-lg text-muted-foreground">
          The most common way to use SOQL is by embedding it directly within your Apex code. This is done using square brackets `[]` and is known as a "static SOQL" query.
        </p>

        <Card>
            <CardHeader>
                <CardTitle>Basic Static SOQL</CardTitle>
                <CardDescription>The query is written directly in Apex and the results are assigned to a variable.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="apex" code={`// Query for a list of records
List<Account> accounts = [SELECT Id, Name FROM Account WHERE Industry = 'Technology'];

// Query for a single record (throws an error if no records or more than one are found)
Account singleAccount = [SELECT Id, Name FROM Account WHERE Name = 'Acme Corp' LIMIT 1];

// You can also get an integer count directly
Integer numberOfAccounts = [SELECT COUNT() FROM Account];`} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Using Bind Variables</CardTitle>
                <CardDescription>You can use Apex variables in your SOQL query by prefixing them with a colon `:`. This is a crucial security feature to prevent SOQL Injection.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="apex" code={`String industry = 'Energy';
List<Account> energyAccounts = [SELECT Id, Name FROM Account WHERE Industry = :industry];

Set<Id> accountIds = new Set<Id>{'001...', '002...'};
List<Contact> contacts = [SELECT Id, Name FROM Contact WHERE AccountId IN :accountIds];`} />
            </CardContent>
        </Card>
      </section>
    </>
  );
}

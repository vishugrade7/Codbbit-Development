'use client';

import { Zap, Lightbulb } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function QueryingCollectionsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-fuchsia-700 dark:text-fuchsia-400">
          <Zap /> Querying for Lists and Maps
        </h2>

        <p className="text-lg text-muted-foreground">
          SOQL queries in Apex can return their results directly into different collection types, which is essential for efficient data handling.
        </p>

        <Card>
            <CardHeader>
                <CardTitle>Querying into a List</CardTitle>
                <CardDescription>This is the most common use case. The query result is a `List` of sObjects.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="apex" code={`<span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>List<Account> accounts = [SELECT Id, Name, Industry FROM Account];</span>

for (Account acc : accounts) {
    System.debug('Account Name: ' + acc.Name);
}`} 
                tooltipContent="A SOQL query can be directly assigned to a List of sObjects."
                />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Querying into a Map</CardTitle>
                <CardDescription>Querying directly into a `Map` is incredibly useful for quickly accessing records by their ID without having to loop through a list.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="apex" code={`// The query populates a Map where the key is the sObject's Id
<span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>Map<Id, Account> accountMap = new Map<Id, Account>([SELECT Id, Name FROM Account WHERE Active__c = 'Yes']);</span>

// Now you can access an account directly if you have its Id
Id anAccountId = '0015g00000kGABCXYZ'; 
if (accountMap.containsKey(anAccountId)) {
    Account myAccount = accountMap.get(anAccountId);
    System.debug('Found Account: ' + myAccount.Name);
}`} 
                tooltipContent="A SOQL query can be used to construct a Map directly, where the map keys are the Ids of the queried sObjects."
                />
                 <Alert variant="default" className="mt-4">
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Pro Tip</AlertTitle>
                  <AlertDescription>
                    Using a `Map` is much more performant than iterating over a large `List` to find a specific record. It's a best practice for processing trigger context data.
                  </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      </section>
    </>
  );
}

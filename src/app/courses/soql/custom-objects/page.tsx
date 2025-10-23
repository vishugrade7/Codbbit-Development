'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function CustomObjectsPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-cyan-700 dark:text-cyan-400">
          <GitBranch /> Querying Custom Objects
        </h2>

        <p className="text-lg text-muted-foreground">
          Querying custom objects and custom fields is a fundamental part of SOQL. The key is to use the correct API names, which always end with `__c`.
        </p>

        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Naming Convention</AlertTitle>
          <AlertDescription>
            Both custom objects and custom fields have an `__c` suffix. For custom relationships, the relationship name ends in `__r`.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Querying a Custom Object</CardTitle>
            <CardDescription>This query retrieves a standard field (`Name`) and a custom field (`Priority__c`) from a custom object named `Project__c`.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="sql" code="SELECT Name, Priority__c, Status__c FROM Project__c WHERE Status__c = 'In Progress'" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Child-to-Parent with Custom Relationship</CardTitle>
            <CardDescription>An `Invoice__c` object has a custom lookup to an `Account` object. The relationship field is `Account__c` (and the relationship name is `Account__r`).</p>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query gets invoice numbers and their corresponding Account names.</p>
            <CodeBlock language="sql" code="SELECT Name, Account__r.Name FROM Invoice__c" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent-to-Child with Custom Relationship</CardTitle>
            <CardDescription>An `Account` has a master-detail relationship with a custom `Service_Contract__c` object. The child relationship name is `Service_Contracts__r`.</p>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query retrieves accounts and all their related service contracts.</p>
            <CodeBlock language="sql" code="SELECT Name, (SELECT Contract_Number__c, End_Date__c FROM Service_Contracts__r) FROM Account" />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

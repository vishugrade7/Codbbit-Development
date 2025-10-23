'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import { BookOpen } from 'lucide-react';

export default function WhatIsSoqlPage() {
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <BookOpen /> What is SOQL?
        </h2>

        <p className="text-lg text-muted-foreground">
          SOQL, which stands for <strong>Salesforce Object Query Language</strong>, is the language you use to read and retrieve information from your Salesforce organization's database. Think of it as a specialized version of SQL (Structured Query Language) that is purpose-built for the Salesforce multi-tenant platform.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Core Purpose</CardTitle>
            <CardDescription>The primary function of SOQL is to construct simple but powerful query strings that specify:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 pl-4 text-muted-foreground">
              <li>The <strong>object(s)</strong> you want to retrieve records from (e.g., `Account`, `Contact`, `My_Custom_Object__c`).</li>
              <li>The specific <strong>fields</strong> you want to retrieve for each record (e.g., `Name`, `Industry`, `Email`).</li>
              <li>The <strong>conditions</strong> that records must meet to be included in the results (e.g., accounts in the 'Technology' industry, or contacts created this year).</li>
            </ul>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-2">A Simple SOQL Query Example</h3>
          <p className="text-muted-foreground mb-4">
            This query retrieves the `Name` and `Industry` fields from all `Account` records.
          </p>
          <CodeBlock language="sql" code="SELECT Name, Industry FROM Account" />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Key Characteristics</h3>
          <div className="grid md:grid-cols-2 gap-4">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-lg">Read-Only Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground">SOQL is strictly for querying data. You cannot use it to modify records (create, update, or delete). For data modification, you use a separate language called DML (Data Manipulation Language) within Apex.</p>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader>
                      <CardTitle className="text-lg">Object-Oriented</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground">Instead of querying database tables directly, you query Salesforce "Objects" and their relationships. This aligns with the object-oriented nature of Apex and the Salesforce platform.</p>
                  </CardContent>
              </Card>
          </div>
        </div>
      </section>
    </>
  );
}

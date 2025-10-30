
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import { Search, Brain, Rocket, Lightbulb, Puzzle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SOQLvsSOSLPage() {
  const whatTheyAre = [
    { term: 'SQL', fullName: 'Structured Query Language', usedIn: 'Databases (e.g., MySQL, PostgreSQL, Oracle)', purpose: 'Query and manipulate relational database data' },
    { term: 'SOQL', fullName: 'Salesforce Object Query Language', usedIn: 'Salesforce', purpose: 'Retrieve records from a single object or related objects' },
    { term: 'SOSL', fullName: 'Salesforce Object Search Language', usedIn: 'Salesforce', purpose: 'Search text, email, or phone fields across multiple objects simultaneously' },
  ];

  const keyDifferences = [
    { feature: 'Purpose', soql: 'Query records from one object (or related objects)', sosl: 'Search for text across multiple objects' },
    { feature: 'Search Type', soql: 'Structured query (like SQL SELECT)', sosl: 'Free-text keyword search' },
    { feature: 'Objects Queried', soql: 'One object at a time (though related objects can be queried)', sosl: 'Multiple objects at once' },
    { feature: 'Fields Queried', soql: 'Must specify fields (SELECT Name, Id FROM Account)', sosl: 'Searches all searchable text fields (FIND \'John\')' },
    { feature: 'Use Case', soql: 'You know where the data is', sosl: 'You don’t know where the data might be' },
    { feature: 'Return Type', soql: 'List of records from one object', sosl: 'List of lists (records grouped by object type)' },
  ];
  
  const whenToUse = [
      { situation: 'You need specific fields from a known object', use: 'SOQL' },
      { situation: 'You need to find a record but don’t know which object it’s in', use: 'SOSL' },
      { situation: 'You need to perform joins or relationship queries', use: 'SOQL' },
      { situation: 'You need a global text search across Salesforce', use: 'SOSL' },
  ];

  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Search /> SOQL vs. SOSL
        </h2>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> What They Are</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Term</TableHead>
                            <TableHead>Full Form</TableHead>
                            <TableHead>Used In</TableHead>
                            <TableHead>Purpose</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {whatTheyAre.map(item => (
                            <TableRow key={item.term}>
                                <TableCell className="font-bold">{item.term}</TableCell>
                                <TableCell>{item.fullName}</TableCell>
                                <TableCell>{item.usedIn}</TableCell>
                                <TableCell>{item.purpose}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Puzzle className="h-5 w-5" /> Key Differences Between SOQL and SOSL</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>SOQL</TableHead>
                        <TableHead>SOSL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {keyDifferences.map(item => (
                         <TableRow key={item.feature}>
                            <TableCell className="font-semibold">{item.feature}</TableCell>
                            <TableCell>{item.soql}</TableCell>
                            <TableCell>{item.sosl}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">🧩 Example of SOQL</h3>
              <p className="text-muted-foreground mb-4">
                Find all Accounts in the Technology industry:
              </p>
              <CodeBlock language="sql" code="SELECT Id, Name, Industry FROM Account WHERE Industry = 'Technology'" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">🔎 Example of SOSL</h3>
              <p className="text-muted-foreground mb-4">
                Find “John” across multiple objects. This searches all text fields in Account and Contact for the term John.
              </p>
              <CodeBlock language="sql" code="FIND 'John' IN ALL FIELDS RETURNING Account(Id, Name), Contact(Id, FirstName, LastName)" />
            </div>
        </div>

        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5"/> When to Use Which</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Situation</TableHead><TableHead>Use</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {whenToUse.map(item => (
                            <TableRow key={item.situation}>
                                <TableCell>{item.situation}</TableCell>
                                <TableCell className="font-bold">{item.use}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
             <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5"/> Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-lg">
                <p><strong>SOQL</strong> = “Give me structured data from one object.”</p>
                <p><strong>SOSL</strong> = “Search everywhere for this term.”</p>
            </CardContent>
        </Card>
      </section>
    </>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import { BookOpen, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MCQ = ({ question, options, correctAnswer, onAnswer }: { question: string, options: string[], correctAnswer: string, onAnswer: (isCorrect: boolean) => void }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    setIsAnswered(true);
    onAnswer(selectedOption === correctAnswer);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Your Knowledge</CardTitle>
        <CardDescription>{question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all',
                selectedOption === option && 'bg-blue-100 dark:bg-blue-900 border-blue-500',
                isAnswered && option === correctAnswer && 'bg-green-100 dark:bg-green-900 border-green-500',
                isAnswered && selectedOption === option && option !== correctAnswer && 'bg-red-100 dark:bg-red-900 border-red-500'
              )}
            >
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0">
                {selectedOption === option && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
              </div>
              <span className="flex-1">{option}</span>
              {isAnswered && option === correctAnswer && <Check className="h-5 w-5 text-green-600" />}
              {isAnswered && selectedOption === option && option !== correctAnswer && <X className="h-5 w-5 text-red-600" />}
            </div>
          ))}
        </div>
        <Button onClick={checkAnswer} disabled={!selectedOption || isAnswered}>Check Answer</Button>
      </CardContent>
    </Card>
  );
};

export default function SOQLvsSQLPage() {
    const [mcqResult, setMcqResult] = useState<boolean | null>(null);
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <BookOpen /> SOQL vs. SQL
        </h2>

        <p className="text-lg text-muted-foreground">
          While SOQL (Salesforce Object Query Language) shares a similar syntax with SQL (Structured Query Language), they are fundamentally different. SQL is designed for traditional relational databases, whereas SOQL is specifically designed for querying the Salesforce multitenant database. Understanding these differences is crucial for any Salesforce developer.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Key Distinctions at a Glance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>SOQL</TableHead>
                        <TableHead>SQL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-semibold">Primary Use</TableCell>
                        <TableCell>Querying data from a single object (with related data).</TableCell>
                        <TableCell>Querying data from multiple tables and complex joins.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-semibold">SELECT *</TableCell>
                        <TableCell><Badge variant="destructive">Not Supported</Badge> You must specify each field name.</TableCell>
                        <TableCell><Badge variant="secondary">Supported</Badge> (Though often discouraged for performance).</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-semibold">JOINs</TableCell>
                        <TableCell>Uses relationship queries (dot notation) to traverse parent-to-child and child-to-parent relationships.</TableCell>
                        <TableCell>Uses explicit JOIN clauses like <code>INNER JOIN</code>, <code>LEFT JOIN</code>, <code>RIGHT JOIN</code>.</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-semibold">Data Source</TableCell>
                        <TableCell>Salesforce SObjects (e.g., Account, Contact__c)</TableCell>
                        <TableCell>Database Tables</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-semibold">Data Modification</TableCell>
                        <TableCell>Read-only. DML (Data Manipulation Language) is used in Apex for updates.</TableCell>
                        <TableCell>Supports <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> directly.</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-2">Querying Related Data: The SOQL Way</h3>
          <p className="text-muted-foreground mb-4">
            Instead of complex JOINs, SOQL uses dot notation to easily navigate relationships.
          </p>
          <h4 className="font-medium mb-2">Child-to-Parent Relationship</h4>
          <p className="text-sm text-muted-foreground mb-4">
            This query retrieves the Name from the Contact and the Name from its related Account.
          </p>
          <CodeBlock language="sql" code="SELECT Name, Account.Name FROM Contact" />

           <h4 className="font-medium mb-2 mt-6">Parent-to-Child Relationship</h4>
          <p className="text-sm text-muted-foreground mb-4">
            This query retrieves the Name from each Account and a sub-list of all related Contacts for each Account. Note the plural name for the child relationship (`Contacts`).
          </p>
          <CodeBlock language="sql" code="SELECT Name, (SELECT Name, Email FROM Contacts) FROM Account" />
        </div>
        
         <div>
          <h3 className="text-xl font-semibold mb-2">Querying Related Data: The SQL Way</h3>
          <p className="text-muted-foreground mb-4">
            SQL requires an explicit <code>JOIN</code> clause to connect the `contacts` and `accounts` tables.
          </p>
          <CodeBlock language="sql" code={`SELECT\n  c.name AS contact_name,\n  a.name AS account_name\nFROM\n  contacts c\nINNER JOIN\n  accounts a ON c.account_id = a.id;`} />
        </div>

        <MCQ
          question="What is the main difference between how SOQL and SQL handle joins?"
          options={[
            "SOQL does not support joins at all.",
            "SOQL uses relationship queries (dot notation), while SQL uses explicit JOIN clauses.",
            "SQL uses relationship queries, while SOQL uses explicit JOIN clauses.",
            "There is no difference; they both use INNER JOIN.",
          ]}
          correctAnswer="SOQL uses relationship queries (dot notation), while SQL uses explicit JOIN clauses."
          onAnswer={setMcqResult}
        />
        {mcqResult !== null && (
            <div className={`p-4 rounded-md text-white ${mcqResult ? 'bg-green-600' : 'bg-red-600'}`}>
                {mcqResult ? 'Correct! SOQL leverages the defined relationships between objects, making queries simpler.' : 'Not quite. SQL requires explicit JOINs, while SOQL uses dot notation for relationships.'}
            </div>
        )}
      </section>
    </>
  );
}

'use client';

import { Filter, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeBlock } from '@/components/CodeBlock';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const sampleAccounts = [
    { Id: '001...', Name: 'Acme Corp', AnnualRevenue: 5000000 },
    { Id: '002...', Name: 'Apex Solutions', AnnualRevenue: 1200000 },
    { Id: '003...', Name: 'Cloudy Inc.', AnnualRevenue: 8000000 },
    { Id: '004...', Name: 'Innovate LLC', AnnualRevenue: 5000000 },
];

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


export default function ComparisonOperatorsPage() {
  const operators = [
    { op: '=', description: 'Equal to' },
    { op: '!=', description: 'Not equal to' },
    { op: '<>', description: 'Not equal to (alternative)' },
    { op: '<', description: 'Less than' },
    { op: '<=', description: 'Less than or equal to' },
    { op: '>', description: 'Greater than' },
    { op: '>=', description: 'Greater than or equal to' },
  ];
  const [mcqResult, setMcqResult] = useState<boolean | null>(null);

  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> Comparison Operators
        </h2>

        <p className="text-lg text-muted-foreground">
          Comparison operators are used in the <code>WHERE</code> clause to compare a field's value to another value. They are the primary way to filter your data to get precisely the records you need.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operator</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators.map(o => (
              <TableRow key={o.op}>
                <TableCell className="font-mono">{o.op}</TableCell>
                <TableCell>{o.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Card>
            <CardHeader>
                <CardTitle>Example: Filtering by Revenue</CardTitle>
                <CardDescription>Let's find all accounts with an annual revenue greater than or equal to $5,000,000 using the sample data below.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock 
                    language="sql" 
                    code="SELECT Name, AnnualRevenue FROM Account WHERE AnnualRevenue <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>>=</span> 5000000"
                    tooltipContent="Comparison operators like >= are used to filter records based on a condition."
                />
                <h4 className="font-semibold my-4">Expected Result:</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>AnnualRevenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sampleAccounts.filter(acc => acc.AnnualRevenue >= 5000000).map(acc => (
                            <TableRow key={acc.Id}>
                                <TableCell>{acc.Name}</TableCell>
                                <TableCell>${acc.AnnualRevenue.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <MCQ
          question="Which query correctly finds accounts with revenue that is NOT $5,000,000?"
          options={[
            "SELECT Name FROM Account WHERE AnnualRevenue <> 5000000",
            "SELECT Name FROM Account WHERE AnnualRevenue != 5000000",
            "Both A and B are correct.",
            "Neither A nor B are correct.",
          ]}
          correctAnswer="Both A and B are correct."
          onAnswer={setMcqResult}
        />
        {mcqResult !== null && (
            <div className={`p-4 rounded-md text-white ${mcqResult ? 'bg-green-600' : 'bg-red-600'}`}>
                {mcqResult ? 'Correct! SOQL accepts both <> and != for "not equal to".' : 'Not quite. Remember, both <> and != are valid "not equal to" operators in SOQL.'}
            </div>
        )}

      </section>
    </>
  );
}

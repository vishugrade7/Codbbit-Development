'use client';

import { useState } from 'react';
import { BarChart, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeBlock } from '@/components/CodeBlock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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


export default function CountPage() {
  const [mcqResult, setMcqResult] = useState<boolean | null>(null);
  
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <BarChart /> COUNT() Function
        </h2>
        
        <p className="text-lg text-muted-foreground">
          The <code>COUNT()</code> aggregate function returns the number of rows that match the query criteria. It's one of the most commonly used functions for getting a quick summary of your data.
        </p>

        <Card>
            <CardHeader>
                <CardTitle>Basic COUNT()</CardTitle>
                <CardDescription>Get the total number of Account records in your org.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="sql" code="SELECT COUNT() FROM Account" />
                <p className="text-muted-foreground mt-2">This query returns a single integer representing the total count.</p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>COUNT() with a WHERE Clause</CardTitle>
                <CardDescription>Count only the records that meet specific criteria. For example, count all opportunities that are in the 'Closed Won' stage.</CardDescription>
            </CardHeader>
            <CardContent>
                <CodeBlock language="sql" code="SELECT COUNT() FROM Opportunity WHERE StageName = 'Closed Won'" />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>COUNT(fieldname)</CardTitle>
                <CardDescription>You can also count the number of rows that have a non-null value for a specific field using <code>COUNT(fieldname)</code>.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">This query counts the number of contacts who have an email address.</p>
                <CodeBlock language="sql" code="SELECT COUNT(Email) FROM Contact" />
            </CardContent>
        </Card>

        <MCQ
          question="Which query correctly counts the number of high-priority cases?"
          options={[
            "SELECT COUNT(Priority) FROM Case WHERE Priority = 'High'",
            "SELECT COUNT() FROM Case WHERE Priority = 'High'",
            "SELECT COUNT FROM Case WHERE Priority = 'High'",
            "Both A and B are correct.",
          ]}
          correctAnswer="Both A and B are correct."
          onAnswer={setMcqResult}
        />
        {mcqResult !== null && (
            <div className={`p-4 rounded-md text-white ${mcqResult ? 'bg-green-600' : 'bg-red-600'}`}>
                {mcqResult ? 'Correct! Both `COUNT()` and `COUNT(fieldname)` can be used with a WHERE clause to count specific records.' : 'Not quite. Both `COUNT()` and `COUNT(fieldname)` will give you the number of records that match the WHERE clause.'}
            </div>
        )}
      </section>
    </>
  );
}

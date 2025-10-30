'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Filter, Check, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const sampleAccounts = [
    { Id: '001...', Name: 'Tech Innovators', Industry: 'Technology', BillingState: 'CA' },
    { Id: '002...', Name: 'SF Web Design', Industry: 'Technology', BillingState: 'CA' },
    { Id: '003...', Name: 'Global Finance', Industry: 'Finance', BillingState: 'NY' },
    { Id: '004...', Name: 'CA Healthcare', Industry: 'Healthcare', BillingState: 'CA' },
    { Id: '005...', Name: 'NY Finance', Industry: 'Finance', BillingState: 'NY' },
    { Id: '006...', Name: 'Boston Tech', Industry: 'Technology', BillingState: 'MA' },
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


export default function LogicalOperatorsPage() {
    const [mcqResult, setMcqResult] = useState<boolean | null>(null);
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> Logical Operators
        </h2>

        <p className="text-lg text-muted-foreground">
          Logical operators like <code>AND</code>, <code>OR</code>, and <code>NOT</code> are used to combine multiple conditions in a <code>WHERE</code> clause, allowing for more complex filtering logic.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>AND Operator</CardTitle>
            <CardDescription>Returns records only when all conditions are true.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This query finds accounts that are in the 'Technology' industry AND are located in 'CA'.</p>
            <CodeBlock 
              language="sql" 
              code="SELECT Name FROM Account WHERE Industry = 'Technology' <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>AND</span> BillingState = 'CA'"
              tooltipContent="The AND operator requires all conditions to be true."
            />
            <h4 className="font-semibold my-4">Expected Result:</h4>
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
                <TableBody>
                    {sampleAccounts.filter(acc => acc.Industry === 'Technology' && acc.BillingState === 'CA').map(acc => (
                        <TableRow key={acc.Id}><TableCell>{acc.Name}</TableCell></TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>OR Operator</CardTitle>
            <CardDescription>Returns records where at least one of the conditions is true.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-muted-foreground mb-4">This query finds all contacts whose lead source is either 'Web' or 'Partner Referral'.</p>
            <CodeBlock 
              language="sql" 
              code="SELECT Name, LeadSource FROM Contact WHERE LeadSource = 'Web' <span class='bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded px-2 py-1'>OR</span> LeadSource = 'Partner Referral'"
              tooltipContent="The OR operator requires at least one of the conditions to be true."
            />
          </CardContent>
        </Card>

        <MCQ
          question="A query `WHERE Industry = 'Technology' OR Industry = 'Finance' AND BillingState = 'CA'` will return which records?"
          options={[
            "Technology and Finance accounts, but only if they are in CA.",
            "All Technology accounts, and also all Finance accounts that are in CA.",
            "All Technology accounts that are in CA, and all Finance accounts that are in CA.",
            "Only accounts that are in CA.",
          ]}
          correctAnswer="All Technology accounts, and also all Finance accounts that are in CA."
          onAnswer={setMcqResult}
        />
        {mcqResult !== null && (
            <div className={`p-4 rounded-md text-white ${mcqResult ? 'bg-green-600' : 'bg-red-600'}`}>
                {mcqResult ? 'Correct! `AND` has a higher precedence than `OR`, so `(Industry = \'Finance\' AND BillingState = \'CA\')` is evaluated first.' : 'Not quite. Remember that `AND` is evaluated before `OR`. Use parentheses `()` to enforce a specific order of evaluation.'}
            </div>
        )}
      </section>
    </>
  );
}

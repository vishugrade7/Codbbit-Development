'use client';

import { useState } from 'react';
import { BarChart, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeBlock } from '@/components/CodeBlock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const productsData = [
  { ProductID: 1, ProductName: 'Chai', SupplierID: 1, CategoryID: 1, Unit: '10 boxes x 20 bags', Price: 18.00 },
  { ProductID: 2, ProductName: 'Chang', SupplierID: 1, CategoryID: 1, Unit: '24 - 12 oz bottles', Price: 19.00 },
  { ProductID: 3, ProductName: 'Aniseed Syrup', SupplierID: 1, CategoryID: 2, Unit: '12 - 550 ml bottles', Price: 10.00 },
  { ProductID: 4, ProductName: 'Chef Anton\'s Cajun Seasoning', SupplierID: 2, CategoryID: 2, Unit: '48 - 6 oz jars', Price: 22.00 },
  { ProductID: 5, ProductName: 'Chef Anton\'s Gumbo Mix', SupplierID: 2, CategoryID: 2, Unit: '36 boxes', Price: 21.35 },
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


export default function AggregateFunctionsPage() {
  const [mcqResult, setMcqResult] = useState<boolean | null>(null);
  
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <BarChart /> MIN(), MAX(), SUM(), AVG()
        </h2>
        
        <p className="text-lg text-muted-foreground">
          Aggregate functions perform a calculation on a set of values and return a single, summary value.
          They are often used with the <code>GROUP BY</code> clause but can also be used on their own.
        </p>
        
        <h3 className="text-xl font-semibold">Sample Data: Products Table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ProductID</TableHead>
              <TableHead>ProductName</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsData.map(p => (
              <TableRow key={p.ProductID}>
                <TableCell>{p.ProductID}</TableCell>
                <TableCell>{p.ProductName}</TableCell>
                <TableCell>${p.Price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="space-y-12">
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle>MIN() Example</CardTitle>
                    <CardDescription>Find the lowest price in the Price column.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock language="sql" code="SELECT MIN(Price) FROM Products;" />
                    <div className="mt-2 text-center text-sm font-semibold text-muted-foreground">Result: $10.00</div>
                    <Button className="mt-4 w-full" variant="secondary">Try it Yourself &raquo;</Button>
                </CardContent>
            </Card>
             <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle>MAX() Example</CardTitle>
                    <CardDescription>Find the highest price in the Price column.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock language="sql" code="SELECT MAX(Price) FROM Products;" />
                    <div className="mt-2 text-center text-sm font-semibold text-muted-foreground">Result: $22.00</div>
                    <Button className="mt-4 w-full" variant="secondary">Try it Yourself &raquo;</Button>
                </CardContent>
            </Card>
             <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle>SUM() Example</CardTitle>
                    <CardDescription>Find the total price of all products from Supplier 1.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock language="sql" code="SELECT SUM(Price) FROM Products WHERE SupplierID = 1;" />
                    <div className="mt-2 text-center text-sm font-semibold text-muted-foreground">Result: $47.00</div>
                    <Button className="mt-4 w-full" variant="secondary">Try it Yourself &raquo;</Button>
                </CardContent>
            </Card>
             <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle>AVG() Example</CardTitle>
                    <CardDescription>Find the average price of all products.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock language="sql" code="SELECT AVG(Price) FROM Products;" />
                    <div className="mt-2 text-center text-sm font-semibold text-muted-foreground">Result: $18.27</div>
                    <Button className="mt-4 w-full" variant="secondary">Try it Yourself &raquo;</Button>
                </CardContent>
            </Card>
        </div>
        
        <MCQ
          question="Which query finds the average price of products in Category 2?"
          options={[
            "SELECT AVG(Price) FROM Products WHERE CategoryID = 2",
            "SELECT AVERAGE(Price) FROM Products WHERE CategoryID = 2",
            "SELECT SUM(Price) FROM Products WHERE CategoryID = 2",
            "SELECT MIN(Price) FROM Products WHERE CategoryID = 2",
          ]}
          correctAnswer="SELECT AVG(Price) FROM Products WHERE CategoryID = 2"
          onAnswer={setMcqResult}
        />
        {mcqResult !== null && (
            <div className={`p-4 rounded-md text-white ${mcqResult ? 'bg-green-600' : 'bg-red-600'}`}>
                {mcqResult ? 'Correct! AVG() is used to find the average value.' : 'Not quite. The correct function to find an average is AVG().'}
            </div>
        )}

      </section>
    </>
  );
}

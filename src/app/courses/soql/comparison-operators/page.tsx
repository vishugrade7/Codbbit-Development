'use client';

import { Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ComparisonOperatorsPage() {
  const operators = [
    { op: '=', description: 'Equal to' },
    { op: '!=', description: 'Not equal to' },
    { op: '<', description: 'Less than' },
    { op: '<=', description: 'Less than or equal to' },
    { op: '>', description: 'Greater than' },
    { op: '>=', description: 'Greater than or equal to' },
  ];
  return (
    <>
      <section className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3 flex items-center gap-3 text-blue-700 dark:text-blue-400">
          <Filter /> Comparison Operators
        </h2>

        <p className="text-lg text-muted-foreground">
          Comparison operators are used in the <code>WHERE</code> clause to compare a field's value to another value.
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
      </section>
    </>
  );
}

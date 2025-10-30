'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SoqlKeyword = ({ children, tooltip }: { children: React.ReactNode, tooltip: string }) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="bg-primary/10 text-primary-foreground px-3 py-1 rounded-md font-mono font-bold cursor-pointer hover:bg-primary/20 transition-colors">{children}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const SoqlField = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-green-500/10 text-green-700 dark:text-green-300 px-3 py-1 rounded-md font-mono">{children}</span>
);

const SoqlValue = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-1 rounded-md font-mono">{children}</span>
);


export function InteractiveSoqlQuery() {
  return (
    <div className="bg-muted/30 p-8 rounded-xl border border-border/50 shadow-lg">
      <h2 className="text-2xl font-bold font-headline mb-6 text-center">Anatomy of a SOQL Query</h2>
      <div className="flex flex-col gap-3 text-lg font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <SoqlKeyword tooltip="The SELECT clause specifies the fields (columns) you want to retrieve from the database.">SELECT</SoqlKeyword>
          <SoqlField>Id</SoqlField>
          <span>,</span>
          <SoqlField>Name</SoqlField>
           <span>,</span>
          <SoqlField>AnnualRevenue</SoqlField>
           <span>,</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 pl-8">
            <span>(</span>
            <SoqlKeyword tooltip="A subquery, or parent-to-child query, retrieves child records related to the parent records in the main query.">SELECT</SoqlKeyword>
            <SoqlField>LastName</SoqlField>
            <SoqlKeyword tooltip="The FROM clause in a subquery specifies the child relationship name (e.g., Contacts, Opportunities).">FROM</SoqlKeyword>
            <SoqlField>Contacts</SoqlField>
            <span>)</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <SoqlKeyword tooltip="The FROM clause specifies the primary object you are querying.">FROM</SoqlKeyword>
            <SoqlField>Account</SoqlField>
        </div>
         <div className="flex flex-wrap items-center gap-3">
            <SoqlKeyword tooltip="The WHERE clause filters the records returned by the query based on one or more conditions.">WHERE</SoqlKeyword>
            <SoqlField>Industry</SoqlField>
            <span>=</span>
            <SoqlValue>'Technology'</SoqlValue>
            <SoqlKeyword tooltip="The AND operator combines multiple conditions, requiring all to be true.">AND</SoqlKeyword>
            <SoqlField>AnnualRevenue</SoqlField>
            <span>&gt;</span>
            <SoqlValue>1000000</SoqlValue>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <SoqlKeyword tooltip="The ORDER BY clause sorts the results of your query based on one or more fields.">ORDER BY</SoqlKeyword>
            <SoqlField>Name</SoqlField>
            <SoqlKeyword tooltip="DESC sorts the results in descending order (Z-A, 9-1).">DESC</SoqlKeyword>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <SoqlKeyword tooltip="LIMIT restricts the maximum number of records returned by the query.">LIMIT</SoqlKeyword>
            <SoqlValue>10</SoqlValue>
        </div>
      </div>
    </div>
  );
}

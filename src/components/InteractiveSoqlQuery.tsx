'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

const keywords = [
  { name: 'SELECT', tooltip: 'Specifies the fields to retrieve.', color: 'bg-purple-500' },
  { name: 'FROM', tooltip: 'Specifies the object to query.', color: 'bg-blue-500' },
  { name: 'WHERE', tooltip: 'Filters records based on conditions.', color: 'bg-teal-500' },
  { name: 'LIMIT', tooltip: 'Restricts the number of records returned.', color: 'bg-green-500' },
  { name: 'ORDER BY', tooltip: 'Sorts the results.', color: 'bg-yellow-500' },
  { name: 'GROUP BY', tooltip: 'Groups rows that have the same values.', color: 'bg-orange-500' },
  { name: 'HAVING', tooltip: 'Filters results of aggregate functions.', color: 'bg-red-500' },
];

const SoqlKeyword = ({ name, tooltip, color, angle }: { name: string, tooltip: string, color: string, angle: number }) => (
  <motion.div
    className="absolute"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: 1,
      scale: 1,
      x: 200 * Math.cos(angle),
      y: 200 * Math.sin(angle),
    }}
    transition={{ type: 'spring', stiffness: 100, damping: 12, delay: angle / 2 }}
    style={{
        transformOrigin: 'center'
    }}
  >
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
             whileHover={{ scale: 1.1, y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
             className={`w-28 h-28 ${color} rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer shadow-lg`}
          >
            {name}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </motion.div>
);

export function InteractiveSoqlQuery() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-transparent">
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center"
        >
            <h2 className="text-4xl font-bold font-headline text-foreground">Different parts</h2>
            <p className="text-2xl text-muted-foreground">of a SOQL query</p>
        </motion.div>
      {keywords.map((keyword, index) => (
        <SoqlKeyword
          key={keyword.name}
          {...keyword}
          angle={(index * 2 * Math.PI) / keywords.length - Math.PI / 2}
        />
      ))}
    </div>
  );
}
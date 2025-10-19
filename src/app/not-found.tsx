
'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <Image
            src="/logo.png"
            alt="Zyntra Owl Mascot looking lost"
            width={200}
            height={200}
            className="drop-shadow-lg"
        />
        <h1 className="mt-8 text-8xl font-bold font-headline text-primary animate-pulse">
          404
        </h1>
        <p className="mt-4 text-2xl font-semibold text-foreground">
          Page Not Found
        </p>
        <p className="mt-2 text-muted-foreground">
          Oops! It looks like the page you're looking for has flown away.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}

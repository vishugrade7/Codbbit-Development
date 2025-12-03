'use client';
import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import { type LucideProps, Loader } from 'lucide-react';
import * as React from 'react';

const spinnerVariants = cva('animate-spin text-muted-foreground', {
  variants: {
    size: {
      default: 'size-6',
      sm: 'size-4',
      lg: 'size-8',
      icon: 'size-5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface SpinnerProps
  extends Omit<LucideProps, 'size'>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <Loader
        ref={ref}
        className={cn(spinnerVariants({ size }), className)}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };


'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
               <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90">
                 <Image src="/logo.png" alt="Codbbit Logo" width={24} height={24} />
                 <h1 className="text-md font-bold font-code text-foreground">
                    Codbbit
                </h1>
              </Link>
              <p className="text-sm text-muted-foreground">The ultimate platform for mastering Salesforce Apex.</p>
            </div>
            <div className="md:col-span-3 md:justify-self-end">
                <h3 className="font-semibold text-lg mb-4">Subscribe to our newsletter</h3>
                <p className="text-muted-foreground mb-4">Get the latest news, updates, and tips straight to your inbox.</p>
                <form className="flex w-full max-w-md gap-2">
                    <Input type="email" placeholder="Enter your email" />
                    <Button type="submit">Subscribe</Button>
                </form>
            </div>
          </div>
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Codbbit. All rights reserved.</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link>
            <Link href="/feedback" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

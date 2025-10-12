
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { ArrowRight, Menu, LayoutGrid, Code, Trophy, Sheet as SheetIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';


const navigationLinks: { href: string, label: string, ariaLabel?: string, icon: React.ElementType }[] = [
    { href: '/', label: 'Dashboard', ariaLabel: 'Go to dashboard', icon: LayoutGrid },
    { href: '/problems', label: 'Problems', ariaLabel: 'View coding problems', icon: Code },
    { href: '/leaderboard', label: 'Leaderboard', ariaLabel: 'View the leaderboard', icon: Trophy },
    { href: '/sheets', label: 'Sheets', ariaLabel: 'View problem sheets', icon: SheetIcon },
];

const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];


export function Header() {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 px-4 backdrop-blur-xl md:px-6 md:hidden">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-6">
           <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90">
             <Image src="/logo.png" alt="Codbbit Logo" width={24} height={24} />
             <h1 className="text-md font-bold font-headline text-foreground">
                Codbbit
            </h1>
          </Link>
          
          {/* Main nav */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation menu */}
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      href={link.href}
                      className="text-muted-foreground hover:text-primary py-1.5 font-medium"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
           <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="text-sm group">
                <Link href="/signup">
                    Get Started
                    <ArrowRight className="-mr-1 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
             {isClient && isMobile && (
               <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu />
                    <span className="sr-only">Open Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs">
                  <div className="flex flex-col h-full">
                    <div className="border-b -mx-6 px-6 pb-4">
                       <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90" onClick={() => setIsSheetOpen(false)}>
                         <Image src="/logo.png" alt="Codbbit Logo" width={24} height={24} />
                         <h1 className="text-md font-bold font-headline text-foreground">
                            Codbbit
                        </h1>
                      </Link>
                    </div>
                    <nav className="flex flex-col gap-4 mt-8">
                      {navigationLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                          <link.icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                     <div className="mt-auto flex flex-col gap-4">
                        <Button asChild className="w-full">
                          <Link href="/signup" onClick={() => setIsSheetOpen(false)}>Get Started</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/login" onClick={() => setIsSheetOpen(false)}>Sign In</Link>
                        </Button>
                     </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
        </div>
      </div>
    </header>
  )
}

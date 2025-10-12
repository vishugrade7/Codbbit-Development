
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ArrowRight, Menu } from 'lucide-react';

const navigationLinks: { href: string, label: string }[] = [
    { href: '#features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
]

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
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

             {/* Mobile menu trigger */}
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    className="md:hidden"
                    variant="ghost"
                    size="icon"
                >
                    <Menu />
                    <span className="sr-only">Open menu</span>
                </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-screen max-w-xs mt-2 mr-4 p-4 md:hidden">
                    <nav className="grid gap-4">
                        {navigationLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-foreground hover:text-primary"
                        >
                            {link.label}
                        </Link>
                        ))}
                    </nav>
                    <div className="mt-6 flex flex-col gap-2">
                        <Button asChild variant="outline">
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

        </div>
      </div>
    </header>
  )
}

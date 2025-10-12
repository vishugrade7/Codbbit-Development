
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
import { ArrowRight, Menu } from 'lucide-react';
import StaggeredMenu from './StaggeredMenu';
import { useIsMobile } from '@/hooks/use-mobile';


const navigationLinks: { href: string, label: string, ariaLabel?: string }[] = [
    { href: '/', label: 'Dashboard', ariaLabel: 'Go to dashboard' },
    { href: '/problems', label: 'Problems', ariaLabel: 'View coding problems' },
    { href: '/leaderboard', label: 'Leaderboard', ariaLabel: 'View the leaderboard' },
    { href: '/sheets', label: 'Sheets', ariaLabel: 'View problem sheets' },
];

const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];


export function Header() {
  const isMobile = useIsMobile();

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
             {isMobile && (
              <StaggeredMenu
                position="right"
                items={navigationLinks}
                socialItems={socialItems}
                displaySocials={true}
                displayItemNumbering={true}
                menuButtonColor="#000000"
                openMenuButtonColor="#ffffff"
                changeMenuColorOnOpen={true}
                colors={['#2C3E50', '#008080']}
                logoUrl="/logo.png"
                accentColor="#008080"
              />
            )}
        </div>
      </div>
    </header>
  )
}

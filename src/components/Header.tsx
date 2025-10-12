
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
import { ArrowRight, Menu, LayoutGrid, Code, Trophy, Sheet as SheetIcon, User, LogOut, Settings, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useAuth, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from './ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { Separator } from './ui/separator';


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
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleSignOut = () => {
    document.documentElement.classList.remove('grayscale-effect');
    auth.signOut();
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);
  };


  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/5 px-4 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-6">
           <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90">
             <Image src="/logo.png" alt="Codbbit Logo" width={24} height={24} />
             <h1 className="text-md font-bold font-headline text-foreground">
                Codbbit
            </h1>
          </Link>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isUserLoading || isProfileLoading ? (
            <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          ) : user && userProfile ? (
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={userProfile.avatarUrl || user.photoURL || ''} alt={userProfile.name} />
                        <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">@{userProfile.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/${userProfile.username}`}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/pricing">
                            <Star className="mr-2 h-4 w-4" />
                            <span>Upgrade to Pro</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
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
          )}
             {isClient && isMobile && (
               <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu />
                    <span className="sr-only">Open Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs bg-background/5 backdrop-blur-xl">
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
                        {user && userProfile ? (
                          <div className="rounded-lg border bg-background/80 p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar>
                                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                                  <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{userProfile.name}</span>
                                  <span className="text-sm text-muted-foreground">@{userProfile.username}</span>
                                </div>
                              </div>
                              <Separator />
                              <nav className="flex flex-col gap-1 mt-4">
                                <Link href={`/${userProfile.username}`} className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}><User className="h-4 w-4" />Profile</Link>
                                <Link href="/settings" className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}><Settings className="h-4 w-4" />Settings</Link>
                                <Link href="/pricing" className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}><Star className="h-4 w-4" />Upgrade to Pro</Link>
                              </nav>
                              <Separator className="my-2" />
                              <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start px-2 py-2 h-auto text-sm text-red-500 hover:text-red-500">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                              </Button>
                          </div>
                        ) : (
                          <>
                            <Button asChild className="w-full">
                              <Link href="/signup" onClick={() => setIsSheetOpen(false)}>Get Started</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                              <Link href="/login" onClick={() => setIsSheetOpen(false)}>Sign In</Link>
                            </Button>
                          </>
                        )}
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

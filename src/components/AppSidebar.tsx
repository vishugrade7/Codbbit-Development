
'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Code, Trophy, Sheet, Settings, LogOut, LayoutGrid, User as UserIcon, LogIn, Star, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import type { PriceConfig, UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';


export function AppSidebar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { state, setOpen, isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  
  const userDocRef = useMemoFirebase(() => {
      if (!firestore || !user?.uid) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const priceDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'pricing');
  }, [firestore]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  const { data: priceConfig } = useDoc<PriceConfig>(priceDocRef);

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
  
  const isCollapsed = !isMobile && state === 'collapsed';

  const handleLogoutHover = (isHovering: boolean) => {
    if (isHovering) {
      document.documentElement.classList.add('grayscale-effect');
    } else {
      document.documentElement.classList.remove('grayscale-effect');
    }
  };
  
  const getActiveTab = () => {
    if (pathname.startsWith('/problems')) return 'problems';
    if (pathname.startsWith('/leaderboard')) return 'leaderboard';
    if (pathname.startsWith('/sheets')) return 'sheets';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/feedback')) return 'feedback';
    if (pathname === '/') return 'dashboard';
    if (userProfile && pathname.startsWith(`/${userProfile.username}`)) return 'profile';
    return '';
  }

  const navItems = [
    { value: 'dashboard', href: '/', icon: LayoutGrid, label: 'Dashboard' },
    { value: 'problems', href: '/problems', icon: Code, label: 'Problems' },
    { value: 'leaderboard', href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { value: 'sheets', href: '/sheets', icon: Sheet, label: 'Sheets' },
  ];


  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center justify-center">
            <Image src="/logo.png" alt="Zyntra Logo" width={32} height={32} />
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <Tabs value={getActiveTab()} orientation="vertical" className="w-full">
            <TabsList className="flex-col h-auto bg-transparent p-2">
                <TooltipProvider delayDuration={0}>
                  {navItems.map((item) => (
                    <Tooltip key={item.value}>
                      <TooltipTrigger asChild>
                         <Link href={item.href}>
                            <TabsTrigger value={item.value} className="py-3 h-12 w-12 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                <item.icon size={20} aria-hidden="true" />
                            </TabsTrigger>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="px-2 py-1 text-xs">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
            </TabsList>
        </Tabs>
      </SidebarContent>

      <SidebarFooter className="mt-auto flex flex-col items-center gap-2 p-2">
        <ThemeToggle />
         <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/feedback">
                        <Button variant={pathname.startsWith('/feedback') ? "secondary" : "ghost"} size="icon" className="h-10 w-10">
                             <MessageSquare size={20}/>
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="px-2 py-1 text-xs">
                    Feedback
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/settings">
                        <Button variant={pathname.startsWith('/settings') ? "secondary" : "ghost"} size="icon" className="h-10 w-10">
                             <Settings size={20}/>
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="px-2 py-1 text-xs">
                    Settings
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="h-12 w-12 p-0 rounded-full">
                            {isUserLoading || isProfileLoading ? <Skeleton className="h-10 w-10 rounded-full" /> :
                                <>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={userProfile?.avatarUrl || user?.photoURL || undefined} alt={userProfile?.name || 'User'} />
                                        <AvatarFallback>{getInitials(userProfile?.name || user?.displayName)}</AvatarFallback>
                                    </Avatar>
                                </>
                            }
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" className="w-56 mb-2 ml-2">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={userProfile?.username ? `/${userProfile.username}` : '/settings/profile'}>
                                <UserIcon className="-ms-0.5 opacity-60" size={16} aria-hidden="true" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        {priceConfig?.isPaymentsEnabled !== false && (
                         <DropdownMenuItem asChild>
                            <Link href="/pricing">
                                <Star className="-ms-0.5 opacity-60" size={16} aria-hidden="true" />
                                <span>Upgrade to Pro</span>
                            </Link>
                        </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          onMouseEnter={() => handleLogoutHover(true)}
                          onMouseLeave={() => handleLogoutHover(false)}
                        >
                            <LogOut className="-ms-0.5 opacity-60" size={16} aria-hidden="true" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                 <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/login">
                                <Button variant="ghost" size="icon" className="h-12 w-12">
                                  <LogIn size={20}/>
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="px-2 py-1 text-xs">
                           Login
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
      </SidebarFooter>
    </>
  );
}

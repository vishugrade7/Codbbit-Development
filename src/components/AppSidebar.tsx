
'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Code, Trophy, Sheet, Settings, LogOut, LayoutGrid, User as UserIcon, LogIn, Star, MessageSquare, Settings2, Search, BookOpen, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import type { PriceConfig, UserProfile, NavigationSettings } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { FeedbackForm } from './FeedbackForm';
import { useState } from 'react';


export function AppSidebar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  
  const userDocRef = useMemoFirebase(() => {
      if (!firestore || !user?.uid) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const priceDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'pricing');
  }, [firestore]);

  const navDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'navigation');
  }, [firestore]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  const { data: priceConfig } = useDoc<PriceConfig>(priceDocRef);
  const { data: navSettings, isLoading: isLoadingNav } = useDoc<NavigationSettings>(navDocRef);

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
  
  const getActiveTab = () => {
    if (pathname.startsWith('/problems')) return 'problems';
    if (pathname.startsWith('/leaderboard')) return 'leaderboard';
    if (pathname.startsWith('/sheets')) return 'sheets';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/feedback')) return 'feedback';
    if (pathname.startsWith('/courses')) return 'courses';
    if (pathname.startsWith('/lwc-playground')) return 'lwc-playground';
    if (pathname === '/') return 'dashboard';
    if (userProfile && pathname.startsWith(`/${userProfile.username}`)) return 'profile';
    return '';
  }

  const allNavItems = [
    { value: 'dashboard', href: '/', icon: LayoutGrid, label: 'Dashboard' },
    { value: 'problems', href: '/problems', icon: Code, label: 'Problems' },
    { value: 'courses', href: '/courses', icon: BookOpen, label: 'Courses' },
    { value: 'lwc-playground', href: '/lwc-playground', icon: Zap, label: 'LWC Playground' },
    { value: 'leaderboard', href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { value: 'sheets', href: '/sheets', icon: Sheet, label: 'Sheets' },
  ];

  const navItems = React.useMemo(() => {
      if (isLoadingNav || !navSettings) {
          // Show all items by default while loading or if settings don't exist
          return allNavItems;
      }
      return allNavItems.filter(item => navSettings[item.value] !== false);
  }, [navSettings, isLoadingNav]);


  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center justify-center">
            <Image src="/logo.png" alt="Zyntra Logo" width={32} height={32} />
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col items-center p-0">
        <SidebarMenu>
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.value}>
                  <Link href={item.href}>
                      <SidebarMenuButton tooltip={item.label} size="lg" isActive={getActiveTab() === item.value}>
                          <item.icon size={20} aria-hidden="true" />
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
            ))}
          </TooltipProvider>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto flex flex-col items-center gap-2 p-2">
        <ThemeToggle />
         <TooltipProvider delayDuration={0}>
            <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
              <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                            <MessageSquare size={20}/>
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="px-2 py-1 text-xs">
                      Feedback & Support
                  </TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-2xl">
                   <DialogHeader>
                    <DialogTitle>Provide Feedback</DialogTitle>
                    <DialogDescription>
                        We value your feedback and are here to assist you. Please use the form below to
                        drop your reviews, suggestions, or to ask for support.
                    </DialogDescription>
                  </DialogHeader>
                  <FeedbackForm onFormSubmit={() => setIsFeedbackDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/settings">
                        <Button variant={pathname.startsWith('/settings') ? "secondary" : "ghost"} size="icon" className="h-10 w-10">
                             <Settings2 size={20}/>
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

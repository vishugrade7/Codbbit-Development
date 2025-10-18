
'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarTrigger,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Users, FilePlus, LogOut, PanelRightOpen, Shield, LogIn, Code, User as UserIcon, Settings, MoreHorizontal, Star, Ticket, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function AdminSidebar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { state, setOpen } = useSidebar();
  const router = useRouter();
  
  const userDocRef = useMemoFirebase(() => {
      if (!firestore || !user?.uid) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const handleSignOut = () => {
    document.documentElement.classList.remove('grayscale-effect');
    auth.signOut();
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);
  };
  
  const isCollapsed = state === 'collapsed';

  const handleLogoutHover = (isHovering: boolean) => {
    if (isHovering) {
      document.documentElement.classList.add('grayscale-effect');
    } else {
      document.documentElement.classList.remove('grayscale-effect');
    }
  };


  return (
    <>
      <SidebarHeader>
        <div className={cn("flex items-center w-full group-data-[collapsible=icon]:justify-center", isCollapsed ? "" : "justify-between")}>
            <div className={cn("flex-1 flex items-center gap-2", isCollapsed ? "justify-center" : "pl-4")}>
                <Image src="/logo.png" alt="Codbbit Logo" width={32} height={32} />
                {!isCollapsed && <h2 className="font-bold text-lg">Admin</h2>}
            </div>
            {!isCollapsed && (
              <div className="pr-4">
                  <SidebarTrigger />
              </div>
            )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/admin" passHref>
              <SidebarMenuButton isActive tooltip="Dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/users" passHref>
              <SidebarMenuButton tooltip="Manage Users">
                <Users />
                <span>Manage Users</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/admin/coding-questions" passHref>
              <SidebarMenuButton tooltip="Coding Questions">
                <Code />
                <span>Coding Questions</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/pricing" passHref>
              <SidebarMenuButton tooltip="Pricing">
                <Ticket />
                <span>Pricing</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/admin/newsletter" passHref>
              <SidebarMenuButton tooltip="Newsletter">
                <Send />
                <span>Newsletter</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto flex flex-col items-center gap-2 p-2">
         <div className="w-full flex items-center justify-center">
            <ThemeToggle />
         </div>
         <SidebarMenu>
            <SidebarMenuItem>
                 <Link href="/settings">
                    <SidebarMenuButton tooltip="Settings">
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className={cn("w-full justify-start items-center gap-2 h-auto transition-all shadow-md hover:shadow-lg", !isCollapsed && "rounded-lg p-2 bg-muted/50 hover:bg-muted", isCollapsed && "p-0")}>
                            {isUserLoading || isProfileLoading ? <SidebarMenuSkeleton showIcon /> :
                                <>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={userProfile?.avatarUrl || user?.photoURL || undefined} alt={userProfile?.name || 'User'} />
                                        <AvatarFallback>{getInitials(userProfile?.name || user?.displayName)}</AvatarFallback>
                                    </Avatar>
                                    {!isCollapsed && (
                                      <>
                                          <div className="flex flex-col items-start truncate">
                                              <span className='font-semibold truncate text-sm'>{userProfile?.name || user?.displayName || 'User Profile'}</span>
                                              <span className="text-xs text-muted-foreground">@{userProfile?.username || '...'}</span>
                                          </div>
                                          <MoreHorizontal className="h-5 w-5 ml-auto"/>
                                      </>
                                    )}
                                </>
                            }
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" className="w-56 mb-2 ml-2">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                             <Link href={userProfile?.username ? `/${userProfile.username}` : '/settings/profile'}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/">
                                <Code className="mr-2 h-4 w-4" />
                                <span>User View</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/pricing">
                                <Star className="mr-2 h-4 w-4" />
                                <span>Upgrade to Pro</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          onMouseEnter={() => handleLogoutHover(true)}
                          onMouseLeave={() => handleLogoutHover(false)}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
          ) : (
            <SidebarMenuItem>
              <Link href="/login">
                <SidebarMenuButton tooltip="Login">
                  <LogIn />
                  <span>Login</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
         </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

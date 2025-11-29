
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, endBefore, limitToLast, where, Query, DocumentData } from 'firebase/firestore';
import type { UserProfile, Question } from '@/lib/types';
import { Trophy, Search, CheckCircle, Flame, BarChart } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PaginationComponent } from '@/components/ui/pagination';
import { VerifiedBadge } from './VerifiedBadge';
import { countries } from '@/lib/countries';
import { Combobox } from './ui/combobox';
import { CompanyAutocomplete } from './CompanyAutocomplete';
import { useDebounce } from '@/hooks/use-debounce';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

const PAGE_SIZE = 10;

const countryMap = new Map(countries.map(c => [c.value, c.label]));

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
};

const getCompanyLogoUrl = (companyName?: string) => {
    if (!companyName) return '';
    try {
        const domain = new URL(`https://${companyName.toLowerCase().replace(/ /g, '').replace(/,/g, '') + '.com'}`).hostname;
        return `https://img.logo.dev/${domain}`;
    } catch (e) {
        return '';
    }
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
  if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400 fill-gray-400" />;
  if (rank === 3) return <Trophy className="h-6 w-6 text-orange-600 fill-orange-600" />;
  return <span className="font-bold text-lg text-muted-foreground">{rank}</span>;
}

function LeaderboardList({ users, currentUserUid }: { users: (UserProfile & { rank: number })[], currentUserUid?: string }) {
    if (!users || users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Search className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No Users Found</h3>
                <p className="text-sm">No users match the current filter criteria.</p>
            </div>
        )
    }
    
    const isUserVerified = (user: UserProfile) => {
        return user.emailVerified && (user.referredUsersCount || 0) >= 3 && user.linkedinUrl;
    }

    return (
        <div className="space-y-2">
            {users.map((user, index) => (
                <div key={user.uid} className={cn("flex items-center p-3 rounded-lg transition-colors", index % 2 === 0 ? "bg-muted/30" : "bg-transparent", user.uid === currentUserUid && "bg-primary/10 ring-2 ring-primary")}>
                    <div className="w-16 text-center flex items-center justify-center">
                       <RankMedal rank={user.rank} />
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                             {isUserVerified(user) && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <VerifiedBadge className="absolute -end-1.5 -top-1.5" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Verified</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <Link href={`/${user.username}`} className="hover:underline">
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 mr-4">
                        {user.company && (
                            <>
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={getCompanyLogoUrl(user.company)} />
                                    <AvatarFallback className="text-xs bg-muted">{user.company.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground hidden md:inline">{user.company}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mr-4">
                        {user.country && (
                            <>
                                <Image src={`https://flagsapi.com/${user.country}/flat/24.png`} alt={`${user.country} flag`} width={24} height={18} />
                                <span className="text-sm text-muted-foreground hidden md:inline">{countryMap.get(user.country)}</span>
                             </>
                        )}
                    </div>
                    <div className="w-24 text-right font-bold text-lg">{user.points}</div>
                </div>
            ))}
        </div>
    )
}

export function LeaderboardClient() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('global');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [countryFilter, setCountryFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('points', 'desc'));
  }, [firestore]);

  const { data: allUsers, isLoading } = useCollection<UserProfile>(usersCollectionRef);

  useEffect(() => {
    // Reset page when filters change
    setCurrentPage(1);
  }, [activeTab, countryFilter, companyFilter]);

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    
    let users = allUsers.filter(user => !user.isAdmin);

    if (activeTab === 'country' && countryFilter) {
      users = users.filter(user => user.country === countryFilter);
    }
    if (activeTab === 'company' && companyFilter) {
      users = users.filter(user => user.company === companyFilter);
    }
    
    return users;
  }, [allUsers, activeTab, countryFilter, companyFilter]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const rankedUsers = useMemo(() => {
    if (!paginatedUsers) return [];
    const baseRank = (currentPage - 1) * PAGE_SIZE;
    return paginatedUsers.map((user, index) => {
        return { ...user, rank: baseRank + index + 1 };
    });
  }, [paginatedUsers, currentPage]);
  
  const currentUserRank = useMemo(() => {
      if (!currentUser || !filteredUsers) return null;
      const userIndex = filteredUsers.findIndex(u => u.uid === currentUser.uid);
      if (userIndex === -1) return null;
      return userIndex + 1;
  }, [currentUser, filteredUsers]);
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
    }
  }


  if (isLoading && !allUsers) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground mt-1 max-w-lg">
                    See how you rank against the top developers. Keep solving problems to climb up the ranks!
                </p>
            </div>
            <div className="flex flex-col items-end gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="global">Global</TabsTrigger>
                        <TabsTrigger value="country">By Country</TabsTrigger>
                        <TabsTrigger value="company">By Company</TabsTrigger>
                    </TabsList>
                </Tabs>
                {currentUserRank && (
                     <div className="text-right">
                        <p className="font-semibold text-lg">Your Rank {currentUserRank}</p>
                    </div>
                )}
            </div>
        </header>

        <div className="mb-4">
            {activeTab === 'country' && (
                <Combobox 
                    options={countries}
                    value={countryFilter}
                    onValueChange={setCountryFilter}
                    placeholder="Select a country..."
                    searchPlaceholder="Search countries..."
                />
            )}
            {activeTab === 'company' && (
            <CompanyAutocomplete 
                    value={companyFilter}
                    onValueChange={setCompanyFilter}
            />
            )}
        </div>
        
        <div className="relative min-h-[400px] bg-card p-4 rounded-xl shadow-lg">
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                    <Loader />
                </div>
            )}
            <LeaderboardList users={rankedUsers} currentUserUid={currentUser?.uid} />
        </div>
        <div className="mt-4 flex justify-center">
            <PaginationComponent 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    </div>
  );
}

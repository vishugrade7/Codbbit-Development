
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Trophy, Search, Star } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaginationComponent } from '@/components/ui/pagination';
import { VerifiedBadge } from './VerifiedBadge';
import { countries } from '@/lib/countries';
import { Combobox } from './ui/combobox';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


const PAGE_SIZE = 15;

const countryMap = new Map(countries.map(c => [c.value, c.label]));

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
};

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400 fill-yellow-400" />;
  if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400 fill-gray-400" />;
  if (rank === 3) return <Trophy className="h-6 w-6 text-orange-500 fill-orange-500" />;
  return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
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
        return user.emailVerified;
    }

    return (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 text-center">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Country</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
                <TableRow key={user.uid} className={cn("transition-colors", user.uid === currentUserUid ? "bg-primary/10 hover:bg-primary/20" : "dark:odd:bg-white/[.02] dark:even:bg-transparent")}>
                    <TableCell className="w-20 text-center py-1">
                        <div className="flex items-center justify-center">
                           <RankMedal rank={user.rank} />
                        </div>
                    </TableCell>
                    <TableCell className="py-1">
                        <div className="flex items-center gap-3">
                             <div className="relative">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatarUrl} />
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                {isUserVerified(user) && (
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <VerifiedBadge className="absolute -end-1 -top-1" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Verified</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            <div>
                                <Link href={`/${user.username}`} className="font-semibold hover:underline">{user.name}</Link>
                                <div className="text-xs text-muted-foreground">@{user.username}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="font-semibold text-base py-1">{user.points}</TableCell>
                    <TableCell className="py-1">
                        {user.country && (
                            <div className="flex items-center gap-2">
                                <Image src={`https://flagsapi.com/${user.country}/flat/24.png`} alt={`${user.country} flag`} width={24} height={18} />
                                <span className="text-sm font-medium">{countryMap.get(user.country)}</span>
                            </div>
                        )}
                    </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
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
    setCurrentPage(1);
  }, [activeTab, countryFilter, companyFilter]);

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    
    let users = allUsers.filter(user => !user.isAdmin);

    if (activeTab === 'country' && countryFilter) {
      users = users.filter(user => user.country === countryFilter);
    }
    
    return users;
  }, [allUsers, activeTab, countryFilter]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const rankedUsers = useMemo(() => {
    const baseRank = (currentPage - 1) * PAGE_SIZE;
    return paginatedUsers.map((user, index) => ({
      ...user,
      rank: baseRank + index + 1,
    }));
  }, [paginatedUsers, currentPage]);
  
  const currentUserProfile = useMemo(() => {
      if (!currentUser || !allUsers) return null;
      return allUsers.find(u => u.uid === currentUser.uid);
  }, [currentUser, allUsers]);
  
  const currentUserRank = useMemo(() => {
      if (!currentUser || !filteredUsers) return null;
      const userIndex = filteredUsers.findIndex(u => u.uid === currentUser.uid);
      return userIndex === -1 ? null : userIndex + 1;
  }, [currentUser, filteredUsers]);
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
    }
  }

  if (isLoading && !allUsers) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Global Ranking</h1>
            </div>
            <div className="flex items-center gap-4">
               {currentUserRank && currentUserProfile && (
                    <div className="flex items-center gap-3 rounded-full bg-muted/50 px-3 py-1.5">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUserProfile.avatarUrl} />
                            <AvatarFallback>{getInitials(currentUserProfile.name)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Your Rank</p>
                            <p className="font-bold text-primary">{currentUserRank}</p>
                        </div>
                        <div className="h-8 w-px bg-border"></div>
                         <div className="text-center">
                            <p className="text-xs text-muted-foreground">Your Points</p>
                            <p className="font-bold text-primary">{currentUserProfile.points}</p>
                        </div>
                    </div>
                )}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="global">Global</TabsTrigger>
                        <TabsTrigger value="country">By Country</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </header>

        {activeTab === 'country' && (
             <div className="mb-4 max-w-sm">
                <Combobox 
                    options={countries}
                    value={countryFilter}
                    onValueChange={setCountryFilter}
                    placeholder="Select a country..."
                    searchPlaceholder="Search countries..."
                />
            </div>
        )}
        
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="relative min-h-[600px]">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                            <Spinner />
                        </div>
                    )}
                    <LeaderboardList users={rankedUsers} currentUserUid={currentUser?.uid} />
                </div>
            </CardContent>
        </Card>
        <div className="mt-6 flex justify-center">
            <PaginationComponent 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    </div>
  );
}

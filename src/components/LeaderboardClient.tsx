
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, endBefore, limitToLast, where, Query, DocumentData } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, Trophy, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const PAGE_SIZE = 20;

const countryMap = new Map(countries.map(c => [c.value, c.label]));

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
};

const getCompanyLogoUrl = (companyName?: string) => {
    if (!companyName) return '';
    try {
        const domain = new URL(`https://${companyName.toLowerCase().replace(/ /g, '').replace(/,/g, '').replace(/\./g, '') + '.com'}`).hostname;
        return `https://logo.clearbit.com/${domain}`;
    } catch (e) {
        return '';
    }
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
  if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400 fill-gray-400" />;
  if (rank === 3) return <Trophy className="h-6 w-6 text-orange-600 fill-orange-600" />;
  return <span className="text-muted-foreground font-medium">{rank}</span>;
}

function LeaderboardTable({ users, currentUserUid, page, pageSize }: { users: (UserProfile & { rank: number })[], currentUserUid?: string, page: number, pageSize: number }) {
    if (!users || users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Search className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No Users Found</h3>
                <p className="text-sm">No users match the current filter criteria.</p>
            </div>
        )
    }
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-20 text-center">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                        <TableRow key={user.uid} className={user.uid === currentUserUid ? 'bg-primary/5' : ''}>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center">
                                    <RankMedal rank={(page - 1) * pageSize + index + 1} />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar>
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        {user.emailVerified && (
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
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <span className="text-muted-foreground mt-0.5 text-xs">
                                          @{user.username}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {user.company ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={getCompanyLogoUrl(user.company)} />
                                            <AvatarFallback className="text-xs bg-muted">{user.company.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{user.company}</span>
                                    </div>
                                ) : 'N/A'}
                            </TableCell>
                            <TableCell>{countryMap.get(user.country) || user.country}</TableCell>
                            <TableCell className="text-right font-bold">{user.points}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export function LeaderboardClient() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('global');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [countryFilter, setCountryFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const debouncedCompanyFilter = useDebounce(companyFilter, 500);

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('points', 'desc'));
  }, [firestore]);

  const { data: allUsers, isLoading } = useCollection<UserProfile>(usersCollectionRef);

  useEffect(() => {
    // Reset page when filters change
    setCurrentPage(1);
  }, [activeTab, countryFilter, debouncedCompanyFilter]);

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    
    let users = allUsers;
    if (activeTab === 'country' && countryFilter) {
      users = users.filter(user => user.country === countryFilter);
    }
    if (activeTab === 'company' && debouncedCompanyFilter) {
      users = users.filter(user => user.company === debouncedCompanyFilter);
    }
    
    return users;
  }, [allUsers, activeTab, countryFilter, debouncedCompanyFilter]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const rankedUsers = useMemo(() => {
    if (!paginatedUsers) return [];
    // The rank needs to be based on the index within the *filtered* list, not just the paginated one
    return paginatedUsers.map((user) => {
        const overallRank = allUsers ? allUsers.findIndex(u => u.uid === user.uid) + 1 : 0;
        return { ...user, rank: overallRank };
    });
  }, [paginatedUsers, allUsers]);
  
  const currentUserRank = useMemo(() => {
      if (!currentUser || !allUsers) return null;
      const userIndex = allUsers.findIndex(u => u.uid === currentUser.uid);
      if (userIndex === -1) return null;
      const userRankData = allUsers[userIndex];
      return { ...userRankData, rank: userIndex + 1 };
  }, [currentUser, allUsers]);
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
    }
  }


  if (isLoading && !allUsers) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-1 max-w-lg">
            See how you rank against the top developers. Keep solving problems to climb up the ranks!
          </p>
        </div>
        {currentUserRank && (
             <Card className="max-w-xs bg-muted/30">
                <CardContent className="p-3">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={currentUserRank.avatarUrl} />
                            <AvatarFallback>{getInitials(currentUserRank.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{currentUserRank.name}</p>
                            <p className="text-sm text-muted-foreground">@{currentUserRank.username}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{currentUserRank.rank}</p>
                            <p className="text-xs text-muted-foreground">Rank</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{currentUserRank.points}</p>
                            <p className="text-xs text-muted-foreground">Points</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
            <TabsList>
                <TabsTrigger value="global">Global</TabsTrigger>
                <TabsTrigger value="country">By Country</TabsTrigger>
                <TabsTrigger value="company">By Company</TabsTrigger>
            </TabsList>
            <div className="w-64">
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
        </div>
        <div className="relative min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin"/>
                </div>
            )}
            <LeaderboardTable users={rankedUsers} currentUserUid={currentUser?.uid} page={currentPage} pageSize={PAGE_SIZE} />
        </div>
          <div className="mt-4 flex justify-center">
            <PaginationComponent 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
          </div>
      </Tabs>
    </div>
  );
}

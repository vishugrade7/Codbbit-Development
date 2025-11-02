
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { UserProfile, Question } from '@/lib/types';
import { Trophy, Search, ChevronRight, BarChartHorizontal, CheckCircle, Tag, List, Filter } from 'lucide-react';
import { HashLoader } from 'react-spinners';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaginationComponent } from '@/components/ui/pagination';
import { VerifiedBadge } from './VerifiedBadge';
import { countries } from '@/lib/countries';
import { Combobox } from './ui/combobox';
import { CompanyAutocomplete } from './CompanyAutocomplete';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Link from 'next/link';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

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
        return `https://img.logo.dev/${domain}`;
    } catch (e) {
        return '';
    }
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
  if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400 fill-gray-400" />;
  if (rank === 3) return <Trophy className="h-6 w-6 text-orange-600 fill-orange-600" />;
  return <span className="text-muted-foreground font-medium text-center w-6">{rank}</span>;
}

const getDifficultyDotClass = (difficulty: string | undefined) => {
    switch (difficulty) {
        case 'Easy': return 'bg-green-500';
        case 'Medium': return 'bg-yellow-500';
        case 'Hard': return 'bg-red-500';
        default: return 'bg-gray-400';
    }
};

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
    
    const isUserVerified = (user: UserProfile) => {
        return user.emailVerified && (user.referredUsersCount || 0) >= 3 && user.linkedinUrl;
    }

    return (
        <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-16 text-center">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="hidden md:table-cell">Company</TableHead>
                            <TableHead className="hidden lg:table-cell">Country</TableHead>
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
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <Link href={`/${user.username}`} className="hover:underline">
                                      <div>
                                          <div className="font-medium">{user.name}</div>
                                          <span className="text-muted-foreground mt-0.5 text-xs">
                                            @{user.username}
                                          </span>
                                      </div>
                                    </Link>
                                    {isUserVerified(user) && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <VerifiedBadge />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Verified</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {user.company && user.company !== 'N/A' ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={getCompanyLogoUrl(user.company)} />
                                            <AvatarFallback className="text-xs bg-muted">{user.company.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{user.company}</span>
                                    </div>
                                ) : 'N/A'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-2">
                                    {user.country && <Image src={`https://flagsapi.com/${user.country}/flat/16.png`} alt={`${user.country} flag`} width={16} height={12} />}
                                    {countryMap.get(user.country) || user.country}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                {user.points}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </ScrollArea>
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

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('points', 'desc'));
  }, [firestore]);

  const { data: allUsers, isLoading } = useCollection<UserProfile>(usersCollectionRef);

  useEffect(() => {
    // Reset page when filters change
    setCurrentPage(1);
  }, [activeTab, countryFilter, companyFilter]);

  const { filteredUsers, currentUserData } = useMemo(() => {
    if (!allUsers) return { filteredUsers: [], currentUserData: null };
    
    let users = allUsers.filter(user => !user.isAdmin);
    let currentUserData = null;

    if (currentUser) {
        const rank = users.findIndex(u => u.uid === currentUser.uid) + 1;
        const profile = users.find(u => u.uid === currentUser.uid);
        if (profile) {
            currentUserData = { ...profile, rank };
        }
    }

    if (activeTab === 'country' && countryFilter) {
      users = users.filter(user => user.country === countryFilter);
    }
    if (activeTab === 'company' && companyFilter) {
      users = users.filter(user => user.company === companyFilter);
    }
    
    return { filteredUsers: users, currentUserData };
  }, [allUsers, activeTab, countryFilter, companyFilter, currentUser]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const rankedUsers = useMemo(() => {
    if (!paginatedUsers) return [];
    return paginatedUsers.map((user, index) => {
        const overallRank = filteredUsers.findIndex(u => u.uid === user.uid) + 1;
        return { ...user, rank: overallRank };
    });
  }, [paginatedUsers, filteredUsers]);
  
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
    }
  }

  const problemsToRankUp: Partial<Question>[] = [
    { title: "Add and Remove Elements from List", difficulty: "Easy" },
    { title: "Merge Account Lists Without Duplicates", difficulty: "Medium" },
    { title: "Sort Integers Descending", difficulty: "Easy" },
    { title: "Remove Duplicate Strings from List", difficulty: "Easy" },
    { title: "Convert List of Ids to Set", difficulty: "Easy" },
  ];


  if (isLoading && !allUsers) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HashLoader color="#456eff" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight">Leaderboard</h1>
              <p className="text-muted-foreground mt-1 max-w-lg">
                  See how you rank against the top developers. Keep solving problems to climb up the ranks!
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-muted p-1 rounded-full">
                  <TabsList className="bg-transparent p-0">
                      <TabsTrigger value="global" className="rounded-full">Global</TabsTrigger>
                      <TabsTrigger value="country" className="rounded-full">By Country</TabsTrigger>
                      <TabsTrigger value="company" className="rounded-full">By Company</TabsTrigger>
                  </TabsList>
              </Tabs>
              <div className="w-full sm:w-64">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                {currentUserData && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Your Rank</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={currentUserData.avatarUrl} />
                                <AvatarFallback>{getInitials(currentUserData.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                               <p className="font-bold text-lg">{currentUserData.name}</p>
                               <p className="text-sm text-muted-foreground">@{currentUserData.username}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="text-center">
                                      <p className="text-2xl font-bold">{currentUserData.rank}</p>
                                      <p className="text-xs text-muted-foreground">Rank</p>
                                  </div>
                                  <div className="text-center">
                                      <p className="text-2xl font-bold">{currentUserData.points}</p>
                                      <p className="text-xs text-muted-foreground">Points</p>
                                  </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Solve to rank Up</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {problemsToRankUp.map((problem) => (
                                <li key={problem.title} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50">
                                    <span>{problem.title}</span>
                                     <Badge variant="outline" className="gap-1.5 w-20 justify-center">
                                        <span className={cn("h-1.5 w-1.5 rounded-full", getDifficultyDotClass(problem.difficulty))} aria-hidden="true"></span>
                                        {problem.difficulty}
                                     </Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <LeaderboardTable users={rankedUsers} currentUserUid={currentUser?.uid} page={currentPage} pageSize={PAGE_SIZE} />
                 <div className="mt-4 flex justify-center">
                    <PaginationComponent 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
        
    </div>
  );
}

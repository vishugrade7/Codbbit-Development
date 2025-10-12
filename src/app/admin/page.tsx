
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile, Question } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { StatCard, GoalsChart, LeadSourceChart } from '@/components';
import { BarChart, Users, Code, DollarSign, Activity, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

export default function AdminDashboardPage() {
    const firestore = useFirestore();

    const usersCollectionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const problemsCollectionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'problems');
    }, [firestore]);
    
    const recentUsersQuery = useMemoFirebase(() => {
        if(!firestore) return null;
        return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'), limit(5));
    }, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersCollectionRef);
    const { data: problemsData, isLoading: isLoadingProblems } = useCollection<{id: string, Questions: Partial<Question>[]}>(problemsCollectionRef);
    const { data: recentUsers, isLoading: isLoadingRecentUsers } = useCollection<UserProfile>(recentUsersQuery);

    const totalProblems = problemsData?.reduce((acc, category) => acc + (category.Questions?.length || 0), 0) || 0;
    
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 20)),
        to: new Date(),
    });


    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
    };

    const isLoading = isLoadingUsers || isLoadingProblems || isLoadingRecentUsers;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, here's a snapshot of your platform.
                </p>
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value="$45,231" icon={DollarSign} isLoading={isLoading} color="green" />
                <StatCard title="Total Users" value={users?.length || 0} icon={Users} isLoading={isLoading} color="blue" />
                <StatCard title="Total Problems" value={totalProblems} icon={Code} isLoading={isLoading} color="purple" />
                <StatCard title="Active Now" value="316" icon={Activity} isLoading={isLoading} color="pink" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Lead Sources</CardTitle>
                        <CardDescription>A chart showing the sources of your leads.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <LeadSourceChart />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                     <CardHeader>
                        <CardTitle>Sales Goal</CardTitle>
                        <CardDescription>A chart showing your sales goal progress.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <GoalsChart />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>A list of the most recent user sign-ups.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentUsers?.map(user => (
                                <TableRow key={user.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatarUrl} />
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isAdmin ? "destructive" : "outline"}>
                                            {user.isAdmin ? 'Admin' : 'User'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.company || 'N/A'}</TableCell>
                                    <TableCell className="text-right">{user.points}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

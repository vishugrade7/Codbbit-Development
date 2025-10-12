
'use client';

import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile, Question, PriceConfig } from '@/lib/types';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { StatCard } from '@/components';
import { Users, Code, DollarSign, Activity, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SubmissionsChart } from '@/components/charts/SubmissionsChart';
import { ProblemsChart } from '@/components/charts/ProblemsChart';
import { useMemo } from 'react';

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

    const priceConfigRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'config', 'pricing');
    }, [firestore]);
    
    const recentUsersQuery = useMemoFirebase(() => {
        if(!firestore) return null;
        return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'), limit(5));
    }, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersCollectionRef);
    const { data: problemsData, isLoading: isLoadingProblems } = useCollection<{id: string, Questions: Partial<Question>[]}>(problemsCollectionRef);
    const { data: recentUsers, isLoading: isLoadingRecentUsers } = useCollection<UserProfile>(recentUsersQuery);
    const { data: priceConfig, isLoading: isLoadingPrice } = useDoc<PriceConfig>(priceConfigRef);

    const stats = useMemo(() => {
        if (!users || !problemsData || !priceConfig) return null;

        const premiumUsers = users.filter(u => u.isPremium).length;
        const totalRevenue = premiumUsers * (priceConfig.premiumPrice || 0);
        
        const totalSubmissions = users.reduce((acc, user) => {
            return acc + Object.keys(user.solvedProblems || {}).length;
        }, 0);

        const totalProblems = problemsData.reduce((acc, category) => acc + (category.Questions?.length || 0), 0);

        return {
            totalRevenue,
            totalUsers: users.length,
            totalProblems,
            totalSubmissions,
        };
    }, [users, problemsData, priceConfig]);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
    };

    const isLoading = isLoadingUsers || isLoadingProblems || isLoadingRecentUsers || isLoadingPrice;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        A real-time overview of your platform's key metrics.
                    </p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value={`$${stats?.totalRevenue.toLocaleString() || '0'}`} icon={DollarSign} isLoading={isLoading} color="green" />
                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} isLoading={isLoading} color="blue" />
                <StatCard title="Total Problems" value={stats?.totalProblems || 0} icon={Code} isLoading={isLoading} color="purple" />
                <StatCard title="Total Submissions" value={stats?.totalSubmissions || 0} icon={Activity} isLoading={isLoading} color="pink" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Submissions Over Time</CardTitle>
                        <CardDescription>User problem submissions over the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <SubmissionsChart users={users} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                     <CardHeader>
                        <CardTitle>Problem Distribution</CardTitle>
                        <CardDescription>Difficulty breakdown of all problems.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ProblemsChart problems={problemsData} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Sign-ups</CardTitle>
                    <CardDescription>The newest members of the Codbbit community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
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
                                    <TableCell>
                                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">{user.points || 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

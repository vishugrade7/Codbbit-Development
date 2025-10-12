
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2, ListFilter } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { collection } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

const allFields: (keyof UserProfile)[] = [
    'name', 'username', 'email', 'company', 'country', 'points', 'isAdmin', 'isPremium', 'currentStreak', 'maxStreak', 'lastSolvedDate'
];

const fieldLabels: Record<keyof UserProfile, string> = {
    name: 'Name',
    username: 'Username',
    email: 'Email',
    company: 'Company',
    country: 'Country',
    points: 'Points',
    isAdmin: 'Is Admin',
    isPremium: 'Is Premium',
    currentStreak: 'Current Streak',
    maxStreak: 'Max Streak',
    lastSolvedDate: 'Last Solved Date',
    uid: '',
    createdAt: '',
    emailVerified: false,
    phone: '',
    phoneVerified: false,
    about: '',
    avatarUrl: '',
    website: '',
    githubUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    trailheadUrl: '',
    isEmailPublic: false,
    fontSize: 0,
    editorTheme: '',
    activeSessionId: '',
    achievements: {},
    categoryPoints: {},
    dsaStats: { Easy: 0, Medium: 0, Hard: 0 },
    sfdcAuth: { connected: false, instanceUrl: '', accessToken: '', refreshToken: '', issuedAt: 0 },
    githubSync: { connected: false },
    solvedProblems: {},
    starredProblems: [],
    followedSheets: [],
    submissionHeatmap: {},
    contributions: [],
    solvedQuestions: []
}

export default function ManageUsersPage() {
  const firestore = useFirestore();
  
  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersCollectionRef);

  const [isExporting, setIsExporting] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Record<keyof UserProfile, boolean>>({
      name: true,
      username: true,
      email: true,
      company: true,
      country: true,
      points: true,
      isAdmin: true,
      isPremium: false,
      currentStreak: false,
      maxStreak: false,
      lastSolvedDate: false,
      uid: false,
      createdAt: false,
      emailVerified: false,
      phone: '',
      phoneVerified: false,
      about: '',
      avatarUrl: '',
      website: '',
      githubUrl: '',
      twitterUrl: '',
      linkedinUrl: '',
      trailheadUrl: '',
      isEmailPublic: false,
      fontSize: 0,
      editorTheme: '',
      activeSessionId: '',
      achievements: {},
      categoryPoints: {},
      dsaStats: { Easy: 0, Medium: 0, Hard: 0 },
      sfdcAuth: { connected: false, instanceUrl: '', accessToken: '', refreshToken: '', issuedAt: 0 },
      githubSync: { connected: false },
      solvedProblems: {},
      starredProblems: [],
      followedSheets: [],
      submissionHeatmap: {},
      contributions: [],
      solvedQuestions: []
  });

  const handleExportToExcel = () => {
    if (!users) return;
    setIsExporting(true);

    try {
      const activeFields = allFields.filter(field => selectedFields[field]);
      if (activeFields.length === 0) {
          alert("Please select at least one field to export.");
          setIsExporting(false);
          return;
      }
        
      const dataToExport = users.map(user => {
        const row: Record<string, any> = {};
        activeFields.forEach(field => {
            row[fieldLabels[field]] = user[field];
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      XLSX.writeFile(workbook, "Codbbit_Users.xlsx");
    } catch (error) {
      console.error("Failed to export to Excel", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground mt-1">View, edit, or remove users.</p>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Customize Export
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Fields to Export</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allFields.map(field => (
                        <DropdownMenuCheckboxItem
                            key={field}
                            checked={selectedFields[field]}
                            onCheckedChange={(checked) => setSelectedFields(prev => ({...prev, [field]: checked}))}
                        >
                            {fieldLabels[field]}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleExportToExcel} disabled={isLoading || isExporting}>
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export to Excel
            </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.company || 'N/A'}</TableCell>
                    <TableCell>{user.isAdmin ? 'Admin' : 'User'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

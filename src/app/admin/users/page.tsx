
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, ListFilter, Upload, Settings } from 'lucide-react';
import { HashLoader } from 'react-spinners';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, errorEmitter, FirestorePermissionError } from '@/firebase';
import type { UserProfile, NavigationSettings } from '@/lib/types';
import { collection, doc, updateDoc, deleteField, setDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const allFields: (keyof UserProfile)[] = [
    'name', 'username', 'email', 'company', 'country', 'points', 'isAdmin', 'isPremium', 'currentStreak', 'maxStreak', 'lastSolvedDate'
];

const fieldLabels: Record<string, string> = {
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
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', description: 'The main landing page for logged-in users.' },
  { id: 'problems', label: 'Problems', description: 'The list of all coding problems.' },
  { id: 'courses', label: 'Courses', description: 'Curated learning paths and tutorials.' },
  { id: 'lwc-playground', label: 'LWC Playground', description: 'A sandbox for building Lightning Web Components.' },
  { id: 'leaderboard', label: 'Leaderboard', description: 'Global and company-wide user rankings.' },
  { id: 'sheets', label: 'Sheets', description: 'User-created problem lists for targeted practice.' },
];

export default function ManageUsersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [userNavOverrides, setUserNavOverrides] = useState<Record<string, 'default' | 'on' | 'off'>>({});

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading, refetch } = useCollection<UserProfile>(usersCollectionRef);

  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
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
  });

  const handleOpenPermissions = (user: UserProfile) => {
    setSelectedUser(user);
    const overrides: Record<string, 'default' | 'on' | 'off'> = {};
    navItems.forEach(item => {
        const overrideValue = user.navigationOverrides?.[item.id as keyof NavigationSettings];
        if (overrideValue === true) {
            overrides[item.id] = 'on';
        } else if (overrideValue === false) {
            overrides[item.id] = 'off';
        } else {
            overrides[item.id] = 'default';
        }
    });
    setUserNavOverrides(overrides);
    setIsPermissionsDialogOpen(true);
  };
  
  const handleSavePermissions = async () => {
    if (!selectedUser || !firestore) return;

    const userDocRef = doc(firestore, 'users', selectedUser.uid);
    const overrides: Record<string, boolean | ReturnType<typeof deleteField>> = {};

    Object.entries(userNavOverrides).forEach(([key, value]) => {
      if (value === 'on') {
        overrides[key] = true;
      } else if (value === 'off') {
        overrides[key] = false;
      } else {
        // For 'default', we need to remove the field.
        overrides[key] = deleteField();
      }
    });
    
    const payload = { navigationOverrides: overrides };

    // Use setDoc with merge to handle both creating and updating nested fields.
    setDoc(userDocRef, payload, { merge: true })
      .then(() => {
        toast({ title: 'Permissions Updated', description: `Navigation settings for ${selectedUser.name} have been saved.` });
        setIsPermissionsDialogOpen(false);
        setSelectedUser(null);
        refetch(); // Refetch user data to reflect changes
      })
      .catch(async (serverError) => {
        // Create the rich, contextual error asynchronously.
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: payload,
        });
        
        // Emit the error with the global error emitter
        errorEmitter.emit('permission-error', permissionError);
      });
  };


  const handleExportToExcel = () => {
    if (!users) return;
    setIsExporting(true);

    try {
      const activeFields = allFields.filter(field => selectedFields[field]);
      if (activeFields.length === 0) {
          toast({ title: "Select Fields", description: "Please select at least one field to export.", variant: "destructive" });
          setIsExporting(false);
          return;
      }
        
      const dataToExport = users.map(user => {
        const row: Record<string, any> = {};
        activeFields.forEach(field => {
            row[fieldLabels[field as keyof UserProfile]] = user[field];
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
  
  const handleBackup = async () => {
    setIsBackingUp(true);
    toast({
        title: "Backup Started",
        description: "User data is being backed up to Salesforce."
    });
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsBackingUp(false);
    toast({
        title: "Backup Complete",
        description: "User data has been successfully backed up.",
    });
  }

  return (
    <>
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
                              onCheckedChange={(checked) => setSelectedFields(prev => ({...prev, [field]: !!checked}))}
                          >
                              {fieldLabels[field]}
                          </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={handleExportToExcel} disabled={isLoading || isExporting}>
                {isExporting ? (
                  <HashLoader color="#456eff" size={20} />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export to Excel
              </Button>
               <Button onClick={handleBackup} disabled={isLoading || isBackingUp}>
                  {isBackingUp ? (
                      <HashLoader color="#456eff" size={20} />
                  ) : (
                      <Upload className="mr-2 h-4 w-4" />
                  )}
                  Backup to Salesforce
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
                <HashLoader color="#456eff" />
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
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                         <Button variant="outline" size="sm" onClick={() => handleOpenPermissions(user)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

       <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Permissions</DialogTitle>
            <DialogDescription>
              Override global navigation settings for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             {navItems.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor={`perm-${item.id}`} className="font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <RadioGroup 
                    value={userNavOverrides[item.id] || 'default'} 
                    onValueChange={(value) => setUserNavOverrides(prev => ({...prev, [item.id]: value as any}))}
                    className="flex items-center gap-3"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="default" id={`perm-${item.id}-default`}/>
                      <Label htmlFor={`perm-${item.id}-default`} className="text-xs">Default</Label>
                    </div>
                     <div className="flex items-center space-x-1">
                      <RadioGroupItem value="on" id={`perm-${item.id}-on`}/>
                      <Label htmlFor={`perm-${item.id}-on`} className="text-xs">On</Label>
                    </div>
                     <div className="flex items-center space-x-1">
                      <RadioGroupItem value="off" id={`perm-${item.id}-off`}/>
                      <Label htmlFor={`perm-${item.id}-off`} className="text-xs">Off</Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

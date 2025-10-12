
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Plus, MoreHorizontal, CalendarIcon, Trash2, DollarSign, Tag, Settings } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking, useDoc } from '@/firebase';
import type { Voucher, PriceConfig } from '@/lib/types';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const voucherSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, 'Voucher code is required.'),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, 'Value must be positive.'),
  isActive: z.boolean(),
  expiresAt: z.date().optional(),
});

type VoucherFormData = z.infer<typeof voucherSchema>;

const priceSchema = z.object({
    premiumPrice: z.coerce.number().min(0, 'Price must be a positive number.'),
    isPaymentsEnabled: z.boolean(),
});

type PriceFormData = z.infer<typeof priceSchema>;

export default function PricingManagementPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Voucher Management
  const vouchersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'vouchers');
  }, [firestore]);
  const { data: vouchers, isLoading: isLoadingVouchers, refetch: refetchVouchers } = useCollection<Voucher>(vouchersCollectionRef);

  const { control, register, handleSubmit, reset, setValue } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 0,
      isActive: true,
      expiresAt: undefined,
    },
  });

  // Price Management
  const priceDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'pricing');
  }, [firestore]);
  const { data: priceConfig, isLoading: isLoadingPrice, refetch: refetchPrice } = useDoc<PriceConfig>(priceDocRef);
  
  const { control: priceControl, register: priceRegister, handleSubmit: handlePriceSubmit, reset: resetPriceForm, formState: { isSubmitting: isSavingPrice } } = useForm<PriceFormData>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
        premiumPrice: 0,
        isPaymentsEnabled: true,
    }
  });

  useEffect(() => {
      if (priceConfig) {
          resetPriceForm({ premiumPrice: priceConfig.premiumPrice, isPaymentsEnabled: priceConfig.isPaymentsEnabled });
      }
  }, [priceConfig, resetPriceForm]);

  const onPriceSubmit = async (data: PriceFormData) => {
    if (!priceDocRef) return;
    try {
        await setDocumentNonBlocking(priceDocRef, data, { merge: true });
        toast({ title: 'Settings Updated', description: 'The pricing settings have been updated.' });
        refetchPrice();
    } catch (error) {
        toast({ title: 'Error', description: 'Could not update the settings.', variant: 'destructive' });
    }
  }


  const handleCreateNew = () => {
    reset({
      code: '',
      type: 'percentage',
      value: 0,
      isActive: true,
      expiresAt: undefined,
    });
    setEditingVoucher(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    reset({
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      isActive: voucher.isActive,
      expiresAt: voucher.expiresAt ? new Date(voucher.expiresAt) : undefined,
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (voucherId: string) => {
      if (!firestore) return;
      const docRef = doc(firestore, 'vouchers', voucherId);
      await deleteDocumentNonBlocking(docRef);
      toast({ title: 'Voucher Deleted', description: 'The voucher has been successfully deleted.' });
      refetchVouchers();
  }

  const onSubmit = async (data: VoucherFormData) => {
    if (!firestore) return;

    const voucherId = editingVoucher?.id || uuidv4();
    const docRef = doc(firestore, 'vouchers', voucherId);

    const voucherData: Voucher = {
      ...data,
      id: voucherId,
      expiresAt: data.expiresAt ? data.expiresAt.toISOString() : null,
    };
    
    await setDocumentNonBlocking(docRef, voucherData, { merge: true });

    toast({
      title: editingVoucher ? 'Voucher Updated' : 'Voucher Created',
      description: `The voucher "${data.code}" has been saved.`,
    });
    
    setIsDialogOpen(false);
    refetchVouchers();
  };
  
  const isLoading = isLoadingVouchers || isLoadingPrice;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Pricing & Vouchers</h1>
          <p className="text-muted-foreground mt-1">Manage subscription prices and promotional codes.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Plan Pricing</CardTitle>
                <CardDescription>Set the price for the premium subscription plan.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePriceSubmit(onPriceSubmit)}>
                <CardContent>
                    {isLoadingPrice ? <Loader2 className="h-6 w-6 animate-spin"/> : (
                        <div className="max-w-sm">
                            <Label htmlFor="premiumPrice">Premium Plan Price (USD)</Label>
                            <div className="relative mt-2">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="premiumPrice" type="number" {...priceRegister('premiumPrice')} className="pl-9" />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSavingPrice}>
                        {isSavingPrice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Price
                    </Button>
                </CardFooter>
            </form>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable major features on the website.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePriceSubmit(onPriceSubmit)}>
                <CardContent>
                    {isLoadingPrice ? <Loader2 className="h-6 w-6 animate-spin"/> : (
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="isPaymentsEnabled" className="font-medium">Enable Payments</Label>
                                <p className="text-sm text-muted-foreground">Show pricing page and upgrade buttons.</p>
                            </div>
                            <Controller
                                name="isPaymentsEnabled"
                                control={priceControl}
                                render={({ field }) => (
                                    <Switch
                                    id="isPaymentsEnabled"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    )}
                </CardContent>
                 <CardFooter>
                    <Button type="submit" disabled={isSavingPrice}>
                        {isSavingPrice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Settings
                    </Button>
                </CardFooter>
            </form>
        </Card>
      </div>


      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Voucher List</CardTitle>
            <CardDescription>A list of all promotional vouchers.</CardDescription>
          </div>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleCreateNew}>
                <Plus />
                Create Voucher
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>{editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}</DialogTitle>
                <DialogDescription>
                    Fill in the details below to configure the voucher.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Voucher Code</Label>
                    <Input id="code" {...register('code')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                        )}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" type="number" {...register('value')} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiration Date</Label>
                    <Controller
                    name="expiresAt"
                    control={control}
                    render={({ field }) => (
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            <CalendarIcon />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                        </Popover>
                    )}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />}
                    />
                    <Label htmlFor="isActive">Voucher is Active</Label>
                </div>
                <DialogFooter>
                    <Button type="submit">Save Voucher</Button>
                </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
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
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers?.map(voucher => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-mono">{voucher.code}</TableCell>
                    <TableCell className="capitalize">{voucher.type}</TableCell>
                    <TableCell>
                      {voucher.type === 'percentage' ? `${voucher.value}%` : `$${voucher.value}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={voucher.isActive ? 'default' : 'secondary'}>
                        {voucher.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {voucher.expiresAt ? format(new Date(voucher.expiresAt), 'PPP') : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(voucher)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(voucher.id)} className="text-red-500">
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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

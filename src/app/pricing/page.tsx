
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AppSidebar, Sidebar, SidebarProvider, SidebarInset } from '@/components';
import { Check, Star, ShieldCheck, Clock, Award, Sparkles, X, Tag } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { PriceConfig, Voucher } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individuals and small projects',
    features: [
      '50 code executions per day',
      'Basic code completion',
      'Access to all free problems',
      'Community support',
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
    featured: false,
  },
  {
    name: 'Premium',
    price: '$129', // Fallback price
    description: 'For professional developers and teams',
    features: [
        { text: 'All Premium components', icon: Sparkles },
        { text: 'Early access', icon: ShieldCheck },
        { text: 'Component Request', icon: Star },
        { text: 'Free Lifetime updates', icon: Clock },
        { text: 'Skiper pro badge', icon: Award },
    ],
    buttonText: 'Get Instant access',
    buttonVariant: 'default' as const,
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Pro, plus:',
      'On-premise deployment options',
      'Custom integrations',
      'Dedicated account manager',
      'SLA and advanced security',
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const,
    featured: false,
  },
];

export default function PricingPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const priceDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'pricing');
  }, [firestore]);

  const { data: priceConfig, isLoading: isLoadingPrice } = useDoc<PriceConfig>(priceDocRef);

  const premiumPrice = useMemo(() => priceConfig?.premiumPrice ?? 129, [priceConfig]);
  const paymentsEnabled = useMemo(() => priceConfig?.isPaymentsEnabled !== false, [priceConfig]);
  
  useEffect(() => {
      setFinalPrice(premiumPrice);
  }, [premiumPrice]);


  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !firestore) return;

    setIsApplyingVoucher(true);
    try {
        const vouchersRef = collection(firestore, 'vouchers');
        const q = query(vouchersRef, where('code', '==', voucherCode.trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ title: 'Invalid Voucher', description: 'This voucher code does not exist.', variant: 'destructive' });
            return;
        }

        const voucherDoc = querySnapshot.docs[0];
        const voucher = voucherDoc.data() as Voucher;

        if (!voucher.isActive) {
            toast({ title: 'Inactive Voucher', description: 'This voucher is no longer active.', variant: 'destructive' });
            return;
        }
        
        if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
             toast({ title: 'Expired Voucher', description: 'This voucher has expired.', variant: 'destructive' });
            return;
        }
        
        let newPrice = premiumPrice;
        if (voucher.type === 'percentage') {
            newPrice = premiumPrice - (premiumPrice * (voucher.value / 100));
        } else if (voucher.type === 'fixed') {
            newPrice = premiumPrice - voucher.value;
        }

        setFinalPrice(newPrice < 0 ? 0 : newPrice);
        setAppliedVoucher(voucher);
        toast({ title: 'Voucher Applied!', description: `Your discount has been applied.` });

    } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Could not apply voucher.', variant: 'destructive' });
    } finally {
        setIsApplyingVoucher(false);
    }
  };
  
  const handleRemoveVoucher = () => {
      setAppliedVoucher(null);
      setFinalPrice(premiumPrice);
      setVoucherCode('');
      toast({ title: 'Voucher Removed' });
  }

  const handleProUpgrade = () => {
    const paymentAmount = finalPrice ?? premiumPrice;
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentAmount * 100, // amount in the smallest currency unit
        currency: "USD",
        name: "Codbbit Premium",
        description: "Lifetime Access",
        image: "/logo.png",
        handler: function (response: any){
            alert('Payment successful: ' + response.razorpay_payment_id);
            // You can handle the successful payment here, e.g., update user subscription status in Firestore
        },
        prefill: {
            name: "Test User",
            email: "test.user@example.com",
            contact: "9999999999"
        },
        notes: {
            address: "Razorpay Corporate Office"
        },
        theme: {
            color: "#1B60FF"
        }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  const getButtonAction = (tierName: string) => {
    if (tierName === 'Premium') {
      return handleProUpgrade;
    }
    return () => {};
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">
              {paymentsEnabled ? "Pricing Plans" : "Coming Soon"}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              {paymentsEnabled ? "Choose the plan that fits your needs. Start for free and upgrade when you're ready." : "We're putting the finishing touches on our premium plans. Check back soon!"}
            </p>
          </header>
          {isLoadingPrice ? (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
           ) : paymentsEnabled ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <Card key={tier.name} className={cn(
                "flex flex-col relative overflow-hidden",
                 tier.featured && "aurora-bg"
              )}>
                 {tier.featured && (
                    <div className="smoke-bg" />
                 )}
                <CardHeader className="z-10">
                  <CardTitle className={cn(tier.featured && "text-white")}>{tier.name}</CardTitle>
                  <CardDescription className={cn(tier.featured && "text-gray-400")}>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow z-10">
                  <div className="mb-6">
                     {tier.name === 'Premium' && appliedVoucher ? (
                         <div className="flex items-end gap-2">
                             <span className="text-5xl font-bold">${finalPrice?.toFixed(2)}</span>
                             <span className="text-2xl font-bold text-muted-foreground line-through">${premiumPrice}</span>
                         </div>
                     ) : (
                        <span className="text-5xl font-bold">{tier.name === 'Premium' ? `$${finalPrice}` : tier.price}</span>
                     )}
                    {tier.name === 'Premium' && <span className="text-muted-foreground">/ lifetime</span>}
                    {tier.name === 'Free' && <span className="text-muted-foreground">/ month</span>}
                  </div>
                  <ul className="space-y-4">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                         {typeof feature === 'string' ? (
                            <>
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{feature}</span>
                            </>
                         ) : (
                            <>
                                <feature.icon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{feature.text}</span>
                            </>
                         )}
                      </li>
                    ))}
                  </ul>
                   {tier.name === 'Premium' && (
                    <div className="mt-6 pt-6 border-t">
                       {appliedVoucher ? (
                            <div className="flex items-center justify-between gap-2 p-3 bg-green-500/10 rounded-md">
                               <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-green-500" />
                                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Voucher applied: <span className="font-bold">{appliedVoucher.code}</span></p>
                               </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-700 dark:text-green-300" onClick={handleRemoveVoucher}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                       ) : (
                         <>
                            <label htmlFor="voucher" className="text-sm font-medium text-muted-foreground">Have a voucher?</label>
                            <div className="flex items-center gap-2 mt-2">
                                <Input 
                                  id="voucher" 
                                  placeholder="Enter voucher code" 
                                  value={voucherCode} 
                                  onChange={(e) => setVoucherCode(e.target.value)}
                                  disabled={isApplyingVoucher}
                                />
                                <Button variant="secondary" onClick={handleApplyVoucher} disabled={isApplyingVoucher}>
                                    {isApplyingVoucher && <Loader />}
                                    Apply
                                </Button>
                            </div>
                         </>
                       )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="z-10 mt-4">
                  <Button 
                     className="w-full"
                     variant={tier.buttonVariant} 
                     onClick={getButtonAction(tier.name)}
                     size="lg"
                   >
                    {tier.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          ) : (
             <div className="text-center">
                <p className="text-muted-foreground">Check back soon for our exciting plans!</p>
            </div>
          )}
           <div className="text-center mt-12">
                <Link href="/settings">
                    <Button variant="ghost">
                        Back to Settings
                    </Button>
                </Link>
           </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

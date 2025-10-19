
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import {
  initiateEmailSignIn,
  initiateEmailSignUp,
} from '@/firebase/non-blocking-login';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import {
  ArrowPathIcon,
  UserIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { updateProfile, sendEmailVerification, type User, onIdTokenChanged, sendPasswordResetEmail } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { PasswordStrength } from './PasswordStrength';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Combobox } from './ui/combobox';
import { countries } from '@/lib/countries';
import { useDebounce } from '@/hooks/use-debounce';
import { isUsernameUnique } from '@/ai/flows/is-username-unique';
import { handleReferral } from '@/ai/flows/handle-referral';
import { useToast } from '@/hooks/use-toast';
import { CompanyAutocomplete } from './CompanyAutocomplete';
import Image from 'next/image';
import { Label } from './ui/label';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signupSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  company: z.string().optional(),
  country: z.string().min(1, { message: 'Please select a country.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
  referralCode: z.string().optional(),
});

type AuthFormProps = {
  type: 'login' | 'signup';
};

type UsernameStatus = 'idle' | 'checking' | 'unique' | 'taken';

function AuthFormComponent({ type }: AuthFormProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [existingUserName, setExistingUserName] = useState<string | null>(null);
  const [showVerifyEmailDialog, setShowVerifyEmailDialog] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<User | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const referralCodeFromUrl = searchParams.get('ref') || '';

  const isLogin = type === 'login';
  const schema = isLogin ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      ...(isLogin ? {} : {
        fullName: '',
        username: '',
        company: '',
        country: '',
        referralCode: referralCodeFromUrl,
      }),
    },
     mode: 'onChange'
  });

  const {
    formState: { isSubmitting, errors, touchedFields },
    trigger,
    setError,
    watch,
    clearErrors
  } = form;

  const usernameValue = watch('username');
  const debouncedUsername = useDebounce(usernameValue, 500);

  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const { isUnique, existingUserName: existingName } = await isUsernameUnique({ username });
      if (isUnique) {
        setUsernameStatus('unique');
        setExistingUserName(null);
        clearErrors('username');
      } else {
        setUsernameStatus('taken');
        setExistingUserName(existingName || null);
        setError('username', { type: 'manual', message: `This username is already taken by ${existingName}.` });
      }
    } catch (error) {
      setUsernameStatus('idle'); // Reset on error
    }
  }, [setError, clearErrors]);

  useEffect(() => {
    if (debouncedUsername) {
      checkUsername(debouncedUsername);
    } else {
      setUsernameStatus('idle');
    }
  }, [debouncedUsername, checkUsername]);
  
  const handleNext = async () => {
    const isValid = await trigger(['email', 'password']);
    if(isValid) {
        setActiveTab('profile');
    }
  }

  useEffect(() => {
    if (user && user.emailVerified) {
      router.replace('/');
    }
  }, [user, router]);
  

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    setIsResending(true);
    try {
      await sendEmailVerification(unverifiedUser);
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox (and spam folder) for the verification link.',
        variant: 'success'
      });
      setShowVerifyEmailDialog(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to send verification email. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsResending(false);
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive'});
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      toast({ title: 'Password Reset Email Sent', description: 'Check your inbox for a link to reset your password.'});
      setIsForgotPasswordOpen(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      let message = 'Failed to send password reset email.';
      if (error.code === 'auth/user-not-found') {
        message = 'No user found with this email address.';
      }
      toast({ title: 'Error', description: message, variant: 'destructive'});
    } finally {
      setIsSendingReset(false);
    }
  }

  async function onSubmit(values: z.infer<typeof schema>) {
    if (isLogin) {
      try {
        const userCredential = await initiateEmailSignIn(auth, values.email, values.password);
        if (userCredential && !userCredential.user.emailVerified) {
            setUnverifiedUser(userCredential.user);
            setShowVerifyEmailDialog(true);
            await auth.signOut();
            return;
        }
      } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          setError('email', { type: 'manual', message: 'Invalid email or password.' });
          setError('password', { type: 'manual', message: 'Invalid email or password.' });
        } else {
          setError('root', { type: 'manual', message: error.message || 'An unexpected error occurred.' });
        }
      }
    } else {
      const signupValues = values as z.infer<typeof signupSchema>;
       if (usernameStatus !== 'unique') {
        setError('username', { type: 'manual', message: `This username is already taken by ${existingUserName}.` });
        return;
      }
      try {
        const userCredential = await initiateEmailSignUp(auth, signupValues.email, signupValues.password);
        if (userCredential && userCredential.user) {
          const user = userCredential.user;
          await updateProfile(user, {
            displayName: signupValues.fullName
          });

          const userDocRef = doc(firestore, 'users', user.uid);
          
          const newUserProfile = {
            uid: user.uid,
            email: user.email,
            name: signupValues.fullName,
            username: signupValues.username,
            username_lowercase: signupValues.username.toLowerCase(),
            company: signupValues.company || '',
            country: signupValues.country,
            emailVerified: user.emailVerified,
            phone: '',
            phoneVerified: false,
            about: '',
            avatarUrl: user.photoURL || '',
            isEmailPublic: false,
            isAdmin: false,
            points: 0,
            currentStreak: 0,
            maxStreak: 0,
            lastSolvedDate: null,
            activeSessionId: '',
            achievements: {},
            categoryPoints: {},
            dsaStats: { Easy: 0, Medium: 0, Hard: 0 },
            sfdcAuth: {
              connected: false,
              instanceUrl: '',
              accessToken: '',
              refreshToken: '',
              issuedAt: 0,
            },
            solvedProblems: {},
            starredProblems: [],
            submissionHeatmap: {},
            contributions: [],
            referredBy: signupValues.referralCode || '',
            referredUsersCount: 0,
          };
          
          setDocumentNonBlocking(userDocRef, newUserProfile, { merge: false });
          
          // Send verification email
          await sendEmailVerification(user);

          // After successful sign up, prompt user to check email
          toast({
            title: 'Account Created!',
            description: 'Please check your inbox to verify your email address.',
            variant: 'success'
          });
          
           // Sign out the user and prompt them to verify
          await auth.signOut();
          setUnverifiedUser(user);
          setShowVerifyEmailDialog(true);
        }
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            setError('email', { type: 'manual', message: 'This email is already in use.' });
        } else {
            setError('root', { type: 'manual', message: error.message || 'An unexpected error occurred during sign up.' });
        }
      }
    }
  }

  if (isUserLoading || (user && user.emailVerified)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <ArrowPathIcon className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md md:max-w-2xl">
        <CardHeader className="items-center text-center">
          <Image src="/logo.png" alt="Codbbit Logo" width={96} height={96} className="mb-4" />
          <CardTitle className="pt-4 font-headline">{isLogin ? 'Welcome Back!' : 'Create an account'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to continue your coding journey.' : 'Enter your information to get started for free.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isLogin ? (
                 <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                              <FormLabel>Password</FormLabel>
                                <DialogTrigger asChild>
                                  <Button variant="link" size="sm" className="p-0 h-auto" type="button">Forgot Password?</Button>
                                </DialogTrigger>
                          </div>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting && <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />}
                      Login
                    </Button>
                  </div>
                 </Dialog>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="account" disabled={isSubmitting}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        Account Info
                      </TabsTrigger>
                      <TabsTrigger 
                          value="profile" 
                          disabled={isSubmitting || !touchedFields.email || !!errors.email || !touchedFields.password || !!errors.password}
                      >
                        <DocumentTextIcon className="mr-2 h-4 w-4" />
                        Profile Info
                      </TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className="mt-4">
                      <div className="space-y-4">
                          <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                  <Input placeholder="user@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                              <FormItem>
                                  <PasswordStrength
                                  id="password"
                                  value={field.value}
                                  onChange={field.onChange}
                                  aria-describedby="password-form-item-message"
                                  />
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <Button type="button" className="w-full" onClick={handleNext}>
                              Next
                          </Button>
                      </div>
                  </TabsContent>
                  <TabsContent value="profile" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                        <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Codbee" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Country <span className="text-destructive">*</span></FormLabel>
                                <Combobox
                                    options={countries}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select country..."
                                    searchPlaceholder="Search countries..."
                                />
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <div className="relative">
                                <Input placeholder="e.g. codbee" {...field} />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    {usernameStatus === 'checking' && <ArrowPathIcon className="h-4 w-4 animate-spin text-muted-foreground" />}
                                    {usernameStatus === 'unique' && <CheckIcon className="h-4 w-4 text-green-500" />}
                                    {usernameStatus === 'taken' && <XMarkIcon className="h-4 w-4 text-red-500" />}
                                </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="referralCode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Referral Code (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter referral code" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                <FormLabel>Company / College (Optional)</FormLabel>
                                <FormControl>
                                    <CompanyAutocomplete
                                    value={field.value || ''}
                                    onValueChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
                        <Button type="button" variant="outline" className="w-full" onClick={() => setActiveTab('account')}>
                          Back
                        </Button>
                        <Button type="submit" className="w-full" disabled={isSubmitting || usernameStatus !== 'unique'}>
                          {isSubmitting && <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />}
                          Create Account
                        </Button>
                      </div>
                      {errors.root && <FormMessage className="mt-4 text-center">{errors.root.message}</FormMessage>}
                  </TabsContent>
                </Tabs>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          {isLogin ? (
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
                Sign Up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                Login
              </Link>
            </p>
          )}
        </CardFooter>
      </Card>
      <AlertDialog open={showVerifyEmailDialog} onOpenChange={setShowVerifyEmailDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Email Verification Required</AlertDialogTitle>
              <AlertDialogDescription>
                Your email address has not been verified. Please check your inbox for a verification link, or request a new one.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction onClick={handleResendVerification} disabled={isResending}>
                {isResending ? (
                  <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="mr-2 h-4 w-4" />
                )}
                Resend Email
              </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-password-email">Email</Label>
                <Input
                  id="forgot-password-email"
                  type="email"
                  placeholder="name@example.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleForgotPassword} disabled={isSendingReset}>
              {isSendingReset && <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


export function AuthForm(props: AuthFormProps) {
  return (
    <Suspense>
      <AuthFormComponent {...props} />
    </Suspense>
  )
}

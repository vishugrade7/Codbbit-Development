

'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useFirestore, useUser, setDocumentNonBlocking, useAuth, useStorage, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { useParams, notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  Twitter,
  Pencil,
  Award,
  Trophy,
  Flame,
  PlusCircle,
  Clock,
  Loader2,
  Upload,
  Tag,
} from 'lucide-react';
import { doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from './ui/progress';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { getUserProfileByUsername } from '@/ai/flows/get-user-profile-by-username';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from './VerifiedBadge';
import { getUserRank } from '@/ai/flows/get-user-rank';
import { Timeline, TimelineContent, TimelineDate, TimelineHeader, TimelineIndicator, TimelineItem, TimelineSeparator, TimelineTitle } from './ui/timeline';


const ContributionGraph = ({ heatmap, currentStreak, maxStreak }: { heatmap: Record<string, number>, currentStreak: number, maxStreak: number }) => {
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(new Date().setFullYear(today.getFullYear() - 1));
    startDate.setDate(startDate.getDate() + 1);

    const dates = useMemo(() => {
        const dates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    }, [startDate, endDate]);
    
    const totalSubmissions = useMemo(() => Object.values(heatmap).reduce((sum, count) => sum + count, 0), [heatmap]);

    const weeks = useMemo(() => {
      const weeks: ({ date: Date; count: number; } | null)[][] = [];
      let currentWeek: ({ date: Date; count: number; } | null)[] = Array(7).fill(null);

      // Align the first day of the year to the correct day of the week
      const firstDayOfWeek = startDate.getDay();
      for (let i = 0; i < firstDayOfWeek; i++) {
          currentWeek[i] = null;
      }
      
      dates.forEach(date => {
          const dayOfWeek = date.getDay();
          const dateString = date.toISOString().split('T')[0];
          currentWeek[dayOfWeek] = {
              date: date,
              count: heatmap[dateString] || 0,
          };

          if (dayOfWeek === 6) { // If it's Saturday (end of the week)
              weeks.push(currentWeek);
              currentWeek = Array(7).fill(null); // Start a new week
          }
      });
      
      // Push the last, possibly incomplete week
      if (currentWeek.some(d => d !== null)) {
          weeks.push(currentWeek);
      }

      return weeks;

    }, [startDate, dates, heatmap]);


    const getColor = (count: number) => {
        if (count < 0) return 'bg-transparent'; // For null days
        if (count === 0) return 'bg-gray-200 dark:bg-[#161b22]';
        if (count <= 2) return 'bg-blue-200 dark:bg-blue-900';
        if (count <= 4) return 'bg-blue-400 dark:bg-blue-700';
        if (count <= 6) return 'bg-blue-600 dark:bg-blue-500';
        return 'bg-blue-800 dark:bg-blue-300';
    };

    const monthNames = useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], []);
    
    const monthLabels = useMemo(() => {
        const labels: { name: string, index: number }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, weekIndex) => {
            const firstDayOfWeek = week.find(day => day !== null);
            if (firstDayOfWeek) {
                const month = firstDayOfWeek.date.getMonth();
                if (month !== lastMonth) {
                    // Show month label if it's the first week of a new month,
                    // or if it appears after the first couple of columns to avoid clutter.
                    if (weekIndex > 1) {
                        labels.push({ name: monthNames[month], index: weekIndex });
                        lastMonth = month;
                    }
                }
            }
        });
        return labels;
    }, [weeks, monthNames]);


  return (
    <TooltipProvider>
      <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm text-muted-foreground">{totalSubmissions} submissions in the last year</h2>
               <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5">
                    <Flame className="-ms-0.5 h-3.5 w-3.5 text-orange-500" />
                    Max Streak: {maxStreak}
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                    <Flame className="-ms-0.5 h-3.5 w-3.5 text-orange-500" />
                    Current Streak: {currentStreak}
                </Badge>
              </div>
          </div>
          <div className="flex gap-3">
              <div className="flex flex-col text-xs text-muted-foreground justify-between pt-5 pb-1">
                  <span>Mon</span>
                  <span className="invisible">Tue</span>
                  <span>Wed</span>
                  <span className="invisible">Thu</span>
                  <span>Fri</span>
                  <span className="invisible">Sat</span>
                  <span className="invisible">Sun</span>
              </div>
              <div className="flex-grow flex flex-col overflow-x-auto">
                  <div className="grid grid-flow-col" style={{ gridTemplateRows: `repeat(1, auto)` }}>
                      {monthLabels.map(({ name, index }) => (
                           <div key={name+index} className="text-xs text-muted-foreground -translate-x-1/2" style={{ gridColumn: index + 1 }}>{name}</div>
                      ))}
                  </div>
                  <div className="grid grid-flow-col grid-rows-7 gap-1">
                      {weeks.flat().map((day, index) => (
                          <Tooltip key={index} delayDuration={100}>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-3.5 h-3.5 rounded-sm ${getColor(day ? day.count : -1)}`}
                              />
                            </TooltipTrigger>
                            {day && day.count >= 0 && (
                               <TooltipContent>
                                  <p>{day.count} contributions on {day.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                      ))}
                  </div>
              </div>
          </div>
        <div className="flex justify-end items-center mt-2 text-xs text-muted-foreground gap-2">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-[#161b22]"></div>
            <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900"></div>
            <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700"></div>
            <div className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-500"></div>
            <div className="w-3 h-3 rounded-sm bg-blue-800 dark:bg-blue-300"></div>
            <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
};


export function ProfilePageClient() {
  const firestore = useFirestore();
  const storage = useStorage();
  const params = useParams();
  const { user: currentUser, isUserLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfileAndRank = async () => {
      const username = params.username as string;
      if (!username) return;

      setLoading(true);
      try {
        const userProfile = await getUserProfileByUsername({ username });
        setProfile(userProfile);
        if (userProfile && userProfile.points != null) {
          const rankResult = await getUserRank({ points: userProfile.points });
          setUserRank(rankResult.rank);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (!isUserLoading) {
        fetchProfileAndRank();
    }
  }, [params, isUserLoading]);

  const solvedCategories = useMemo(() => {
    if (!profile?.solvedProblems) {
      return {};
    }
    return Object.values(profile.solvedProblems).reduce((acc: Record<string, number>, problem: any) => {
      const category = problem.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }, [profile?.solvedProblems]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!currentUser || !profile || !selectedFile || !storage) {
      toast({ title: "Error", description: "No file selected or user not authenticated.", variant: "destructive" });
      return;
    }
    if (currentUser.uid !== profile.uid) {
      toast({ title: "Error", description: "You can only change your own profile picture.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const filePath = `avatars/${currentUser.uid}/${selectedFile.name}`;
    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        setIsUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          if (currentUser) {
            await updateAuthProfile(currentUser, { photoURL: downloadURL });
          }
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          setDocumentNonBlocking(userDocRef, { avatarUrl: downloadURL }, { merge: true });

          setProfile(prev => prev ? { ...prev, avatarUrl: downloadURL } : null);
          
          toast({ title: "Success", description: "Your profile picture has been updated." });
        } catch (error: any) {
          console.error("Failed to update profile with new avatar:", error);
          toast({ title: "Update Failed", description: error.message, variant: "destructive" });
        } finally {
          setIsUploading(false);
          setIsUploadDialogOpen(false);
          setSelectedFile(null);
          setUploadProgress(0);
        }
      }
    );
  };

  if (loading || isUserLoading || userRank === null) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (!profile) {
    notFound();
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
  };

  const isOwnProfile = currentUser?.uid === profile.uid;
  const isVerified = profile.emailVerified;
  const totalSolved = (profile.dsaStats?.Easy || 0) + (profile.dsaStats?.Medium || 0) + (profile.dsaStats?.Hard || 0);
  const totalQuestions = 72; // Hardcoded for now
  const progressPercentage = (totalSolved / totalQuestions) * 100;
  
  const recentActivity = Object.values(profile.solvedProblems || {}).sort((a: any, b: any) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime()).slice(0, 5);
  
  const getDifficultyDotClass = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-muted/20 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative group w-24 h-24 mx-auto mb-4">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <button onClick={() => setIsUploadDialogOpen(true)} className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-8 w-8 text-white" />
                  </button>
                )}
                 {isVerified && <VerifiedBadge className="absolute -end-1.5 -top-1.5" />}
              </div>

              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
              <div className="mt-4 flex flex-col items-center justify-center text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{profile.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.country}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-3">
                <Button variant="ghost" size="icon"><LinkIcon className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Github className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Linkedin className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Twitter className="h-5 w-5" /></Button>
              </div>
              {isOwnProfile && (
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/settings/profile">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5"/> Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-around">
                    <div className="relative">
                        <svg className="h-32 w-32 -rotate-90">
                            <circle cx="64" cy="64" r="54" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-gray-200 dark:text-gray-700" />
                            <circle cx="64" cy="64" r="54" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-sky-500" strokeDasharray="339.292" strokeDashoffset={339.292 - (progressPercentage / 100) * 339.292} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{totalSolved}</span>
                            <span className="text-sm text-muted-foreground">Solved</span>
                        </div>
                    </div>
                     <div>
                        <p className="text-sm">Total Solved: {totalSolved}/{totalQuestions}</p>
                        <ul className="mt-2 space-y-1 text-sm">
                            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span>Easy: {profile.dsaStats?.Easy || 0}/41</li>
                            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"></span>Medium: {profile.dsaStats?.Medium || 0}/26</li>
                            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500"></span>Hard: {profile.dsaStats?.Hard || 0}/5</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Solved Categories</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {Object.entries(solvedCategories).map(([category, count]) => (
                    <Badge key={category} variant="secondary">
                        {category} <span className="ml-2 text-muted-foreground">{count}</span>
                    </Badge>
                ))}
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Submissions</CardTitle></CardHeader>
            <CardContent>
              <ContributionGraph 
                heatmap={profile.submissionHeatmap || {}} 
                currentStreak={profile.currentStreak || 0}
                maxStreak={profile.maxStreak || 0}
              />
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
                <Timeline>
                  {recentActivity.map((act: any, index) => (
                    <TimelineItem key={act.title + index} step={index + 1}>
                      <TimelineHeader>
                        <TimelineSeparator />
                        <TimelineDate>{new Date(act.solvedAt).toLocaleDateString()}</TimelineDate>
                        <TimelineTitle>{act.title}</TimelineTitle>
                        <TimelineIndicator />
                      </TimelineHeader>
                      <TimelineContent>
                        <Badge variant="outline" className={cn("w-24 justify-center", getDifficultyDotClass(act.difficulty))}>{act.difficulty}</Badge>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
            </CardContent>
          </Card>

        </div>
      </div>
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Choose a new image to upload.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="avatar-file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? selectedFile.name : 'Choose an image'}
            </Button>
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-xs text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleUploadAvatar} disabled={isUploading || !selectedFile}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isUploading ? 'Uploading...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

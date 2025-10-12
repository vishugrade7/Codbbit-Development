
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDoc, useFirestore, useUser, setDocumentNonBlocking, useMemoFirebase, useStorage } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, Pencil, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { Cropper, CropperCropArea } from "@/components/ui/cropper"
import { Slider } from '@/components/ui/slider';
import type { Area } from 'react-easy-crop';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// Function to create a cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg');
  });
}


export default function EditProfilePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const editorThemes = ["vs-dark", "light", "hc-black", "vs", "hc-light", "monokai"];

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading, refetch } = useDoc<UserProfile>(userDocRef);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    username: '',
    company: '',
    about: '',
    avatarUrl: '',
    editorTheme: 'vs-dark',
    fontSize: 14,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        username: userProfile.username || '',
        company: userProfile.company || '',
        about: userProfile.about || '',
        avatarUrl: userProfile.avatarUrl || '',
        editorTheme: userProfile.editorTheme || 'vs-dark',
        fontSize: userProfile.fontSize || 14,
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
 const handleUploadAvatar = async () => {
    if (!user || !imagePreview || !croppedAreaPixels || !storage) {
      toast({ title: "Error", description: "No image cropped or user not authenticated.", variant: "destructive" });
      return;
    }
    if (user.uid !== userProfile?.uid) {
      toast({ title: "Error", description: "You can only change your own profile picture.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const croppedImageBlob = await getCroppedImg(imagePreview, croppedAreaPixels);
      const fileName = selectedFile?.name || 'cropped-avatar.jpg';

      const filePath = `avatars/${user.uid}/${fileName}`;
      const fileRef = storageRef(storage, filePath);
      const uploadTask = uploadBytesResumable(fileRef, croppedImageBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          let description = 'An unknown error occurred during upload.';
          switch (error.code) {
            case 'storage/unauthorized':
              description = 'You do not have permission to upload this file. Check storage security rules and CORS configuration.';
              break;
            case 'storage/canceled':
              description = 'The upload was canceled.';
              break;
            case 'storage/unknown':
              description = 'An unknown error occurred, check your security rules and network connection.';
              break;
          }
          toast({ title: "Upload Failed", description, variant: "destructive" });
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            if (user) {
              await updateAuthProfile(user, { photoURL: downloadURL });
            }
            if (userDocRef) {
              setDocumentNonBlocking(userDocRef, { avatarUrl: downloadURL }, { merge: true });
            }
            
            setFormData(prev => ({ ...prev, avatarUrl: downloadURL }));
            await refetch();
            
            toast({ title: "Success", description: "Your profile picture has been updated." });
          } catch (error: any) {
            console.error("Failed to update profile with new avatar:", error);
            toast({ title: "Update Failed", description: error.message, variant: "destructive" });
          } finally {
            setIsUploading(false);
            setIsUploadDialogOpen(false);
            setSelectedFile(null);
            setImagePreview(null);
            setUploadProgress(0);
          }
        }
      );
    } catch (e: any) {
        console.error('Cropping failed', e);
        toast({ title: 'Cropping Failed', description: e.message, variant: 'destructive'});
        setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userDocRef) {
      toast({
        title: "Error",
        description: "Could not save profile. User not found.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      setDocumentNonBlocking(userDocRef, formData, { merge: true });
      localStorage.setItem('editor_font_size', String(formData.fontSize));
      localStorage.setItem('editor_theme', formData.editorTheme || 'vs-dark');

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      if (formData.username && formData.username !== userProfile?.username) {
        router.push(`/${formData.username}`);
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      toast({
        title: "Error",
        description: "Something went wrong while saving your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2);
  };
  
  const profile = userProfile; // alias for clarity

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update the information that will be displayed on your profile page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-w-xl">
              <div className="flex items-center gap-6">
                <div className="relative group w-24 h-24">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                        <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                        <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                    </Avatar>
                    <button type="button" onClick={() => setIsUploadDialogOpen(true)} className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="h-8 w-8 text-white" />
                    </button>
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Your Avatar</h3>
                    <p className="text-sm text-muted-foreground">Click on the image to upload a new one.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Jane Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="e.g. janedoe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company / College</Label>
                <Input id="company" name="company" value={formData.company} onChange={handleInputChange} placeholder="e.g. Apple Inc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                <Textarea id="about" name="about" value={formData.about} onChange={handleInputChange} placeholder="Tell us a little bit about yourself." className="min-h-[100px]" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
              </Button>
          </CardFooter>
        </Card>
      </form>
       <Card className="mt-8">
        <CardHeader>
          <CardTitle>Editor Settings</CardTitle>
          <CardDescription>Customize your coding environment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-xl">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editorTheme">Theme</Label>
                <Select value={formData.editorTheme} onValueChange={(value) => setFormData(prev => ({...prev, editorTheme: value}))}>
                  <SelectTrigger id="editor-theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {editorThemes.map(theme => (
                        <SelectItem key={theme} value={theme}>
                        {theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <span className="text-sm font-medium text-muted-foreground">{formData.fontSize}px</span>
                </div>
                 <Slider
                    id="fontSize"
                    min={12}
                    max={20}
                    step={1}
                    value={[formData.fontSize || 14]}
                    onValueChange={(value) => setFormData(prev => ({...prev, fontSize: value[0]}))}
                    className="my-2"
                />
              </div>
           </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Editor Settings
            </Button>
        </CardFooter>
      </Card>
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Choose and crop your new profile picture.
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
             {!imagePreview && (
                 <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose an image
                </Button>
             )}
            
            {imagePreview && (
                <div className="space-y-4">
                    <Cropper
                        image={imagePreview}
                        className="h-80 w-full"
                        aspect={1}
                        zoom={zoom}
                        onZoomChange={setZoom}
                        onCropComplete={(croppedArea, croppedAreaPixels) => {
                            setCroppedAreaPixels(croppedAreaPixels);
                        }}
                    >
                         <CropperCropArea className="rounded-full" />
                    </Cropper>
                    <div className="space-y-2">
                        <Label htmlFor="zoom">Zoom</Label>
                        <Slider
                            id="zoom"
                            min={1}
                            max={3}
                            step={0.1}
                            value={[zoom]}
                            onValueChange={(value) => setZoom(value[0])}
                        />
                    </div>
                </div>
            )}
            
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-xs text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => {
                setIsUploadDialogOpen(false);
                setImagePreview(null);
                setSelectedFile(null);
            }} disabled={isUploading}>Cancel</Button>
            <Button type="button" onClick={handleUploadAvatar} disabled={isUploading || !selectedFile}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isUploading ? 'Uploading...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

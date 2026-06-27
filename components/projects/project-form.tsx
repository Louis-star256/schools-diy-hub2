'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirebaseApp, useStorage } from '@/firebase';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
    Loader2, 
    Wand2, 
    Video, 
    Clapperboard, 
    Mic, 
    ImageIcon, 
    X, 
    ChevronRight, 
    ChevronLeft, 
    Rocket, 
    ShieldCheck, 
    Users, 
    Heart, 
    Zap,
    CheckCircle2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Project } from '@/lib/types';
import { suggestSimplifications } from '@/ai/flows/suggest-simplifications';
import { Progress } from '../ui/progress';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  materials: z.string().min(3, 'Please list at least one material.'),
  instructions: z.string().min(20, 'Instructions must be at least 20 characters.'),
  communityImpact: z.string().min(10, 'Please describe how this helps your community.'),
  supportNeeds: z.string().min(5, 'What do you need to complete this?'),
  trustInfo: z.string().min(5, 'Provide a verification reference (e.g. Teacher name).'),
  targetAmount: z.string().optional(),
  imageFile: z.any().optional(),
  videoFile: z.any().optional(),
  audioFile: z.any().optional(),
  liveLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProjectFormProps = {
  project?: Project;
};

const STEPS = [
  { id: 1, title: 'IDEA', icon: Rocket, desc: 'Vision & Concept' },
  { id: 2, title: 'PROOF', icon: Video, desc: 'Visual Evidence' },
  { id: 3, title: 'IMPACT', icon: Heart, desc: 'Community Value' },
  { id: 4, title: 'SUPPORT', icon: Zap, desc: 'Needs & Funding' },
  { id: 5, title: 'TRUST', icon: ShieldCheck, desc: 'Verification' },
];

export function ProjectForm({ project }: ProjectFormProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const app = useFirebaseApp();
  const storage = useStorage();
  const firestore = app ? app.firestore : null;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [imagePreview, setImagePreview] = useState(project?.imageUrl || '');
  const [videoPreview, setVideoPreview] = useState(project?.videoUrl || '');
  const [audioPreview, setAudioPreview] = useState(project?.audioUrl || '');

  const isEditMode = !!project;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      skillLevel: project?.skillLevel || 'Beginner',
      materials: project?.materials?.join(', ') || '',
      instructions: project?.instructions || '',
      communityImpact: project?.communityImpact || '',
      supportNeeds: project?.supportNeeds || '',
      trustInfo: project?.trustInfo || '',
      targetAmount: project?.targetAmount?.toString() || '0',
      liveLink: project?.liveLink || '',
    },
  });

  useEffect(() => {
    const videoUrlFromRecord = searchParams.get('videoUrl');
    if (videoUrlFromRecord) setVideoPreview(videoUrlFromRecord);
    const imageUrlFromRecord = searchParams.get('imageUrl');
    if (imageUrlFromRecord) setImagePreview(imageUrlFromRecord);
    const audioUrlFromRecord = searchParams.get('audioUrl');
    if (audioUrlFromRecord) setAudioPreview(audioUrlFromRecord);
  }, [searchParams]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSuggestSimplifications = async () => {
    const instructions = form.getValues('instructions');
    const skillLevel = form.getValues('skillLevel');
    if (!instructions) return;
    setIsSimplifying(true);
    try {
      const result = await suggestSimplifications({ instructions, skillLevel });
      form.setValue('instructions', result.simplifiedInstructions, { shouldValidate: true });
      toast({ title: 'AI Optimized Blueprint' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'AI Error', description: error.message });
    } finally {
      setIsSimplifying(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !auth.currentUser || !storage) return;

    setIsUploading(true);

    const uploadFile = async (file: File, folder: string): Promise<string> => {
        const storageRef = ref(storage, `${folder}/${auth.currentUser!.uid}/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
                (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100), 
                reject, 
                () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
            );
        });
    };
    
    try {
        let finalImageUrl = imagePreview || 'https://picsum.photos/seed/diy/800/600';
        let finalVideoUrl = videoPreview;
        let finalAudioUrl = audioPreview;

        const imgFile = values.imageFile?.[0];
        if (imgFile) finalImageUrl = await uploadFile(imgFile, 'project-images');
        const vidFile = values.videoFile?.[0];
        if (vidFile) finalVideoUrl = await uploadFile(vidFile, 'project-videos');
        const audFile = values.audioFile?.[0];
        if (audFile) finalAudioUrl = await uploadFile(audFile, 'project-audio');

        const projectData = {
            title: values.title,
            description: values.description,
            skillLevel: values.skillLevel,
            materials: values.materials.split(',').map((m) => m.trim()),
            instructions: values.instructions,
            communityImpact: values.communityImpact,
            supportNeeds: values.supportNeeds,
            trustInfo: values.trustInfo,
            targetAmount: parseFloat(values.targetAmount || '0'),
            liveLink: values.liveLink,
            userId: auth.currentUser.uid,
            imageUrl: finalImageUrl,
            videoUrl: finalVideoUrl,
            audioUrl: finalAudioUrl,
            imageHint: 'innovation project',
            status: 'pending',
            raisedAmount: project?.raisedAmount || 0,
            certificateId: project?.certificateId || `CERT-${Date.now()}`
        };

        if (isEditMode && project) {
            await updateDoc(doc(firestore, 'projects', project.id), projectData);
            toast({ title: 'Update Transmitted', description: 'Your innovation parameters have been synced.' });
            router.push(`/projects/${project.id}`);
        } else {
            const docRef = await addDoc(collection(firestore, 'projects'), {
                ...projectData,
                likes: 0,
                sponsors: 0,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Innovation Launched!', description: 'Your project is now in the global laboratory.' });
            router.push(`/projects/${docRef.id}`);
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Sync Failed', description: error.message });
    } finally {
        setIsUploading(false);
    }
  }

  return (
    <Card className="max-w-5xl mx-auto border-white/5 bg-[#0B0F19]/80 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
      <CardHeader className="bg-white/5 border-b border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
            <CardTitle className="font-headline text-4xl font-black tracking-tighter text-white">
            {isEditMode ? 'Modify Hub ID' : 'New Project Application'}
            </CardTitle>
            <CardDescription className="text-primary font-bold uppercase tracking-widest text-[10px] mt-1">Innovation Trust Protocol v2.0</CardDescription>
        </div>
        
        <div className="flex gap-2">
            {STEPS.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-1 group">
                    <div className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center transition-all border-2",
                        step === s.id ? "bg-primary border-primary text-black scale-110 shadow-lg" : 
                        step > s.id ? "bg-green-500 border-green-500 text-white" : "bg-white/5 border-white/10 text-muted-foreground"
                    )}>
                        <s.icon className="h-5 w-5" />
                    </div>
                    <span className={cn("text-[8px] font-black uppercase tracking-tighter", step === s.id ? "text-primary" : "text-muted-foreground")}>{s.title}</span>
                </div>
            ))}
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Rocket className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-bold font-headline">The Big Idea</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Project Name</FormLabel>
                                    <FormControl><Input placeholder="What are we building?" className="h-12 bg-white/5 border-white/10 text-lg font-bold" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="skillLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Complexity Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="h-12 bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent className="bg-[#0B0F19] border-white/10">
                                            <SelectItem value="Beginner">Beginner (Seed)</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate (Root)</SelectItem>
                                            <SelectItem value="Advanced">Advanced (Bloom)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Mission Statement</FormLabel>
                                <FormControl><Textarea placeholder="Describe your invention in one powerful paragraph..." className="min-h-[120px] bg-white/5 border-white/10" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Clapperboard className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-bold font-headline">Proof of Concept</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="imageFile"
                            render={({ field: { onChange, value, ...rest }}) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Technical Blueprint (Photo)</FormLabel>
                                    <div className="relative aspect-[4/3] rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5 overflow-hidden group">
                                        {imagePreview ? (
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="flex flex-col items-center text-muted-foreground">
                                                <ImageIcon className="h-12 w-12 mb-2 text-primary/40" />
                                                <p className="text-[10px] font-black uppercase">Click to capture/upload</p>
                                            </div>
                                        )}
                                        <input 
                                            type="file" accept="image/*" 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImagePreview(URL.createObjectURL(file));
                                                    onChange(e.target.files);
                                                }
                                            }}
                                            {...rest}
                                        />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="materials"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Required Components</FormLabel>
                                        <FormControl><Textarea placeholder="Cardboard, Sensors, Glue..." className="h-[100px] bg-white/5 border-white/10" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                                <p className="text-xs text-muted-foreground leading-relaxed italic">
                                    "Proof is essential for Trust. High-quality images of your prototypes increase sponsorship chances by 400%."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Heart className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-bold font-headline">Community Impact</h3>
                    </div>
                    <FormField
                        control={form.control}
                        name="communityImpact"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">How does this solve a local problem?</FormLabel>
                                <FormControl><Textarea placeholder="e.g. This water filter will help 50 families in my village access clean drinking water..." className="min-h-[150px] bg-white/5 border-white/10" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between mb-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Assembly Protocol</FormLabel>
                                    <Button type="button" variant="outline" size="sm" onClick={handleSuggestSimplifications} disabled={isSimplifying} className="h-7 text-[10px] font-black uppercase border-primary/20">
                                        {isSimplifying ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Wand2 className="mr-1 h-3 w-3" />}
                                        Louis Assist
                                    </Button>
                                </div>
                                <FormControl><Textarea placeholder="1. Gather parts..." className="min-h-[200px] bg-white/5 border-white/10" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Zap className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-bold font-headline">Support & Scaling</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="targetAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Funding Goal (USD Equivalent)</FormLabel>
                                    <FormControl><Input type="number" placeholder="50.00" className="bg-white/5 border-white/10 h-12" {...field} /></FormControl>
                                    <FormDescription className="text-[10px]">What is the estimated cost of materials?</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="supportNeeds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Type of Help Needed</FormLabel>
                                    <FormControl><Input placeholder="e.g. Programming help, 3D printing..." className="bg-white/5 border-white/10 h-12" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="bg-primary/10 p-8 rounded-[2.5rem] border-2 border-primary/20">
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Heart className="h-4 w-4 text-primary" /> Sponsor Readiness</h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                            Venture firms use these values to determine ROI and impact scores. Be as accurate as possible with your financial requests.
                        </p>
                    </div>
                </div>
            )}

            {step === 5 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-bold font-headline">Verification & Trust</h3>
                    </div>
                    <FormField
                        control={form.control}
                        name="trustInfo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Institutional Reference</FormLabel>
                                <FormControl><Input placeholder="e.g. Mr. John (Physics Teacher), Phone: +256..." className="bg-white/5 border-white/10 h-12" {...field} /></FormControl>
                                <FormDescription className="text-[10px]">Who can verify this project at your school?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="liveLink"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Project Website / External Repo (Optional)</FormLabel>
                                <FormControl><Input placeholder="https://github.com/..." className="bg-white/5 border-white/10 h-12" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <div className="p-8 rounded-[2.5rem] bg-green-500/10 border-2 border-green-500/20 text-center space-y-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        <div>
                            <h4 className="text-xl font-bold font-headline">Verification Ready</h4>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">By submitting, you declare this project is your own creation. Louis will analyze your entry for verification.</p>
                        </div>
                    </div>
                </div>
            )}

            {isUploading && (
                <div className="space-y-4 py-4 px-8 bg-black/40 rounded-3xl border border-white/5">
                    <div className="flex justify-between text-[10px] font-black uppercase text-primary">
                        <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Transmission Active</span>
                        <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5 bg-white/5 [&>div]:bg-primary" />
                </div>
            )}

            <div className="flex gap-4 pt-8">
                {step > 1 && (
                    <Button type="button" variant="outline" onClick={handleBack} className="h-14 rounded-2xl flex-1 border-white/10 bg-white/5 text-white font-bold">
                        <ChevronLeft className="mr-2 h-5 w-5" /> Previous Step
                    </Button>
                )}
                
                {step < 5 ? (
                    <Button type="button" onClick={handleNext} className="h-14 rounded-2xl flex-1 bg-primary text-black font-black uppercase tracking-widest">
                        Proceed to {STEPS[step].title} <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                ) : (
                    <Button type="submit" disabled={isSubmitting || isUploading} className="h-14 rounded-2xl flex-[2] bg-primary text-black font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                        {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Rocket className="mr-2 h-6 w-6" />}
                        Launch to Showcase
                    </Button>
                )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

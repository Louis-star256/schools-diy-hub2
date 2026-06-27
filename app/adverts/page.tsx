'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, serverTimestamp, query, orderBy, limit, doc } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  CalendarIcon, 
  Loader2, 
  Newspaper, 
  TrendingUp, 
  Award, 
  Heart, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  FileText,
  Rocket,
  Plus,
  Mail,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import type { Project, User as UserProfile } from '@/lib/types';
import Link from 'next/link';

const advertSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  targetAudience: z.enum(['all', 'school', 'institutionType']),
  targetId: z.string().optional(),
  expiryDate: z.date().optional(),
  noExpiry: z.boolean().default(false),
});

const MEDIA_TARGETS = [
  { id: 'new-vision', name: 'New Vision', desc: 'Best for major national student innovations and technology projects.', category: 'National Tech', reporter: 'Tech Desk Editor' },
  { id: 'daily-monitor', name: 'Daily Monitor', desc: 'Best for impactful community and education projects.', category: 'Community Impact', reporter: 'Education Desk' },
  { id: 'bukedde', name: 'Bukedde', desc: 'Best for local-language and community-based projects.', category: 'Local Community', reporter: 'Community News' },
  { id: 'independent', name: 'The Independent', desc: 'Best for detailed feature stories and unique inventions.', category: 'Feature Stories', reporter: 'Science Writer' },
  { id: 'uganda-today', name: 'Uganda Today', desc: 'Best for youth, technology, and social innovation.', category: 'Youth Tech', reporter: 'Innovation Team' },
  { id: 'rwenzori-times', name: 'The Rwenzori Times', desc: 'Best for western Uganda and regional student projects.', category: 'Regional Projects', reporter: 'Regional Bureau' },
];

function ProjectNewsCard({ project, rank, isAdmin }: { project: Project, rank: number, isAdmin: boolean }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [isSubmittingToMedia, setIsSubmittingToMedia] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);
  const [isSent, setIsSent] = useState(false);
  
  const authorRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', project.userId) : null),
    [firestore, project.userId]
  );
  const { data: author } = useDoc<UserProfile>(authorRef);

  const isLead = rank === 0;

  const handleMediaSubmit = async () => {
    if (!selectedTarget) return;
    
    setIsSubmittingToMedia(true);
    setSubmissionStep(1); // Preparing package
    
    // Simulate multi-stage submission process to reporter
    setTimeout(() => setSubmissionStep(2), 1500); // Compiling assets
    setTimeout(() => setSubmissionStep(3), 3000); // Delivering to Desk
    
    setTimeout(() => {
      setIsSubmittingToMedia(false);
      setIsSent(true);
      toast({
        title: "Project Sent to News Desk!",
        description: `Full submission package delivered to the ${MEDIA_TARGETS.find(t => t.id === selectedTarget)?.name} editorial team.`,
      });
    }, 5000);
  };

  return (
    <>
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--primary),0.2)] border-primary/10",
        isLead ? "lg:col-span-2 bg-gradient-to-br from-card to-primary/5" : "bg-card/50",
        isSent && "ring-2 ring-green-500/50"
      )}>
        {isLead && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-yellow-500 text-black font-black px-4 py-1.5 shadow-2xl animate-pulse rounded-full flex items-center gap-2">
              <Award className="h-4 w-4" /> TOP PROJECT OF THE MONTH
            </Badge>
          </div>
        )}

        {isSent && (
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-green-500 text-white font-black px-4 py-1.5 shadow-2xl rounded-full flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> SUBMITTED TO MEDIA
            </Badge>
          </div>
        )}
        
        <div className={cn("flex flex-col", isLead ? "md:flex-row h-full" : "")}>
          <div className={cn("relative overflow-hidden", isLead ? "md:w-1/2 min-h-[300px]" : "aspect-[16/10]")}>
            <Image 
              src={project.imageUrl} 
              alt={project.title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 flex gap-3">
              <div className="flex items-center gap-1 text-white text-xs font-bold bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                <Heart className="h-3 w-3 text-red-500 fill-red-500" /> {project.likes}
              </div>
              <div className="flex items-center gap-1 text-white text-xs font-bold bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                <MessageSquare className="h-3 w-3 text-primary" /> {rank + 5}
              </div>
            </div>
          </div>

          <div className={cn("p-6 flex flex-col justify-between", isLead ? "md:w-1/2" : "")}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">In the Spotlight</span>
              </div>
              <h3 className={cn("font-headline font-bold tracking-tighter leading-tight group-hover:text-primary transition-colors", isLead ? "text-4xl mb-4" : "text-xl mb-2")}>
                {project.title}
              </h3>
              <p className={cn("text-muted-foreground line-clamp-3 mb-6 font-medium leading-relaxed", isLead ? "text-lg" : "text-sm")}>
                {project.description}
              </p>
              
              {author && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border border-primary/20">
                    <Image src={author.profilePicture || ''} alt={author.fullName} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Innovator</p>
                    <p className="text-xs font-bold font-headline">{author.fullName}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button asChild className="flex-1 rounded-full font-headline tracking-tight" variant={isLead ? "default" : "secondary"}>
                <Link href={`/projects/${project.id}`}>Read Full Feature</Link>
              </Button>
              {isAdmin && (
                <Button 
                  size="icon" 
                  variant={isSent ? "success" : "outline"} 
                  className={cn("rounded-full shrink-0", isSent && "bg-green-500 text-white")} 
                  onClick={() => setShowMediaDialog(true)}
                >
                  {isSent ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-headline flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" /> Reporter Submission Hub
            </DialogTitle>
            <DialogDescription className="text-lg">
              Prepare this innovation for publication in a real national newspaper.
            </DialogDescription>
          </DialogHeader>
          
          {!isSent ? (
            <>
              <div className="grid md:grid-cols-2 gap-4 py-6">
                {MEDIA_TARGETS.map((target) => (
                  <Card 
                    key={target.id} 
                    className={cn(
                      "p-4 cursor-pointer transition-all border-2 flex flex-col justify-between", 
                      selectedTarget === target.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
                    )}
                    onClick={() => setSelectedTarget(target.id)}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold font-headline">{target.name}</h4>
                        <Badge variant="outline" className="text-[8px] uppercase">{target.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{target.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary">
                      <Zap className="h-3 w-3" /> Target: {target.reporter}
                    </div>
                  </Card>
                ))}
              </div>

              {isSubmittingToMedia ? (
                <div className="py-12 space-y-6 text-center">
                  <div className="relative h-20 w-20 mx-auto">
                    <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20" />
                    <Send className="absolute inset-0 m-auto h-8 w-8 text-primary animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold font-headline text-xl">
                      {submissionStep === 1 && "Bundling Technical Specs..."}
                      {submissionStep === 2 && "Preparing High-Res Assets..."}
                      {submissionStep === 3 && "Delivering to Editorial Desk..."}
                    </p>
                    <p className="text-muted-foreground text-sm">Please wait while Louis establishes secure transmission.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 p-6 rounded-3xl border border-dashed border-primary/20 space-y-4">
                  <h5 className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Package Preview
                  </h5>
                  <div className="text-xs space-y-2 text-muted-foreground italic">
                    <p><strong>Title:</strong> {project.title}</p>
                    <p><strong>Innovator:</strong> {author?.fullName} ({author?.homeCountry || 'Uganda'})</p>
                    <p><strong>Metrics:</strong> {project.likes} Community Appreciations, Verified Innovation Score: High</p>
                    <p><strong>Lead Narrative:</strong> AI-Mentored project solving real-world challenges in {project.materials.slice(0, 2).join(', ')}.</p>
                  </div>
                </div>
              )}

              <DialogFooter className="flex gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowMediaDialog(false)} disabled={isSubmittingToMedia}>Cancel</Button>
                <Button 
                  disabled={!selectedTarget || isSubmittingToMedia} 
                  className="flex-1 rounded-full h-14 gap-2 text-lg font-headline shadow-xl shadow-primary/20"
                  onClick={handleMediaSubmit}
                >
                  {isSubmittingToMedia ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                  Submit to Reporter
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-12 text-center space-y-6">
              <div className="h-24 w-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/20">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold font-headline tracking-tighter">Submission Successful!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  The editorial team at <strong>{MEDIA_TARGETS.find(t => t.id === selectedTarget)?.name}</strong> has received the package. They will contact the Innovator via their registered email.
                </p>
              </div>
              <Button onClick={() => setShowMediaDialog(false)} className="rounded-full px-12">Close Hub</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdvertsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  // Fetch user profile to check for Admin/Patron status
  const profileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: profile } = useDoc<UserProfile>(profileRef);
  const isAdmin = profile?.institutionRole === 'Head' || profile?.institutionRole === 'Patron' || profile?.institutionType === 'Organisation';

  // Fetch top projects for the Newspaper section
  const topProjectsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'projects'), orderBy('likes', 'desc'), limit(10)) : null,
    [firestore]
  );
  const { data: topProjects, isLoading: loadingNews } = useCollection<Project>(topProjectsQuery);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<z.infer<typeof advertSchema>>({
    resolver: zodResolver(advertSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      content: '',
      targetAudience: 'all',
      targetId: '',
      noExpiry: true,
      expiryDate: undefined,
    },
  });

  const targetAudience = watch('targetAudience');
  const noExpiry = watch('noExpiry');
  const watchedValues = watch();

  const onSubmit = async (data: z.infer<typeof advertSchema>) => {
    if (!firestore) return;
    try {
      const advertsCollection = collection(firestore, 'adverts');
      const dataToSubmit: any = { ...data, createdAt: serverTimestamp() };
      if(data.noExpiry) dataToSubmit.expiryDate = null;
      await addDocumentNonBlocking(advertsCollection, dataToSubmit);
      toast({ title: 'Advertisement Sent!', description: 'Your advert has been successfully submitted.' });
      reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 space-y-24">
      {/* 1. TOP PROJECTS IN THE NEWS SECTION */}
      <section className="space-y-12">
        <header className="relative text-center py-12 bg-primary/5 rounded-[3rem] border border-primary/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="absolute -top-24 -left-24 h-64 w-64 bg-primary/10 rounded-full blur-[100px]" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em]">
              <Newspaper className="h-3 w-3" /> Featured in Innovation Spotlight
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter leading-none">
              Top Projects <span className="text-primary italic">in the News</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Louis identifies high-impact innovations rising like rockets through the clouds. Discover the stars of the Hub.
            </p>
          </div>
        </header>

        {loadingNews ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : topProjects && topProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topProjects.map((project, idx) => (
              <ProjectNewsCard key={project.id} project={project} rank={idx} isAdmin={!!isAdmin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-2 border-dashed">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground italic">No trending innovations recorded yet. Start building to make headlines!</p>
          </div>
        )}
      </section>

      {/* 2. CREATE ADVERT SECTION */}
      <section className="max-w-4xl mx-auto space-y-12">
        <header className="text-center">
          <h2 className="text-4xl font-bold font-headline tracking-tight">Post Community Announcements</h2>
          <p className="mt-2 text-muted-foreground">Share opportunities, science fairs, and competitions with specific audiences.</p>
        </header>

        <Card className="shadow-2xl border-primary/5">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="bg-primary/5 border-b border-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> New Advertisement
              </CardTitle>
              <CardDescription>Target your message to the right innovators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-2">
                <Label htmlFor="title">Headline</Label>
                <Input id="title" placeholder="e.g., Regional Science Fair 2024" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Full Announcement Details</Label>
                <Textarea id="content" placeholder="Describe the opportunity, entry requirements, and dates..." className="min-h-[120px]" {...register('content')} />
                {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-muted/20 p-6 rounded-2xl border">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Group</Label>
                  <Controller
                    name="targetAudience"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="targetAudience"><SelectValue placeholder="Select audience" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Innovators</SelectItem>
                          <SelectItem value="school">Specific School</SelectItem>
                          <SelectItem value="institutionType">Institution Level</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                
                {targetAudience === 'school' && (
                  <div className="space-y-2">
                    <Label htmlFor="targetId">School Reference ID</Label>
                    <Input id="targetId" placeholder="e.g., school-1" {...register('targetId')} />
                  </div>
                )}
                
                {targetAudience === 'institutionType' && (
                  <div className="space-y-2">
                    <Label htmlFor="targetId">Level</Label>
                    <Controller
                      name="targetId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="targetId"><SelectValue placeholder="Select level" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Primary Institution">Primary</SelectItem>
                            <SelectItem value="Secondary Institution">Secondary</SelectItem>
                            <SelectItem value="Tertiary Institution">Tertiary</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <Label>Visibility Controls</Label>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl border bg-card/50">
                  <div className="flex-1 w-full">
                    <Controller
                      name="expiryDate"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl h-11", !field.value && "text-muted-foreground")} disabled={noExpiry}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP') : <span>Set Archive Date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-3 bg-muted/50 px-4 py-2.5 rounded-xl border">
                    <Controller
                      name="noExpiry"
                      control={control}
                      render={({ field }) => <Checkbox id="noExpiry" checked={field.value} onCheckedChange={field.onChange} />}
                    />
                    <Label htmlFor="noExpiry" className="text-sm font-bold cursor-pointer">Permanent Post</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 pt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" className="w-full h-14 text-lg font-headline shadow-xl shadow-primary/20 rounded-2xl" disabled={!isValid || isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                    Broadcast Announcement
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-headline">Verify Announcement</AlertDialogTitle>
                    <AlertDialogDescription>Your post will be visible to the selected audience instantly. Is everything correct?</AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="text-sm space-y-3 max-h-60 overflow-y-auto rounded-3xl border p-6 bg-muted/20 font-medium">
                    <p><span className="text-primary font-black uppercase text-[10px] block mb-1">Headline:</span> {watchedValues.title}</p>
                    <p><span className="text-primary font-black uppercase text-[10px] block mb-1">Target:</span> {watchedValues.targetAudience}</p>
                    <p><span className="text-primary font-black uppercase text-[10px] block mb-1">Archive:</span> {watchedValues.noExpiry ? 'Never' : watchedValues.expiryDate ? format(watchedValues.expiryDate, 'PPP') : 'Not set'}</p>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">Refine Details</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onSubmit(watchedValues)} className="rounded-full px-8">Confirm & Send</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </form>
        </Card>
      </section>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest", className)}>
      {children}
    </div>
  );
}

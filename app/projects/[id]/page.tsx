'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Paintbrush,
  Hammer,
  CheckCircle,
  Heart,
  Edit,
  Loader2,
  Trash2,
  MessageSquare,
  Download,
  DollarSign,
  Lock,
  ShieldCheck,
  Building2,
  Rocket,
  Handshake,
  Users,
  MapPin,
  Globe,
  Award,
  Zap,
  Star,
  FileBadge
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { SimplifyInstructions } from '@/components/projects/simplify-instructions';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc, updateDoc, increment, collection, serverTimestamp, addDoc, setDoc } from 'firebase/firestore';
import type { Project, User as UserProfile, School } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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
import { ProjectComments } from '@/components/projects/project-comments';
import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TranslatedText } from '@/components/translated-text';
import { cn } from '@/lib/utils';
import { PaymentDialog } from '@/components/payments/payment-dialog';
import { LocalGiftIcon } from '@/components/icons';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [isLiking, setIsLiking] = useState(false);
  const [isSponsoring, setIsSponsoring] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [sponsorType, setSponsorType] = useState<'Funding' | 'Mentorship' | 'Partnership'>('Funding');
  const [sponsorMessage, setSponsorMessage] = useState('');

  const projectRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'projects', id) : null),
    [firestore, id]
  );
  const { data: project, isLoading } = useDoc<Project>(projectRef);

  const userLikeRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'projects', id, 'userLikes', currentUser.uid) : null),
    [firestore, id, currentUser]
  );
  const { data: likeDoc } = useDoc(userLikeRef);

  useEffect(() => {
    if (project) setLocalLikes(project.likes || 0);
  }, [project]);

  useEffect(() => {
    setHasLiked(!!likeDoc);
  }, [likeDoc]);
  
  const authorRef = useMemoFirebase(
    () => (firestore && project ? doc(firestore, 'users', project.userId) : null),
    [firestore, project]
  );
  const { data: author } = useDoc<UserProfile>(authorRef);

  const schoolRef = useMemoFirebase(
    () => (firestore && author?.schoolId ? doc(firestore, 'schools', author.schoolId) : null),
    [firestore, author?.schoolId]
  );
  const { data: school } = useDoc<School>(schoolRef);

  const currentUserProfileRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: currentUserProfile } = useDoc<UserProfile>(currentUserProfileRef);

  const canAccess = (feature: 'view' | 'like' | 'comment' | 'post' | 'all') => {
    if (!currentUserProfile) return true; 
    if (currentUserProfile.institutionRole !== 'Pupil' || currentUserProfile.institutionType === 'Organisation') return true;
    if (!currentUserProfile.ageBracket) return false;

    const limits: Record<string, string[]> = {
      "6-9": ["view"],
      "10-12": ["view", "like"],
      "13-15": ["view", "like", "comment"],
      "16-18": ["view", "like", "comment", "post"],
      "18+": ["all"]
    };

    const userPermissions = limits[currentUserProfile.ageBracket] || [];
    if (userPermissions.includes('all')) return true;
    return userPermissions.includes(feature);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  const isOwner = currentUser?.uid === project.userId;
  const isOrganisation = currentUserProfile?.institutionType === 'Organisation';

  const handleLike = async () => {
    if (!firestore || !currentUser || !projectRef || !canAccess('like')) return;
    setIsLiking(true);
    const lRef = doc(firestore, 'projects', project.id, 'userLikes', currentUser.uid);

    try {
      if (hasLiked) {
        setLocalLikes(prev => Math.max(0, prev - 1));
        setHasLiked(false);
        await deleteDoc(lRef);
        await updateDoc(projectRef, { likes: increment(-1) });
      } else {
        setLocalLikes(prev => prev + 1);
        setHasLiked(true);
        await setDoc(lRef, { likedAt: new Date() });
        await updateDoc(projectRef, { likes: increment(1) });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLiking(false);
    }
  };

  const handleSponsorInnovation = async () => {
    if (!firestore || !currentUser || !projectRef) return;
    setIsSponsoring(true);
    try {
      await addDoc(collection(firestore, 'sponsorships'), {
        sponsorId: currentUser.uid,
        projectId: project.id,
        type: sponsorType,
        message: sponsorMessage,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      await updateDoc(projectRef, { 
        sponsors: increment(1),
        isSponsored: true 
      });

      toast({
        title: 'Interest Sent!',
        description: `Your ${sponsorType} request has been delivered to the innovator.`,
      });
      setSponsorDialogOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSponsoring(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!project.certificateId) return;
    toast({ title: "Generating Secure Certificate...", description: "Louis is preparing your innovation credentials." });
    setTimeout(() => {
        window.open(`https://kommodo.ai/api/certificate/${project.certificateId}`, '_blank');
    }, 1500);
  };

  const handleDelete = async () => {
    if (!firestore || !isOwner) return;
    try {
      await deleteDoc(doc(firestore, 'projects', project.id));
      toast({ title: 'Success', description: 'Project deleted successfully.' });
      router.push('/projects');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <BackButton />
        {isOwner && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={`/projects/${project.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="rounded-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Innovation?</AlertDialogTitle>
                  <AlertDialogDescription>This action is permanent and cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="rounded-full">Confirm Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <article className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <header>
            <div className="relative mb-10 h-[300px] md:h-[500px] w-full overflow-hidden rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-primary/20 bg-black">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover opacity-90"
                data-ai-hint={project.imageHint}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-8 left-8 flex flex-col gap-2">
                  {project.status === 'featured' && (
                    <Badge className="bg-yellow-500 px-6 py-3 text-black gap-2 border-none shadow-2xl backdrop-blur-2xl rounded-full text-sm font-black uppercase tracking-widest animate-pulse">
                        <Star className="h-5 w-5 fill-current" /> Hub Spotlight Masterpiece
                    </Badge>
                  )}
                  {project.status === 'verified' && (
                    <Badge className="bg-green-500 px-6 py-3 text-white gap-2 border-none shadow-2xl backdrop-blur-2xl rounded-full text-sm font-black uppercase tracking-widest">
                        <ShieldCheck className="h-5 w-5" /> Lab Verified Innovation
                    </Badge>
                  )}
                  {project.isSponsored && (
                    <Badge className="bg-primary px-6 py-3 text-primary-foreground gap-2 border-none shadow-2xl backdrop-blur-2xl rounded-full text-sm font-black uppercase tracking-widest">
                        <Zap className="h-5 w-5" /> Venture Backed
                    </Badge>
                  )}
              </div>
            </div>
            
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="px-5 py-2 uppercase tracking-widest text-[11px] font-black rounded-full bg-white/10 text-white">
                        {project.skillLevel} Difficulty
                    </Badge>
                    {author?.homeCountry && (
                        <Badge variant="outline" className="px-5 py-2 font-black rounded-full border-white/20 text-white uppercase tracking-widest text-[11px]">
                            📍 {author.homeCountry}
                        </Badge>
                    )}
                </div>
                <h1 className="text-6xl md:text-8xl font-bold font-headline tracking-tighter leading-tight text-white">
                    <TranslatedText text={project.title} as="span" />
                </h1>
                <div className="text-2xl text-white/90 leading-relaxed font-medium">
                    <TranslatedText text={project.description} />
                </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-8 p-8 rounded-[2.5rem] bg-white/[0.05] border border-white/20 backdrop-blur-md shadow-2xl">
                {author && (
                <Link href={`/profile/${author.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <Avatar className="h-20 w-20 border-2 border-primary shadow-xl">
                        <AvatarImage src={author.profilePicture} alt={author.fullName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{author.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Innovator</p>
                        <p className="font-bold font-headline text-3xl text-white tracking-tight">{author.fullName}</p>
                    </div>
                </Link>
                )}
                <div className="h-16 w-px bg-white/20 hidden md:block" />
                <div className="flex gap-12">
                    <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/60 mb-2">Community</p>
                        <p className="font-black text-3xl flex items-center gap-2 justify-center text-white"><Heart className={cn("h-7 w-7", hasLiked ? "fill-red-500 text-red-500" : "text-white/60")} /> {localLikes}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/60 mb-2">Backers</p>
                        <p className="font-black text-3xl flex items-center gap-2 justify-center text-white"><Building2 className="h-7 w-7 text-primary" /> {project.sponsors || 0}</p>
                    </div>
                </div>
            </div>
          </header>

          <section className="space-y-8">
            <h2 className="flex items-center gap-4 text-4xl font-bold font-headline text-white">
              <Paintbrush className="h-10 w-10 text-primary" />
              Build Instructions
            </h2>
            <Card className="rounded-[3rem] overflow-hidden border-white/20 bg-white/[0.05] backdrop-blur-lg shadow-2xl">
                <CardContent className="p-10">
                    <TranslatedText text={project.instructions} className="whitespace-pre-wrap leading-relaxed prose dark:prose-invert max-w-none text-white text-3xl font-bold" />
                </CardContent>
            </Card>
            <SimplifyInstructions initialInstructions={project.instructions} />
          </section>
        </div>

        <aside className="space-y-10">
          <Card className="rounded-[3rem] border-2 border-primary/30 overflow-hidden shadow-2xl bg-[#0B0F19] text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <DollarSign className="h-32 w-32" />
            </div>
            <CardHeader className="bg-primary/10 border-b border-primary/20 p-8">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="font-headline font-black text-xl uppercase tracking-widest text-primary flex items-center gap-2">
                        <DollarSign className="h-5 w-5" /> Project Wallet
                    </CardTitle>
                    <Badge className="bg-primary text-black font-black">Active</Badge>
                </div>
                <div className="space-y-1">
                    <p className="text-5xl font-black font-headline tracking-tighter">${project.raisedAmount || 0}</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Community Support</p>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase text-primary">
                        <span>Goal: ${project.targetAmount || 100}</span>
                        <span>{Math.round(((project.raisedAmount || 0) / (project.targetAmount || 100)) * 100)}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                        <div 
                            className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-all duration-1000"
                            style={{ width: `${Math.min(100, ((project.raisedAmount || 0) / (project.targetAmount || 100)) * 100)}%` }}
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Supporters</p>
                        <p className="text-2xl font-black font-headline">{project.sponsors || 0}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Status</p>
                        <p className="text-xs font-black uppercase text-primary">{project.status}</p>
                    </div>
                </div>

                <Button 
                    className="w-full h-16 text-xl font-headline font-black rounded-2xl gap-3 shadow-2xl shadow-primary/30"
                    onClick={() => setShowGifts(true)}
                >
                    <LocalGiftIcon className="h-6 w-6" /> Gift Support
                </Button>
            </CardContent>
          </Card>

          {(project.status === 'verified' || project.status === 'featured') && (
            <Card className="rounded-[3rem] border-2 border-yellow-500/30 overflow-hidden shadow-2xl bg-gradient-to-br from-card to-yellow-500/5 text-white">
                <CardHeader className="p-8 pb-4">
                    <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 mb-4">
                        <Award className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline text-2xl font-black tracking-tight">Official Credentials</CardTitle>
                    <CardDescription className="text-yellow-500/60 font-bold uppercase tracking-widest text-[10px]">Verified Innovation Record</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                    <div className="bg-black/20 p-6 rounded-2xl border border-yellow-500/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <FileBadge className="h-5 w-5 text-yellow-500" />
                            <p className="text-xs font-mono text-yellow-500/80">ID: {project.certificateId || 'VER-001-STUDIO'}</p>
                        </div>
                        <p className="text-sm leading-relaxed font-medium">
                            This innovation has passed the rigorous **Louis AI Evaluation Protocol** and is officially certified by School's DIY Hub.
                        </p>
                    </div>
                    <Button 
                        variant="secondary" 
                        className="w-full h-14 rounded-2xl text-lg font-headline font-black gap-2 bg-yellow-500 text-black hover:bg-yellow-400"
                        onClick={handleDownloadCertificate}
                    >
                        <Download className="h-5 w-5" /> Download Certificate
                    </Button>
                </CardContent>
            </Card>
          )}

          <Card className="rounded-[3rem] border-2 border-primary/30 overflow-hidden shadow-2xl bg-card">
            <CardHeader className="bg-primary/10 border-b border-primary/20">
                <CardTitle className="font-headline flex items-center gap-3 text-2xl text-white">
                    <Handshake className="h-6 w-6 text-primary" />
                    Innovation Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
                {isOrganisation ? (
                    <Dialog open={sponsorDialogOpen} onOpenChange={setSponsorDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full h-16 text-xl font-headline gap-3 shadow-2xl shadow-primary/30 rounded-2xl">
                                <Handshake className="h-6 w-6" /> Sponsor Innovation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px] rounded-[3rem] border-primary/50 shadow-2xl bg-[#111111] text-white">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-headline text-white">Back this Project</DialogTitle>
                                <DialogDescription className="text-white/60">Select how your firm wishes to support this innovator.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-8 py-6">
                                <div className="space-y-4">
                                    <Label className="font-black uppercase tracking-widest text-primary text-xs">Sponsorship Mode</Label>
                                    <RadioGroup value={sponsorType} onValueChange={(v: any) => setSponsorType(v)} className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'Funding', icon: DollarSign, label: 'Capital Funding', desc: 'Direct financial backing for materials/prototypes.' },
                                            { id: 'Mentorship', icon: Users, label: 'Technical Guidance', desc: 'Provide expert engineering or design hours.' },
                                            { id: 'Partnership', icon: Handshake, label: 'Full Partnership', desc: 'Joint venture or long-term institutional backing.' },
                                        ].map((t) => (
                                            <Label key={t.id} htmlFor={t.id} className={cn(
                                                "flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                                                sponsorType === t.id ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"
                                            )}>
                                                <RadioGroupItem value={t.id} id={t.id} className="mt-1" />
                                                <div className="space-y-1">
                                                    <p className="font-bold flex items-center gap-2 text-base text-white">
                                                        <t.icon className="h-5 w-5 text-primary" /> {t.label}
                                                    </p>
                                                    <p className="text-[11px] text-white/50 font-medium leading-tight">{t.desc}</p>
                                                </div>
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className="space-y-3">
                                    <Label className="font-black uppercase tracking-widest text-primary text-xs">Proposal Message</Label>
                                    <Textarea 
                                        placeholder="Outline your interest or specific terms..." 
                                        value={sponsorMessage}
                                        onChange={(e) => setSponsorMessage(e.target.value)}
                                        className="min-h-[120px] rounded-2xl bg-white/5 border-white/20 focus-visible:ring-primary text-white"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSponsorInnovation} disabled={isSponsoring} className="w-full h-14 text-xl rounded-full shadow-2xl shadow-primary/40 font-headline">
                                    {isSponsoring ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-6 w-6" />}
                                    Send Commitment
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <Button 
                      onClick={handleLike} 
                      disabled={!currentUser || isLiking || !canAccess('like')} 
                      className={cn(
                        "w-full h-16 text-xl font-headline gap-3 rounded-2xl shadow-2xl transition-all",
                        hasLiked ? "bg-red-500 text-white hover:bg-red-600" : "default"
                      )} 
                      variant={hasLiked ? "default" : (canAccess('like') ? "default" : "secondary")}
                    >
                        {isLiking ? <Loader2 className="h-6 w-6 animate-spin" /> : <Heart className={cn("h-6 w-6", hasLiked && "fill-current")} />}
                        {hasLiked ? "Appreciated" : `Appreciate (${localLikes})`}
                    </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" asChild className="rounded-2xl h-14 border-white/20 text-white hover:bg-white/10 font-bold">
                        <Link href={`/profile/${author?.id}`}>
                            <MessageSquare className="mr-2 h-5 w-5" /> Message
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => setShowGifts(true)} className="rounded-2xl h-14 border-white/20 text-white hover:bg-white/10 font-bold">
                        <LocalGiftIcon className="mr-2 h-5 w-5 text-primary" /> Gift Support
                    </Button>
                </div>
            </CardContent>
          </Card>

          <Card className="rounded-[3rem] border-white/20 shadow-2xl bg-card overflow-hidden">
            <CardHeader className="bg-white/[0.05] border-b border-white/10">
                <CardTitle className="font-headline flex items-center gap-3 text-xl text-white">
                    <Hammer className="h-6 w-6 text-primary" />
                    Required Assets
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
                <ul className="space-y-4">
                    {project.materials.map((material, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.05] border border-transparent hover:border-primary/40 transition-all group">
                        <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 shrink-0 group-hover:scale-125 transition-transform" />
                        <span className="text-lg font-bold text-white leading-tight"><TranslatedText text={material} as="span" /></span>
                    </li>
                    ))}
                </ul>
            </CardContent>
          </Card>
        </aside>
      </article>

      <div className="mt-24">
          {canAccess('comment') ? (
            <div className="w-full bg-white/[0.05] backdrop-blur-3xl rounded-[4rem] border-2 border-white/20 p-10 md:p-20 shadow-[0_30px_100px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
              <header className="flex items-center gap-8 mb-16">
                  <div className="bg-primary/20 p-6 rounded-[2rem] shadow-2xl shadow-primary/20">
                    <MessageSquare className="h-16 w-16 text-primary" />
                  </div>
                  <h2 className="text-7xl font-bold font-headline tracking-tighter text-white">Innovation Feedback</h2>
              </header>
              <ProjectComments projectId={project.id} />
            </div>
          ) : (
             <Card className="rounded-[4rem] border-2 border-dashed border-white/20 bg-white/[0.03]">
              <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                <Lock className="h-20 w-20 text-white/20 mb-6" />
                <h2 className="text-3xl font-bold font-headline text-white">Community Interaction Restricted</h2>
                <p className="text-white/60 max-w-sm mt-3 text-lg font-medium">
                  Your account does not have permission to post public feedback based on safety guidelines.
                </p>
              </CardContent>
            </Card>
          )}
      </div>

      <PaymentDialog 
        open={showGifts} 
        onOpenChange={setShowGifts} 
        project={{
            id: project.id,
            title: project.title,
            userId: project.userId
        }} 
      />
    </div>
  );
}

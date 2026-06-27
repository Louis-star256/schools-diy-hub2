'use client';

import { useState, useRef, useEffect } from 'react';
import type { Project, User as UserProfile } from '@/lib/types';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
  useDoc,
} from '@/firebase';
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  increment,
  limit,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  Loader2,
  Heart,
  MessageSquare,
  Share2,
  Home,
  Compass,
  PlusSquare,
  Bell,
  User,
  X,
  CheckCircle2,
  Sparkles,
  Star,
  Zap,
  TrendingUp,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProjectComments } from '@/components/projects/project-comments';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { PaymentDialog } from '@/components/payments/payment-dialog';
import { Badge } from '@/components/ui/badge';
import { LocalGiftIcon } from '@/components/icons';

function VideoFeedCard({ 
  project, 
  isActive, 
  isNext 
}: { 
  project: Project; 
  isActive: boolean;
  isNext: boolean;
}) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showComments, setShowComments] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(project.likes || 0);

  const authorRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', project.userId) : null),
    [firestore, project.userId]
  );
  const { data: author } = useDoc<UserProfile>(authorRef);

  const userLikeRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'projects', project.id, 'userLikes', currentUser.uid) : null),
    [firestore, project.id, currentUser]
  );
  const { data: likeDoc } = useDoc(userLikeRef);

  useEffect(() => {
    setIsLiked(!!likeDoc);
  }, [likeDoc]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firestore || !currentUser) {
        toast({ title: 'Identity Required', description: 'Sign in to join the innovation network.' });
        return;
    }
    
    const pRef = doc(firestore, 'projects', project.id);
    const lRef = doc(firestore, 'projects', project.id, 'userLikes', currentUser.uid);

    try {
        if (isLiked) {
            setLocalLikes(prev => Math.max(0, prev - 1));
            setIsLiked(false);
            deleteDoc(lRef);
            updateDoc(pRef, { likes: increment(-1) });
        } else {
            setLocalLikes(prev => prev + 1);
            setIsLiked(true);
            setDoc(lRef, { likedAt: new Date() });
            updateDoc(pRef, { likes: increment(1) });
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleGift = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowGifts(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/projects/${project.id}`);
    toast({ title: "Blueprint Link Copied!", description: "Share this innovation with your network." });
  };

  return (
    <div className="relative h-full w-full bg-[#05070A] flex items-center justify-center snap-start overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 z-0">
        {project.videoUrl ? (
          <video
            ref={videoRef}
            src={project.videoUrl}
            loop
            playsInline
            muted
            preload={isNext ? "auto" : "metadata"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative h-full w-full">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover opacity-80"
              priority={isActive}
            />
          </div>
        )}
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black via-black/20 to-transparent" />

      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
          {project.status === 'featured' && (
             <Badge className="bg-yellow-500 text-black border-none gap-2 font-black uppercase text-[10px] tracking-widest py-2 px-4 shadow-2xl">
                <Star className="h-4 w-4 fill-current" /> Hub Spotlight
            </Badge>
          )}
          {project.status === 'verified' && (
             <Badge className="bg-green-500 text-white border-none gap-2 font-black uppercase text-[10px] tracking-widest py-2 px-4 shadow-2xl">
                <ShieldCheck className="h-4 w-4" /> Lab Verified
            </Badge>
          )}
      </div>

      <div className="absolute bottom-24 left-0 right-0 p-8 z-20 text-white max-w-[85%] pointer-events-none">
        <div className="flex items-center gap-4 mb-6 pointer-events-auto">
          <Link href={`/profile/${project.userId}`}>
            <Avatar className="h-14 w-14 border-2 border-white shadow-2xl transition-transform active:scale-90">
              <AvatarImage src={author?.profilePicture} />
              <AvatarFallback className="text-black bg-white font-black">{author?.fullName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/profile/${project.userId}`} className="font-black text-2xl font-headline hover:text-primary transition-colors block drop-shadow-lg tracking-tighter">
              @{author?.fullName?.replace(/\s+/g, '').toLowerCase() || 'innovator'}
            </Link>
            <p className="text-sm opacity-90 font-bold tracking-tight text-primary/80 uppercase tracking-widest text-[10px]">Verified Student Innovator</p>
          </div>
        </div>
        
        <h3 className="text-3xl font-black font-headline tracking-tighter mb-4 drop-shadow-2xl">{project.title}</h3>
        
        <div className="flex gap-4 mb-6 pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest">${project.raisedAmount || 0} Raised</span>
            </div>
            {project.certificateId && (
                <div className="bg-green-500/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-green-500/30 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-black uppercase tracking-widest">Certified</span>
                </div>
            )}
        </div>
      </div>

      <div className="absolute right-6 bottom-28 z-30 flex flex-col items-center gap-6 pointer-events-auto">
        <div className="flex flex-col items-center gap-2">
          <button
            className={cn(
              "h-16 w-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all active:scale-125 shadow-2xl",
              isLiked && "border-red-500/40"
            )}
            onClick={handleLike}
          >
            <Heart className={cn(
                "h-8 w-8 text-white transition-colors", 
                isLiked && "fill-[#FF3040] text-[#FF3040] scale-110"
            )} />
          </button>
          <span className="text-[12px] font-black text-white drop-shadow-lg">{localLikes}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all active:scale-125 shadow-2xl"
            onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
          >
            <MessageSquare className="h-8 w-8 text-white" />
          </button>
          <span className="text-[12px] font-black text-white drop-shadow-lg">Feedback</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            className="h-16 w-16 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/40 flex items-center justify-center transition-all active:scale-125 group shadow-2xl shadow-primary/20"
            onClick={handleGift}
          >
            <LocalGiftIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-[12px] font-black text-primary drop-shadow-lg uppercase tracking-tighter">Support</span>
        </div>

        <button
          className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all active:scale-125 shadow-2xl"
          onClick={handleShare}
        >
          <Share2 className="h-8 w-8 text-white" />
        </button>
      </div>

      <Sheet open={showComments} onOpenChange={setShowComments}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-[3rem] p-0 overflow-hidden bg-[#0B0F19] text-white border-t border-white/10 shadow-2xl">
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black font-headline tracking-tighter">Innovation Feedback</h2>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12" onClick={() => setShowComments(false)}><X className="h-6 w-6" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-black/20">
              <ProjectComments projectId={project.id} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

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

export default function ProjectsPage() {
  const firestore = useFirestore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const projectsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'projects'), 
            orderBy('createdAt', 'desc'),
            limit(50)
          )
        : null,
    [firestore]
  );

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);
  const validProjects = projects?.filter((p) => p && p.id && p.userId) || [];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollPos = containerRef.current.scrollTop;
      const height = containerRef.current.clientHeight;
      if (height === 0) return;
      const index = Math.round(scrollPos / height);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] bg-black">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col bg-black">
      {validProjects.length > 0 ? (
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        >
          {validProjects.map((project, index) => (
            <VideoFeedCard 
              key={project.id} 
              project={project} 
              isActive={index === activeIndex}
              isNext={index === activeIndex + 1}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white space-y-8">
          <div className="h-32 w-32 bg-primary/10 rounded-[3rem] flex items-center justify-center border-4 border-dashed border-primary/20">
            <TrendingUp className="h-16 w-16 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black font-headline tracking-tighter">Laboratory Offline</h2>
            <p className="text-muted-foreground text-xl max-w-sm mx-auto font-medium">
                Our innovation feed is currently empty. Be the first to launch a project to the global Hub!
            </p>
          </div>
          <Button asChild className="h-20 px-16 text-2xl font-headline font-black rounded-full shadow-2xl shadow-primary/30 active:scale-95 transition-all">
            <Link href="/projects/new">Begin Capture <Rocket className="ml-2 h-8 w-8" /></Link>
          </Button>
        </div>
      )}

      <nav className="h-[70px] bg-black/80 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-4 z-50">
        <Link href="/" className="flex flex-col items-center text-white/40 hover:text-primary transition-all active:scale-90 group">
          <Home className="h-7 w-7 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] mt-1 font-black uppercase tracking-[0.2em]">Home</span>
        </Link>
        <Link href="/projects" className="flex flex-col items-center text-primary transition-all active:scale-90 group">
          <Compass className="h-7 w-7 scale-110 shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          <span className="text-[9px] mt-1 font-black uppercase tracking-[0.2em]">Explore</span>
        </Link>
        <Link href="/projects/new" className="flex flex-col items-center -mt-8">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-black shadow-2xl shadow-primary/40 border-4 border-black group active:scale-90 transition-transform">
             <PlusSquare className="h-8 w-8" />
          </div>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center text-white/40 hover:text-primary transition-all active:scale-90 group">
          <Bell className="h-7 w-7 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] mt-1 font-black uppercase tracking-[0.2em]">Alerts</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-white/40 hover:text-primary transition-all active:scale-90 group">
          <User className="h-7 w-7 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] mt-1 font-black uppercase tracking-[0.2em]">Labs</span>
        </Link>
      </nav>
    </div>
  );
}

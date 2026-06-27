
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import type { Project, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Heart, ShieldCheck, Star, School, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, increment, deleteDoc, setDoc } from 'firebase/firestore';
import { TranslatedText } from '../translated-text';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface ProjectCardProps {
  project: Project;
}

function AuthorInfo({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const authorRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', userId) : null),
    [firestore, userId]
  );
  const { data: author } = useDoc<User>(authorRef);

  if (!author) {
    return <div className="h-8 w-24 bg-white/5 rounded-md animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8 border border-white/10">
        <AvatarImage src={author.profilePicture} alt={author.fullName} />
        <AvatarFallback className="bg-white/5 text-[10px]">
          {author.fullName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <Link
        href={`/profile/${author.id}`}
        className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground hover:text-primary transition-colors truncate max-w-[80px]"
      >
        {author.fullName}
      </Link>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [localLikes, setLocalLikes] = useState(project.likes || 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const userLikeRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'projects', project.id, 'userLikes', user.uid) : null),
    [firestore, project.id, user]
  );
  const { data: likeDoc } = useDoc(userLikeRef);

  useEffect(() => {
    setHasLiked(!!likeDoc);
  }, [likeDoc]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;
    
    setIsAnimating(true);
    const pRef = doc(firestore, 'projects', project.id);
    const lRef = doc(firestore, 'projects', project.id, 'userLikes', user.uid);

    if (hasLiked) {
      setLocalLikes(prev => Math.max(0, prev - 1));
      setHasLiked(false);
      await deleteDoc(lRef);
      await updateDoc(pRef, { likes: increment(-1) });
    } else {
      setLocalLikes(prev => prev + 1);
      setHasLiked(true);
      await setDoc(lRef, { likedAt: new Date() });
      await updateDoc(pRef, { likes: increment(1) });
    }
    
    setTimeout(() => setIsAnimating(false), 200);
  };

  const fundingProgress = project.targetAmount ? (project.raisedAmount || 0) / project.targetAmount * 100 : 0;

  return (
    <Card className="flex h-full transform flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5 relative bg-[#0B0F19]/50 backdrop-blur-xl group active:scale-[0.98] rounded-[2rem]">
      
      {/* BADGES HUB */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {project.status === 'featured' && (
            <Badge className="bg-yellow-500 text-black border-none gap-1 font-black uppercase text-[8px] tracking-widest shadow-2xl py-1">
                <Star className="h-3 w-3 fill-current" /> Featured
            </Badge>
          )}
          {project.status === 'verified' && (
            <Badge className="bg-green-500 text-white border-none gap-1 font-black uppercase text-[8px] tracking-widest shadow-2xl py-1">
                <CheckCircle2 className="h-3 w-3" /> Verified
            </Badge>
          )}
          {project.isSponsored && (
            <Badge className="bg-primary text-black border-none gap-1 font-black uppercase text-[8px] tracking-widest shadow-2xl py-1">
                <DollarSign className="h-3 w-3" /> Funded
            </Badge>
          )}
      </div>

      <CardHeader className="p-0 relative">
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint={project.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-60" />
        </div>
        
        {/* Wallet Indicator Overlay */}
        {project.targetAmount && project.targetAmount > 0 && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <div className="flex justify-between text-[8px] font-black uppercase text-primary mb-1">
                    <span>Raised: ${project.raisedAmount || 0}</span>
                    <span>Goal: ${project.targetAmount}</span>
                </div>
                <Progress value={fundingProgress} className="h-1 bg-white/10 [&>div]:bg-primary" />
            </div>
        )}
      </CardHeader>

      <CardContent className="p-6 flex-grow space-y-4">
        <CardTitle className="font-headline text-2xl font-bold tracking-tight text-white line-clamp-1">
          <Link href={`/projects/${project.id}`} className="hover:text-primary transition-colors block">
            <TranslatedText text={project.title} as="span" />
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          <TranslatedText text={project.description} />
        </CardDescription>
        
        <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-white/10 text-white/60">
              {project.skillLevel}
            </Badge>
            <div className="flex-1 h-px bg-white/5" />
            <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1 text-[10px] font-bold">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    {project.sponsors || 0} Backers
                </div>
            </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-white/5 p-6 bg-white/[0.02] backdrop-blur-lg">
        <AuthorInfo userId={project.userId} />
         <button 
            onClick={handleLike}
            className={cn(
                "flex items-center gap-2 p-2 rounded-full transition-all bg-white/5 hover:bg-white/10",
                hasLiked ? "text-red-500" : "text-muted-foreground",
                isAnimating && "animate-bounce"
            )}
         >
            <Heart className={cn("h-5 w-5 transition-all", hasLiked && "fill-current scale-110")} />
            <span className="text-xs font-black">{localLikes}</span>
        </button>
      </CardFooter>
    </Card>
  );
}

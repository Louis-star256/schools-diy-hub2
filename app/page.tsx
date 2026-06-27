'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Rocket, 
  Database, 
  ArrowRight, 
  Loader2, 
  Heart, 
  ShieldCheck,
  PlusCircle,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, query, orderBy, limit } from 'firebase/firestore';
import { demoUsers, demoProjects, demoChatRooms } from '@/lib/placeholder-data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { Project } from '@/lib/types';
import { LocalGiftIcon } from '@/components/icons';

export default function Home() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const trendingQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'projects'), orderBy('createdAt', 'desc'), limit(6)) : null,
    [firestore]
  );
  const { data: trendingProjects } = useCollection<Project>(trendingQuery);

  const handleSeedDemoData = () => {
    if (!firestore) return;
    setIsSeeding(true);
    let completedCount = 0;
    const totalToSeed = demoUsers.length + demoProjects.length + demoChatRooms.length;

    const checkCompletion = () => {
      completedCount++;
      if (completedCount === totalToSeed) {
        setIsSeeding(false);
        toast({ title: "Lab Initialized!" });
      }
    };

    demoUsers.forEach((dUser) => {
      const userRef = doc(firestore, 'users', dUser.id);
      setDoc(userRef, { ...dUser, createdAt: serverTimestamp() }, { merge: true }).then(checkCompletion);
    });

    demoProjects.forEach((dProj) => {
      const projRef = doc(firestore, 'projects', dProj.id);
      setDoc(projRef, { ...dProj, createdAt: serverTimestamp() }, { merge: true }).then(checkCompletion);
    });

    demoChatRooms.forEach((dRoom) => {
      const roomRef = doc(firestore, 'chatRooms', dRoom.id);
      setDoc(roomRef, { ...dRoom, createdAt: serverTimestamp() }, { merge: true }).then(checkCompletion);
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* HERO SECTION: Featuring Soft-Fade Branding */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="container mx-auto px-4 text-center space-y-12">
            <div className="relative inline-block group">
                <div className="relative bg-white/[0.01] backdrop-blur-3xl border border-white/5 p-12 rounded-[5rem] overflow-hidden transition-all duration-1000">
                    {/* Soft-Fade Mask */}
                    <div 
                      className="absolute inset-0 z-20 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at center, transparent 0%, #020617 85%)',
                        maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
                      }}
                    />
                    
                    <div className="relative h-32 w-48 md:h-48 md:w-72 mx-auto scale-110">
                        <Image 
                            src="https://i.imgur.com/ZnPZFay.jpeg" 
                            alt="School's DIY Hub Identity" 
                            fill 
                            className="object-contain opacity-95 grayscale-[0.05] contrast-[1.05]"
                            priority
                            unoptimized
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-tight max-w-5xl mx-auto text-white">
                Building the Future <br />
                <span className="text-primary italic">One Project at a Time.</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                AI-mentored DIY projects and global showcasing for the next generation of engineers.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                    <Button asChild size="lg" className="h-16 px-12 text-xl font-headline shadow-2xl shadow-primary/30 group rounded-full">
                        <Link href="/projects/new">
                        Begin Capture <Rocket className="ml-2 h-6 w-6 transition-transform group-hover:translate-y-[-4px]" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-16 px-12 text-xl font-headline border-primary/20 hover:bg-primary/5 rounded-full">
                        <Link href="/ai-hub">Enter AI Lab</Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>

      <div className="py-24">
        <div className="container mx-auto px-4 mb-12 flex items-center justify-between">
            <h2 className="text-4xl font-bold font-headline tracking-tight text-white">Trending Innovations</h2>
            <Button variant="ghost" asChild className="group">
                <Link href="/projects">Show all innovations <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
        </div>
        
        <div className="flex overflow-x-auto gap-6 px-4 pb-8 scrollbar-hide snap-x snap-mandatory">
            {trendingProjects && trendingProjects.length > 0 ? (
                trendingProjects.map((project) => (
                    <div key={project.id} className="snap-center min-w-[300px] md:min-w-[400px]">
                        <Card className="overflow-hidden border-primary/10 bg-background/80 group rounded-[2rem]">
                            <div className="relative h-56 w-full">
                                <Image 
                                    src={project.imageUrl} 
                                    alt={project.title} 
                                    fill 
                                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <div className="px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest bg-primary/90 text-primary-foreground font-bold">{project.skillLevel}</div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold font-headline mb-2 truncate text-white">{project.title}</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Heart className="h-3 w-3 text-red-500 fill-red-500" /> {project.likes}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <ShieldCheck className="h-3 w-3 text-primary" /> {project.isSponsored ? 'Backed' : 'Independent'}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8"><LocalGiftIcon className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8"><Share2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))
            ) : (
                <div className="w-full flex flex-col items-center justify-center py-12 text-muted-foreground italic">
                    <Database className="h-12 w-12 mb-4 opacity-20" />
                    <p>Building the creativity database...</p>
                    <Button variant="outline" size="sm" onClick={handleSeedDemoData} disabled={isSeeding} className="mt-4">
                        {isSeeding ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        Initialize Lab
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

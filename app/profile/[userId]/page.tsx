
'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useState, use } from 'react';
import { 
  Loader2, 
  ChevronRight, 
  Wallet, 
  TrendingUp, 
  FolderKanban, 
  BarChart3, 
  Award, 
  Settings2, 
  ArrowUpRight, 
  Zap, 
  Eye, 
  Heart, 
  Share2, 
  Trash2, 
  Edit,
  Plus,
  Home,
  Search as SearchIcon,
  User as UserIcon,
  ShieldCheck,
  CreditCard,
  Smartphone,
  BadgeCheck,
  Download,
  Building2,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc, orderBy } from 'firebase/firestore';
import type { Project, User as UserProfile } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LocalGiftIcon } from '@/components/icons';

export default function ProfileDashboardPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', userId) : null),
    [firestore, userId]
  );
  const { data: profile, isLoading: profileLoading } = useDoc<UserProfile>(userRef);

  const projectsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'projects'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
        : null,
    [firestore, userId]
  );
  const { data: userProjects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  const isOwnProfile = authUser?.uid === userId;

  if (profileLoading || projectsLoading || isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0b0b]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return notFound();

  const handleShare = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/projects/${id}`);
    toast({ title: "Blueprint Link Copied!" });
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'projects', id));
      toast({ title: "Project Removed from Hub" });
    } catch (e) {
      toast({ variant: 'destructive', title: "Delete Failed" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white pb-32">
      <section className="p-8 pb-12 bg-gradient-to-b from-primary/5 to-transparent border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between group">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Avatar className="h-32 w-32 border-4 border-white/10 shadow-2xl ring-2 ring-primary/20 scale-100 group-hover:scale-105 transition-transform duration-500">
                <AvatarImage src={profile.profilePicture} className="object-cover" />
                <AvatarFallback className="bg-[#222] text-3xl font-black">{profile.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black font-headline tracking-tighter">{profile.fullName}</h1>
              <div className="flex items-center gap-2 text-white/40 font-medium">
                <span className="text-sm">Innovation Lab Verified</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
          {isOwnProfile && (
            <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 hover:bg-white/5">
              <Settings2 className="h-6 w-6 text-white/60" />
            </Button>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { label: "Email Node", value: profile.email, icon: UserIcon },
                { label: "Hub Identity", value: `@${profile.fullName.replace(/\s+/g, '').toLowerCase()}`, icon: BadgeCheck },
                { label: "Institutional Lab", value: profile.schoolId || 'Independent', icon: Home },
                { label: "Role Protocol", value: profile.institutionRole, icon: ShieldCheck }
            ].map((item, i) => (
                <div key={i} className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center gap-6 hover:bg-white/[0.05] transition-colors">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                        <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">{item.label}</p>
                        <p className="font-bold truncate max-w-[200px] text-white">{item.value}</p>
                    </div>
                </div>
            ))}
        </section>

        {isOwnProfile && (
          <>
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-black font-headline tracking-tight uppercase text-white">Venture Earnings</h2>
                </div>
                <Card className="bg-white/[0.03] border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
                    <CardHeader className="p-10 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-2">Available Balance</p>
                                <h3 className="text-6xl font-black font-headline tracking-tighter text-white">${profile.walletBalance || 0}</h3>
                            </div>
                            <Badge className="bg-green-500/20 text-green-500 border-none rounded-full px-4 py-2 font-black text-[10px] uppercase tracking-widest">
                                Protocol Active
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/5 py-8">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase mb-1">Gifts Received</p>
                                <p className="text-2xl font-bold font-headline text-white">${profile.totalGifts || 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase mb-1">Donations</p>
                                <p className="text-2xl font-bold font-headline text-white">${profile.totalDonations || 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold font-headline text-white">${(profile.totalGifts || 0) + (profile.totalDonations || 0)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase mb-1">Pending Clear</p>
                                <p className="text-2xl font-bold font-headline text-yellow-500">${profile.pendingWithdrawals || 0}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="h-16 px-10 rounded-[1.5rem] bg-primary text-black font-black uppercase tracking-tighter shadow-2xl shadow-primary/20 flex-1 text-lg">
                                        Withdraw Capital <ArrowUpRight className="ml-2 h-6 w-6" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#111] border-white/10 rounded-[2.5rem] text-white">
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl font-headline font-black">Capital Withdrawal</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6 py-6">
                                        <div className="space-y-4">
                                            <Label className="text-xs uppercase font-black text-primary">Receiving Method</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-4 rounded-2xl border-2 border-primary bg-primary/10 flex items-center gap-3">
                                                    <Smartphone className="h-5 w-5" /> <span className="font-bold">MTN MOMO</span>
                                                </div>
                                                <div className="p-4 rounded-2xl border border-white/10 opacity-40 grayscale flex items-center gap-3">
                                                    <CreditCard className="h-5 w-5" /> <span className="font-bold">Card</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button className="w-full h-14 rounded-2xl font-black text-lg">Authorize Withdrawal</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button variant="outline" className="h-16 px-10 rounded-[1.5rem] border-white/10 bg-white/5 font-black uppercase tracking-tighter flex-1">
                                Transaction Ledger
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-black font-headline tracking-tight uppercase text-white">Hub Performance</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: "Total Views", value: "14.2k", icon: Eye },
                        { label: "Followers", value: profile.followers || 0, icon: UserIcon },
                        { label: "Engagement", value: "8.4%", icon: TrendingUp },
                        { label: "Monthly", value: "$420", icon: Wallet },
                        { label: "Hub Rank", value: "#12", icon: Zap }
                    ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-center space-y-3 hover:bg-white/[0.04] transition-all">
                            <stat.icon className="h-5 w-5 mx-auto text-primary/60" />
                            <div>
                                <p className="text-2xl font-black font-headline tracking-tighter text-white">{stat.value}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FolderKanban className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-black font-headline tracking-tight uppercase text-white">My Innovation Pipeline</h2>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {userProjects?.map((project) => (
                        <div key={project.id} className="p-4 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="relative h-40 w-full md:w-64 shrink-0 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                    <Image src={project.imageUrl} alt={project.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-2">
                                    <div>
                                        <h4 className="text-2xl font-black font-headline tracking-tighter mb-2 text-white">{project.title}</h4>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                                <Eye className="h-3 w-3" /> {project.views || 0}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                                                <Wallet className="h-3 w-3" /> ${project.earnedAmount || 0} Earned
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-6">
                                        <Button variant="secondary" size="sm" className="rounded-full px-6 font-bold h-10" asChild>
                                            <Link href={`/projects/${project.id}`}>View Details</Link>
                                        </Button>
                                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-white/5 bg-white/5" asChild>
                                            <Link href={`/projects/${project.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="destructive" size="icon" className="rounded-full h-10 w-10 opacity-20 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(project.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          </>
        )}
      </div>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg h-20 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-around px-8 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <Link href="/" className="flex flex-col items-center gap-1 group">
          <Home className="h-6 w-6 text-white/40 group-hover:text-primary transition-all active:scale-90" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Hub</span>
        </Link>
        <Link href="/projects" className="flex flex-col items-center gap-1 group">
          <SearchIcon className="h-6 w-6 text-white/40 group-hover:text-primary transition-all active:scale-90" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Explore</span>
        </Link>
        <Link href="/projects/new" className="flex flex-col items-center group -mt-12">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(var(--primary),0.4)] border-4 border-[#0b0b0b] scale-100 group-hover:scale-110 active:scale-90 transition-all">
                <Plus className="h-8 w-8" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary mt-2">Build</span>
        </Link>
        <Link href="/ai-hub" className="flex flex-col items-center gap-1 group">
          <Zap className="h-6 w-6 text-white/40 group-hover:text-primary transition-all active:scale-90" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Louis</span>
        </Link>
        <Link href={`/profile/${authUser?.uid}`} className="flex flex-col items-center gap-1 group">
          <UserIcon className={cn(
              "h-6 w-6 transition-all active:scale-90",
              isOwnProfile ? "text-primary scale-110" : "text-white/40 group-hover:text-primary"
          )} />
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Me</span>
        </Link>
      </nav>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, School, BarChart, ShieldCheck, Building2, User, Rocket, Lock, TrendingUp, Award, Zap, Heart } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import type { User as UserProfile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { PaymentDialog } from "@/components/payments/payment-dialog";

export default function SponsorshipPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [showFounderSupport, setShowFounderSupport] = useState(false);

  const sponsorsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'users'), where('institutionType', '==', 'Organisation'), limit(4)) : null,
    [firestore]
  );
  const { data: topSponsors } = useCollection<UserProfile>(sponsorsQuery);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full -z-10" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest animate-pulse">
          <Rocket className="h-3 w-3" /> Venture Partner Network
        </div>
        <h1 className="text-6xl md:text-8xl font-bold font-headline tracking-tighter leading-none max-w-5xl mx-auto">
          Back the Future of <span className="text-primary">African DIY.</span>
        </h1>
        <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          School's DIY Hub connects innovative venture firms with the most promising student inventors. Scale impact, mentor talent, and drive regional growth.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button onClick={() => setShowFounderSupport(true)} size="lg" className="h-16 px-12 text-lg font-headline shadow-2xl shadow-primary/30 gap-2">
                <Heart className="h-6 w-6 fill-current" /> Donate to Hub
            </Button>
            <Button asChild size="lg" variant="outline" className="h-16 px-12 text-lg font-headline">
                <Link href="/projects">Explore Opportunities</Link>
            </Button>
        </div>
      </section>

      {/* Founder Direct Section */}
      <section className="bg-primary/5 border-2 border-primary/20 rounded-[4rem] p-12 md:p-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <Heart className="h-96 w-96 text-primary fill-current" />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                  <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-black shadow-2xl shadow-primary/20">
                    <Heart className="h-10 w-10 fill-current" />
                  </div>
                  <h2 className="text-5xl font-black font-headline tracking-tighter leading-tight">Support the <br /> Hub's Mission</h2>
                  <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                      By donating directly to the platform, you enable the expansion of the Innovation Studio and provide resources for students who lack materials.
                  </p>
                  <Button 
                    onClick={() => setShowFounderSupport(true)} 
                    className="h-14 px-12 rounded-full text-lg font-headline font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    Donate to Platform
                  </Button>
              </div>
              <div className="relative aspect-square max-w-sm mx-auto">
                   <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                   <div className="relative h-full w-full rounded-full overflow-hidden border-8 border-white/10 shadow-2xl">
                      <img src="https://i.imgur.com/3Yay8aW.jpeg" alt="Hub Leadership" className="object-cover h-full w-full" />
                   </div>
              </div>
          </div>
      </section>

      {/* Venture Tracks */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2.5rem] overflow-hidden group hover:border-primary transition-all">
            <CardHeader className="p-10 pb-6 space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Rocket className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-headline text-4xl leading-tight">Independent Innovators</CardTitle>
                <CardDescription className="text-lg">Direct pipeline to high-potential solo makers.</CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-6 text-muted-foreground text-lg">
                <p>Individuals manage their own projects directly. They need no external support or institutional approval to showcase their innovations or receive sponsorship.</p>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-background/50 border text-foreground">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span className="font-bold">Fast-track direct funding</span>
                </div>
            </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20 bg-secondary/5 rounded-[2.5rem] overflow-hidden group hover:border-secondary transition-all">
            <CardHeader className="p-10 pb-6 space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <School className="h-10 w-10 text-secondary-foreground" />
                </div>
                <CardTitle className="font-headline text-4xl leading-tight">Institutional Trust</CardTitle>
                <CardDescription className="text-lg">Supervised impact through verified schools.</CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-6 text-muted-foreground text-lg">
                <p>For students affiliated with a school, contributions are managed through administration to ensure accountability and educational alignment.</p>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-background/50 border text-foreground">
                    <ShieldCheck className="h-6 w-6 text-secondary-foreground" />
                    <span className="font-bold">Managed accountability</span>
                </div>
            </CardContent>
        </Card>
      </div>

      <PaymentDialog 
        open={showFounderSupport} 
        onOpenChange={setShowFounderSupport} 
        isCreatorDonation={true}
        project={{
            id: 'creator-donation-page',
            title: 'Support the Vision of the DIY Hub',
            userId: 'creator-louis-direct'
        }}
      />
    </div>
  );
}

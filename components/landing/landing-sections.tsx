'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, Lightbulb, Share2, Award, Users, CheckCircle2, Globe, ArrowRight, Zap, Heart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function LandingHero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full -z-10" />
      <div className="container mx-auto px-4 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest animate-pulse">
          <Zap className="h-3 w-3" /> Start Your Innovation Journey
        </div>
        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-tight max-w-5xl mx-auto">
          Turn Your Ideas Into <br />
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Real Projects.</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Join thousands of students building, showcasing, and earning from innovation. The best site to improve your creativity.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
          <Button asChild size="lg" className="h-16 px-12 text-xl font-headline shadow-2xl shadow-primary/30 group rounded-full">
            <Link href="/projects/new">
              Start Building <Rocket className="ml-2 h-6 w-6 transition-transform group-hover:translate-y-[-4px]" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-16 px-12 text-xl font-headline border-primary/20 hover:bg-primary/5 rounded-full">
            <Link href="/projects">Explore Projects</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  const [counts, setCounts] = useState({ projects: 0, students: 0, schools: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCounts(prev => ({
        projects: Math.min(prev.projects + 12, 500),
        students: Math.min(prev.students + 25, 1000),
        schools: Math.min(prev.schools + 1, 50),
      }));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 border-y border-white/5 bg-white/2">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Projects Built", value: `${counts.projects}+`, icon: Rocket },
            { label: "Active Innovators", value: `${counts.students}+`, icon: Users },
            { label: "Partner Schools", value: `${counts.schools}+`, icon: Globe },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-2 group">
              <stat.icon className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
              <div className="text-4xl font-headline font-black tracking-tighter">{stat.value}</div>
              <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { title: "Get an Idea", desc: "Use Louis AI to brainstorm creative solutions for community problems.", icon: Lightbulb, color: "bg-yellow-500/10 text-yellow-500" },
    { title: "Build It", desc: "Get material lists and step-by-step guidance in the Innovation Lab.", icon: Zap, color: "bg-blue-500/10 text-blue-500" },
    { title: "Showcase & Earn", desc: "Upload your video to attract sponsors and receive direct gifts.", icon: Award, color: "bg-green-500/10 text-green-500" },
  ];

  return (
    <section className="py-24 container mx-auto px-4">
      <header className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter">How Innovation Works</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">Your path from a simple thought to a community-changing invention.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {steps.map((step, i) => (
          <div key={i} className="relative group">
            {i < 2 && <div className="hidden md:block absolute top-12 left-full w-full h-px border-t-2 border-dashed border-white/10 z-0" />}
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className={cn("h-24 w-24 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500", step.color)}>
                <step.icon className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-headline">{i + 1}. {step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeatureHighlights() {
  const features = [
    { title: "AI Project Builder", desc: "Louis acts as your personal engineering mentor, helping you code and design.", icon: Lightbulb, href: "/ai-hub" },
    { title: "Project Showcase", desc: "A high-visibility video feed to share your progress with the world.", icon: Share2, href: "/projects" },
    { title: "Real Money Support", desc: "Receive direct funding and sponsorships for your materials.", icon: Heart, href: "/sponsorship" },
    { title: "Global Exposure", desc: "Your projects are indexed globally to reach universities and firms.", icon: Globe, href: "/adverts" },
  ];

  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Link key={i} href={feature.href}>
              <Card className="h-full group hover:border-primary/40 transition-all duration-500 bg-card/50 backdrop-blur-xl cursor-pointer">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CreatorBrand() {
  return (
    <section className="py-24 container mx-auto px-4">
      <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-card to-white/5 border border-white/10 p-8 md:p-16 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/10 rounded-full blur-[100px]" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest">
              Community Led
            </div>
            <h2 className="text-5xl font-black font-headline tracking-tighter leading-none">Built for Students, <br /> By Students.</h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                School's DIY Hub was founded with a simple vision: Every student deserves a laboratory to build the future.
              </p>
              <p>
                Starting locally, we are scaling to empower the next generation of creative engineers worldwide.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild variant="outline" className="rounded-full h-12 px-8">
                <Link href="/about">Our Mission</Link>
              </Button>
              <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/20">
                <Award className="h-4 w-4" /> Verified Innovation Network
              </div>
            </div>
          </div>
          
          <div className="relative aspect-square">
            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl animate-pulse" />
            <div className="relative h-full w-full rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl transform hover:rotate-2 transition-transform duration-700">
              <Image 
                src="https://i.imgur.com/3Yay8aW.jpeg" 
                alt="School's DIY Hub Leadership" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

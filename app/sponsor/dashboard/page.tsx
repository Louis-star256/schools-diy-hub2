
'use client';

import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, limit, orderBy } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { 
    Users, 
    Rocket, 
    Heart, 
    Loader2, 
    Zap, 
    ArrowUpRight, 
    Filter,
    Award,
    TrendingUp,
    Briefcase,
    Handshake,
    ShieldCheck,
    DollarSign,
    Target,
    BarChart3
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { User, Project, Sponsorship, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from '@/components/projects/project-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export default function SponsorDashboardPage() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const profileRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: profile } = useDoc<User>(profileRef);

  // Discovery: Featured projects first
  const discoveryQuery = useMemoFirebase(
    () => firestore ? query(
        collection(firestore, 'projects'), 
        where('status', '==', 'verified'),
        limit(12)
    ) : null,
    [firestore]
  );
  const { data: discoveryProjects, isLoading: discoveryLoading } = useCollection<Project>(discoveryQuery);

  // Transactions History
  const txQuery = useMemoFirebase(
    () => firestore && currentUser ? query(
        collection(firestore, 'transactions'), 
        where('senderId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
    ) : null,
    [firestore, currentUser]
  );
  const { data: transactions } = useCollection<Transaction>(txQuery);

  // Portfolio: Projects I've supported
  const sponsoredProjectIds = Array.from(new Set(transactions?.map(t => t.projectId) || []));
  
  const myProjectsQuery = useMemoFirebase(
    () => firestore && sponsoredProjectIds.length > 0 ? query(
        collection(firestore, 'projects'), 
        where('id', 'in', sponsoredProjectIds.slice(0, 10))
    ) : null,
    [firestore, sponsoredProjectIds]
  );
  const { data: portfolioProjects } = useCollection<Project>(myProjectsQuery);

  const totalImpact = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  if (discoveryLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)] bg-[#0B0F19]">
        <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F19] min-h-screen text-white">
      <div className="container mx-auto px-6 py-12 max-w-7xl space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/5 p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl rounded-full" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-black shadow-lg shadow-primary/20">
                        <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="font-headline text-5xl font-black tracking-tighter">Venture Portal</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Strategic Partner: {profile?.fullName}</p>
                    </div>
                </div>
                <p className="text-muted-foreground text-xl max-w-xl font-medium leading-relaxed">
                    Analyzing global innovation pipelines. Discover high-ROI projects for community and technical growth.
                </p>
            </div>
            <div className="flex gap-4 relative z-10">
                <Button className="h-16 px-10 rounded-full bg-primary text-black font-black uppercase tracking-tighter shadow-2xl shadow-primary/20 active:scale-95 transition-all">
                    Generate Impact Report <BarChart3 className="ml-2 h-6 w-6" />
                </Button>
            </div>
        </header>

        {/* High-Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: "Innovations Backed", value: sponsoredProjectIds.length, icon: Rocket, color: "text-blue-400" },
                { label: "Community Capital", value: `$${totalImpact.toLocaleString()}`, icon: DollarSign, color: "text-green-400" },
                { label: "Innovation Score", value: "94.2", icon: Target, color: "text-purple-400" },
                { label: "Network Growth", value: "+12%", icon: TrendingUp, color: "text-primary" }
            ].map((stat, i) => (
                <Card key={i} className="bg-white/5 border-white/5 rounded-[2rem] p-8 shadow-xl hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className={cn("h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center", stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-20" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-black font-headline tracking-tighter">{stat.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    </div>
                </Card>
            ))}
        </div>

        <Tabs defaultValue="discovery" className="w-full">
          <TabsList className="h-16 w-full max-w-xl bg-white/5 rounded-full p-2 mb-12 border border-white/5">
            <TabsTrigger value="discovery" className="rounded-full h-full text-lg font-headline font-bold data-[state=active]:bg-primary data-[state=active]:text-black gap-2">
              <Zap className="h-5 w-5" /> Pipeline Discovery
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="rounded-full h-full text-lg font-headline font-bold data-[state=active]:bg-primary data-[state=active]:text-black gap-2">
              <Briefcase className="h-5 w-5" /> Venture Portfolio
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-full h-full text-lg font-headline font-bold data-[state=active]:bg-primary data-[state=active]:text-black gap-2">
              <BarChart3 className="h-5 w-5" /> Transaction Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discovery" className="space-y-12">
              <section>
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                            <ShieldCheck className="h-6 w-6 text-green-500" />
                          </div>
                          <h2 className="text-3xl font-black font-headline tracking-tighter">Verified Lab Pipeline</h2>
                      </div>
                      <Button variant="ghost" className="text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/10">Filter Sectors</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {discoveryProjects?.map((project) => (
                          <ProjectCard key={project.id} project={project} />
                      ))}
                  </div>
              </section>
          </TabsContent>

          <TabsContent value="portfolio">
              {portfolioProjects && portfolioProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {portfolioProjects.map((project) => (
                          <div key={project.id} className="relative group">
                              <div className="absolute top-6 right-6 z-20">
                                  <Badge className="bg-primary text-black border-none font-black uppercase text-[8px] py-1 shadow-2xl">Active Venture</Badge>
                              </div>
                              <ProjectCard project={project} />
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-white/2 rounded-[3rem] border-4 border-dashed border-white/5 opacity-40">
                      <Handshake className="h-24 w-24 text-muted-foreground" />
                      <div className="space-y-2">
                          <h3 className="text-3xl font-black font-headline tracking-tighter">Portfolio Dormant</h3>
                          <p className="text-muted-foreground max-w-sm mx-auto font-medium">Browse the innovation pipeline to find projects that align with your firm's technical goals.</p>
                      </div>
                      <Button variant="outline" className="h-12 px-8 rounded-full border-white/20">Begin Discovery</Button>
                  </div>
              )}
          </TabsContent>

          <TabsContent value="history">
              <Card className="bg-white/5 border-white/5 rounded-[3rem] overflow-hidden">
                  <CardHeader className="p-10 border-b border-white/5">
                      <CardTitle className="text-2xl font-black font-headline flex items-center gap-3">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        Strategic Support History
                      </CardTitle>
                      <CardDescription className="font-medium">Complete audit of capital distribution and sponsorship commitments.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                      <ScrollArea className="h-[500px]">
                          <div className="divide-y divide-white/5">
                              {transactions?.map((tx) => (
                                  <div key={tx.id} className="p-8 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                                      <div className="flex items-center gap-6">
                                          <div className={cn(
                                              "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg",
                                              tx.method === 'MTN' ? "bg-yellow-500/10 text-yellow-500" :
                                              tx.method === 'Airtel' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                          )}>
                                              <Smartphone className="h-7 w-7" />
                                          </div>
                                          <div>
                                              <p className="font-black font-headline text-lg group-hover:text-primary transition-colors">Support: ${tx.amount} {tx.currency}</p>
                                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                                  Method: {tx.method} • Ref: {tx.providerRef || tx.id}
                                              </p>
                                          </div>
                                      </div>
                                      <div className="text-right space-y-1">
                                          <Badge className="bg-green-500 text-black border-none font-black uppercase text-[8px] tracking-widest">{tx.status}</Badge>
                                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                              {tx.createdAt ? format((tx.createdAt as any).toDate(), 'PPP p') : 'Pending'}
                                          </p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </ScrollArea>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Navigation, Globe, Phone, ExternalLink, Loader2, Star, Rocket } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { School } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Dynamically import the map to avoid SSR issues with Leaflet
const InstitutionMap = dynamic(() => import('@/components/institutions/institution-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
});

export default function InstitutionsPage() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const schoolsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'schools'), limit(50)) : null,
    [firestore]
  );
  const { data: schools, isLoading } = useCollection<School>(schoolsQuery);

  const filteredSchools = schools?.filter((s) =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.country || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Search & Cards */}
        <aside className="w-full lg:w-96 border-r flex flex-col bg-card/50 backdrop-blur-sm z-20">
          <div className="p-6 space-y-6 border-b">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold font-headline tracking-tighter">Hub Network</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">Find verified schools and innovation labs across the globe.</p>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search name, city, country..."
                className="pl-10 bg-background/50 border-primary/10 h-11 rounded-xl shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSchools.length > 0 ? (
              filteredSchools.map((school) => (
                <Card 
                  key={school.id} 
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-primary/5 hover:border-primary/40 hover:shadow-lg rounded-2xl group",
                    selectedSchool?.id === school.id ? "border-primary bg-primary/5 shadow-primary/10 ring-1 ring-primary/20" : "bg-card/30"
                  )}
                  onClick={() => setSelectedSchool(school)}
                >
                  <div className="relative h-32 w-full overflow-hidden rounded-t-2xl">
                    <Image 
                        src={school.previewImageUrl || `https://picsum.photos/seed/${school.id}/400/200`} 
                        alt={school.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest">{school.type}</Badge>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-headline truncate">{school.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                        <MapPin className="h-3 w-3 text-primary" />
                        {school.city || school.address}, {school.country || 'Uganda'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 rounded-full text-[10px] h-8" asChild>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${school.latitude},${school.longitude}`} target="_blank" rel="noopener noreferrer">
                                <Navigation className="h-3 w-3 mr-1" /> Get Directions
                            </a>
                        </Button>
                        <Button size="sm" className="flex-1 rounded-full text-[10px] h-8 shadow-md">
                            Visit Profile
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 opacity-50 space-y-4">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm italic">No institutions found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel: Map */}
        <main className="flex-1 relative bg-muted/5 flex items-center justify-center overflow-hidden">
            {/* Map Placeholder for Dynamic Import */}
            <div className="absolute inset-0 z-0">
                <InstitutionMap 
                    schools={filteredSchools} 
                    selectedSchool={selectedSchool} 
                    onSchoolSelect={setSelectedSchool} 
                />
            </div>

            {/* Map Overlay Controls */}
            <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
                <div className="bg-card/80 backdrop-blur shadow-2xl rounded-2xl p-4 border-2 border-primary/10 max-w-[200px] animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold uppercase tracking-tighter">Global Footprint</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">Currently monitoring <strong>{schools?.length || 0}</strong> innovation labs across the network.</p>
                </div>
                <Button size="icon" variant="secondary" className="rounded-full h-12 w-12 shadow-xl border bg-card/80 backdrop-blur" onClick={() => setSelectedSchool(null)}>
                    <Globe className="h-5 w-5" />
                </Button>
            </div>

            {/* Selected School Quick Info (Floating) */}
            {selectedSchool && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0 w-[90%] max-w-sm z-30 animate-in slide-in-from-bottom-8 duration-500">
                    <Card className="rounded-[2rem] border-2 border-primary overflow-hidden shadow-2xl shadow-primary/20">
                        <div className="relative h-40">
                            <Image 
                                src={selectedSchool.previewImageUrl || `https://picsum.photos/seed/${selectedSchool.id}/600/300`} 
                                alt={selectedSchool.name} 
                                fill 
                                className="object-cover" 
                            />
                            <Button size="icon" variant="ghost" className="absolute top-2 right-2 rounded-full bg-black/40 text-white hover:bg-black/60 h-8 w-8" onClick={() => setSelectedSchool(null)}>
                                <Loader2 className="h-4 w-4 rotate-45" />
                            </Button>
                        </div>
                        <CardHeader className="bg-card p-6 border-b">
                            <CardTitle className="font-headline text-2xl tracking-tighter">{selectedSchool.name}</CardTitle>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] uppercase font-black">{selectedSchool.country || 'Global'}</Badge>
                                <Badge variant="outline" className="text-[10px] uppercase font-black">{selectedSchool.institutionType}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                                    <p className="text-sm text-muted-foreground">{selectedSchool.address}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-primary shrink-0" />
                                    <p className="text-sm font-mono">{selectedSchool.contact}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button className="h-12 rounded-2xl gap-2 font-headline shadow-lg shadow-primary/20" asChild>
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${selectedSchool.latitude},${selectedSchool.longitude}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" /> Google Maps
                                    </a>
                                </Button>
                                <Button variant="secondary" className="h-12 rounded-2xl gap-2 font-headline" asChild>
                                    <a href={`mailto:${selectedSchool.email}`}>
                                        <Globe className="h-4 w-4" /> Official Inquiries
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { DiyAssistantChat } from '@/components/ai/diy-assistant-chat';
import { 
  Plus, 
  Search, 
  FolderKanban, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  X,
  History,
  LayoutGrid,
  Loader2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { collection, query, where, deleteDoc, doc } from 'firebase/firestore';
import type { ChatSession } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/login-form';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';

export default function AiHubPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoSrc] = useState('https://i.imgur.com/gdkdHKr.jpeg');
  
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Your Mentor Louis | AI Hub";
  }, []);

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'innovationSessions'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: rawSessions } = useCollection<ChatSession>(sessionsQuery);
  
  const sessions = rawSessions?.sort((a, b) => {
    const timeA = (a.updatedAt as any)?.toMillis?.() || 0;
    const timeB = (b.updatedAt as any)?.toMillis?.() || 0;
    return timeB - timeA;
  });

  const filteredSessions = sessions?.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    setCurrentSessionId(null);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'innovationSessions', id));
      if (currentSessionId === id) setCurrentSessionId(null);
      toast({ title: 'Conversation deleted' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Action failed' });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await initiateGoogleSignIn(auth);
      toast({ title: "Authorized", description: "Welcome to your innovation lab." });
    } catch (err) {
      toast({ variant: "destructive", title: "Sign In Failed" });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // GUEST MODE / VENTURE GATE
  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[#0A0A0A] p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-block rounded-[2rem] bg-white/[0.03] p-4 mb-6 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="relative h-24 w-40 flex items-center justify-center z-10">
                  <Image 
                    src={logoSrc} 
                    alt="Louis Hub Logo" 
                    fill 
                    className="object-contain"
                    unoptimized
                    priority
                  />
                </div>
            </div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter text-white">Venture Gate</h1>
            <p className="text-white/40 mt-2 font-medium">Authorize to access your personal AI Mentor.</p>
          </div>

          <div className="bg-[#111111] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <LoginForm />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#111111] px-2 text-white/20 font-black tracking-widest">OR</span></div>
            </div>

            <Button 
              onClick={handleGoogleSignIn}
              variant="outline" 
              className="w-full h-14 rounded-2xl gap-3 border-white/10 hover:bg-white/5 text-white font-bold"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Authority
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase text-white/20 tracking-[0.5em]">
            <ShieldCheck className="h-3 w-3" /> Secure Innovation Protocol
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW (AUTHENTICATED)
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0A0A0A] text-[#ECECF1]">
      <aside className={cn(
        "flex flex-col border-r border-white/10 bg-[#000000] transition-all duration-300 ease-in-out z-30",
        isSidebarOpen ? "w-[280px]" : "w-0 -translate-x-full lg:translate-x-0 lg:w-[0px] lg:opacity-0"
      )}>
        <div className="flex flex-col h-full p-4 gap-4">
          <Button 
            onClick={handleNewChat}
            variant="outline"
            className="w-full justify-start gap-3 h-12 border-white/10 bg-transparent hover:bg-white/5 rounded-lg text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 group-focus-within:text-white" />
            <Input 
              placeholder="Search chats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white/5 border-none rounded-lg text-sm placeholder:text-white/30"
            />
          </div>

          <nav className="space-y-1">
             <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
                <FolderKanban className="h-4 w-4 text-blue-400" />
                Projects
             </button>
             <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
                <LayoutGrid className="h-4 w-4 text-purple-400" />
                Innovation ID
             </button>
          </nav>

          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 mt-6 flex items-center gap-2">
                <History className="h-3 w-3" /> Recents
            </h3>
            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-0.5">
                {filteredSessions?.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => setCurrentSessionId(session.id)}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                      currentSessionId === session.id 
                        ? "bg-white/10 text-white" 
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare className="h-4 w-4 shrink-0 opacity-40" />
                      <span className="text-sm truncate font-normal">{session.title}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="pt-4 border-t border-white/10">
             <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors text-white/60">
                <MoreHorizontal className="h-4 w-4" />
                More
             </button>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
        <header className="flex items-center justify-between px-4 h-14 border-b border-white/5">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white/60"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white/90">Your Mentor Louis</span>
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>

            <div className="w-8" />
        </header>

        <div className="flex-1 relative">
            <DiyAssistantChat 
                externalSessionId={currentSessionId} 
                onSessionSelect={setCurrentSessionId} 
            />
        </div>
      </main>
    </div>
  );
}

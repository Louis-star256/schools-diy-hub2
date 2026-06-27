'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatRoomList } from '@/components/chat/chat-room-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { useUser, useFirestore } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function ChatContent() {
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const inviteRoomId = searchParams.get('join');

  useEffect(() => {
    if (inviteRoomId && user && firestore) {
      const joinRoom = async () => {
        const roomRef = doc(firestore, 'chatRooms', inviteRoomId);
        try {
          const roomSnap = await getDoc(roomRef);
          if (roomSnap.exists()) {
            await updateDoc(roomRef, {
              userIds: arrayUnion(user.uid)
            });
            setSelectedChatRoomId(inviteRoomId);
            toast({ title: "Joined Innovation Space!", description: `You are now a collaborator in ${roomSnap.data().name}.` });
          }
        } catch (e) {
          console.error("Invite join error:", e);
        }
      };
      joinRoom();
    }
  }, [inviteRoomId, user, firestore, toast]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl text-center py-20">
        <Alert variant="destructive" className="rounded-3xl border-2">
          <AlertTitle className="text-xl font-headline font-bold">Secure Access Required</AlertTitle>
          <AlertDescription className="text-lg">
            Join the community to collaborate with fellow innovators.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-8 h-14 px-12 text-lg rounded-full shadow-xl">
          <Link href="/login">Log In to Chat</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0b141a]">
      <aside className={cn(
        "fixed inset-y-16 left-0 z-40 flex flex-col border-r border-white/5 bg-[#111b21] transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
        isSidebarOpen ? "w-[320px] translate-x-0" : "w-0 -translate-x-full lg:w-0 lg:opacity-0 lg:invisible"
      )}>
        <ChatRoomList
          currentUserId={user.uid}
          selectedChatRoomId={selectedChatRoomId}
          onSelectChatRoom={(id) => {
            setSelectedChatRoomId(id);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
        />
      </aside>

      <main className="relative flex-1 flex flex-col min-w-0 bg-[#0b141a]">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden absolute top-4 left-4 z-50 text-white bg-black/20 backdrop-blur rounded-full"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <ChatWindow
          chatRoomId={selectedChatRoomId}
          currentUserId={user.uid}
        />
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

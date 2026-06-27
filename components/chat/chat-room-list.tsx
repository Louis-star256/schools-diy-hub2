
'use client';

import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
  useStorage,
  useDoc,
} from '@/firebase';
import {
  collection,
  query,
  where,
  serverTimestamp,
  doc,
  setDoc,
  limit,
  orderBy,
  addDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
    Loader2, 
    Plus, 
    Search, 
    MessageSquare, 
    Users, 
    CheckCheck, 
    User as UserIcon, 
    Globe, 
    Lock, 
    Camera, 
    Settings,
    CircleDashed,
    ShieldCheck
} from 'lucide-react';
import type { ChatRoom, User, UserStatus } from '@/lib/types';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ChatRoomListProps {
  currentUserId: string;
  selectedChatRoomId: string | null;
  onSelectChatRoom: (id: string) => void;
}

const newChatRoomSchema = z.object({
  name: z.string().min(3, 'Room name must be at least 3 characters.'),
  description: z.string().optional(),
});

export function ChatRoomList({
  currentUserId,
  selectedChatRoomId,
  onSelectChatRoom,
}: ChatRoomListProps) {
  const firestore = useFirestore();
  const storage = useStorage();
  const { user: authUser } = useUser();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('public');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof newChatRoomSchema>>({
    resolver: zodResolver(newChatRoomSchema),
    defaultValues: { name: '', description: '' },
  });

  const chatRoomsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'chatRooms'),
            where('userIds', 'array-contains', currentUserId)
          )
        : null,
    [firestore, currentUserId]
  );
  const { data: chatRooms } = useCollection<ChatRoom>(chatRoomsQuery);

  const innovatorsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'users'), limit(50)) : null,
    [firestore]
  );
  const { data: innovators } = useCollection<User>(innovatorsQuery);

  const statusesQuery = useMemoFirebase(
    () => (firestore && authUser) ? query(collection(firestore, 'statuses'), orderBy('createdAt', 'desc'), limit(20)) : null,
    [firestore, authUser]
  );
  const { data: statuses } = useCollection<UserStatus>(statusesQuery);

  const currentUserProfileRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', currentUserId) : null),
    [firestore, currentUserId]
  );
  const { data: profile } = useDoc<User>(currentUserProfileRef);

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !firestore) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profile-pictures/${currentUserId}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(firestore, 'users', currentUserId), { profilePicture: url }, { merge: true });
      toast({ title: 'Profile Updated', description: 'Your new identity is live!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload Failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !firestore || !profile) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `statuses/${currentUserId}/${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(firestore, 'statuses'), {
        userId: currentUserId,
        userName: profile.fullName,
        userAvatar: profile.profilePicture || '',
        mediaUrl: url,
        type: 'image',
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Status Posted!', description: 'Your update is now visible to the Hub.' });
      setActiveTab('status');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to post status' });
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof newChatRoomSchema>) {
    if (!firestore) return;
    setIsCreating(true);
    try {
      const newRoom: Omit<ChatRoom, 'id'> = {
        name: values.name,
        description: values.description || '',
        userIds: [currentUserId],
        createdAt: serverTimestamp(),
        type: 'public',
      };
      const roomCollection = collection(firestore, 'chatRooms');
      const docRef = await addDocumentNonBlocking(roomCollection, newRoom);
      if (docRef) {
        onSelectChatRoom(docRef.id);
      }
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating chat room:', error);
    } finally {
      setIsCreating(false);
    }
  }

  const startPrivateChat = async (targetUser: User) => {
    if (!firestore) return;
    const roomId = [currentUserId, targetUser.id].sort().join('_');
    const roomRef = doc(firestore, 'chatRooms', roomId);
    
    await setDoc(roomRef, {
      id: roomId,
      name: `Lab: ${targetUser.fullName}`,
      description: 'Private 1-on-1 collaboration',
      userIds: [currentUserId, targetUser.id],
      type: 'private',
      createdAt: serverTimestamp(),
    }, { merge: true });

    onSelectChatRoom(roomId);
    setActiveTab('private');
  };

  const filteredRooms = chatRooms?.filter(room => 
    (room.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const timeA = (a.lastMessage?.timestamp as any)?.toMillis() || 0;
    const timeB = (b.lastMessage?.timestamp as any)?.toMillis() || 0;
    return timeB - timeA;
  });

  const filteredInnovators = innovators?.filter(u => 
    u.id !== currentUserId && (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#111b21]">
      {/* HEADER SECTION */}
      <div className="p-3 bg-[#202c33] flex items-center justify-between">
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity border border-white/10 shadow-lg">
                    <AvatarImage src={profile?.profilePicture} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">{profile?.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
            </DialogTrigger>
            <DialogContent className="bg-[#222e35] text-white border-white/5 rounded-[2rem] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline flex items-center gap-3">
                        <Settings className="h-6 w-6 text-primary" />
                        My Profile Settings
                    </DialogTitle>
                </DialogHeader>
                <div className="py-8 flex flex-col items-center gap-6">
                    <div className="relative group">
                        <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-2xl">
                            <AvatarImage src={profile?.profilePicture} className="object-cover" />
                            <AvatarFallback className="bg-[#111b21] text-3xl font-black">{profile?.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="h-8 w-8 text-white mb-1" />
                            <span className="text-[10px] font-black uppercase">Change Photo</span>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                    <div className="w-full space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Innovator ID</label>
                            <Input value={profile?.fullName || ''} readOnly className="bg-[#111b21] border-none rounded-xl h-12 font-bold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">About Me</label>
                            <Input value={profile?.bio || 'Mailing from the Lab...'} readOnly className="bg-[#111b21] border-none rounded-xl h-12 italic text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        <div className="flex items-center gap-2">
            <button 
                onClick={() => setActiveTab('status')}
                className={cn(
                    "p-2 rounded-full hover:bg-white/5 transition-all relative",
                    activeTab === 'status' ? "text-[#00a884] bg-white/5" : "text-[#aebac1]"
                )}
            >
                <CircleDashed className="h-6 w-6" />
                {statuses && statuses.length > 0 && (
                    <div className="absolute top-2 right-2 h-2 w-2 bg-[#00a884] rounded-full border border-[#202c33]" />
                )}
            </button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="rounded-full text-[#aebac1] hover:bg-white/5 h-10 w-10">
                        <Plus className="h-6 w-6" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#222e35] text-white border-white/5 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-headline">New Community Hub</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hub Name</FormLabel>
                                <FormControl>
                                <Input className="bg-[#2a3942] border-none rounded-xl" placeholder="e.g., Robotics Unit" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isCreating} className="bg-[#00a884] hover:bg-[#008f6c] text-white rounded-full px-8 h-12 font-bold">
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Open Lab
                            </Button>
                        </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8696a0] group-focus-within:text-[#00a884] transition-colors" />
          <Input 
            placeholder="Search innovators..." 
            className="pl-10 h-9 bg-[#202c33] border-none rounded-full text-sm text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0 shadow-inner" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4 bg-transparent border-b border-white/5 h-12 p-0 rounded-none">
          <TabsTrigger value="public" className="data-[state=active]:bg-transparent data-[state=active]:text-[#00a884] data-[state=active]:border-b-2 data-[state=active]:border-[#00a884] rounded-none h-full gap-2 text-[10px] uppercase font-black px-0">
            <Globe className="h-3 w-3" /> Hubs
          </TabsTrigger>
          <TabsTrigger value="private" className="data-[state=active]:bg-transparent data-[state=active]:text-[#00a884] data-[state=active]:border-b-2 data-[state=active]:border-[#00a884] rounded-none h-full gap-2 text-[10px] uppercase font-black px-0">
            <Lock className="h-3 w-3" /> Labs
          </TabsTrigger>
          <TabsTrigger value="status" className="data-[state=active]:bg-transparent data-[state=active]:text-[#00a884] data-[state=active]:border-b-2 data-[state=active]:border-[#00a884] rounded-none h-full gap-2 text-[10px] uppercase font-black px-0">
            <CircleDashed className="h-3 w-3" /> Status
          </TabsTrigger>
          <TabsTrigger value="discover" className="data-[state=active]:bg-transparent data-[state=active]:text-[#00a884] data-[state=active]:border-b-2 data-[state=active]:border-[#00a884] rounded-none h-full gap-2 text-[10px] uppercase font-black px-0">
            <UserIcon className="h-3 w-3" /> People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="divide-y divide-white/5">
              {filteredRooms?.filter(r => r.type === 'public').map(room => (
                <ChatRoomItem 
                  key={room.id} 
                  room={room} 
                  selected={room.id === selectedChatRoomId}
                  onClick={() => onSelectChatRoom(room.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="private" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="divide-y divide-white/5">
              {filteredRooms?.filter(r => r.type === 'private').map(room => (
                <ChatRoomItem 
                  key={room.id} 
                  room={room} 
                  selected={room.id === selectedChatRoomId}
                  onClick={() => onSelectChatRoom(room.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="status" className="flex-1 overflow-hidden m-0">
            <div className="flex flex-col h-full">
                <div 
                    className="p-4 flex items-center gap-4 hover:bg-[#202c33] cursor-pointer transition-all border-b border-white/5"
                    onClick={() => statusInputRef.current?.click()}
                >
                    <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-[#00a884]">
                            <AvatarImage src={profile?.profilePicture} className="object-cover" />
                            <AvatarFallback className="bg-primary/20 text-primary">{profile?.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-5 w-5 bg-[#00a884] rounded-full border-2 border-[#111b21] flex items-center justify-center">
                            <Plus className="h-3 w-3 text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#e9edef] leading-tight">My Status</h3>
                        <p className="text-xs text-[#8696a0]">Tap to add innovation update</p>
                    </div>
                    <input type="file" ref={statusInputRef} className="hidden" accept="image/*" onChange={handleStatusUpload} />
                </div>

                <div className="p-4 pb-2">
                    <p className="text-[10px] font-black uppercase text-[#00a884] tracking-[0.2em]">Recent Updates</p>
                </div>

                <ScrollArea className="flex-1">
                    <div className="divide-y divide-white/5">
                        {statuses && statuses.length > 0 ? (
                            statuses.map((status) => (
                                <div key={status.id} className="p-4 flex items-center gap-4 hover:bg-[#202c33] cursor-pointer group">
                                    <div className="p-0.5 rounded-full border-2 border-[#00a884]">
                                        <Avatar className="h-12 w-12 border border-[#111b21]">
                                            <AvatarImage src={status.userAvatar} className="object-cover" />
                                            <AvatarFallback className="bg-primary/10 text-primary">{status.userName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[#e9edef] truncate">{status.userName}</h3>
                                        <p className="text-xs text-[#8696a0] truncate">
                                            {status.createdAt ? formatDistanceToNow(status.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                    <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
                                        <Image src={status.mediaUrl} alt="Status" fill className="object-cover" unoptimized />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
                                <CircleDashed className="h-12 w-12 mb-4 animate-pulse" />
                                <p className="text-sm font-bold uppercase tracking-tighter">No recent updates</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </TabsContent>

        <TabsContent value="discover" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="divide-y divide-white/5">
              {filteredInnovators?.map(innovator => (
                <div 
                  key={innovator.id} 
                  onClick={() => startPrivateChat(innovator)}
                  className="group flex items-center gap-3 p-3 hover:bg-[#202c33] cursor-pointer transition-all"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={innovator.profilePicture} />
                    <AvatarFallback>{innovator.fullName?.charAt(0) || 'I'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#e9edef] truncate">{innovator.fullName}</h3>
                    <p className="text-xs text-[#8696a0] truncate">{innovator.institutionType} Innovator</p>
                  </div>
                  <MessageSquare className="h-4 w-4 text-[#8696a0] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChatRoomItem({ room, selected, onClick }: { room: ChatRoom, selected: boolean, onClick: () => void }) {
  const time = room.lastMessage?.timestamp ? format((room.lastMessage.timestamp as any).toDate(), 'HH:mm') : '';
  
  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 hover:bg-[#202c33] cursor-pointer transition-all duration-200',
        selected && 'bg-[#2a3942]'
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 border border-white/5">
          <AvatarFallback className="bg-[#2a3942] text-[#8696a0]">
            {room.type === 'public' ? <Users className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0 group-hover:border-transparent pb-3 pt-1">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-bold text-[#e9edef] truncate tracking-tight">{room.name}</h3>
          <span className={cn(
              "text-[10px] font-medium whitespace-nowrap ml-2",
              selected ? "text-[#00a884]" : "text-[#8696a0]"
          )}>
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#8696a0] truncate flex-1 font-medium">
            {room.lastMessage ? (
              <span className="flex items-center gap-1">
                <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
                {room.lastMessage.text}
              </span>
            ) : (
              room.description || 'Private Laboratory'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
  useStorage,
} from '@/firebase';
import {
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage, ChatRoom, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
    Loader2, 
    Plus, 
    Send, 
    Camera, 
    Mic, 
    MoreVertical,
    CheckCheck,
    Smile,
    Image as ImageIcon,
    FileText,
    Video,
    Phone,
    Rocket,
    X,
    MessageSquare,
    UserPlus,
    Copy,
    Sticker,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const INNOVATION_STICKERS = [
  { id: 'rocket', url: 'https://kommodo.ai/i/f2gHb05ASiAyNCF', name: 'Innovation Launch' },
  { id: 'bot', url: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png', name: 'Louis AI Assistant' },
  { id: 'bulb', url: 'https://cdn-icons-png.flaticon.com/512/3176/3176304.png', name: 'Bright Idea' },
  { id: 'cpu', url: 'https://cdn-icons-png.flaticon.com/512/900/900618.png', name: 'Tech Core' },
  { id: 'gear', url: 'https://cdn-icons-png.flaticon.com/512/3067/3106791.png', name: 'Engineering' },
  { id: 'heart', url: 'https://cdn-icons-png.flaticon.com/512/833/833472.png', name: 'Community Love' }
];

interface ChatWindowProps {
  chatRoomId: string | null;
  currentUserId: string;
}

export function ChatWindow({ chatRoomId, currentUserId }: ChatWindowProps) {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatRoomRef = useMemoFirebase(
    () => (firestore && chatRoomId ? doc(firestore, 'chatRooms', chatRoomId) : null),
    [firestore, chatRoomId]
  );
  const { data: chatRoom, isLoading: isRoomLoading } = useDoc<ChatRoom>(chatRoomRef);

  const messagesQuery = useMemoFirebase(
    () =>
      firestore && chatRoomId
        ? query(
            collection(firestore, 'chatRooms', chatRoomId, 'messages'),
            orderBy('timestamp', 'asc')
          )
        : null,
    [firestore, chatRoomId]
  );
  const { data: messages } = useCollection<ChatMessage>(messagesQuery);

  const usersInRoomQuery = useMemoFirebase(() => {
    if (!firestore || !chatRoom?.userIds || chatRoom.userIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('id', 'in', chatRoom.userIds));
  }, [firestore, chatRoom?.userIds]);

  const { data: usersInRoom } = useCollection<User>(usersInRoomQuery);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollableView = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollableView) {
        scrollableView.scrollTo({ top: scrollableView.scrollHeight, behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e?: React.FormEvent, customData?: { text: string, type: ChatMessage['type'] }) => {
    if (e) e.preventDefault();
    const text = customData?.text || messageText.trim();
    const type = customData?.type || 'text';
    if (!text || !firestore || !chatRoomId) return;
    if (!customData) setMessageText('');
    
    const messagesCollection = collection(firestore, 'chatRooms', chatRoomId, 'messages');
    const newMessage: Omit<ChatMessage, 'id'> = {
      senderId: currentUserId,
      message: text,
      timestamp: serverTimestamp(),
      receiverId: '', 
      type: type,
    };

    addDocumentNonBlocking(messagesCollection, newMessage);
    
    if (chatRoomRef) {
        updateDoc(chatRoomRef, {
            lastMessage: {
                text: type === 'text' ? text : `Shared a ${type}`,
                senderId: currentUserId,
                timestamp: serverTimestamp()
            }
        });
    }
    inputRef.current?.focus();
    setShowEmojiPicker(false);
    setShowStickers(false);
  };

  const onEmojiClick = (emojiData: any) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !chatRoomId) return;
    setUploadingFile(file);
    const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : 
                     file.type.startsWith('audio/') ? 'audio' : 'text';
    const storageRef = ref(storage, `chat-media/${chatRoomId}/${currentUserId}/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed', 
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        () => setUploadingFile(null),
        async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            handleSendMessage(undefined, { text: downloadURL, type: fileType as any });
            setUploadingFile(null);
        }
    );
  };

  const generateInviteLink = () => {
    if (!chatRoomId) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/chat?join=${chatRoomId}`;
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(generateInviteLink());
    toast({ title: "Invite Link Copied!", description: "Share this link with fellow innovators to add them to this space." });
    setShowInviteDialog(false);
  };

  if (!chatRoomId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0b141a] animate-in fade-in duration-1000">
        <div className="bg-[#202c33] p-10 rounded-full mb-8 shadow-2xl relative">
            <div className="absolute inset-0 bg-[#00a884]/5 rounded-full animate-ping" />
            <MessageSquare className="h-20 w-20 text-[#8696a0] relative z-10" />
        </div>
        <h3 className="text-3xl font-bold font-headline text-[#e9edef] tracking-tight mb-2">School DIY Hub Collaboration</h3>
        <p className="text-[#8696a0] max-w-sm leading-relaxed font-medium">
          Collaborate with students and sponsors in secure private and group innovation rooms.
        </p>
        <div className="mt-12 flex items-center gap-2 text-[#8696a0] text-xs font-mono uppercase tracking-widest">
            <CheckCheck className="h-4 w-4 text-[#00a884]" /> End-to-end encrypted
        </div>
      </div>
    );
  }

  if (isRoomLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0b141a]">
        <Loader2 className="h-10 w-10 animate-spin text-[#00a884]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <div className="flex items-center justify-between gap-4 p-3 bg-[#202c33] z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white/5 shadow-md">
            <AvatarFallback className="bg-[#2a3942] text-[#8696a0] font-bold">
                {chatRoom?.name?.charAt(0) || 'R'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#e9edef] truncate leading-tight tracking-tight flex items-center gap-2">
                {chatRoom?.name || 'Loading Space...'}
                {chatRoom?.type === 'private' && <ShieldCheck className="h-3 w-3 text-[#00a884]" />}
            </h2>
            <p className="text-[10px] text-[#00a884] truncate font-bold uppercase tracking-wider">
                {usersInRoom?.length || 0} online collaborators
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#aebac1]">
            <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-[#2a3942] text-[#00a884]"
                onClick={() => setShowInviteDialog(true)}
            >
                <UserPlus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#2a3942]"><Phone className="h-5 w-5" /></Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-[#2a3942]">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#233138] text-[#e9edef] border-white/5 rounded-xl p-2 shadow-2xl">
                    <DropdownMenuItem className="rounded-lg cursor-pointer">Lab Specs</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer">Media Gallery</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 rounded-lg cursor-pointer">Archive Room</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1 z-10" ref={scrollAreaRef}>
        <div className="p-6 space-y-4 max-w-5xl mx-auto">
          {messages?.map((msg) => {
            const isCurrentUser = msg.senderId === currentUserId;
            const sender = usersInRoom?.find((u) => u.id === msg.senderId);
            const showName = chatRoom?.type === 'public' && !isCurrentUser;
            const time = msg.timestamp ? format((msg.timestamp as any).toDate(), 'HH:mm') : '';

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex w-full mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300',
                  isCurrentUser ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 shadow-md text-sm',
                    isCurrentUser 
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' 
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                  )}
                >
                  {showName && (
                    <p className="text-[11px] font-black mb-1 text-[#00a884] uppercase tracking-widest">
                      {sender?.fullName || 'Innovator'}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {msg.type === 'text' && <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.message}</p>}
                    {msg.type === 'image' && (
                        <div className="relative aspect-video w-72 max-w-full rounded-xl overflow-hidden bg-black/20 mt-1 border border-white/10">
                            <Image src={msg.message} alt="Shared" fill className="object-cover" unoptimized />
                        </div>
                    )}
                    {msg.type === 'video' && (
                        <div className="w-72 max-w-full rounded-xl overflow-hidden bg-black mt-1 border border-white/10">
                            <video src={msg.message} controls className="w-full h-auto" />
                        </div>
                    )}
                  </div>

                  <div className={cn(
                    "flex items-center justify-end gap-1 mt-1 opacity-60",
                    isCurrentUser ? "text-[#e9edef]" : "text-[#8696a0]"
                  )}>
                    <span className="text-[9px] font-bold">{time}</span>
                    {isCurrentUser && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="px-4 pb-6 z-20">
        {uploadingFile && (
            <div className="max-w-4xl mx-auto mb-4 bg-[#202c33] p-3 rounded-2xl shadow-2xl border border-white/5 animate-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#8696a0] flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin text-[#00a884]" />
                        Syncing lab data...
                    </span>
                    <span className="text-[10px] font-mono text-[#00a884]">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1 bg-[#111b21] [&>div]:bg-[#00a884]" />
            </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-1 bg-[#202c33] rounded-full px-2 h-14 shadow-2xl border border-white/5 backdrop-blur-xl flex-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="rounded-full text-[#aebac1] hover:bg-[#2a3942]">
                        <Smile className="h-6 w-6" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="p-0 border-none bg-transparent shadow-none w-auto mb-4">
                    <EmojiPicker 
                        theme={'dark' as any} 
                        onEmojiClick={onEmojiClick} 
                        lazyLoadEmojis={true}
                    />
                </PopoverContent>
            </Popover>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="rounded-full text-[#aebac1] hover:bg-[#2a3942]">
                        <Plus className="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="bg-[#233138] border-none rounded-[2rem] p-3 w-56 mb-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in zoom-in-95">
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="rounded-2xl gap-4 h-12 text-[#e9edef] cursor-pointer hover:bg-[#2a3942]">
                        <div className="bg-[#00a884] p-2 rounded-full"><ImageIcon className="h-4 w-4 text-white" /></div> <span>Lab Blueprint</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowStickers(true)} className="rounded-2xl gap-4 h-12 text-[#e9edef] cursor-pointer hover:bg-[#2a3942]">
                        <div className="bg-[#ff9f00] p-2 rounded-full"><Sticker className="h-4 w-4 text-white" /></div> <span>Hub Stickers</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl gap-4 h-12 text-[#e9edef] cursor-pointer hover:bg-[#2a3942]">
                        <div className="bg-[#7f66ff] p-2 rounded-full"><FileText className="h-4 w-4 text-white" /></div> <span>Technical Spec</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl gap-4 h-12 text-[#e9edef] cursor-pointer hover:bg-[#2a3942]">
                        <div className="bg-[#ff2e74] p-2 rounded-full"><Video className="h-4 w-4 text-white" /></div> <span>Project Demo</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />

            <Input
                ref={inputRef}
                placeholder="Type your engineering request..."
                className="bg-transparent border-none text-[#e9edef] placeholder:text-[#8696a0] h-full text-base focus-visible:ring-0 shadow-none px-2 font-medium"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
            />

            {!messageText.trim() && (
                <Button type="button" size="icon" variant="ghost" className="rounded-full text-[#aebac1] hover:bg-[#2a3942]">
                    <Camera className="h-6 w-6" />
                </Button>
            )}
          </div>

          <Button
            type="submit"
            size="icon"
            className={cn(
                "rounded-full h-14 w-14 shadow-2xl transition-all active:scale-90",
                messageText.trim() ? "bg-[#00a884] hover:bg-[#008f6c]" : "bg-[#202c33] hover:bg-[#2a3942] text-[#aebac1]"
            )}
          >
            {messageText.trim() ? <Send className="h-6 w-6 text-[#111b21] ml-1" /> : <Mic className="h-6 w-6" />}
          </Button>
        </form>
      </div>

      <Dialog open={showStickers} onOpenChange={setShowStickers}>
        <DialogContent className="bg-[#222e35] text-white border-white/5 rounded-[2.5rem] max-w-lg">
            <DialogHeader>
                <DialogTitle className="text-2xl font-headline flex items-center gap-3">
                    <Sticker className="h-8 w-8 text-[#00a884]" />
                    Innovation Stickers
                </DialogTitle>
                <DialogDescription className="text-[#8696a0]">
                    Celebrate innovation with high-quality stickers.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-6 py-8">
                {INNOVATION_STICKERS.map((sticker) => (
                    <button 
                        key={sticker.id} 
                        className="group flex flex-col items-center gap-2 p-4 rounded-3xl bg-[#111b21] border border-white/5 hover:bg-[#00a884]/10 hover:border-[#00a884]/20 transition-all active:scale-95"
                        onClick={() => handleSendMessage(undefined, { text: sticker.url, type: 'image' })}
                    >
                        <div className="relative h-16 w-16 group-hover:scale-110 transition-transform">
                            <div className="relative h-full w-full z-10">
                                <Image src={sticker.url} alt={sticker.name} fill className="object-contain" unoptimized />
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase text-[#8696a0] tracking-widest">{sticker.name}</span>
                    </button>
                ))}
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-[#222e35] text-white border-white/5 rounded-[2rem] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-[#00a884]" />
              Secure Invitation
            </DialogTitle>
            <DialogDescription className="text-[#8696a0]">
              Share this secure link with fellow innovators to add them to **{chatRoom?.name || 'the Lab'}**.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center gap-2 p-3 bg-[#111b21] rounded-2xl border border-white/5">
              <Input 
                readOnly 
                value={generateInviteLink()} 
                className="bg-transparent border-none text-xs text-[#8696a0] font-mono h-auto p-0 focus-visible:ring-0"
              />
              <Button size="sm" className="bg-[#00a884] hover:bg-[#008f6c] rounded-xl h-8 gap-2" onClick={copyInvite}>
                <Copy className="h-3 w-3" /> Copy
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <p className="text-[10px] text-[#8696a0] uppercase font-black tracking-widest">
              End-to-End Secure • Hub Verified
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

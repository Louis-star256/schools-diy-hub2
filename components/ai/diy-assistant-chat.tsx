
"use client";

import React, { useState, useRef, useEffect } from "react";
import { askDiyAssistant } from "@/ai/flows/ask-diy-assistant";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
    Loader2, 
    Send, 
    Plus, 
    Mic, 
    Copy, 
    ThumbsUp,
    ThumbsDown,
    RefreshCw, 
    Share2,
    ShieldCheck,
    Code2,
    Bug,
    Lightbulb
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import type { User as UserProfile, ChatMessage } from "@/lib/types";

interface DiyAssistantChatProps {
  externalSessionId?: string | null;
  onSessionSelect?: (id: string) => void;
}

const QUICK_ACTIONS = [
    { label: "Brainstorm Ideas", icon: Lightbulb, prompt: "I want to start a new DIY project. Can you help me brainstorm some ideas based on my interests?" },
    { label: "Generate Code", icon: Code2, prompt: "I need to write some code for my school project. Can you help me get started?" },
    { label: "Troubleshoot Project", icon: Bug, prompt: "I'm having trouble with my electronics project. Can we troubleshoot the connections?" },
];

export function DiyAssistantChat({ externalSessionId, onSessionSelect }: DiyAssistantChatProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const profileRef = useMemoFirebase(
        () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
        [firestore, user]
    );
    const { data: profile } = useDoc<UserProfile>(profileRef);

    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !externalSessionId) return null;
        return query(
            collection(firestore, 'innovationSessions', externalSessionId, 'messages'),
            orderBy('timestamp', 'asc')
        );
    }, [firestore, externalSessionId]);

    const { data: messages } = useCollection<ChatMessage>(messagesQuery);

    useEffect(() => {
        if (messages) {
            setChatHistory(messages);
        } else if (!externalSessionId) {
            setChatHistory([]);
        }
    }, [messages, externalSessionId]);

    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [chatHistory, isLoading]);

    const handleSendMessage = async (customPrompt?: string) => {
        const questionText = customPrompt || inputValue;
        if (!questionText.trim() || isLoading || !user || !firestore) return;

        const question = questionText.trim();
        const newUserMsg = { role: 'user' as const, message: question, timestamp: new Date() };
        
        setInputValue("");
        setIsLoading(true);

        let sessionId = externalSessionId;

        try {
            if (!sessionId && onSessionSelect) {
                const sessionRef = await addDoc(collection(firestore, 'innovationSessions'), {
                    userId: user.uid,
                    title: question.slice(0, 40) + (question.length > 40 ? '...' : ''),
                    updatedAt: serverTimestamp(),
                    createdAt: serverTimestamp(),
                });
                sessionId = sessionRef.id;
                onSessionSelect(sessionId);
            } else if (sessionId) {
                await updateDoc(doc(firestore, 'innovationSessions', sessionId), { updatedAt: serverTimestamp() });
            }

            if (sessionId) {
                await addDoc(collection(firestore, 'innovationSessions', sessionId, 'messages'), {
                    senderId: user.uid,
                    message: question,
                    timestamp: serverTimestamp(),
                    type: 'text',
                    role: 'user'
                });
            }

            const result = await askDiyAssistant({ 
                question,
                history: chatHistory.map(m => ({ role: m.role as any, text: m.message })),
                skillLevel: profile?.levelOfStudies || 'Beginner'
            });

            if (sessionId) {
                await addDoc(collection(firestore, 'innovationSessions', sessionId, 'messages'), {
                    senderId: 'louis-ai',
                    message: result.answer,
                    timestamp: serverTimestamp(),
                    type: 'text',
                    role: 'model'
                });
            } else {
                setChatHistory(prev => [...prev, 
                    { ...newUserMsg, type: 'text', id: 'temp-u', senderId: user.uid, receiverId: '', timestamp: new Date() }, 
                    { role: 'model', message: result.answer, timestamp: new Date(), type: 'text', id: 'temp-m', senderId: '', receiverId: user.uid }
                ]);
            }

        } catch (e: any) {
            console.error("[LOUIS ENGINE ERROR]", e);
            toast({ variant: 'destructive', title: 'Transmission Error', description: 'Could not connect to Mentor Louis. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Response copied to clipboard." });
    };

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] relative">
            <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
                    {chatHistory.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                            <div className="relative h-16 w-16 mb-8 rounded-full border border-white/10 p-2 shadow-2xl bg-white/[0.03] overflow-hidden">
                                <Image 
                                    src="https://kommodo.ai/i/f2gHb05ASiAyNCF" 
                                    alt="Mentor Icon" 
                                    fill 
                                    className="object-contain p-2"
                                    unoptimized
                                />
                            </div>
                            <h2 className="text-4xl font-bold font-headline mb-4 tracking-tight text-white">Ready to innovate?</h2>
                            <p className="text-white/60 mb-8 max-w-sm">I'm Louis, your mentor and engineering guide. Tell me what you're thinking or pick a topic below.</p>
                            
                            <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
                                {QUICK_ACTIONS.map((action) => (
                                    <button 
                                        key={action.label}
                                        onClick={() => handleSendMessage(action.prompt)}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <action.icon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <span className="text-sm font-medium text-white/80">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {chatHistory.map((chat, index) => (
                        <div 
                            key={index} 
                            className={cn(
                                "flex gap-6 p-6 rounded-2xl transition-all border border-transparent",
                                chat.role === 'user' ? "flex-row-reverse" : "bg-white/[0.02] border-white/5"
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 shrink-0 rounded-full flex items-center justify-center overflow-hidden border border-white/10",
                                chat.role === 'user' ? "bg-purple-500/20" : "bg-blue-500/20"
                            )}>
                                {chat.role === 'model' ? (
                                    <Image src="https://kommodo.ai/i/f2gHb05ASiAyNCF" alt="Louis" width={20} height={20} className="object-contain" unoptimized />
                                ) : (
                                    <span className="text-[10px] font-bold">YOU</span>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-4">
                                <div className={cn(
                                    "prose dark:prose-invert prose-sm leading-relaxed max-w-none text-white/90",
                                    chat.role === 'user' ? "text-right" : ""
                                )}>
                                    <div className="whitespace-pre-wrap break-words">{chat.message}</div>
                                </div>

                                {chat.role === 'model' && (
                                    <div className="flex items-center gap-1 pt-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all" onClick={() => copyToClipboard(chat.message)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/40 hover:text-green-400 hover:bg-white/10 transition-all">
                                            <ThumbsUp className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-all">
                                            <ThumbsDown className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/10 transition-all">
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/40 hover:text-purple-400 hover:bg-white/10 transition-all">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border-white/5 animate-pulse">
                            <div className="h-8 w-8 rounded-full bg-white/10" />
                            <div className="flex-1 space-y-3">
                                <div className="h-3 bg-white/10 rounded w-1/4" />
                                <div className="h-3 bg-white/10 rounded w-full" />
                                <div className="h-3 bg-white/10 rounded w-5/6" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* FIXED BOTTOM CHAT BAR */}
            <div className="border-t border-white/5 bg-gradient-to-t from-[#0A0A0A] to-transparent p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                        className="relative flex items-end gap-2 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 focus-within:border-white/20 transition-all shadow-xl"
                    >
                        <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-white/40 hover:text-white">
                            <Plus className="h-5 w-5" />
                        </Button>
                        
                        <Textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message Your Mentor Louis..."
                            className="flex-1 min-h-[44px] max-h-[200px] border-0 focus-visible:ring-0 resize-none bg-transparent py-3 text-sm placeholder:text-white/20"
                        />
                        
                        <div className="flex items-center gap-1">
                            <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-white/40 hover:text-white">
                                <Mic className="h-5 w-5" />
                            </Button>
                            <Button 
                                type="submit" 
                                size="icon" 
                                disabled={!inputValue.trim() || isLoading} 
                                className={cn(
                                    "h-10 w-10 rounded-xl transition-all",
                                    inputValue.trim() ? "bg-white text-black" : "bg-white/5 text-white/20"
                                )}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </form>

                    <div className="flex flex-col items-center gap-1">
                        <p className="text-[10px] text-white/30 text-center leading-relaxed">
                            Your Mentor Louis can make mistakes. Check important info. See Preferences.
                        </p>
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase text-white/20 tracking-[0.5em]">
                            <ShieldCheck className="h-3 w-3" /> Secure Innovation Protocol Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

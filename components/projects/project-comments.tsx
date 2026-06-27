'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Comment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Send, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ProjectCommentsProps {
  projectId: string;
}

export function ProjectComments({ projectId }: ProjectCommentsProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'projects', projectId, 'comments'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, projectId]
  );

  const { data: comments, isLoading: commentsLoading } = useCollection<Comment>(commentsQuery);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !commentText.trim()) return;

    setIsSubmitting(true);
    const commentsCollection = collection(firestore, 'projects', projectId, 'comments');
    
    const newComment = {
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Innovator',
      userAvatarUrl: user.photoURL || `https://avatar.vercel.sh/${user.email}.png`,
      text: commentText,
      createdAt: serverTimestamp(),
    };

    try {
      // ULTRAFAST_UI: Optimistic local response
      await addDocumentNonBlocking(commentsCollection, newComment);
      setCommentText('');
    } catch (error) {
      console.error("Failed to post comment: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16">
        {user ? (
          <form onSubmit={handlePostComment} className="flex flex-col gap-8 p-12 bg-white/20 rounded-[4rem] border-4 border-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl ring-2 ring-white/10">
            <div className="flex items-start gap-8">
                <Avatar className="h-20 w-20 shrink-0 border-4 border-primary shadow-2xl">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-black text-2xl">{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        <span className="text-[12px] font-black uppercase tracking-[0.4em] text-primary">Community Intel Active</span>
                    </div>
                    <Textarea
                        placeholder="Add your technical insight..."
                        className="min-h-[180px] bg-black/80 border-white/40 focus-visible:ring-primary text-white placeholder:text-white/40 rounded-[2.5rem] text-4xl font-black p-10 shadow-inner leading-tight"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={!commentText.trim() || isSubmitting} className="rounded-full px-20 font-black uppercase tracking-[0.3em] h-24 shadow-[0_0_60px_rgba(var(--primary),0.5)] bg-primary text-black hover:bg-primary/90 text-3xl transition-all active:scale-95 group">
                  {isSubmitting ? <Loader2 className="mr-4 h-8 w-8 animate-spin" /> : <Send className="mr-4 h-8 w-8 group-hover:translate-x-2 transition-transform" />}
                  Launch Feedback
                </Button>
            </div>
          </form>
        ) : (
          <div className="text-center text-white p-20 border-8 border-dashed border-white/20 rounded-[5rem] bg-white/[0.05] backdrop-blur-2xl">
            <p className="mb-12 font-black text-5xl font-headline tracking-tighter">Login to share your innovation feedback.</p>
            <Button asChild className="rounded-full h-24 px-24 text-3xl font-headline font-black shadow-2xl shadow-primary/30 uppercase tracking-widest">
              <Link href="/login">Unlock Community Hub</Link>
            </Button>
          </div>
        )}

        <div className="space-y-12 pt-8">
          {commentsLoading && (
            <div className="flex justify-center p-20">
              <Loader2 className="h-20 w-20 animate-spin text-primary opacity-30" />
            </div>
          )}
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-10 p-16 rounded-[5rem] bg-white text-black transition-all hover:bg-white/95 group shadow-[0_50px_80px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Avatar className="h-28 w-24 border-6 border-black/10 group-hover:border-primary transition-colors shadow-2xl rounded-3xl overflow-hidden">
                  <AvatarImage src={comment.userAvatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-black/5 text-black font-black text-4xl">{comment.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <p className="font-black text-primary font-headline text-6xl tracking-tighter">{comment.userName}</p>
                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black/60 bg-black/5 px-10 py-4 rounded-full border-2 border-black/10 w-fit">
                      {comment.createdAt
                        ? formatDistanceToNow((comment.createdAt as any).toDate(), { addSuffix: true })
                        : 'Just now'}
                    </p>
                  </div>
                  {/* ULTRA HIGH LIGHT CONTAINER: Pure white surface with black font for ultimate technical clarity */}
                  <div className="bg-white p-12 rounded-[3.5rem] border-8 border-primary/20 relative overflow-hidden shadow-2xl min-h-[150px]">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <MessageSquare className="h-24 w-24 text-black" />
                    </div>
                    <p className="text-black text-5xl leading-[1.1] font-black tracking-tighter relative z-10">
                      {comment.text}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !commentsLoading && (
              <div className="text-center py-48 opacity-90">
                <div className="h-48 w-48 rounded-[4rem] bg-white/10 flex items-center justify-center mx-auto mb-16 border-6 border-dashed border-white/20 animate-pulse shadow-2xl">
                  <MessageSquare className="h-24 w-24 text-white/40" />
                </div>
                <p className="font-headline font-black uppercase tracking-[0.8em] text-3xl text-white/30 drop-shadow-lg">Awaiting Peer Review</p>
              </div>
            )
          )}
        </div>
    </div>
  );
}
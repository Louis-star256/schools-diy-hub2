'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function FeedbackPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submitFeedback(event: React.FormEvent) {
        event.preventDefault();

        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
            return;
        }

        if (!message.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Feedback message cannot be empty.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const feedbackCollection = collection(firestore, 'feedback');
            await addDocumentNonBlocking(feedbackCollection, {
                message,
                createdAt: serverTimestamp(),
            });
            
            toast({
                title: 'Feedback Sent!',
                description: 'Thank you for your valuable input.',
            });
            setMessage('');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: error.message || 'There was a problem submitting your feedback.',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isUserLoading) {
        return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
    }
    
    if (!user) {
        return (
            <div className="container mx-auto max-w-2xl text-center py-12">
                <Alert>
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    To prevent spam, you must be logged in to submit feedback. Your feedback will be stored anonymously.
                  </AlertDescription>
                </Alert>
                <Button asChild className="mt-4">
                  <Link href="/login">Log In to Provide Feedback</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold font-headline tracking-tight">Send Us Your Feedback</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    We'd love to hear your thoughts on how we can improve. Your feedback is anonymous.
                </p>
            </header>

            <Card>
                <form onSubmit={submitFeedback}>
                    <CardHeader>
                        <CardTitle>Feedback Form</CardTitle>
                        <CardDescription>
                            Your input is valuable to us.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea 
                                id="message" 
                                name="message" 
                                placeholder="Your anonymous feedback..." 
                                required 
                                className="min-h-[150px]" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting || !message.trim()}>
                             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Feedback
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

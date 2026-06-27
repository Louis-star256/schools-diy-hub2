
'use client';

import { MediaStudio } from '@/components/projects/media-studio';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { BackButton } from '@/components/back-button';

export default function NewProjectPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] bg-[#0B0F19]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl text-center py-24 min-h-[calc(100vh-4rem)] bg-[#0B0F19]">
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
          <AlertTitle className="text-xl font-headline font-bold">Secure Access Required</AlertTitle>
          <AlertDescription className="text-lg">
            You must be logged in to enter the Media Studio.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-8 h-14 px-12 text-lg rounded-full shadow-xl">
          <Link href="/login">Log In to Create</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F19] min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
            <BackButton />
            <div className="text-right">
                <h1 className="text-3xl font-black font-headline tracking-tighter text-white">Innovation Studio</h1>
                <p className="text-xs text-primary font-bold uppercase tracking-[0.2em]">High Performance Media Engine</p>
            </div>
        </header>
        <MediaStudio />
      </div>
    </div>
  );
}

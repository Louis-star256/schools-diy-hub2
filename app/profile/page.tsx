
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Profile Redirect Gateway.
 * Resolves 404 issues by routing authenticated users to their specific personal dashboard.
 * Navigating to '/profile' will now always result in a valid destination if logged in.
 */
export default function ProfileRedirectPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // Route to the specific dynamic profile path
        router.replace(`/profile/${user.uid}`);
      } else {
        // Route to login if not authenticated
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#0b0b0b]">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-20" />
        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Authorizing Hub Identity...</p>
      </div>
    </div>
  );
}

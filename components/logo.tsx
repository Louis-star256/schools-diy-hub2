'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';

/**
 * @fileOverview The iconic brand lock for School's DIY Hub.
 * Using the primary icon (gdkdHKr.jpeg) as the global identity across navigation.
 */
export function Logo({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [imgSrc] = useState('https://i.imgur.com/gdkdHKr.jpeg');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="h-10 w-10 bg-white/5 rounded-xl animate-pulse" />
        {!iconOnly && <div className="h-6 w-32 bg-white/5 rounded-md animate-pulse" />}
      </div>
    );
  }

  return (
    <Link href="/" className={cn("flex items-center gap-3 group transition-opacity hover:opacity-90", className)}>
      <div className="relative h-10 w-10 shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black">
        <Image 
          src={imgSrc} 
          alt="School's DIY Hub Icon" 
          fill
          className="object-contain"
          priority
          unoptimized
        />
      </div>
      
      {!iconOnly && (
        <span className="font-headline text-xl font-bold tracking-tighter text-white group-hover:text-primary transition-colors whitespace-nowrap">
          School's DIY Hub
        </span>
      )}
    </Link>
  );
}

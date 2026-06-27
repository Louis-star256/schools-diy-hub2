
'use client';

import {
  CircleUser,
  Search,
  Globe,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Logo } from './logo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { SidebarTrigger } from './ui/sidebar';
import { getAuth, signOut } from 'firebase/auth';
import { doc as firestoreDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { PreferencesDialog } from './preferences-dialog';

export function Header() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = !isUserLoading && !!user;

  const userRef = useMemoFirebase(
    () => (firestore && user ? firestoreDoc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: profile } = useDoc<User>(userRef);

  const handleLanguageChange = async (val: string) => {
    if (isLoggedIn && firestore) {
        try {
            await updateDoc(firestoreDoc(firestore, 'users', user.uid), { language: val });
            toast({ title: 'Language Updated', description: `Hub preference set to ${val.toUpperCase()}.` });
        } catch (e) {
            console.error(e);
        }
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    toast({ title: 'Logged Out', description: 'See you again soon!' });
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Logo className="flex" />
      </div>

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="hidden sm:flex flex-initial max-w-xs ml-auto">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="pl-8 w-full rounded-full bg-muted/50 border-none h-9"
            />
          </div>
        </form>
        
        <div className="hidden xs:flex items-center gap-2 bg-primary/5 rounded-full px-3 py-1 border border-primary/10">
          <Globe className="h-4 w-4 text-primary" />
          <Select 
            value={profile?.language || lang || 'en'} 
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-[110px] border-none bg-transparent shadow-none h-8 p-0 text-xs font-bold uppercase tracking-tight">
              <SelectValue placeholder="Lang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="lg">Luganda</SelectItem>
              <SelectItem value="sw">Swahili</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mounted && isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full h-9 w-9 border-2 border-primary/20">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl">
              <DropdownMenuLabel className="font-headline text-lg">
                {t('welcome')}, {profile?.fullName?.split(' ')[0] || 'Innovator'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.uid}`} className="cursor-pointer w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPreferences(true)} className="cursor-pointer">
                <Settings2 className="mr-2 h-4 w-4" /> Hub Preferences
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="cursor-pointer w-full">Alerts</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : mounted ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="rounded-full h-9 px-4">
              <Link href="/login">{t('login')}</Link>
            </Button>
            <Button asChild className="rounded-full h-9 px-4">
              <Link href="/signup">{t('signup')}</Link>
            </Button>
          </div>
        ) : (
          <div className="h-9 w-24 bg-muted animate-pulse rounded-full" />
        )}
      </div>

      <PreferencesDialog open={showPreferences} onOpenChange={setShowPreferences} />
    </header>
  );
}

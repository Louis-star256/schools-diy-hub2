'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Mail,
  Info,
  Bell,
  Rss,
  Presentation,
  GraduationCap,
  Heart,
  ShoppingCart,
  PlusCircle,
  Home,
  TrendingUp,
  Map as MapIcon,
  BookOpen,
  Zap
} from 'lucide-react';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';

const navLinks = [
  { href: '/', label: 'home', icon: Home },
  { href: '/projects', label: 'showcase', icon: Presentation },
  { href: '/projects/new', label: 'createProject', icon: PlusCircle },
  { href: '/ai-hub', label: 'aiHub', customIcon: "https://i.imgur.com/gdkdHKr.jpeg", fallbackIcon: Zap },
  { href: '/how-to-use', label: 'howToUse', icon: BookOpen },
  { href: '/institutions', label: 'Institutions', icon: MapIcon },
  { href: '/materials', label: 'materials', icon: ShoppingCart },
  { href: '/chat', label: 'chat', icon: MessageSquare },
  { href: '/notifications', label: 'notifications', icon: Bell },
  { href: '/adverts', label: 'adverts', icon: Rss },
  { href: '/sponsorship', label: 'sponsorship', icon: Heart },
  { href: '/about', label: 'about', icon: Info },
  { href: '/feedback', label: 'feedback', icon: Mail },
];

export function AppNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const profileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: profile } = useDoc<User>(profileRef);

  const isOrganisation = profile?.institutionType === 'Organisation';
  const isHeadOrSupervisor = profile?.institutionRole === 'Head' || profile?.institutionRole === 'Patron';

  return (
    <div className="flex flex-col gap-4">
      <SidebarMenu className="px-2">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/' 
              ? pathname === '/' 
              : link.href === '/projects'
              ? pathname === '/projects' ||
                (pathname.startsWith('/projects/') &&
                  !pathname.startsWith('/projects/new') &&
                  !pathname.startsWith('/projects/generate'))
              : pathname.startsWith(link.href);
          
          const Icon = link.icon;
          const FallbackIcon = link.fallbackIcon;

          return (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={t(link.label)}
              >
                <Link href={link.href}>
                  {link.customIcon ? (
                    <div className="relative h-6 w-8 shrink-0 overflow-hidden rounded-md border border-white/5 bg-white/5 p-0.5">
                      <div className="relative h-full w-full z-10">
                        <Image 
                          src={link.customIcon} 
                          alt={link.label} 
                          fill 
                          className="object-contain" 
                          unoptimized 
                        />
                      </div>
                      {!isActive && FallbackIcon && <FallbackIcon className="absolute inset-0 m-auto h-4 w-4 opacity-0" />}
                    </div>
                  ) : (
                    Icon && <Icon />
                  )}
                  <span>{t(link.label)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

      <div className="mt-auto p-2 space-y-2">
        <SidebarMenu>
          {isOrganisation && (
            <SidebarMenuItem>
                <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/sponsor')}
                tooltip={t('partnerDashboard')}
                className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                <Link href="/sponsor/dashboard">
                    <TrendingUp />
                    <span>{t('partnerDashboard')}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {(isHeadOrSupervisor || isOrganisation) && (
            <SidebarMenuItem>
                <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/school')}
                tooltip={t('adminPortal')}
                >
                <Link href="/school/dashboard">
                    <GraduationCap />
                    <span>{t('adminPortal')}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </div>
    </div>
  );
}

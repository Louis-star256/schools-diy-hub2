'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Bell, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  or,
  limit,
} from 'firebase/firestore';
import type { Advert } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const advertsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    
    // In a real app, you would fetch the user's profile to get their schoolId and institutionType.
    // For this example, we'll hardcode some values for demonstration.
    const userSchoolId = 'school-1';
    const userInstitutionType = 'Secondary Institution';

    return query(
      collection(firestore, 'adverts'),
      or(
        where('targetAudience', '==', 'all'),
        where('targetId', '==', userSchoolId),
        where('targetId', '==', userInstitutionType)
      ),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [firestore, user]);

  const {
    data: adverts,
    isLoading,
    error,
  } = useCollection<Advert>(advertsQuery);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          Notifications
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Stay updated with the latest announcements and opportunities.
        </p>
      </header>
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Your Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUserLoading || isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !user ? (
            <div className="text-center text-muted-foreground p-8">
              Please log in to see your notifications.
            </div>
          ) : error ? (
            <div className="text-center text-destructive p-8">
              Error loading notifications: {error.message}
            </div>
          ) : adverts && adverts.length > 0 ? (
            <div className="space-y-6">
              {adverts.map((advert) => (
                <div key={advert.id} className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-muted-foreground">
                    {advert.createdAt
                      ? formatDistanceToNow(advert.createdAt.toDate(), { addSuffix: true })
                      : 'Just now'}
                  </p>
                  <h3 className="font-semibold text-lg">{advert.title}</h3>
                  <p className="text-muted-foreground">{advert.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-muted-foreground">
                You have no new notifications.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

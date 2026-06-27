
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { dictionaries, type Language } from '@/lib/i18n';
import type { User } from '@/lib/types';

export function useTranslation() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  const { data: profile } = useDoc<User>(userRef);
  
  const lang: Language = (profile?.language as Language) || 'en';
  const dictionary = dictionaries[lang] || dictionaries.en;

  const t = (key: string) => {
    return dictionary[key] || key;
  };

  return { t, lang };
}

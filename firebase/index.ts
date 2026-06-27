'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Auth } from 'firebase/auth';

/**
 * Singleton state to ensure persistence is only enabled once.
 */
let memoizedSdks: {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
} | null = null;

let persistencePromise: Promise<void> | null = null;

export function initializeFirebase() {
  if (memoizedSdks) return memoizedSdks;

  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Firebase initialization failed:', e);
      firebaseApp = initializeApp();
    }
  } else {
    firebaseApp = getApp();
  }

  const firestore = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
  });

  const sdks = {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore,
    storage: getStorage(firebaseApp)
  };

  // ULTRAFAST_UI: Enable Firestore Offline Persistence ONCE
  if (typeof window !== 'undefined' && !persistencePromise) {
    persistencePromise = enableIndexedDbPersistence(firestore).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Persistence failed: Browser not supported');
      }
    });
  }

  memoizedSdks = sdks;
  return sdks;
}

export function getSdks(firebaseApp: FirebaseApp) {
  return initializeFirebase();
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

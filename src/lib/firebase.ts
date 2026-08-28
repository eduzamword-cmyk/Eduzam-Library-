import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, 
  getDocFromServer, 
  FirestoreError, 
  setLogLevel 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress transient Firestore connectivity warnings in the console
setLogLevel('silent');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  code?: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Analytics is disabled to prevent unhandled fetch errors in the iframe environment.
export let analytics: any = null;

// Suppress benign Firebase dev-mode unhandled rejections for IndexedDB
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason);
    if (msg.toLowerCase().includes('database is closing') || msg.toLowerCase().includes('closing/hidden') || msg.toLowerCase().includes('database is hidden')) {
      event.preventDefault();
      console.warn('Suppressed Firebase IndexedDB transient unhandledrejection:', msg);
    }
  });
  window.addEventListener('error', (event) => {
    const msg = event.message || String(event.error);
    if (msg.toLowerCase().includes('database is closing') || msg.toLowerCase().includes('closing/hidden') || msg.toLowerCase().includes('database is hidden')) {
      event.preventDefault();
      console.warn('Suppressed Firebase IndexedDB transient error:', msg);
    }
  });
}

// Using initializeFirestore with persistentLocalCache and long polling for iframe compatibility
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  experimentalForceLongPolling: true,
}, databaseId);

// Standard Firebase Auth initialization
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: browserLocalPersistence,
  });
} catch {
  authInstance = getAuth(app);
}
export const auth = authInstance;

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore running in offline cache mode.");
    }
  }
}
testConnection();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isFirestoreError = error && typeof error === 'object' && 'code' in error;
  const code = isFirestoreError ? (error as FirestoreError).code : undefined;
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    code,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }

  // Handle transient connectivity errors gracefully
  const errorMsg = String(errInfo.error).toLowerCase();
  
  if (
    code === 'unavailable' || 
    code === 'deadline-exceeded' || 
    errorMsg.includes('database is closing') || 
    errorMsg.includes('database is hidden') ||
    errorMsg.includes('closing/hidden')
  ) {
    console.warn('Firestore Connectivity Issue (Transient): ', JSON.stringify(errInfo));
    // Do not throw for transient connection issues, let the SDK retry in background
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

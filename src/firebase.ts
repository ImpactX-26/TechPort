import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Applicant } from './types.ts';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(
  app, 
  (firebaseConfig as { firestoreDatabaseId: string }).firestoreDatabaseId
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handling standard per skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline, will use local persistence.');
    }
    return false;
  }
}

// Initialize check
testFirestoreConnection().catch(() => {});

// Sync applicant profile to Firestore
export async function syncApplicantToFirestore(applicant: Applicant): Promise<void> {
  const path = `applicants/${applicant.id}`;
  try {
    const payload = {
      ...applicant,
      lastSyncedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'applicants', applicant.id), payload, { merge: true });
    // Also store locally for fast reloads and offline resiliency
    localStorage.setItem(`germanpath_applicant_${applicant.id}`, JSON.stringify(payload));
  } catch (error) {
    console.warn('Firebase write notice (persisting locally):', error);
    // Keep local cache up-to-date
    localStorage.setItem(`germanpath_applicant_${applicant.id}`, JSON.stringify(applicant));
    // If permission or network error, let app continue with local storage
  }
}

// Fetch applicant profile from Firestore
export async function getApplicantFromFirestore(userId: string): Promise<Applicant | null> {
  const path = `applicants/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'applicants', userId));
    if (snap.exists()) {
      return snap.data() as Applicant;
    }
  } catch (error) {
    console.warn('Firebase read fallback to local cache:', error);
  }

  // Fallback to local storage
  const cached = localStorage.getItem(`germanpath_applicant_${userId}`);
  if (cached) {
    try {
      return JSON.parse(cached) as Applicant;
    } catch {
      return null;
    }
  }
  return null;
}

// Real-time listener for applicant changes
export function subscribeToApplicant(
  userId: string, 
  onUpdate: (applicant: Applicant) => void,
  onError?: (err: unknown) => void
) {
  const path = `applicants/${userId}`;
  return onSnapshot(
    doc(db, 'applicants', userId),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as Applicant);
      }
    },
    (error) => {
      console.warn('onSnapshot warning:', error);
      if (onError) onError(error);
    }
  );
}

// Firebase Auth helpers
export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function signUpWithEmail(email: string, pass: string) {
  return await createUserWithEmailAndPassword(auth, email, pass);
}

export async function loginWithEmail(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function logoutUser() {
  return await firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { User };

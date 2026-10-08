import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ApplicantEntity } from './types';

const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function sanitizeFirestoreId(rawId: string): string {
  // firestore.rules requires: id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')
  return rawId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, checking configuration:', error.message);
    }
  }
}

// Test connection on boot
testConnection();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    localStorage.removeItem('germanpath_active_applicant_id');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

/**
 * Persists an applicant and all progress directly to Firebase Firestore
 */
export async function syncApplicantToFirestore(applicant: ApplicantEntity): Promise<{ success: boolean; firestoreId: string; error?: string }> {
  try {
    const firestoreId = sanitizeFirestoreId(applicant.id);
    const applicantRef = doc(db, 'applicants', firestoreId);

    const dataToSave = {
      id: firestoreId,
      originalId: applicant.id,
      name: applicant.name,
      country: applicant.country || 'International',
      age: Number(applicant.age) || 24,
      goal: applicant.goal,
      germanLevel: applicant.germanLevel || 'Not yet started',
      completionPercentage: applicant.profile?.completionPercentage ?? 10,
      documentsCount: applicant.documents?.length ?? 0,
      documents: (applicant.documents || []).map(d => ({
        id: sanitizeFirestoreId(d.id),
        name: d.name,
        type: d.type,
        status: d.status,
        uploadedAt: d.uploadedAt
      })),
      qualificationStatus: applicant.qualification?.overallStatus || 'Incomplete',
      nextBestActionTitle: applicant.nextBestAction?.title || 'Upload First Document',
      updatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString()
    };

    await setDoc(applicantRef, dataToSave, { merge: true });
    console.log(`[Firebase Firestore] Successfully synced applicant document: applicants/${firestoreId}`);
    return { success: true, firestoreId };
  } catch (err: any) {
    console.warn('[Firebase Firestore] Sync warning:', err?.message || err);
    return { success: false, firestoreId: sanitizeFirestoreId(applicant.id), error: err?.message };
  }
}

/**
 * Checks and reads an applicant from Firebase Firestore
 */
export async function fetchApplicantFromFirestore(id: string): Promise<any | null> {
  try {
    const firestoreId = sanitizeFirestoreId(id);
    const docRef = doc(db, 'applicants', firestoreId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('[Firebase Firestore] Failed to fetch document:', err);
    return null;
  }
}

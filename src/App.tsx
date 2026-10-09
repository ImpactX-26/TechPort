import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Applicant } from './types.ts';
import { 
  auth, 
  onAuthStateChanged, 
  logoutUser, 
  syncApplicantToFirestore, 
  getApplicantFromFirestore 
} from './firebase.ts';
import { createFreshApplicant } from './api.ts';

export default function App() {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Monitor Firebase Auth state
  useEffect(() => {
    // Check local storage for persistent guest/cached state
    const cachedUid = localStorage.getItem('germanpath_active_user_id');
    if (cachedUid) {
      getApplicantFromFirestore(cachedUid).then((cached) => {
        if (cached) {
          setApplicant(cached);
          setLoading(false);
        }
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.setItem('germanpath_active_user_id', user.uid);
        const existing = await getApplicantFromFirestore(user.uid);
        if (existing) {
          setApplicant(existing);
        } else {
          // Fresh applicant with 0 documents as required
          const fresh = createFreshApplicant({
            id: user.uid,
            email: user.email || 'user@germanpath.ai',
            fullName: user.displayName || 'Candidate',
            goal: 'Work',
          });
          setApplicant(fresh);
          await syncApplicantToFirestore(fresh);
        }
      } else if (!cachedUid) {
        // Not logged in and no cache
        setApplicant(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = async (newApplicant: Applicant) => {
    setApplicant(newApplicant);
    localStorage.setItem('germanpath_active_user_id', newApplicant.id);
    await syncApplicantToFirestore(newApplicant);
  };

  const handleUpdateApplicant = async (updated: Applicant) => {
    setApplicant(updated);
    await syncApplicantToFirestore(updated);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    localStorage.removeItem('germanpath_active_user_id');
    setApplicant(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-red-500/30 border-t-amber-400 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Connecting to GermanPath AI Secured Registry...
        </p>
      </div>
    );
  }

  if (!applicant) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Dashboard
      applicant={applicant}
      onUpdateApplicant={handleUpdateApplicant}
      onLogout={handleLogout}
    />
  );
}

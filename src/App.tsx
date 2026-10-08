/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ApplicantEntity, GermanyGoal, DocumentType } from './types';
import { 
  loadDemoApplicant, 
  createApplicant, 
  updateProfile, 
  uploadDocument, 
  completeNextAction, 
  runPipeline,
  syncApplicantToServer
} from './api';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { DocumentsView } from './components/DocumentsView';
import { ProfileView } from './components/ProfileView';
import { QualificationView } from './components/QualificationView';
import { OnboardingModal } from './components/OnboardingModal';
import { CVGeneratorModal } from './components/CVGeneratorModal';
import { VideoIntroModal } from './components/VideoIntroModal';
import { LoginPage, AuthSuccessOptions } from './components/LoginPage';
import { FastUploadModal } from './components/FastUploadModal';
import { CelebrationEffect } from './components/CelebrationEffect';
import { Sparkles } from 'lucide-react';
import { syncApplicantToFirestore, logoutUser } from './firebase';
import { createFreshApplicant } from './utils/freshApplicant';

export default function App() {
  const [applicant, setApplicant] = useState<ApplicantEntity | null>(null);
  const [view, setView] = useState<'landing' | 'app' | 'login'>('landing');
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'signup'>('signin');
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'documents' | 'profile' | 'qualification'>('dashboard');
  
  // Modals
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showFastUploadModal, setShowFastUploadModal] = useState(false);
  const [uploadTargetType, setUploadTargetType] = useState<DocumentType | undefined>(undefined);
  
  // Celebrations & Feedback
  const [celebration, setCelebration] = useState<{
    show: boolean;
    title: string;
    subtitle: string;
    xpPoints?: number;
    securedTimestamp?: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to load demo applicant by pathway (For Judges/Demo Testing)
  const handleLoadDemo = async (type: 'malavika' | 'rahul' | 'elena' = 'malavika') => {
    setIsProcessing(true);
    try {
      const demo = await loadDemoApplicant(type);
      // Also sync demo applicant to Firebase Firestore!
      await syncApplicantToFirestore(demo);
      setApplicant(demo);
      setView('app');
      setCurrentTab('dashboard');

      const nowStamp = new Date().toLocaleString('en-DE', { dateStyle: 'medium', timeStyle: 'short' });

      if (type === 'malavika') {
        showToast('Student Pathway: Malavika J Dev (Study in Germany) loaded.');
        setCelebration({
          show: true,
          title: 'Student Track Activated',
          subtitle: 'Sapthagiri NPS Univ · CGPA 8.8 · 3-Layer Forensics & Uni-Assist VPD Readiness active.',
          xpPoints: 100,
          securedTimestamp: nowStamp
        });
      } else if (type === 'elena') {
        showToast('Ausbildung Pathway: Elena Rostova (Dual Vocational Training) loaded.');
        setCelebration({
          show: true,
          title: 'Ausbildung Track Activated',
          subtitle: 'Mechatronics & IT Dual Training · Goethe B2 Certified · IHK Registration Pipeline.',
          xpPoints: 100,
          securedTimestamp: nowStamp
        });
      } else {
        showToast('Skilled Worker Pathway: Rahul Sharma (Work in Germany / Chancenkarte) loaded.');
        setCelebration({
          show: true,
          title: 'Employee Track Activated',
          subtitle: 'Software Engineer · ZAB Statement of Comparability · Blue Card Eligibility active.',
          xpPoints: 100,
          securedTimestamp: nowStamp
        });
      }
    } catch (err) {
      console.error('Failed to load demo applicant', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle User Login or Sign-Up
  const handleAuthSuccess = async (options: AuthSuccessOptions) => {
    setIsProcessing(true);
    try {
      if (options.isNewUser) {
        // CRITICAL REQUIREMENT: Profile creation starts from the beginning!
        // ZERO sample documents uploaded by default!
        const fresh = createFreshApplicant({
          fullName: options.fullName,
          email: options.email,
          goal: options.goal || 'Study in Germany'
        });

        // Sync into server store
        await syncApplicantToServer(fresh);

        // Sync directly into Firebase Firestore!
        const firestoreSync = await syncApplicantToFirestore(fresh);
        console.log('Firebase sync status for new user:', firestoreSync);

        setApplicant(fresh);
        setView('app');
        setCurrentTab('dashboard');

        showToast(`Welcome ${fresh.name}! Profile created in Firebase Firestore with 0 sample documents.`);

        setCelebration({
          show: true,
          title: 'Profile Started in Firebase!',
          subtitle: `Welcome ${fresh.name}! Fresh profile initialized for ${fresh.goal}. Start by uploading your degree or passport.`,
          xpPoints: 100,
          securedTimestamp: new Date().toLocaleString('en-DE', { dateStyle: 'medium', timeStyle: 'short' })
        });
      } else if (options.demoType) {
        await handleLoadDemo(options.demoType);
      }
    } catch (err: any) {
      console.error('Error during auth success:', err);
      showToast('Signed in successfully.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    setIsProcessing(true);
    try {
      await logoutUser();
      setApplicant(null);
      setView('landing');
      showToast('You have signed out successfully.');
    } catch (err) {
      console.error('Failed to sign out', err);
      setApplicant(null);
      setView('landing');
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch Pathway from UI
  const handleSwitchPathway = async (pathway: GermanyGoal) => {
    if (!applicant) return;
    
    // Update active applicant's goal and sync to Firebase Firestore!
    const updated: ApplicantEntity = {
      ...applicant,
      goal: pathway,
      profile: {
        ...applicant.profile,
        goal: { value: pathway, source: 'user_provided' }
      },
      qualification: {
        ...applicant.qualification,
        targetGoal: pathway
      }
    };

    setApplicant(updated);
    await syncApplicantToServer(updated);
    await syncApplicantToFirestore(updated);
    showToast(`Pathway updated to: ${pathway}`);
  };

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleCreateApplicant = async (formData: any) => {
    setIsProcessing(true);
    try {
      const newApplicant = await createApplicant(formData);
      // Sync into Firebase Firestore
      await syncApplicantToFirestore(newApplicant);
      setApplicant(newApplicant);
      setShowOnboarding(false);
      setView('app');
      setCurrentTab('dashboard');
      showToast(`Welcome ${newApplicant.name}! Profile created & saved in Firebase Firestore.`);
      
      setCelebration({
        show: true,
        title: 'Welcome to GermanPath AI!',
        subtitle: `Journey initialized for ${newApplicant.goal}. Saved to Firebase database.`,
        xpPoints: 250,
        securedTimestamp: new Date().toLocaleString('en-DE', { dateStyle: 'medium', timeStyle: 'short' })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Complete Next Best Action (Interactive hackathon cycle with celebration!)
  const handleCompleteNextAction = async () => {
    if (!applicant) return;
    setIsProcessing(true);
    try {
      const res = await completeNextAction(applicant.id);
      setApplicant(res.applicant);
      // Sync update to Firebase Firestore!
      await syncApplicantToFirestore(res.applicant);
      showToast(res.summary || 'Next step completed! Updated in Firebase.');
      
      const nowStamp = new Date().toLocaleString('en-DE', { dateStyle: 'medium', timeStyle: 'short' });
      setCelebration({
        show: true,
        title: 'Step Completed & Saved!',
        subtitle: res.summary || 'Next action completed and saved to Firebase Firestore.',
        xpPoints: 150,
        securedTimestamp: nowStamp
      });
    } catch (err) {
      console.error('Failed to complete next action', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Document Upload with celebration and Firebase sync
  const handleUploadDocument = async (doc: { name: string; type: string; rawText: string; fileSize?: string }) => {
    if (!applicant) return;
    setIsProcessing(true);
    try {
      const res = await uploadDocument(applicant.id, doc);
      setApplicant(res.applicant);
      // Sync document update to Firebase Firestore!
      await syncApplicantToFirestore(res.applicant);
      showToast(`Document "${doc.name}" uploaded & saved to Firebase!`);

      const nowStamp = new Date().toLocaleString('en-DE', { dateStyle: 'medium', timeStyle: 'short' });
      setCelebration({
        show: true,
        title: 'Document Saved in Firebase!',
        subtitle: `"${doc.name}" was uploaded and synchronized to your Firebase Firestore document.`,
        xpPoints: 150,
        securedTimestamp: nowStamp
      });
    } catch (err) {
      console.error('Failed to upload document', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Profile Update with Firebase sync
  const handleUpdateProfile = async (updates: any) => {
    if (!applicant) return;
    setIsProcessing(true);
    try {
      const updatedProfile = await updateProfile(applicant.id, updates);
      const updatedApplicant = { ...applicant, profile: updatedProfile };
      setApplicant(updatedApplicant);
      // Sync profile update to Firebase Firestore!
      await syncApplicantToFirestore(updatedApplicant);
      showToast('Profile updated & synchronized to Firebase Firestore.');
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Re-Evaluate
  const handleTriggerReEvaluate = async () => {
    if (!applicant) return;
    setIsProcessing(true);
    try {
      const res = await runPipeline(applicant.id);
      setApplicant(res.applicant);
      await syncApplicantToFirestore(res.applicant);
      showToast('Requirements synchronized & evaluated.');
    } catch (err) {
      console.error('Failed to re-run pipeline', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const openUploadModal = (targetType?: DocumentType) => {
    setUploadTargetType(targetType);
    setShowFastUploadModal(true);
  };

  return (
    <div className="min-h-screen cosmic-mesh text-slate-100 font-sans flex flex-col selection:bg-amber-400 selection:text-slate-950 w-full overflow-x-hidden">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/30 flex items-center space-x-2.5 text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Celebration Burst Modal */}
      {celebration && (
        <CelebrationEffect
          show={celebration.show}
          title={celebration.title}
          subtitle={celebration.subtitle}
          xpPoints={celebration.xpPoints}
          securedTimestamp={celebration.securedTimestamp}
          onClose={() => setCelebration(null)}
        />
      )}

      {view === 'landing' ? (
        <LandingPage
          onStartJourney={handleStartOnboarding}
          onTryDemo={() => handleLoadDemo('malavika')}
          onOpenSignIn={() => { setAuthInitialTab('signin'); setView('login'); }}
          onOpenSignUp={() => { setAuthInitialTab('signup'); setView('login'); }}
        />
      ) : view === 'login' ? (
        <LoginPage
          initialTab={authInitialTab}
          onSuccessLogin={handleAuthSuccess}
          onCancel={() => setView(applicant ? 'app' : 'landing')}
        />
      ) : (
        <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
          {/* Main Top Navigation Header with SIGN OUT */}
          <Header
            currentApplicant={applicant}
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab as any)}
            onOpenUploadModal={() => openUploadModal()}
            onOpenCVModal={() => setShowCVModal(true)}
            onOpenVideoModal={() => setShowVideoModal(true)}
            onSignOut={handleSignOut}
            isProcessing={isProcessing}
          />

          {/* Main Body by Tab */}
          <main className="flex-1 w-full max-w-full overflow-x-hidden">
            {applicant && currentTab === 'dashboard' && (
              <Dashboard
                applicant={applicant}
                onCompleteAction={handleCompleteNextAction}
                onNavigateTab={(tab) => setCurrentTab(tab as any)}
                onTriggerReEvaluate={handleTriggerReEvaluate}
                onOpenUploadModal={(targetType) => openUploadModal(targetType)}
                onSwitchPathway={handleSwitchPathway}
                isProcessing={isProcessing}
              />
            )}

            {applicant && currentTab === 'documents' && (
              <DocumentsView
                documents={applicant.documents}
                onUploadDocument={handleUploadDocument}
                isProcessing={isProcessing}
              />
            )}

            {applicant && currentTab === 'profile' && (
              <ProfileView
                profile={applicant.profile}
                onUpdateProfile={handleUpdateProfile}
                isProcessing={isProcessing}
              />
            )}

            {applicant && currentTab === 'qualification' && (
              <QualificationView
                qualification={applicant.qualification}
                targetGoal={applicant.goal}
                onTriggerReEvaluate={handleTriggerReEvaluate}
                isProcessing={isProcessing}
              />
            )}
          </main>
        </div>
      )}

      {/* Streamlined Fast Upload Modal (System or Drive) */}
      <FastUploadModal
        isOpen={showFastUploadModal}
        onClose={() => setShowFastUploadModal(false)}
        onUpload={handleUploadDocument}
        isProcessing={isProcessing}
        targetDocumentType={uploadTargetType}
      />

      {/* Onboarding Multi-Step Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSubmit={handleCreateApplicant}
        isLoading={isProcessing}
      />

      {/* German Lebenslauf CV Builder Modal */}
      {applicant && (
        <CVGeneratorModal
          isOpen={showCVModal}
          onClose={() => setShowCVModal(false)}
          applicant={applicant}
        />
      )}

      {/* Introduction Video Pitch Modal */}
      {applicant && (
        <VideoIntroModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          applicant={applicant}
          onProfileUpdated={(updated) => {
            setApplicant(updated);
            syncApplicantToFirestore(updated);
            showToast('Video insights synced with your profile & Firebase!');
          }}
        />
      )}

    </div>
  );
}

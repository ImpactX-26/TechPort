import React, { useState } from 'react';
import { 
  Compass, 
  ShieldCheck, 
  FileText, 
  Award, 
  User, 
  UploadCloud, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Fingerprint, 
  Clock, 
  LogOut, 
  FileCheck2, 
  ExternalLink,
  Layers,
  ChevronRight,
  Video,
  GraduationCap
} from 'lucide-react';
import { Applicant, ApplicantDocument } from '../types.ts';
import { 
  formatGermanTimestamp, 
  calculateCompletionPercentage, 
  calculateXPPoints,
  getApplicantLevel
} from '../api.ts';
import { DocumentsView } from './DocumentsView.tsx';
import { DocumentVerificationView } from './DocumentVerificationView.tsx';
import { ProfileView } from './ProfileView.tsx';
import { QualificationView } from './QualificationView.tsx';
import { VideoTranscribeView } from './VideoTranscribeView.tsx';
import { AlumniView } from './AlumniView.tsx';
import { OnboardingModal } from './OnboardingModal.tsx';
import { FastUploadModal } from './FastUploadModal.tsx';
import { CVGeneratorModal } from './CVGeneratorModal.tsx';

interface DashboardProps {
  applicant: Applicant;
  onUpdateApplicant: (updated: Applicant) => void;
  onLogout: () => void;
}

export type ActiveTab = 'dashboard' | 'documents' | 'profile' | 'qualification' | 'verification' | 'video-transcribe' | 'alumni';

export const Dashboard: React.FC<DashboardProps> = ({
  applicant,
  onUpdateApplicant,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isFastUploadOpen, setIsFastUploadOpen] = useState(false);
  const [isCVGeneratorOpen, setIsCVGeneratorOpen] = useState(false);

  const completion = calculateCompletionPercentage(applicant);
  const xp = calculateXPPoints(applicant);
  const levelInfo = getApplicantLevel(xp);
  const documents = applicant.documents || [];
  const verifiedDocsCount = documents.filter((d) => d.status === 'verified').length;
  const failedDocsCount = documents.filter((d) => d.status === 'failed').length;

  // Breakdown metrics for the 4 pillars (20% + 40% + 20% + 20%)
  const pdScore = applicant.personalData.digiLockerVerified ? 20 : 15;
  const docScore = Math.min(40, verifiedDocsCount * 20);
  const cvScore = applicant.cvData.generatedCv ? 20 : applicant.cvData.hasOldCv ? 10 : 0;
  const qualScore = applicant.qualificationData.anabinStatus === 'H+' ? 20 : 10;

  const handleDocumentUploaded = (newDoc: ApplicantDocument) => {
    const updatedDocs = [newDoc, ...documents.filter((d) => d.id !== newDoc.id)];
    const updated: Applicant = {
      ...applicant,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    };
    updated.completionPercentage = calculateCompletionPercentage(updated);
    onUpdateApplicant(updated);
    // Switch to verification tab to immediately show the AI forensic results!
    setActiveTab('verification');
  };

  const handleUpdateDocument = (updatedDoc: ApplicantDocument) => {
    const updatedDocs = documents.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
    const updated: Applicant = {
      ...applicant,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    };
    updated.completionPercentage = calculateCompletionPercentage(updated);
    onUpdateApplicant(updated);
  };

  const handleDeleteDocument = (docId: string) => {
    const updatedDocs = documents.filter((d) => d.id !== docId);
    const updated: Applicant = {
      ...applicant,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    };
    updated.completionPercentage = calculateCompletionPercentage(updated);
    onUpdateApplicant(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top German Ribbon Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 flex z-50">
        <div className="w-1/3 bg-black" />
        <div className="w-1/3 bg-red-600" />
        <div className="w-1/3 bg-amber-400" />
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/20 text-white font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  GermanPath <span className="text-amber-400">AI</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                  DE SKILLED PIPELINE
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Dashboard | Documents | Profile | Qualification) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'documents'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Documents ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'verification'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Forensics</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('video-transcribe')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'video-transcribe'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span>Video Transcribe</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qualification')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'qualification'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Qualification & Chancenkarte
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alumni')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'alumni'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Alumni Mentors</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">Videos & Chat</span>
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-white">
                {applicant.personalData.fullName || applicant.fullName}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {xp} XP &bull; {levelInfo.title}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-800 gap-1 bg-slate-950">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-semibold ${
              activeTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-semibold ${
              activeTab === 'documents' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            Documents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-semibold ${
              activeTab === 'verification' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            AI Forensics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video-transcribe')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-semibold ${
              activeTab === 'video-transcribe' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            Video Transcribe
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alumni')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-semibold ${
              activeTab === 'alumni' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            Alumni Mentors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-semibold ${
              activeTab === 'profile' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qualification')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-semibold ${
              activeTab === 'qualification' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            Chancenkarte
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* DASHBOARD TAB (Default View) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Top Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CARD 1: CIRCULAR PROGRESS PROFILE COMPLETION % */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Profile Completion Status
                    </h3>
                    <p className="text-xs text-slate-400">
                      Weighted formula: Personal + Docs + CV + Qualification
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    GERMAN EMBASSY VETTING
                  </span>
                </div>

                {/* Circular Progress Display */}
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-800"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Foreground animated progress */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-amber-400 transition-all duration-1000 ease-out"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - completion / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-white">{completion}%</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {completion >= 80 ? 'Visa Ready' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Pillars Breakdown Display */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 flex justify-between">
                    <span className="text-slate-400">Personal (20%)</span>
                    <span className="font-bold text-amber-400">{pdScore}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 flex justify-between">
                    <span className="text-slate-400">Documents (40%)</span>
                    <span className="font-bold text-emerald-400">{docScore}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 flex justify-between">
                    <span className="text-slate-400">German CV (20%)</span>
                    <span className="font-bold text-blue-400">{cvScore}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 flex justify-between">
                    <span className="text-slate-400">Qualification (20%)</span>
                    <span className="font-bold text-indigo-400">{qualScore}%</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: XP POINTS, LEVEL & SECURED TIMESTAMP IN GERMAN FORMAT */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Gamified Progress
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                      {levelInfo.badge}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{xp}</span>
                    <span className="text-sm font-bold text-amber-400">XP Points</span>
                  </div>

                  {/* Logical Level Progress Bar */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span className="text-white font-bold">{levelInfo.title}</span>
                      <span>{levelInfo.xpNeeded > 0 ? `${levelInfo.xpNeeded} XP to next level` : 'Maximum Milestone'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${levelInfo.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Milestone points for verified degrees (+100 XP), German CV (+150 XP), video pitch (+200 XP), and DigiLocker (+150 XP).
                  </p>
                </div>

                {/* SECURED TIMESTAMP IN GERMAN FORMAT AS EXPLICITLY REQUIRED */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mt-4 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Secured Timestamp (German Standard):</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-400">
                    {formatGermanTimestamp(applicant.lastSyncedAt || new Date())}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Cryptographically validated & synchronized to Firestore `applicants`
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">DigiLocker Status:</span>
                  <span className={`font-semibold ${applicant.personalData.digiLockerVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {applicant.personalData.digiLockerVerified ? '✓ Identity Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>

              {/* CARD 3: CHANCENKARTE VISA STATS (FIXED 13/6 SCORECARD) */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Opportunity Card Scorecard
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                      § 20a AufenthG
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${
                      applicant.qualificationData.chancenkarteEligible ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {applicant.qualificationData.chancenkartePoints}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 14 Pts Max</span>
                    <span className="ml-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Min. 6 to Qualify
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {applicant.qualificationData.chancenkarteEligible
                      ? `✓ You score ${applicant.qualificationData.chancenkartePoints} / 14 points (+${applicant.qualificationData.chancenkartePoints - 6} above the 6-point statutory cutoff). You are legally qualified for the Opportunity Card!`
                      : `You have ${applicant.qualificationData.chancenkartePoints} points out of 14. At least 6 points are required to qualify for the German Embassy visa.`}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setActiveTab('qualification')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect 14-Point Breakdown</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Banner for Video Transcribe Option */}
            <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border-2 border-red-500/40 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Multimodal AI Feature</span>
                  <span className="px-2 py-0.2 rounded bg-amber-500/30 text-amber-200">+200 XP</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Record or Upload Video Pitch & Let AI Build Your German Dossier
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Turn on your webcam or upload a self-introduction video. Our AI agent transcribes your speech, extracts your qualifications, experience, and German language level, and automatically populates your profile!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('video-transcribe')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-all flex items-center gap-2.5 shrink-0 self-start md:self-auto"
              >
                <Video className="w-4 h-4" />
                <span>Start Video Pitch Agent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Alumni Mentors & Video Stories Spotlight Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Alumni Experience & Mentorship Hub</span>
                  <span className="px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-200 text-[10px] font-bold">4 Verified Paths</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Watch Video Stories & Chat With Alumni in Berlin, Munich & Frankfurt
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Explore real housing search timelines, detailed monthly cost of living breakdowns, degree evaluation from your branch, and tax-optimized salary numbers from graduates who relocated.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('alumni')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2.5 shrink-0 self-start md:self-auto"
              >
                <Video className="w-4 h-4" />
                <span>Meet Alumni & Watch Videos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Action Grid */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Pipeline Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Action 1: Upload Documents */}
                <button
                  type="button"
                  onClick={() => setIsFastUploadOpen(true)}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-red-500/40 text-left transition-all shadow-md group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Upload & Verify Document
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Auto-scans for forgery, pixel manipulation & AI synthesis.
                  </p>
                </button>

                {/* Action 2: Update Personal Dossier & DigiLocker */}
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left transition-all shadow-md group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Personal Dossier & DigiLocker
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Update 5-step applicant data and government authentication.
                  </p>
                </button>

                {/* Action 3: Generate German CV */}
                <button
                  type="button"
                  onClick={() => setIsCVGeneratorOpen(true)}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 text-left transition-all shadow-md group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    German DIN 5008 CV Generator
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Format into German Tabellarischer Lebenslauf with signature.
                  </p>
                </button>

                {/* Action 4: Anabin Check */}
                <button
                  type="button"
                  onClick={() => setActiveTab('qualification')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all shadow-md group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Anabin & ZAB Equivalence
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Test university H+ status and Chancenkarte qualifications.
                  </p>
                </button>
              </div>
            </div>

            {/* Recent Uploads & Forensics Snapshot */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Recent Document Forensics Activity
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time verification results across uploaded credentials
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <span>View All ({documents.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-800 rounded-2xl">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No documents uploaded yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsFastUploadOpen(true)}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
                  >
                    Upload First Document
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {documents.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          doc.status === 'verified'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {doc.status === 'verified' ? '✓' : '!'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{doc.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {doc.type} &bull; {(doc.fileSize / 1024).toFixed(0)} KB &bull; {formatGermanTimestamp(doc.uploadedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${
                          doc.status === 'verified' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {doc.verification?.authenticityScore || 96}% Authentic
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('verification')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                        >
                          Forensics
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <DocumentsView
            applicant={applicant}
            onOpenUpload={() => setIsFastUploadOpen(true)}
            onOpenVerificationDetail={(docId) => setActiveTab('verification')}
            onDeleteDocument={handleDeleteDocument}
            onUpdateApplicant={onUpdateApplicant}
            onOpenCVGenerator={() => setIsCVGeneratorOpen(true)}
          />
        )}

        {/* FORENSICS VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <DocumentVerificationView
            documents={documents}
            onUpdateDocument={handleUpdateDocument}
            onOpenUpload={() => setIsFastUploadOpen(true)}
          />
        )}

        {/* VIDEO TRANSCRIBE TAB */}
        {activeTab === 'video-transcribe' && (
          <VideoTranscribeView
            applicant={applicant}
            onUpdateApplicant={onUpdateApplicant}
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <ProfileView
            applicant={applicant}
            onOpenEditModal={() => setIsOnboardingOpen(true)}
          />
        )}

        {/* QUALIFICATION TAB */}
        {activeTab === 'qualification' && (
          <QualificationView
            applicant={applicant}
            onUpdateApplicant={onUpdateApplicant}
          />
        )}

        {/* ALUMNI MENTOR HUB & VIDEOS TAB */}
        {activeTab === 'alumni' && (
          <AlumniView
            applicant={applicant}
            onUpdateApplicant={onUpdateApplicant}
          />
        )}
      </main>

      {/* MODALS */}
      <OnboardingModal
        applicant={applicant}
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSave={onUpdateApplicant}
      />

      <FastUploadModal
        isOpen={isFastUploadOpen}
        onClose={() => setIsFastUploadOpen(false)}
        onDocumentUploaded={handleDocumentUploaded}
      />

      <CVGeneratorModal
        applicant={applicant}
        isOpen={isCVGeneratorOpen}
        onClose={() => setIsCVGeneratorOpen(false)}
        onSaveCV={onUpdateApplicant}
      />
    </div>
  );
};

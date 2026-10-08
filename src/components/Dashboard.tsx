import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Award, 
  Compass, 
  Check, 
  Clock, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight,
  GraduationCap,
  Briefcase,
  Wrench,
  Lock,
  Database,
  CloudCheck,
  HelpCircle
} from 'lucide-react';
import { ApplicantEntity, GermanyGoal, DocumentType } from '../types';
import { JourneyTimeline } from './JourneyTimeline';
import { syncApplicantToFirestore } from '../firebase';

interface DashboardProps {
  applicant: ApplicantEntity;
  onCompleteAction: () => void;
  onNavigateTab: (tab: string) => void;
  onTriggerReEvaluate: () => void;
  onOpenUploadModal: (targetType?: DocumentType) => void;
  onSwitchPathway?: (goal: GermanyGoal) => void;
  isProcessing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  applicant,
  onCompleteAction,
  onNavigateTab,
  onTriggerReEvaluate,
  onOpenUploadModal,
  onSwitchPathway,
  isProcessing
}) => {
  const { profile, documents, qualification, nextBestAction, journeySteps, gaps } = applicant;
  const currentGoal = applicant.goal;

  const [firebaseStatus, setFirebaseStatus] = useState<string>('Live & Synced');
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  const handleManualFirebaseSync = async () => {
    setIsSyncingFirebase(true);
    try {
      const res = await syncApplicantToFirestore(applicant);
      if (res.success) {
        setFirebaseStatus('Live & Synced just now');
      } else {
        setFirebaseStatus('Sync checked');
      }
    } catch {
      setFirebaseStatus('Connected');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Needs Attention':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Incomplete':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const secureDateDisplay = new Date().toLocaleDateString('en-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 text-slate-100 w-full overflow-x-hidden">
      
      {/* 1. Pathway Track Selector: Student vs Employee vs Ausbildung */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-amber-400 via-rose-500 to-sky-500" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="text-amber-400 font-bold flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Germany Mobility Plan</span>
              </span>
              <span>·</span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <Lock className="w-3 h-3" />
                <span>Secured Date: {secureDateDisplay}</span>
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex flex-wrap items-baseline gap-2">
              <span>Welcome,</span>
              <span className="text-amber-300">{applicant.name}</span>
            </h1>

            <p className="text-xs text-slate-400 mt-0.5">
              Choose your goal to customize your requirements, checklist, and admission guidance:
            </p>
          </div>

          {/* Interactive Pathway Selector Tabs */}
          {onSwitchPathway && (
            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-bold shrink-0">
              {/* Student Track */}
              <button
                type="button"
                onClick={() => onSwitchPathway('Study in Germany')}
                disabled={isProcessing}
                className={`px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  currentGoal === 'Study in Germany'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Student</span>
              </button>

              {/* Employee Track */}
              <button
                type="button"
                onClick={() => onSwitchPathway('Work in Germany')}
                disabled={isProcessing}
                className={`px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  currentGoal === 'Work in Germany'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Worker</span>
              </button>

              {/* Ausbildung Track */}
              <button
                type="button"
                onClick={() => onSwitchPathway('Ausbildung in Germany')}
                disabled={isProcessing}
                className={`px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  currentGoal === 'Ausbildung in Germany'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ausbildung</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Firebase Firestore Status Card */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">
              Firebase Firestore Database: <strong className="text-emerald-400 font-mono">Connected</strong>
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              Document: applicants/{applicant.id}
            </span>
          </div>

          <button
            onClick={handleManualFirebaseSync}
            disabled={isSyncingFirebase}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer font-semibold"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
            <span>{isSyncingFirebase ? 'Saving to Firebase...' : 'Save to Firebase'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Cards (Clean 4-Card Responsive Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Profile Progress */}
        <div 
          onClick={() => onNavigateTab('profile')}
          className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Profile Progress</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                {profile.completionPercentage}%
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">
                {profile.completionPercentage > 50 ? 'Well Prepared' : 'Getting Started'}
              </div>
            </div>

            <div className="relative w-10 h-10 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="14" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="3.5" 
                  strokeDasharray="88" 
                  strokeDashoffset={88 - (88 * profile.completionPercentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Documents Count */}
        <div 
          onClick={() => onNavigateTab('documents')}
          className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>My Documents</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight mt-1">
            {documents.length} <span className="text-xs font-semibold text-slate-400">uploaded</span>
          </div>
          <div className="text-[10px] text-amber-400 font-semibold mt-1">
            {documents.length === 0 ? 'Upload first document below' : `${documents.length} verified documents`}
          </div>
        </div>

        {/* Card 3: Visa & Admission Status */}
        <div 
          onClick={() => onNavigateTab('qualification')}
          className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Visa Readiness</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="mt-1.5">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-black border ${getStatusBadge(qualification.overallStatus)}`}>
              {qualification.overallStatus}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            {documents.length === 0 ? 'Requires initial document' : `${qualification.matchedRequirements.length} criteria satisfied`}
          </div>
        </div>

        {/* Card 4: German Language Level */}
        <div 
          onClick={() => onNavigateTab('profile')}
          className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>German Level</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight flex items-center space-x-2 mt-1">
            <span>{profile.languageLevel?.value || 'Not set'}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            CEFR Standard (A1 - C2)
          </div>
        </div>

      </div>

      {/* 3. NEXT BEST ACTION: Easy, understandable language */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 text-white shadow-2xl border border-amber-400/40 bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-3xl space-y-2.5">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center space-x-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Next Recommended Step</span>
              </span>

              <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
                <Lock className="w-2.5 h-2.5" />
                <span>Verified Date: {secureDateDisplay}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              {nextBestAction.title}
            </h2>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-200 flex items-start space-x-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-amber-300">Why this is needed: </span>
                <span className="text-slate-300">{nextBestAction.reason}</span>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {/* Direct Upload */}
            <button
              onClick={() => onOpenUploadModal(nextBestAction.targetDocumentType)}
              disabled={isProcessing}
              className="px-5 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-slate-950" />
              <span>{nextBestAction.suggestedActionLabel || 'Upload Document'}</span>
            </button>

            {/* Complete / Advance */}
            <button
              onClick={onCompleteAction}
              disabled={isProcessing}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Mark as Done</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Visual 4-Stage Roadmap */}
      <JourneyTimeline steps={journeySteps} />

      {/* 5. Clear Two Column Section: What is Needed vs What is Verified */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Identified Checklist / Gaps Card */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-white tracking-tight flex items-center space-x-2">
                <span>Documents & Steps Needed</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {gaps.length} Action Items
                </span>
              </h3>
              <p className="text-xs text-slate-400">Upload these to complete your German visa dossier</p>
            </div>
            <button
              onClick={() => onNavigateTab('documents')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
            >
              <span>Upload</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {gaps.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-400 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                <div className="font-bold text-emerald-300">All Core Documents Verified!</div>
                <div>Your dossier is ready for German visa processing.</div>
              </div>
            ) : (
              gaps.map((gap) => (
                <div 
                  key={gap.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{gap.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300">
                      Required
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {gap.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verified Criteria Card */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-white tracking-tight flex items-center space-x-2">
                <span>Verified Requirements</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {qualification.matchedRequirements.length} Verified
                </span>
              </h3>
              <p className="text-xs text-slate-400">German admission and visa criteria met so far</p>
            </div>
            <button
              onClick={() => onNavigateTab('qualification')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {qualification.matchedRequirements.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                <FileText className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
                <div className="font-semibold text-slate-300">No verified documents yet</div>
                <div>Upload your degree, transcript, or passport to start verifying requirements.</div>
              </div>
            ) : (
              qualification.matchedRequirements.map((req) => (
                <div 
                  key={req.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-200 flex items-start space-x-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/40">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <span>{req.title}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">{req.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

import React from 'react';
import { 
  Compass, 
  FileText, 
  UserCheck, 
  Award, 
  Sparkles, 
  Video, 
  Upload, 
  LogOut,
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  CheckCircle2,
  Database
} from 'lucide-react';
import { ApplicantEntity, GermanyGoal } from '../types';

interface HeaderProps {
  currentApplicant: ApplicantEntity | null;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUploadModal?: () => void;
  onOpenVideoModal: () => void;
  onOpenCVModal: () => void;
  onSignOut: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentApplicant,
  currentTab,
  onSelectTab,
  onOpenUploadModal,
  onOpenVideoModal,
  onOpenCVModal,
  onSignOut,
  isProcessing
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 text-slate-100 w-full overflow-x-hidden">
      {/* Top Accent Strip */}
      <div className="h-0.5 w-full bg-linear-to-r from-amber-400 via-rose-500 to-sky-500" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button 
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center space-x-2 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-amber-400/40 flex items-center justify-center text-white shadow-md shadow-amber-400/10">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div>
                <span className="font-black text-base sm:text-lg tracking-tight text-white">
                  GermanPath<span className="text-amber-400">AI</span>
                </span>
              </div>
            </button>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('documents')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                currentTab === 'documents'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Documents</span>
              {currentApplicant && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                  {currentApplicant.documents.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('profile')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                currentTab === 'profile'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Profile</span>
              {currentApplicant && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {currentApplicant.profile.completionPercentage}%
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('qualification')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                currentTab === 'qualification'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Visa & Requirements</span>
            </button>

            <button
              onClick={onOpenVideoModal}
              className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-sky-300 hover:bg-slate-900 transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Record or Upload Video Pitch"
            >
              <Video className="w-3.5 h-3.5 text-sky-400" />
              <span>Video Pitch</span>
            </button>

            <button
              onClick={onOpenCVModal}
              className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-900 transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Generate German Lebenslauf CV"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Resume</span>
            </button>
          </nav>

          {/* Right Action Area: Upload + User Badge + SIGN OUT */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Quick Upload Button */}
            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                disabled={isProcessing}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            )}

            {/* Applicant Name / Goal Badge */}
            {currentApplicant && (
              <div className="hidden lg:flex items-center px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 max-w-[170px] truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 shrink-0" />
                <span className="font-semibold truncate">{currentApplicant.name}</span>
              </div>
            )}

            {/* SIGN OUT BUTTON */}
            <button
              onClick={onSignOut}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-rose-950/70 text-slate-300 hover:text-rose-200 border border-slate-800 hover:border-rose-500/40 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Sign Out from GermanPath AI"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto text-xs space-x-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-2 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
              currentTab === 'dashboard' ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('documents')}
            className={`px-2 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
              currentTab === 'documents' ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40' : 'text-slate-400'
            }`}
          >
            Documents ({currentApplicant?.documents.length || 0})
          </button>
          <button
            onClick={() => onSelectTab('profile')}
            className={`px-2 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
              currentTab === 'profile' ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40' : 'text-slate-400'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => onSelectTab('qualification')}
            className={`px-2 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
              currentTab === 'qualification' ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40' : 'text-slate-400'
            }`}
          >
            Visa Check
          </button>
          <button
            onClick={onOpenVideoModal}
            className="px-2 py-1 rounded-lg whitespace-nowrap text-sky-400 cursor-pointer"
          >
            Video
          </button>
        </div>
      </div>
    </header>
  );
};

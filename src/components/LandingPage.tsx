import React from 'react';
import { 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  FileCheck2, 
  FileSearch, 
  Activity, 
  Play, 
  Briefcase, 
  GraduationCap, 
  Wrench,
  Lock,
  Zap,
  Layers,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onStartJourney: () => void;
  onTryDemo: () => void;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartJourney,
  onTryDemo,
  onOpenSignIn,
  onOpenSignUp
}) => {
  return (
    <div className="min-h-screen cosmic-mesh text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Precision Germany Accent Bar */}
      <div className="h-0.5 w-full bg-linear-to-r from-amber-400 via-rose-500 to-sky-500 opacity-80" />

      {/* Top Navigation Bar on Landing Page */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-sm tracking-tight text-white flex items-center space-x-1">
              <span>GermanPath</span>
              <span className="text-amber-400">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono -mt-0.5">
              Intelligent Journey
            </div>
          </div>
        </div>

        {/* Right Auth Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenSignIn}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            Sign In
          </button>

          <button
            onClick={onOpenSignUp}
            className="px-4 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-6 pb-20 lg:pt-10 lg:pb-28">
        
        {/* Soft glowing ambient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-60 -z-10" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl opacity-50 -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Pill with Security guarantee */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-semibold text-slate-300 shadow-xl mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>AI-Powered Applicant Journey for Germany</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 flex items-center space-x-1 font-mono text-[11px]">
              <Lock className="w-3 h-3" />
              <span>DSGVO / EU GDPR Secured</span>
            </span>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            GERMANPATH <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-rose-400 to-sky-400">AI</span>
          </h1>
          
          <p className="mt-4 text-xl sm:text-2xl font-bold text-slate-200 tracking-tight">
            “Your journey to Germany, intelligently guided.”
          </p>

          <p className="mt-2 text-sm sm:text-base font-medium text-amber-300/90">
            “Understand your profile. Find the gaps. Take the next best step.”
          </p>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An AI-powered applicant journey that understands your profile, analyzes your documents with 3-layer forensics,
            identifies gaps, and continuously recommends your <span className="font-bold text-amber-400">next best action</span>.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartJourney}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <span>Start My Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Launch Live Demo Track</span>
            </button>
          </div>

          {/* Architectural Guarantee Banner */}
          <div className="mt-8 inline-flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800 backdrop-blur-md">
            <BrainCircuit className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Autonomous multi-agent system: Orchestrator, Document Forensic, Profile, Qualification, Gap, & Routing Agents.</span>
          </div>

          {/* Visual Journey Flow in Cosmic Glass */}
          <div className="mt-16 glass-card rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl text-left">
            <div className="text-xs font-black uppercase tracking-wider text-amber-400 mb-6 flex items-center justify-between">
              <span>The Agentic Journey Loop</span>
              <span className="text-[11px] text-slate-400 font-mono">Observe · Reason · Decide · Guide</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 items-center">
              {[
                { title: 'Profile', sub: 'Verified inputs', icon: GraduationCap },
                { title: 'Documents', sub: 'PDF / Video upload', icon: FileCheck2 },
                { title: 'AI Forensics', sub: '3-Layer audit', icon: FileSearch },
                { title: 'Qualification', sub: 'Visa benchmark', icon: ShieldCheck },
                { title: 'Gap Detection', sub: 'Flag anomalies', icon: Activity },
                { title: 'Next Best Action', sub: 'Autonomous route', icon: Sparkles, highlight: true },
                { title: 'Journey Progress', sub: 'Dynamic states', icon: CheckCircle2 }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative group">
                    <div className={`p-4 rounded-2xl border text-center transition-all ${
                      step.highlight 
                        ? 'bg-amber-500/20 border-amber-400/50 shadow-lg shadow-amber-500/10' 
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}>
                      <div className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                        step.highlight ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className={`text-xs font-black leading-tight ${step.highlight ? 'text-amber-300' : 'text-white'}`}>
                        {step.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {step.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Pathways: Student vs Employee vs Ausbildung */}
          <div className="mt-16 text-left">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6">
              Tailored Pathways for Germany
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* 1. Student Track */}
              <div className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-sky-500/40 transition-all flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-sm text-white">Study in Germany (Student)</div>
                  <div className="text-xs text-slate-400 mt-1">
                    APS Certificate, Anabin H+ Institution, Uni-Assist VPD, TestDaF/Goethe & Blocked Account (€11,904).
                  </div>
                </div>
              </div>

              {/* 2. Employee Track */}
              <div className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-amber-500/40 transition-all flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-sm text-white">Work in Germany (Employee)</div>
                  <div className="text-xs text-slate-400 mt-1">
                    EU Blue Card (§18g), Chancenkarte Opportunity Card, ZAB Statement of Comparability & Verified Experience.
                  </div>
                </div>
              </div>

              {/* 3. Ausbildung Track */}
              <div className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-emerald-500/40 transition-all flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-sm text-white">Ausbildung in Germany</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Dual Vocational Training, Goethe B1/B2 Certification, School Diploma Equivalence & Ausbildungsvertrag.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Three Key Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-amber-400/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-400/20">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Understand your profile</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Consolidates personal information, education, experience, and CEFR German language level into a unified profile with field-level provenance tracking.
              </p>
            </div>

            <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-sky-400/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center mb-4 border border-sky-400/20">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Identify what is missing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The Gap Agent automatically detects missing documents, incomplete fields, and cross-source discrepancies before embassies or universities do.
              </p>
            </div>

            <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-emerald-400/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-400/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Know what to do next</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our Routing Agent computes your Next Best Action dynamically: complete the task, and the system re-reasons to reveal your next milestone.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">GermanPath AI</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <Lock className="w-2.5 h-2.5" />
              <span>DSGVO / EU GDPR Compliance Certified</span>
            </span>
          </div>
          <div className="text-slate-400">
            “We don't just answer the applicant. We move the applicant forward.”
          </div>
        </div>
      </footer>
    </div>
  );
};

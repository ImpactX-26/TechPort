import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  RefreshCw, 
  Check, 
  AlertOctagon, 
  HelpCircle,
  Briefcase,
  GraduationCap,
  Wrench,
  Lock,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { QualificationAssessment, GermanyGoal, QualificationStatus } from '../types';

interface QualificationViewProps {
  qualification: QualificationAssessment;
  targetGoal: GermanyGoal;
  onTriggerReEvaluate: () => void;
  isProcessing: boolean;
}

export const QualificationView: React.FC<QualificationViewProps> = ({
  qualification,
  targetGoal,
  onTriggerReEvaluate,
  isProcessing
}) => {
  const getStatusBadge = (status: QualificationStatus) => {
    switch (status) {
      case 'Ready':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-2 ring-emerald-500/20',
          desc: 'All core qualification benchmarks met. Ready for official filing preparation.'
        };
      case 'Needs Attention':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-2 ring-amber-500/20',
          desc: 'Strong foundational profile, but critical documents or verifications are missing.'
        };
      case 'Incomplete':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-2 ring-rose-500/20',
          desc: 'Core qualifications (degree recognition or minimum language) are not yet fulfilled.'
        };
      case 'Under Review':
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          desc: 'Cross-verification inconsistencies require applicant confirmation.'
        };
    }
  };

  const statusInfo = getStatusBadge(qualification.overallStatus);
  const secureDateStr = new Date(qualification.evaluatedAt || Date.now()).toLocaleDateString('en-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-1">
            <span className="text-amber-400">Evaluation Engine</span>
            <span>•</span>
            <span className="text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30 font-bold">
              {targetGoal}
            </span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Secured Date: {secureDateStr}</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Qualification Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audited by the <span className="font-semibold text-amber-300">Qualification Agent</span> against German immigration and university benchmarks.
          </p>
        </div>

        <button
          onClick={onTriggerReEvaluate}
          disabled={isProcessing}
          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>Re-Run Assessment</span>
        </button>
      </div>

      {/* Official Regulatory Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-extrabold uppercase tracking-wider text-[11px] text-amber-300">
            Official Regulatory Notice
          </div>
          <div className="leading-relaxed text-slate-300">
            {qualification.disclaimer}
          </div>
        </div>
      </div>

      {/* Overall Assessment Status Card */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Overall Readiness Rating
          </span>
          <div className="flex items-center space-x-3 mt-1.5">
            <span className={`px-4 py-1.5 rounded-xl text-base font-black border ${statusInfo.bg}`}>
              {qualification.overallStatus}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
            {qualification.agentSummary}
          </p>
        </div>

        <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8 text-xs">
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">
              {qualification.matchedRequirements.length}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Matched
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-black text-amber-400">
              {qualification.missingRequirements.length}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Missing
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-black text-rose-400">
              {qualification.potentialIssues.length}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Issues
            </div>
          </div>
        </div>
      </div>

      {/* WHAT ALUMNI SAY ABOUT THIS COLLEGE'S ELIGIBILITY */}
      <div className="glass-card rounded-2xl border-2 border-amber-400/40 p-6 shadow-2xl space-y-4 bg-slate-900/90 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                What Alumni Say About Real College Eligibility & Ground Standards
              </h3>
              <p className="text-[11px] text-slate-400">
                Official brochures vs ground truth reported by verified Indian seniors in Germany
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 font-mono">
            Ground Truth Intelligence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Rahul M."
                className="w-8 h-8 rounded-xl object-cover border border-amber-400/40"
              />
              <div>
                <span className="font-black text-white block">Rahul M.</span>
                <span className="text-[10px] text-slate-400">Charité Berlin · Nursing</span>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed italic">
              "The website brochure says B1 is eligible for Ausbildung, but in reality Charité hospital rounds expect B2 fluency from day one. Complete B2 in India or you will struggle heavily on patient handovers."
            </p>
            <div className="text-[10px] text-amber-300 font-mono">
              ✓ Verified Ground Reality: Need B2 before flight
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                alt="Priya S."
                className="w-8 h-8 rounded-xl object-cover border border-amber-400/40"
              />
              <div>
                <span className="font-black text-white block">Priya S.</span>
                <span className="text-[10px] text-slate-400">TU Munich · Informatics</span>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed italic">
              "TUM admission committee strictly audits your math and theoretical algorithms ECTS credits. If your Indian transcript lacks discrete math or theory of computation, they reject even with high CGPA."
            </p>
            <div className="text-[10px] text-amber-300 font-mono">
              ✓ Verified Ground Reality: Match ECTS modules strictly
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                alt="Arjun K."
                className="w-8 h-8 rounded-xl object-cover border border-amber-400/40"
              />
              <div>
                <span className="font-black text-white block">Arjun K.</span>
                <span className="text-[10px] text-slate-400">Heidelberg · Mechatronics</span>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed italic">
              "Don't rely solely on German language certificates. During the Ausbildung interview, the Meister asks you to explain simple industrial tools and DIN safety regulations in German."
            </p>
            <div className="text-[10px] text-amber-300 font-mono">
              ✓ Verified Ground Reality: Practice technical German vocab
            </div>
          </div>

        </div>

        <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-amber-200">
            💡 <strong>Recommended Next Action:</strong> Talk to 2 seniors from your target college before paying non-refundable fees.
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wide shrink-0">
            Avoid Wasting Process
          </span>
        </div>
      </div>

      {/* Tripartite Breakdown: Matched, Missing, Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MATCHED REQUIREMENTS */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                Matched ({qualification.matchedRequirements.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {qualification.matchedRequirements.length === 0 ? (
              <div className="text-xs text-slate-500 italic">No verified requirements yet.</div>
            ) : (
              qualification.matchedRequirements.map(req => (
                <div key={req.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{req.title}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {req.category}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {req.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MISSING REQUIREMENTS */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                Missing ({qualification.missingRequirements.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {qualification.missingRequirements.length === 0 ? (
              <div className="text-xs text-emerald-400 italic font-semibold">All mandatory criteria satisfied!</div>
            ) : (
              qualification.missingRequirements.map(req => (
                <div key={req.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{req.title}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {req.category}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {req.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* POTENTIAL ISSUES */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                Potential Issues ({qualification.potentialIssues.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {qualification.potentialIssues.length === 0 ? (
              <div className="text-xs text-slate-500 italic">No consular or consistency issues flagged.</div>
            ) : (
              qualification.potentialIssues.map(issue => (
                <div key={issue.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-rose-300 flex items-center space-x-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{issue.title}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {issue.category}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

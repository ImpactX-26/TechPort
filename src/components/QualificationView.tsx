import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Award, 
  ExternalLink,
  BookOpen,
  Briefcase,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Applicant } from '../types.ts';
import { simulateAnabinCheck, calculateChancenkarte, calculateCompletionPercentage } from '../api.ts';

interface QualificationViewProps {
  applicant: Applicant;
  onUpdateApplicant: (updated: Applicant) => void;
}

export const QualificationView: React.FC<QualificationViewProps> = ({
  applicant,
  onUpdateApplicant,
}) => {
  const [searchUniversity, setSearchUniversity] = useState(
    applicant.personalData.university || 'Anna University'
  );
  const [searchDegree, setSearchDegree] = useState(
    applicant.personalData.educationLevel || 'Bachelor of Engineering'
  );
  const [isSearchingAnabin, setIsSearchingAnabin] = useState(false);
  const [anabinResult, setAnabinResult] = useState<{
    status: 'H+' | 'H+/-' | 'H-';
    statusExplanation: string;
    equivalenceRating: string;
    referenceId: string;
  } | null>(null);

  const qData = applicant.qualificationData || calculateChancenkarte(applicant);
  const points = qData.chancenkartePoints;
  const isEligible = points >= 6;

  const handleRunAnabinSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingAnabin(true);
    try {
      const res = await simulateAnabinCheck(searchUniversity, searchDegree);
      setAnabinResult(res);

      const updated: Applicant = {
        ...applicant,
        qualificationData: {
          ...applicant.qualificationData,
          anabinStatus: res.status,
          institutionName: searchUniversity,
          degreeName: searchDegree,
          recognitionCheckDate: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
      updated.completionPercentage = calculateCompletionPercentage(updated);
      onUpdateApplicant(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingAnabin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                German Degree Recognition & Chancenkarte Engine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official ZAB (KMK) Anabin accreditation standards & 2026 Skilled Immigration Act
              </p>
            </div>
          </div>
        </div>

        {/* Quick Visa Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
            isEligible 
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
              : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
          }`}>
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold">
              Chancenkarte: {points} / 14 Points &bull; {isEligible ? `QUALIFIED (Pass Threshold: 6 Pts met, +${points - 6} above cutoff)` : `NEED +${6 - points} PTS TO PASS (6 min)`}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: CHANCENKARTE (OPPORTUNITY CARD) POINTS CALCULATOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Opportunity Card (Chancenkarte) Scorecard</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Statutory points evaluation under German Skilled Immigration Act (§ 20a AufenthG)
              </p>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-black ${isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                {points}
              </span>
              <span className="text-xs text-slate-400 font-bold"> / 14 Max</span>
              <div className="text-[10px] text-emerald-400 font-semibold">Min. 6 to Qualify</div>
            </div>
          </div>

          {/* Progress Bar towards 14 points with 6-point threshold indicator */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Points Score ({points} of 14 Max)</span>
              <span className={isEligible ? 'text-emerald-400' : 'text-amber-400'}>
                {points >= 6 ? `✓ Eligible (+${points - 6} above 6-point legal requirement)` : `${6 - points} points required to reach minimum`}
              </span>
            </div>
            <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
              {/* Threshold line at 6 points (6/14 = 42.8%) */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                style={{ left: `${(6 / 14) * 100}%` }}
                title="Legal passing threshold: 6 points"
              />
              <div
                className={`h-full transition-all duration-500 ${
                  isEligible 
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400' 
                    : 'bg-gradient-to-r from-amber-500 to-red-500'
                }`}
                style={{ width: `${Math.min(100, (points / 14) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
              <span>0 Pts</span>
              <span className="text-amber-400 font-bold">Passing Cutoff: 6 Pts</span>
              <span>14 Pts Max</span>
            </div>
          </div>

          {/* Breakdown Items List */}
          <div className="space-y-3 pt-2">
            {qData.chancenkarteBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.category}</span>
                    {item.qualified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-mono text-xs font-bold ${item.points > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                    +{item.points} / {item.maxPoints} pts
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* German Language Boost Tip */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Fast-Track Strategy:</span> Advancing your German proficiency from A1 to B1 instantly awards <strong>+2 extra points</strong> on the Chancenkarte scale!
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ANABIN DATABASE SIMULATOR & ZAB PATHWAY */}
        <div className="space-y-6">
          {/* Anabin Lookup Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Anabin (KMK) Database Equivalence Check</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify if your university holds official H+ status in Germany
              </p>
            </div>

            <form onSubmit={handleRunAnabinSearch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  University / Awarding Institution
                </label>
                <input
                  type="text"
                  value={searchUniversity}
                  onChange={(e) => setSearchUniversity(e.target.value)}
                  placeholder="e.g. University of Delhi, VTU, Anna University"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 shadow-sm"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Degree Title
                </label>
                <input
                  type="text"
                  value={searchDegree}
                  onChange={(e) => setSearchDegree(e.target.value)}
                  placeholder="e.g. Bachelor of Technology / Computer Science"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 shadow-sm"
                  style={{ color: '#000000' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSearchingAnabin}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSearchingAnabin ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Querying Anabin Central Register...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Run Official Anabin Database Query</span>
                  </>
                )}
              </button>
            </form>

            {/* Simulated Anabin Result Display */}
            {anabinResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Institutional Status:</span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-black bg-emerald-600 text-white">
                    Status: {anabinResult.status} (Accredited)
                  </span>
                </div>
                <p className="text-xs text-slate-300">{anabinResult.statusExplanation}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{anabinResult.equivalenceRating}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Registry Reference: {anabinResult.referenceId}
                </div>
              </div>
            )}
          </div>

          {/* Official German Recognition Roadmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>ZAB Statement of Comparability Checklist</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>Anabin screenshot printout showing H+ status of university and degree type.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>Original transcripts with consolidated marksheets translated if not in English/German.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>Employment reference letters matching German DIN 5008 resume dates.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

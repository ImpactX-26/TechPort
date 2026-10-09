import React from 'react';
import { 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Languages, 
  Edit3, 
  Check, 
  Compass, 
  Award,
  Sparkles,
  Fingerprint,
  Video
} from 'lucide-react';
import { Applicant } from '../types.ts';
import { formatGermanTimestamp } from '../api.ts';

interface ProfileViewProps {
  applicant: Applicant;
  onOpenEditModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  applicant,
  onOpenEditModal,
}) => {
  const pd = applicant.personalData;

  return (
    <div className="space-y-6">
      {/* Profile Header Hero */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-red-600/20">
              {pd.fullName ? pd.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {pd.fullName || applicant.fullName}
                </h1>
                {pd.digiLockerVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    DigiLocker Verified
                  </span>
                )}
                {applicant.videoPitchData?.hasVideo && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-500/50">
                    <Video className="w-3.5 h-3.5" />
                    AI Video Pitch Transcribed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{applicant.email}</span>
                <span>&bull;</span>
                <span className="text-amber-400 font-semibold">{pd.goal}</span>
              </p>
              <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  Target: {pd.targetCity || 'München'}, Germany
                </span>
                <span>&bull;</span>
                <span>Citizenship: {pd.citizenship} (Age: {pd.age})</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEditModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 shadow-sm shrink-0"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Edit Profile Data</span>
          </button>
        </div>
      </div>

      {/* AI Video Pitch Enhanced Dossier Banner */}
      {applicant.videoPitchData?.profileApplied && (
        <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Profile Synchronized via AI Video Pitch
                  </span>
                  <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Active in Database
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Extracted from speech: <strong>{pd.educationLevel}</strong> in {pd.fieldOfStudy}, <strong>{pd.workExperienceYears} yrs experience</strong>, German <strong>{pd.germanLevel}</strong> &rarr; Destination {pd.targetCity}.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-purple-300 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-700/60">
                {formatGermanTimestamp(applicant.videoPitchData.recordedAt || applicant.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education & Qualifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Academic Credentials</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
              Anabin H+
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Degree & Specialization</div>
              <div className="text-white font-bold text-sm mt-0.5">{pd.educationLevel}</div>
              <div className="text-amber-400 font-medium mt-0.5">{pd.fieldOfStudy}</div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-slate-400 text-[11px]">Graduation Year</div>
                <div className="text-white font-bold mt-0.5">{pd.graduationYear}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-slate-400 text-[11px]">Academic GPA</div>
                <div className="text-white font-bold mt-0.5">{pd.gpa}</div>
              </div>
            </div>

            {pd.university && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-slate-400 text-[11px]">Awarding Institution</div>
                <div className="text-white font-semibold mt-0.5">{pd.university}</div>
              </div>
            )}
          </div>
        </div>

        {/* Work Experience & Skills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Professional Experience</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
              {pd.workExperienceYears} Years Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Current Designation</div>
              <div className="text-white font-bold text-sm mt-0.5">{pd.currentRole}</div>
              {pd.currentCompany && (
                <div className="text-slate-300 font-medium mt-0.5">{pd.currentCompany}</div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-slate-400 text-[11px] mb-1.5">Core Competencies & Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {(pd.skills || []).map((sk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] border border-slate-700"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Language Proficiency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-emerald-400" />
            <span>Language Capabilities (CEFR / GER)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">German (Deutsch)</div>
              <div className="text-amber-400 font-extrabold text-lg mt-0.5">{pd.germanLevel}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {pd.hasLanguageCert ? '✓ Official certificate held' : 'Self-assessed CEFR'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">English</div>
              <div className="text-blue-400 font-extrabold text-lg mt-0.5">{pd.englishLevel}</div>
              <div className="text-[11px] text-slate-500 mt-1">Professional Working</div>
            </div>
          </div>
        </div>

        {/* Relocation & Bio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-red-400" />
            <span>Relocation Objective & Bio</span>
          </h3>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            {pd.bio || 'Applicant profile prepared for skilled migration to the Federal Republic of Germany.'}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Dossier Last Synced:</span>
            <span className="font-mono text-slate-300">
              {formatGermanTimestamp(applicant.lastSyncedAt || applicant.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Video Introduction Transcript Card if applicant has video pitch */}
      {applicant.videoPitchData?.transcript && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-400" />
              <span>Transcribed Video Pitch & Multimodal Dossier</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Agent Verified {(applicant.videoPitchData.confidence ? applicant.videoPitchData.confidence * 100 : 95).toFixed(0)}%
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed">
            "{applicant.videoPitchData.transcript}"
          </div>
          {applicant.videoPitchData.keyInsights && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {applicant.videoPitchData.keyInsights.map((insight, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 text-[11px] text-slate-400 border border-slate-800 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

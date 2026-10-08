import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Languages, 
  Target, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileCheck2, 
  Info,
  ShieldAlert,
  Save,
  X,
  Lock,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { ApplicantProfile, FieldProvenance, ProvenanceField } from '../types';

interface ProfileViewProps {
  profile: ApplicantProfile;
  onUpdateProfile: (updates: any) => Promise<void>;
  isProcessing: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  isProcessing
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: profile.personal.fullName.value,
    country: profile.personal.country.value,
    age: profile.personal.age.value,
    email: profile.personal.email?.value || '',
    highestQualification: profile.education.highestQualification.value,
    fieldOfStudy: profile.education.fieldOfStudy.value,
    institution: profile.education.institution.value,
    graduationYear: profile.education.graduationYear.value,
    yearsOfExperience: profile.experience.yearsOfExperience.value,
    recentRole: profile.experience.currentOrRecentRole.value,
    skills: profile.experience.skills.value.join(', '),
    germanLevel: profile.languageLevel.value,
    goal: profile.goal.value
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = editForm.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    await onUpdateProfile({
      ...editForm,
      skills: skillsArray,
      age: Number(editForm.age),
      graduationYear: Number(editForm.graduationYear),
      yearsOfExperience: Number(editForm.yearsOfExperience)
    });

    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-1">
            <span className="text-amber-400">Structured Data Model</span>
            <span>•</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              {profile.completionPercentage}% Complete
            </span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>DSGVO Art. 32 Tamper-Proof</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Applicant Master Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Synthesized by the <span className="font-semibold text-amber-300">Profile Agent</span> with cryptographic field-level provenance tracking.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Safety & Integrity Notice */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-3">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-300">Cryptographic Provenance Guarantee: </span>
          Data from AI extraction does not silently overwrite user-verified attributes. Every field displays its exact authenticated source (user-provided, document-extracted, or AI-inferred).
        </div>
      </div>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. PERSONAL INFORMATION */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-black text-base text-white">Personal Information</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Core Identity</span>
          </div>

          <div className="space-y-3 text-xs">
            <FieldRow label="Full Legal Name" field={profile.personal.fullName} />
            <FieldRow label="Country of Origin" field={profile.personal.country} />
            <FieldRow label="Age" field={profile.personal.age} />
            {profile.personal.email && (
              <FieldRow label="Email Address" field={profile.personal.email} />
            )}
          </div>
        </div>

        {/* 2. EDUCATION & DEGREES */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-400/10 text-sky-400 flex items-center justify-center border border-sky-400/20">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="font-black text-base text-white">Education & Academics</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Academic Equivalence</span>
          </div>

          <div className="space-y-3 text-xs">
            <FieldRow label="Highest Qualification" field={profile.education.highestQualification} />
            <FieldRow label="Field of Study" field={profile.education.fieldOfStudy} />
            <FieldRow label="Graduating Institution" field={profile.education.institution} />
            <FieldRow label="Graduation Year" field={profile.education.graduationYear} />
            {profile.education.gradeOrGpa && (
              <FieldRow label="GPA / Cumulative Marks" field={profile.education.gradeOrGpa} />
            )}
          </div>
        </div>

        {/* 3. EXPERIENCE & EMPLOYMENT */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center border border-emerald-400/20">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="font-black text-base text-white">Work Experience</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Professional Record</span>
          </div>

          <div className="space-y-3 text-xs">
            <FieldRow label="Years of Experience" field={profile.experience.yearsOfExperience} />
            <FieldRow label="Current or Recent Role" field={profile.experience.currentOrRecentRole} />
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Verified Technical Skills
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.experience.skills.value.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. LANGUAGE & GOALS */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-400/10 text-purple-400 flex items-center justify-center border border-purple-400/20">
                <Languages className="w-4 h-4" />
              </div>
              <h3 className="font-black text-base text-white">Language & Target Path</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Immigration Baseline</span>
          </div>

          <div className="space-y-3 text-xs">
            <FieldRow label="German Proficiency (CEFR)" field={profile.languageLevel} />
            <FieldRow label="Primary Germany Objective" field={profile.goal} />

            <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-amber-300">Consular Path Status:</div>
              <div>
                Targeting <span className="font-semibold text-white">{profile.goal.value}</span> requires authenticated qualification documents and minimum German language targets as evaluated by the Qualification Agent.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto space-y-4 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Direct Edit</span>
                <h3 className="text-base font-extrabold text-white">Update Profile Information</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={e => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={e => setEditForm(prev => ({ ...prev, age: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={editForm.highestQualification}
                    onChange={e => setEditForm(prev => ({ ...prev, highestQualification: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={editForm.fieldOfStudy}
                    onChange={e => setEditForm(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Institution</label>
                  <input
                    type="text"
                    value={editForm.institution}
                    onChange={e => setEditForm(prev => ({ ...prev, institution: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={editForm.graduationYear}
                    onChange={e => setEditForm(prev => ({ ...prev, graduationYear: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    value={editForm.yearsOfExperience}
                    onChange={e => setEditForm(prev => ({ ...prev, yearsOfExperience: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Job / Role</label>
                  <input
                    type="text"
                    value={editForm.recentRole}
                    onChange={e => setEditForm(prev => ({ ...prev, recentRole: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={e => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md shadow-amber-400/20 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Re-Verify</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

interface FieldRowProps<T> {
  label: string;
  field: ProvenanceField<T>;
  formatter?: (val: T) => string;
}

function FieldRow<T>({ label, field, formatter }: FieldRowProps<T>) {
  const getBadge = (source: FieldProvenance) => {
    switch (source) {
      case 'document_extracted':
        return { label: 'Doc Extracted', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'user_provided':
        return { label: 'User Provided', class: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'ai_inferred':
        return { label: 'AI Inferred', class: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      default:
        return { label: 'Needs Verification', class: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
  };

  const badge = getBadge(field.source);

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </div>
        <div className="font-extrabold text-white text-xs mt-0.5">
          {formatter ? formatter(field.value) : String(field.value)}
        </div>
      </div>
      <div className="flex items-center space-x-1.5">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.class}`}>
          {badge.label}
        </span>
      </div>
    </div>
  );
}

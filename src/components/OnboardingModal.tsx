import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  GraduationCap, 
  Briefcase, 
  Languages, 
  Compass, 
  UserCheck 
} from 'lucide-react';
import { Applicant, PersonalData, ApplicantGoal } from '../types.ts';
import { verifyWithDigiLocker, calculateCompletionPercentage, calculateChancenkarte } from '../api.ts';

interface OnboardingModalProps {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Applicant) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  applicant,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<PersonalData>({ ...applicant.personalData });
  const [skillInput, setSkillInput] = useState('');
  const [digiLockerLoading, setDigiLockerLoading] = useState(false);
  const [digiLockerMessage, setDigiLockerMessage] = useState<string | null>(null);

  const handleDigiLockerVerify = async () => {
    setDigiLockerLoading(true);
    setDigiLockerMessage(null);
    try {
      const res = await verifyWithDigiLocker(formData.fullName);
      setFormData(prev => ({
        ...prev,
        digiLockerVerified: true,
        digiLockerDocId: res.docId,
        digiLockerVerifiedAt: res.verifiedAt,
      }));
      setDigiLockerMessage('✓ Verified with DigiLocker: Aadhaar & Identity Authenticated');
    } catch (err) {
      console.error(err);
    } finally {
      setDigiLockerLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (sk: string) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== sk)
    }));
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Finalize and save
      const updatedApplicant: Applicant = {
        ...applicant,
        fullName: formData.fullName || applicant.fullName,
        goal: formData.goal,
        personalData: { ...formData },
        updatedAt: new Date().toISOString(),
      };
      updatedApplicant.completionPercentage = calculateCompletionPercentage(updatedApplicant);
      updatedApplicant.qualificationData = calculateChancenkarte(updatedApplicant);
      onSave(updatedApplicant);
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Applicant Personal Dossier
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Step {step} of 5 &bull; Standardized for German Federal Employment Agency (BA)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar */}
        <div className="px-6 pt-3 pb-1 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className={step >= 1 ? 'text-amber-400' : ''}>1. Identity</span>
            <span className={step >= 2 ? 'text-amber-400' : ''}>2. Education</span>
            <span className={step >= 3 ? 'text-amber-400' : ''}>3. Experience</span>
            <span className={step >= 4 ? 'text-amber-400' : ''}>4. Languages</span>
            <span className={step >= 5 ? 'text-amber-400' : ''}>5. Target</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: IDENTITY & CITIZENSHIP */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      DigiLocker Government Verification
                      {formData.digiLockerVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Instantly verify official identity, Aadhaar & passport via national gateway
                    </p>
                  </div>
                </div>
                {!formData.digiLockerVerified ? (
                  <button
                    type="button"
                    onClick={handleDigiLockerVerify}
                    disabled={digiLockerLoading}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {digiLockerLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                    <span>Verify with DigiLocker</span>
                  </button>
                ) : (
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> {formData.digiLockerDocId}
                  </div>
                )}
              </div>

              {digiLockerMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700 text-xs text-emerald-200">
                  {digiLockerMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Legal Name (as on Passport) *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                  style={{ color: '#000000' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Country of Citizenship *
                  </label>
                  <input
                    type="text"
                    value={formData.citizenship}
                    onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                    placeholder="e.g. India, Brazil, Nigeria, Turkey"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age (Critical for Chancenkarte Points) *
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={65}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Under 35 years = 2 Chancenkarte points. 35-40 years = 1 point.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Pathway Goal in Germany *
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value as ApplicantGoal })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                  style={{ color: '#000000' }}
                >
                  <option value="Work">Direct Skilled Work (Fachkraft Beschäftigung)</option>
                  <option value="Chancenkarte">Chancenkarte (Opportunity Card Visa - 6 Pkt.)</option>
                  <option value="Study in Germany">Study in Germany (Master / Bachelor Degree)</option>
                  <option value="Ausbildung">Ausbildung (Vocational Dual Training)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Highest Degree Level Completed *
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                  style={{ color: '#000000' }}
                >
                  <option value="Bachelor of Technology / Engineering">Bachelor of Technology / Engineering (4 Years)</option>
                  <option value="Bachelor of Science / Computer Applications">Bachelor of Science / BCA / IT (3-4 Years)</option>
                  <option value="Master of Science / Technology / MCA">Master of Science / M.Tech / MCA (Postgraduate)</option>
                  <option value="High School Diploma / Secondary (12th Grade)">Secondary / High School (For Ausbildung)</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Field of Study / Discipline *
                </label>
                <input
                  type="text"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                  placeholder="e.g. Computer Science, Mechanical Engineering, Data Analytics"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                  style={{ color: '#000000' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 2023 })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GPA / Percentage
                  </label>
                  <input
                    type="text"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="e.g. 8.4 / 10 (German Equiv: 1.7)"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  University / College Name (for Anabin database check)
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="e.g. Anna University, Mumbai University, VTU, IIT"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          )}

          {/* STEP 3: WORK EXPERIENCE */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Years of Work Experience *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={formData.workExperienceYears}
                    onChange={(e) => setFormData({ ...formData, workExperienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    2+ years = 2 Chancenkarte pts. 5+ years = 3 pts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current / Target Role *
                  </label>
                  <input
                    type="text"
                    value={formData.currentRole}
                    onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                    placeholder="e.g. Full Stack Developer, Mechanical Engineer"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Most Recent Employer / Company
                </label>
                <input
                  type="text"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  placeholder="e.g. Infosys, Siemens, Tata Elxsi, Freelance"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Core Skills & Technologies (For German ATS matching)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
                    placeholder="e.g. React, Python, Cloud, CAD"
                    className="flex-1 px-3.5 py-2 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {(formData.skills || []).map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => removeSkill(sk)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: LANGUAGES */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                <span className="font-bold">🇩🇪 German Language Requirement:</span> Even for English-speaking jobs, German A1/A2 increases Chancenkarte score by +1 to +2 points and accelerates Blue Card permanent residency from 27 to 21 months!
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    German Level (CEFR) *
                  </label>
                  <select
                    value={formData.germanLevel}
                    onChange={(e) => setFormData({ ...formData, germanLevel: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  >
                    <option value="None / A0">None / Beginner (A0)</option>
                    <option value="A1">A1 - Breakthrough (1 Point)</option>
                    <option value="A2">A2 - Elementary (1 Point)</option>
                    <option value="B1">B1 - Intermediate (2 Points)</option>
                    <option value="B2">B2 - Vantage (3 Points)</option>
                    <option value="C1">C1 - Effective Operational (4 Points)</option>
                    <option value="C2">C2 - Mastery / Bilingual (4 Points)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    English Level *
                  </label>
                  <select
                    value={formData.englishLevel}
                    onChange={(e) => setFormData({ ...formData, englishLevel: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  >
                    <option value="Basic">Basic (A2-B1)</option>
                    <option value="B2">B2 - Good Working Proficiency</option>
                    <option value="C1">C1 - Fluent / Professional (+1 Point)</option>
                    <option value="C2">C2 - Advanced Proficient</option>
                    <option value="Native">Native Speaker (+1 Point)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hasCert"
                  checked={formData.hasLanguageCert}
                  onChange={(e) => setFormData({ ...formData, hasLanguageCert: e.target.checked })}
                  className="rounded bg-white border-gray-300 text-red-600 focus:ring-red-500"
                  style={{ color: '#000000' }}
                />
                <label htmlFor="hasCert" className="text-xs text-slate-300 font-medium">
                  I hold an official Goethe-Institut, telc, TestDaF, or IELTS/TOEFL score report.
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: PREFERENCES & RELOCATION */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target German City / Region
                  </label>
                  <select
                    value={formData.targetCity}
                    onChange={(e) => setFormData({ ...formData, targetCity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  >
                    <option value="Munich">München (Munich, Bavaria)</option>
                    <option value="Berlin">Berlin (Capital & Tech Startups)</option>
                    <option value="Frankfurt">Frankfurt am Main (Finance & IT)</option>
                    <option value="Hamburg">Hamburg (Logistics & Media)</option>
                    <option value="Stuttgart">Stuttgart (Automotive & Engineering)</option>
                    <option value="Düsseldorf / Köln">Düsseldorf / Köln (NRW)</option>
                    <option value="Open to any region">Open to any German Federal State</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Industry
                  </label>
                  <input
                    type="text"
                    value={formData.targetIndustry}
                    onChange={(e) => setFormData({ ...formData, targetIndustry: e.target.value })}
                    placeholder="e.g. IT, Automotive, Renewable Energy, Healthcare"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Professional Bio & Relocation Motivation (Used in German CV & Cover Letter)
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your background and why you are seeking a career in Germany..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white text-black placeholder:text-gray-400 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                  style={{ color: '#000000' }}
                />
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Profile Readiness Audit</div>
                  <div className="text-slate-400 text-[11px]">
                    Automatic calculation will update your Chances of Visa Approval & Anabin status.
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  +150 XP
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all"
          >
            <span>{step === 5 ? 'Save & Sync Profile' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
